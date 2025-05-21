# PM2 Logrotate

`PM2`는 로그를 계속 누적하기 때문에, 별도 설정이 없으면 로그 파일이 무한히 커질 수 있습니다.

이를 방지하기 위해 `logrotate` 모듈을 사용합니다.

`pm2-logrotate`는 `PM2` 로그 파일의 용량이 커지는 것을 방지하기 위해 **자동으로 로그를 순환(rotate)** 하고, **오래된 로그를 삭제**해주는 `PM2`의 외부 모듈입니다.

## 설치

```sh
pm2 install pm2-logrotate
```

설치하면 `PM2`가 자동으로 `logrotate` 모듈을 관리하게 됩니다.

## 주요 설정 방법

설정은 `pm2 set` 명령어를 통해 진행할 수 있습니다.

| 설정 항목            | 설명                     | 예시                                                         |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| `max_size`       | 로그 파일 하나의 최대 크기        | `pm2 set pm2-logrotate:max_size 10M`                       |
| `retain`         | 유지할 로그 파일 개수           | `pm2 set pm2-logrotate:retain 5`                           |
| `compress`       | 압축 여부 (true/false)     | `pm2 set pm2-logrotate:compress true`                      |
| `dateFormat`     | 로그 파일명에 들어갈 날짜 형식      | `pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss`     |
| `rotateInterval` | 주기적인 로테이션 설정 (cron 형식) | `pm2 set pm2-logrotate:rotateInterval '0 0 * * *'` (매일 자정) |
| `workerInterval` | 내부 확인 주기 (초)           | `pm2 set pm2-logrotate:workerInterval 30`                  |
| `rotateModule`   | 모듈 자체를 주기적으로 재시작할지 여부  | `pm2 set pm2-logrotate:rotateModule true`                  |

## 설정 예시

```sh
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # 매일 자정에 회전
```

## 로그 파일 저장 위치

기본적으로 `PM2` 로그는 다음 위치에 저장됩니다.

```sh
~/.pm2/logs/
```

`logrotate` 설정을 적용하면 이 디렉토리 안에 날짜별 로그 파일들이 순환 저장됩니다.

## 적용된 설정 확인

```sh
pm2 conf
```

이 명령어로 현재 설정된 `logrotate` 관련 항목들을 확인할 수 있습니다.