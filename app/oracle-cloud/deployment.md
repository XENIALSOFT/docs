# 오라클 클라우드로 앱 배포하기

## Nuxt 배포

### 로컬에서 Nuxt 앱 빌드 후 tar로 묶기

1. `pnpm install`
2. `pnpm build`
3. `tar czvf nuxt-app.tar.gz .output package.json pnpm-lock.yaml`

### 서버로 `tar` 파일 업로드

1. SCP 명령어 사용

```bash
scp -i ./ssh-key.key nuxt-app.tar.gz [계정]@[주소]:/var/www
```

2. 권한 오류 해결
위 명령어에서 `Bad permissions` 오류가 발생하면, 관리자 권한으로 PowerShell을 열어 아래 명령어로 권한을 재조정합니다.

```sh
icacls .\ssh-key-2025-02-03.key /inheritance:r
icacls .\ssh-key-2025-02-03.key /grant:r "사용자명:R"
```

3. 서버에서 `/var/www` 디렉토리 생성 및 권한 설정

```bash
sudo mkdir -p /var/www/nuxt-app
sudo chown -R $USER:$USER /var/www/nuxt-app
```

### 압축 풀기

```bash
cd /var/www/
sudo mv nuxt-app.tar.gz nuxt-app/
cd nuxt-app/
tar -xzvf nuxt-app.tar.gz
```

### 필수 패키지 설치

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx curl
```

### Node.js, pnpm, pm2 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pnpm
sudo npm install -g pm2

node -v
npm -v
pnpm -v
pm2 -v
```

### pm2로 Nuxt 앱 실행

```bash
pm2 start .output/server/index.mjs --name "nuxt-app" --interpreter=node
pm2 save
pm2 startup
```

### Nginx 설정

1. Nginx 설정 파일 작성

```bash
sudo vi /etc/nginx/sites-available/nuxt-app
```

2. Nginx 설정

```nginx
server {
    listen 80;
    server_name xenialsoft.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. 심볼릭 링크로 활성화

```bash
sudo ln -s /etc/nginx/sites-available/nuxt-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 포트 설정

```bash
sudo iptables -L --line
# 'Chain INPUT'란에 REJECT된 부분을 삭제
sudo iptables -D INPUT 번호

sudo iptables -A INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT
```

### 도메인 설정

1. A 레코드 vs CNAME 차이

|목적|사용 레코드|설명|
|--|--|--|
|도메인 → IP 연결|A 레코드|aforclinic.xenialsoft.com → 123.123.123.123|
|도메인 → 도메인 연결|CNAME 레코드|clinic.xenialsoft.com → aforclinic.xenialsoft.com|

### Nginx + Let's Encrypt SSL 적용 방법

1. Certbot과 Nginx 플러그인 설치

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

2. SSL 적용

```bash
sudo certbot --nginx -d aforclinic.xenialsoft.com
```

## 스프링 부트 배포

### 서버에 Amazon Corretto 21 설치

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
```

### 로컬에서 스프링부트 앱 빌드하기

```sh
./gradlew clean build

cd build/libs

scp -i ./ssh-key-2025-02-03.key api-0.0.1-SNAPSHOT.jar [계정]@[주소]:/var/www
```

### pm2로 스프링부트 앱 실행하기

```bash
pm2 start "java -jar api-0.0.1-SNAPSHOT.jar --spring.profiles.active=production" --name spring-app
pm2 save
pm2 startup
```

### Nginx + Let's Encrypt SSL 적용 방법

```bash
sudo certbot --nginx -d api.aforclinic.xenialsoft.com
```

## 전체 배포 흐름 요약

1. Nuxt 앱: 로컬 빌드 -> tar로 묶어서 서버에 업로드 -> pm2와 nginx로 실행
2. SpringBoot 앱: 로컬 빌드 -> jar 파일 업로드 -> pm2와 nginx로 실행

<!-- 
1. 로컬에서 nuxt 앱을 빌드하여 tar로 묶는다.

    1. pnpm install
    2. pnpm build
    3. tar czvf nuxt-app.tar.gz .output package.json pnpm-lock.yaml

2. scp를 이용해서 서버로 업로드한다.

    1. scp -i ./ssh-key-2025-02-03.key nuxt-app.tar.gz [계정]@[주소]:/var/www
    2. 혹시 아래와 같은 오류가 발생했다면
    ```sh
    Bad permissions. Try removing permissions for user: BUILTIN\\Users (S-1-5-32-545) on file ssh-key-2025-02-03.key.
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Permissions for './ssh-key-2025-02-03.key' are too open.
    It is required that your private key files are NOT accessible by others.
    This private key will be ignored.
    Load key "./ssh-key-2025-02-03.key": bad permissions
    ubuntu@140.245.77.6: Permission denied (publickey).
    C:\WINDOWS\System32\OpenSSH\scp.exe: Connection closed
    ```

    pwsh를 관리자 권한으로 열어서

    ```sh
    icacls .\ssh-key-2025-02-03.key /inheritance:r
    icacls .\ssh-key-2025-02-03.key /grant:r "mglee:R"
    ```

    를 수행해서 권한을 재조정해주면된다.
    3. 서버에서 /var/www를 만들어서 sudo chown -R $USER:$USER /var/www 도 해주자

3. 업로드된 tar를 압축 풀어준다.
```sh
cd /var/www/
sudo mkdir -p nuxt-app
sudo chown -R $USER:$USER nuxt-app
mv nuxt-app.tar.gz nuxt-app/
cd nuxt-app/
tar -xzvf nuxt-app.tar.gz
```

4. 필수 패키지 설치
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx curl git
```

5. Node.js pnpm pm2 설치
```sh
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pnpm
sudo npm install -g pm2

node -v
npm -v
pnpm -v
pm2 -v
```

6. pm2로 앱 실행
```sh
pm2 start .output/server/index.mjs --name "nuxt-app" --interpreter=node
pm2 save
pm2 startup
```

7. nginx 설정
```sh
sudo vi /etc/nginx/sites-available/nuxt-app
```

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```sh
sudo ln -s /etc/nginx/sites-available/nuxt-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. 포트 설정
```sh
sudo iptables -L --line
# 'Chain INPUT'란에 REJECT된 부분을 삭제
sudo iptables -D INPUT 번호

sudo iptables -A INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT
```

9. 도메인 설정

**A 레코드 vs CNAME 차이**
|목적|사용 레코드|설명|
|--|--|--|
|도메인 → IP 연결|A 레코드|aforclinic.xenialsoft.com → 123.123.123.123|
|도메인 → 도메인 연결|CNAME 레코드|clinic.xenialsoft.com → aforclinic.xenialsoft.com|

10. nginx + Let's Encrypt SSL 적용 방법

    1. Certbot과 Nginx 플러그인 설치
    
    ```sh
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    ```

    2. nginx의 서버 블록(server_name) 확인
    ```nginx
    server {
      server_name 원하는 주소
    }
    ```

## spring

1. Amazon Corretto 21 설치

```sh
# GPG 키 가져오기
sudo apt update
sudo apt install -y wget gnupg
wget -O- https://apt.corretto.aws/corretto.key | sudo gpg --dearmor -o /usr/share/keyrings/corretto-archive-keyring.gpg

# APT 저장소 추가
echo "deb [signed-by=/usr/share/keyrings/corretto-archive-keyring.gpg] https://apt.corretto.aws stable main" | sudo tee /etc/apt/sources.list.d/corretto.list

# 설치
sudo apt update
sudo apt install -y java-21-amazon-corretto-jdk
```

2. 로컬에서 스프링부트 앱 빌드하기

```sh
./gradlew clean build

cd build/libs

scp -i ./ssh-key-2025-02-03.key api-0.0.1-SNAPSHOT.jar [계정]@[주소]:/var/www
```

3. 서버에서 pm2로 스프링 부트 실행하기

```sh
pm2 start "java -jar api-0.0.1-SNAPSHOT.jar --spring.profiles.active=production" --name spring-app
pm2 save
pm2 startup
```

4. ssl 적용

```sh
sudo certbot --nginx -d api.aforclinic.xenialsoft.com
``` -->