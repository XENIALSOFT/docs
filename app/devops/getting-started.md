---
outline: deep
---

# 시작하기

## 필수 패키지 설치

### 준비하기

```sh
sudo apt update && sudo apt upgrade -y
```

### curl

```sh
sudo apt install -y curl
```

### Node.js

```sh
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```

```sh
sudo apt install -y nodejs
```

### npm

:::info
설치 대신 최신 버전으로 업그레이드
:::

```sh
sudo npm install -g npm@latest
```

### pnpm
```sh
sudo npm install -g pnpm
```

### pm2
```sh
sudo npm install -g pm2
```

### nginx

```sh
sudo apt install -y nginx
```

### certbot

:::info
`Nginx`와 `Let's Encrypt SSL` 적용할 경우 필요
:::

```sh
sudo apt install -y certbot python3-certbot-nginx
```

### Amazon Corretto 21

```sh
sudo apt install -y wget gnupg
```

- `GPG` 키 가져오기
```sh
wget -O- https://apt.corretto.aws/corretto.key | sudo gpg --dearmor -o /usr/share/keyrings/corretto-archive-keyring.gpg
```

- `APT` 저장소 추가
```sh
echo "deb [signed-by=/usr/share/keyrings/corretto-archive-keyring.gpg] https://apt.corretto.aws stable main" | sudo tee /etc/apt/sources.list.d/corretto.list
```

- `APT` 업데이트
```sh
sudo apt update
```

- `JDK21` 설치
```sh
sudo apt install -y java-21-amazon-corretto-jdk
```

## 방화벽 설정

- `80` 포트
```sh
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT
```

- `443` 포트
```sh
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT
```

### 방화벽 설정 저장

```sh
sudo iptables-save > /etc/iptables/rules.v4
```

```sh
sudo apt install iptables-persistent
```

## 타임존 설정

### 현재 타임존 확인

현재 시스템에서 설정된 타임존와 시간을 확인하려면 다음 명령어를 실행합니다.

```sh
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

### 사용 가능한 타임존 목록 확인

OS에서 지원하는 타임존 목록을 보려면 다음 명령어를 실행합니다.

- 전체 타임존 목록
```sh
timedatectl list-timezones
```

- 특정 타임존 검색
```sh
timedatectl list-timezones | grep Seoul
```

### 타임존 변경

1. 특정 타임존로 변경

```sh
sudo timedatectl set-timezone Asia/Seoul
```

2. `UTC`로 변경

```sh
sudo timedatectl set-timezone UTC
```