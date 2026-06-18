---
outline: deep
---

# Let's Encrypt SSL 설정

`Let's Encrypt SSL`을 적용하여 사이트에 `HTTPS` 보안 프로토콜을 활성화하고 안전한 통신 환경을 구축합니다.

## Certbot과 nginx 플러그인 설치

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## SSL 인증서 발급 및 적용

:::warning
www 리디렉션을 위한 사전 작업
추후 www.xenialsoft.com으로 들어오는 요청을 xenialsoft.com으로 안전하게 리디렉션하려면, 두 도메인이 모두 포함된 하나의 통합 인증서를 발급받아야 브라우저 보안 경고가 발생하지 않습니다.
:::

아래 명령어를 실행하여 메인 도메인과 서브 도메인을 한 번에 묶어 인증서를 발급합니다.

```bash
sudo certbot --nginx -d xenialsoft.com
```

여러 개의 도메인을 적용하려면

```bash
sudo certbot --nginx -d xenialsoft.com -d www.xenialsoft.com
```

:::tip
명령어 실행 중 이메일 입력, 서비스 약관 동의(A), 이메일 수신 동의 여부(Y/N)를 묻는 프롬프트가 차례로 나타납니다. 안내에 따라 진행하면 Certbot이 Nginx 설정을 분석하여 필요한 인증서 코드를 자동으로 주입합니다.
:::

## SSL 인증서 자동 갱신 설정

Let's Encrypt 인증서는 유효기간이 90일입니다.

만료 전 자동 갱신이 정상적으로 작동하는지 가상 시뮬레이션을 통해 테스트합니다.

```bash
sudo certbot renew --dry-run
```

### 추천: 갱신 성공 시 Nginx 자동 리로드 설정 (Deploy Hook)

```bash
sudo systemctl status certbot.timer
```

:::info
최신 Ubuntu 환경에서는 apt로 certbot 설치 시 systemd 스케줄러(certbot.timer)가 백그라운드에 자동으로 등록되어 하루 2번 갱신 테스트를 수행합니다. 따라서 크론탭을 직접 편집하는 것보다, 인증서가 실제 갱신되었을 때 Nginx를 부드럽게 리로드해주는 훅(Hook)을 등록하는 것이 가장 깔끔하고 안전합니다.
:::

인증서가 성공적으로 갱신되었을 때만 Nginx 설정을 검사하고 반영하도록 시스템 훅 디렉토리에 스크립트를 생성합니다.

```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

파일 내부에 아래 내용을 작성하고 저장합니다.

```bash
#!/bin/bash
nginx -t && systemctl reload nginx
```

스크립트 파일에 실행 권한을 부여합니다.

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

## SSL 인증서 상태 확인

현재 서버에 발급되어 있는 인증서의 목록과 만료일, 도메인 매핑 상태를 확인합니다.

```bash
sudo certbot certificates
```

출력 예시:

```text
Found the following certs:
  Certificate Name: xenialsoft.com
    Domains: xenialsoft.com
    Expiry Date: 2024-06-01 00:00:00+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/xenialsoft.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/xenialsoft.com/privkey.pem
```

## Nginx 설정 적용 및 반영

Nginx 설정 파일의 문법 이상 유무를 점검한 뒤, 서비스 중단(Downtime)이 없는 reload 명령어로 변경 사항을 안전하게 반영합니다.

```bash
# 1. 문법 검사 (successful 메시지가 나와야 합니다)
sudo nginx -t

# 2. 안전한 설정 재로드
sudo systemctl reload nginx
```

## SSL 적용 확인

웹 브라우저에서 https://xenialsoft.com으로 접속하여 주소창의 자물쇠 아이콘을 확인하거나, 터미널에서 curl 명령어로 응답 헤더를 조회하여 검증합니다.

```bash
curl -I https://xenialsoft.com
```

출력 예시:

```text
HTTP/2 200
server: nginx
...
```

응답 프로토콜이 HTTP/2로 나타나거나 Strict-Transport-Security(HSTS) 헤더가 확인된다면 SSL 환경 구축이 완료된 것입니다.

# www를 없애는 방법 (Apex 도메인 통합)

사용자가 www.xenialsoft.com 또는 일반 HTTP 경로로 접근하더라도 무조건 보안 프로토콜이 적용된 본래의 도메인(https://xenialsoft.com)으로 접속되도록 Nginx 서버 블록을 구조화합니다.

```nginx
# 1️⃣ HTTP (xenialsoft.com & www.xenialsoft.com) → HTTPS 메인 도메인 리디렉션
server {
    listen 80;
    server_name xenialsoft.com www.xenialsoft.com;

    return 301 https://xenialsoft.com$request_uri;
}

# 2️⃣ HTTPS www.xenialsoft.com → HTTPS 메인 도메인 리디렉션
server {
    listen 443 ssl http2;
    server_name www.xenialsoft.com;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/xenialsoft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xenialsoft.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://xenialsoft.com$request_uri;
}

# 3️⃣ HTTPS Main Domain → 내부 WAS (Nuxt.js 등) 프록시 연결
server {
    listen 443 ssl http2;
    server_name xenialsoft.com;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/xenialsoft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xenialsoft.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # 웹소켓 및 커넥션 유지 설정
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # 클라이언트 실제 정보 전달 헤더 (실무 필수)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
    }
}
```

:::tip [참고] Nginx 버전에 따른 HTTP/2 설정
Nginx 최신 버전(1.25.1 이상)을 사용하는 경우 listen 443 ssl http2; 형태의 단일 선언은 지원 중단(Deprecated) 경고가 발생할 수 있습니다. 경고가 발생할 경우 아래와 같이 분리하여 작성하시면 됩니다.
:::

```nginx
listen 443 ssl;
http2 on;
```