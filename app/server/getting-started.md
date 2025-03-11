---
prev: false
outline: deep
---
# 시작하기

## 필수 패키지 설치

### curl

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl
```

### nginx

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx
```

### Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

node -v

npm -v
```

### pnpm

```bash
sudo npm install -g pnpm

pnpm -v
```

### pm2

```bash
sudo npm install -g pm2

pm2 -v
```

### Amazon Corretto 21

```bash
# GPG 키 가져오기
sudo apt update
sudo apt install -y wget gnupg
wget -O- https://apt.corretto.aws/corretto.key | sudo gpg --dearmor -o /usr/share/keyrings/corretto-archive-keyring.gpg

# APT 저장소 추가
echo "deb [signed-by=/usr/share/keyrings/corretto-archive-keyring.gpg] https://apt.corretto.aws stable main" | sudo tee /etc/apt/sources.list.d/corretto.list

# 설치
sudo apt update
sudo apt install -y java-21-amazon-corretto-jdk

java -version
```