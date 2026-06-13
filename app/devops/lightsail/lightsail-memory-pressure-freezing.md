# Amazon Lightsail 인스턴스 프리징 원인 분석 및 해결 가이드

Amazon Lightsail 인스턴스(2vCPU, 2GB RAM 사양 등)에서 간헐적으로 발생할 수 있는 시스템 응답 불가(Freezing) 및 SSH 접속 타임아웃 장애의 원인을 시스템 로그 분석을 통해 진단하고, 근본적인 방지 대책을 정리합니다.

## 1. 장애 현상
- AWS Lightsail 콘솔 상에서는 인스턴스 상태가 **실행 중(Running)**으로 표기됨.
- 외부(Putty, SSH Terminal) 및 AWS 브라우저 콘솔을 통한 **SSH 접근이 모두 타임아웃 오류**로 실패함.
- 콘솔을 통한 인스턴스 강제 재부팅 시 가동 완료까지 비정상적으로 오랜 시간이 소요됨.

## 2. 연쇄 장애 발생 원인 (Root Cause Analysis)

상태 메트릭(CPU Utilization, Status Check Failed)과 OS 시스템 로그(`/var/log/syslog`)를 교차 분석한 결과, **메모리 고갈로 인한 연쇄적 인프라 마비** 현상으로 확인되었습니다.

```text
[Memory Pressure 발생] ➔ [커널/DB 메모리 쥐어짜기] ➔ [CPU 사용률 폭발 (60~70%)]
➔ [Burst Credit 전량 고갈] ➔ [AWS 하드웨어 단에서 CPU 성능 강제 제한 (5% 이하)]
➔ [I/O 및 네트워크 스택 마비 (시간 왜곡 발생)] ➔ [Status Check Fail 및 SSH 먹통]
```

### 상세 로그 타임라인 분석

#### ① 12:31 ~ 12:36 — 메모리 경고등 점등 및 가상화 오버헤드 시작
```text
mariadbd[88429]: 2026-06-13 12:31:22 0 [Note] InnoDB: Memory pressure event disregarded; innodb_buffer_pool_size=128m, innodb_buffer_pool_size_auto_min=128m
```

- 진단: 커널이 시스템 가용 RAM 부족을 감지하고 MariaDB에 메모리 반환 신호(Memory pressure event)를 보냈습니다. DB는 이미 최소 버퍼 풀(128M)로 동작 중이라 신호를 무시(disregarded)하고 버텼습니다.

- 영향: OS가 부족한 RAM 공간을 확보하기 위해 디스크 가상 메모리 및 페이지 캐시 회수를 시도하며 CPU 점유율이 60~70% 선으로 급증했습니다.

#### ② 13:38 — OS 커널 자원 임계치 도달

```text
kernel: systemd-journald[88313]: Under memory pressure, flushing caches.
```

- 진단: 로그 시스템(systemd-journald)마저 메모리 압박을 견디지 못하고 캐시를 강제로 비우기 시작합니다. 시스템 내부가 극도로 느려지며 AWS의 헬스체크 핑에 응답하지 못해 상태 검사 실패(Status Check Failed) 카운트가 누적되기 시작한 시점입니다.

#### ③ 14:16 ~ 14:58 — CPU Throttling으로 인한 시스템 무반응 및 네트워크 다운

```text
2026-06-13T14:16:28... mariadbd... 2026-06-13 13:27:09 ... Memory pressure...
2026-06-13T14:58:43... systemd-networkd[88345]: ens5: Could not set route: Connection timed out
```

- 진단 (시간 왜곡): 13:27분에 발생한 DB 이벤트가 실제 디스크 로그에 기록된 시점은 14:16분으로, 약 50분의 시간 왜곡(Lag)이 발생했습니다.

- 결론: 버스트 크레딧이 완전 고갈($0$)되어 AWS 가상화 엔진이 CPU 성능을 기본선 이하(5% 미만)로 강제 락다운(Lock)했습니다. CPU 성능 토막으로 인해 디스크 쓰기 속도가 마비되었고, 최종적으로 네트워크 데몬(systemd-networkd)이 타임아웃으로 다운되면서 모든 SSH 통신이 끊어졌습니다.

## 3. 해결 방안 및 대응 조치

### 단기 대책: Linux Swap 메모리 할당 (필수)

물리 RAM(2GB)이 순간적으로 가득 차더라도 가상 스왑 공간을 활용하여 OS 핵심 스택과 네트워크 데몬이 커널 패닉에 빠지거나 굳어버리는 현상을 방지합니다. 2GB RAM 사양 기준 4GB(RAM의 2배) 할당을 권장합니다.

```
Swappiness 최적화
클라우드 환경에서 과도한 디스크 I/O 성능 저하를 막기 위해, 실제 RAM 공간을 최대(90%)로 활용한 후 어쩔 수 없는 임계 상황에서만 스왑을 사용하도록 swappiness 값을 10으로 대폭 낮추어 설정해야 합니다.
```

### 장기 대책: 모니터링 경보 및 인스턴스 스케일업

1. Lightsail 경보 알림(Metrics Alarm) 설정: CPU 사용률이 5분간 50% 이상 지속될 경우 사전 알림을 받도록 조치하여 크레딧 고갈 전 선제 대응 환경을 구축합니다.

2. 인스턴스 스펙 업그레이드: 스왑 설정 이후에도 특정 시간대(예: 배치가 도는 12:30 전후)에 서비스 병목이 지속된다면 스냅샷을 기반으로 RAM 사양이 더 높은 상위 플랜으로 마이그레이션하는 것을 권장합니다.