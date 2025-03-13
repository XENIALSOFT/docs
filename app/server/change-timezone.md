# 타임존 변경 방법

## 현재 타임존 확인

현재 시스템에서 설정된 타임존와 시간을 확인하려면 다음 명령어를 실행합니다.

```bash
timedatectl
```

```
               Local time: Thu 2025-03-13 09:39:42 KST
           Universal time: Thu 2025-03-13 00:39:42 UTC
                 RTC time: Thu 2025-03-13 00:39:42
                Time zone: Asia/Seoul (KST, +0900)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

- `Local time`: 현재 시스템의 로컬 시간
- `Universal time`: UTC(세계 표준시)
- `RTC time`: 하드웨어(Read-Time Clock, RTC) 시간
- `Time zone`: 현재 설정된 타임존

## 사용 가능한 타임존 목록 확인

OS에서 지원하는 타임존 목록을 보려면 다음 명령어를 실행합니다.

```bash
# 전체 타임존 목록
timedatectl list-timezones

# 특정 타임존 검색
timedatectl list-timezones | grep Seoul
```

## 타임존 변경

1. 특정 타임존로 변경

```bash
sudo timedatectl set-timezone Asia/Seoul

timedatectl
```

2. `UTC`로 변경

```bash
sudo timedatectl set-timezone UTC

timedatectl
```