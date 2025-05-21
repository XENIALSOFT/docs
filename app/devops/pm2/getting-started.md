---
outline: deep
---

# 시작하기

## 소개

`PM2`는 `Node.js` 애플리케이션을 관리하기 위한 프로덕션 수준의 `프로세스 매니저(Process Manager)`입니다.

애플리케이션을 백그라운드에서 실행, 자동 재시작, 로깅, 모니터링 등 다양한 기능을 제공해 개발자와 운영자들이 애플리케이션을 안정적으로 배포하고 운영할 수 있도록 도와줍니다.

## 주요 기능

1. 프로세스 관리
    - 애플리케이션을 백그라운드에서 실행
    - 애플리케이션이 크래시되면 자동으로 재시작
    - 여러 애플리케이션을 동시에 실행 및 관리 기능
2. 로깅 및 모니터링
    - 표준 출력(log) 및 에러 로그 기록
    - 실시간 리소스 사용량(CPU, 메모리 등) 모니터링 가능
3. 클러스터 모드
    - 멀티코어 환경에서 `Node.js` 애플리케이션을 클러스터 모드로 실행해 성능 향상 가능
4. 자동 시작 설정
    - 서버 재부팅 시 자동으로 앱을 다시 실행
5. 환경 변수 및 설정 파일
    - `.json` 또는 `.yml` 형식의 설정 파일을 통해 다양한 앱 설정 가능
6. 배포 기능
    - 간단한 배포 자동화 기능

## PM2를 사용하는 이유

- `Node.js` 애플리케이션을 안정적이고 쉽게 운영
- 다운타임 없이 배포 가능(Zero-Downtime Reload)
- 개발자와 DevOps 팀이 애플리케이션을 효율적으로 관리할 수 있음

## 기본 명령어

```sh
# 애플리케이션 실행
pm2 start app.js

# 애플리케이션 목록 보기
pm2 list

# 애플리케이션 로그 보기
pm2 logs

# 애플리케이션 재시작
pm2 restart app

# 서버 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

## 사용 방법

### 실행

`PM2`를 이용해 애플리케이션을 실행하면 **기본적으로 fork 모드(자식 프로세스)**로 실행되며, 실행 즉시 데몬(Daemon) 형태로 백그라운드에서 동작하게 됩니다. 이로 인해 서버는 종료되거나 에러가 발생하지 않는 이상 24시간 지속적으로 유지됩니다.

:::info PM2 실행 옵션
🔄 `--watch`
  - 프로젝트 내 **파일 변경사항을 감지하여 자동으로 서버를 재적용(reload)** 합니다.
  - 특정 폴더는 감지 대상에서 제외할 수 있습니다:
  ```sh
  pm2 start app.js --watch --ignore-watch="logs/*"
  ```
---
⚙️ `-i <숫자 | max> (Cluster Mode)`
  - `Node.js`의 **싱글 스레드 한계를 보완하기** 위해 여러 프로세스로 앱을 실행합니다.
  - `<숫자>`를 입력해 프로세스 개수를 수동 설정하거나, `max`를 사용해 서버의 CPU 코어 수만큼 클러스터링할 수 있습니다.
  ```sh
  pm2 start app.js -i max
  ```
---
🏷️ `--name <앱 이름>`
  - 실행 중인 애플리케이션에 사용자 지정 이름을 부여합니다.
  ```sh
  pm2 start app.js --name my-app
  ```
---
💾 `--max-memory-restart <메모리 제한>`
  - 지정된 메모리 한도(MB 또는 GB)를 초과하면 자동으로 앱을 재시작합니다.
  ```sh
  pm2 start app.js --max-memory-restart 200M
  ```
---
📁 `--log <로그 경로>`
  - 로그 파일의 저장 경로를 직접 지정합니다.
  ```sh
  pm2 start app.js --log /var/log/myapp.log
  ```
---
➕ `-- arg1 arg2 ...`
  - 실행할 스크립트에 **추가 인수(arguments)**를 전달합니다.
  ```sh
  pm2 start app.js -- arg1 arg2
  ```
---
⏱️ `--restart-delay <밀리초>`
  - 프로세스가 재시작될 때 **지연 시간(delay)**을 설정합니다.
  ```sh
  pm2 start app.js --restart-delay 5000
  ```
---
🕒 `--time`
  - 로그에 **타임스탬프(시간 정보)**를 포함시킵니다.
  ```sh
  pm2 start app.js --time
  ```
---
🚫 `--no-autorestart`
  - 앱이 종료되었을 때 자동으로 재시작되지 않도록 설정합니다.
  ```sh
  pm2 start app.js --no-autorestart
  ```
---
📅 `--cron <크론 표현식>`
  - 지정된 크론 스케줄에 따라 주기적으로 앱을 재시작합니다.
  ```sh
  # 매일 새벽 3시에 앱 재시작
  pm2 start app.js --cron "0 3 * * *"
  ```
:::

### 증설

프로세스 개수를 늘리거나 줄여야한다면 `scale` 명령어로 프로세스 수를 증가시키거나 감소시킬 수 있습니다.

```sh
pm2 scale app -2
pm2 scale app +2
```

### 상태

현재 프로세스 리스트 목록을 볼 수 있습니다.

```sh
pm2 status
pm2 list
```

### 중지

프로세스를 중지합니다.

```sh
pm2 stop [name]|[process_id]
```

```sh
pm2 stop all
```

### 재시작

프로세스를 재시작합니다.

```sh
pm2 restart [name]|[process_id]
```

```sh
pm2 restart all
```

### 재적용

프로세스를 재적용합니다.

```sh
pm2 reload [name]|[process_id]
```

```sh
pm2 reload all
```

:::info 재시작과의 차이점
- 재시작은 모든 프로세스를 정지한 후 다시 시작하는 방식입니다.
- 재적용은 프로세스를 차례대로 정지하여 최소 1개 이상의 프로세스를 유지합니다. 이를 `zero-downtime reload`라 합니다.
- 때문에 재적용은 재시작보다 느립니다.
:::

### 삭제

프로세스를 삭제합니다.

```sh
pm2 delete [name]|[process_id]
```

```sh
pm2 delete all
```

### 로그

프로세스의 로그를 확인합니다.

```sh
pm2 logs
pm2 logs [name]|[process_id]

# Display 1000 lines of api log file
pm2 logs api --lines 1000
```

:::tip 로그 위치
~/.pm2/pm2.log
:::

#### 로그 관리

`PM2`는 로그를 계속 누적하기 때문에, 별도 설정이 없으면 로그 파일이 무한히 커질 수 있습니다.

이를 방지하기 위해 `logrotate` 모듈을 사용합니다.

[logrotate](./logrotate.md)

## ecosystem.config.js

`ecosystem.config.js`는 **PM2 프로세스 실행에 필요한 모든 설정을 코드로 구성할 수 있는 설정 파일**입니다.

[ecosystem.config.js](./ecosystem-config.md)