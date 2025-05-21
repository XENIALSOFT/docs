# `ecosystem.config.js`란?

`ecosystem.config.js`는 **PM2 프로세스 실행에 필요한 모든 설정을 코드로 구성할 수 있는 설정 파일**입니다.

복잡한 애플리케이션 구성(여러 앱, 환경 변수, 클러스터 모드, 로그 경로, 메모리 제한 등)을 쉽게 정의하고 버전 관리 할 수 있다는 장점이 있습니다.

`PM2`에서 이 파일을 사용하면 명령어 없이도 다음과 같은 작업이 가능합니다.
- 여러 앱의 실행 설정 관리
- 환경(개발/운영 등)에 따른 설정 구분
- 시작 시 자동 로그 설정
- 클러스터 모드, 메모리 제한, 인자 전달 등

## 기본 예시
```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./app.js",
      instances: "max",
      exec_mode: "cluster",
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      max_memory_restart: "200M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      time: true,
    }
  ]
};
```

## 주요 설정 항목 설명

| 속성                       | 설명                          |
| ------------------------ | --------------------------- |
| `name`                   | 앱 이름                        |
| `script`                 | 실행할 메인 파일                   |
| `instances`              | 인스턴스 수 (숫자 or `max` 사용 가능)  |
| `exec_mode`              | 실행 모드 (`fork` or `cluster`) |
| `watch`                  | 파일 변경 감지 후 자동 재시작 여부        |
| `ignore_watch`           | 감지 제외할 디렉터리                 |
| `env`                    | 기본 환경 변수 (개발용 등)            |
| `env_production`         | 프로덕션 환경 변수                  |
| `max_memory_restart`     | 메모리 초과 시 재시작 기준             |
| `error_file`, `out_file` | 로그 저장 위치 지정                 |
| `time`                   | 로그에 타임스탬프 포함                |

## 실행 방법

```sh
pm2 start ecosystem.config.js
```

환경 설정에 따라 실행할 수도 있습니다.

```sh
pm2 start ecosystem.config.js --env production
```

## `pm2-logrotate`와 함께 사용하는 방법

`pm2-logrotate`는 설정을 ecosystem 파일에 직접 넣는 것이 아니라 `pm2 set` 명령어를 통해 전역 설정합니다. 하지만 `ecosystem.config.js`에서 **로그 파일 경로와 로그 날짜 포맷 등은 지정**할 수 있어 함께 잘 작동하도록 구성할 수 있습니다.

```js
module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "300M",
      error_file: "./logs/api-server-error.log",
      out_file: "./logs/api-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      time: true,
    }
  ]
};
```

그리고 `logrotate` 설정은 아래처럼 명령어로 지정합니다.

```sh
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

## 요약
| 장점              | 내용                                     |
| --------------- | -------------------------------------- |
| 📁 구성 파일화       | 설정 내용을 코드로 정리해 관리 가능                   |
| 🔄 반복 실행 용이     | `pm2 restart`, `pm2 deploy` 등에 유리      |
| 🔧 logrotate 연동 | 로그 파일 경로/포맷 설정 → logrotate가 자동으로 처리 가능 |
| 🌐 환경 분리        | dev/prod 환경에 따라 다른 설정 적용 가능            |
