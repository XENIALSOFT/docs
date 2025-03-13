---
next: false
outline: deep
---
# nginx

## 설정

### nginx 설정 파일 작성

`server_name`과 `proxy_pass`를 주의하면서 작성합니다.

```bash
sudo vi /etc/nginx/sites-available/[앱 이름]
```

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

### nginx 설정 파일 활성화

`심볼릭 링크`로 `nginx`로 설정 파일을 활성화합니다.

```bash
# 심볼릭 링크
sudo ln -s /etc/nginx/sites-available/[앱 이름] /etc/nginx/sites-enabled/
# 테스트
sudo nginx -t
# nginx 재시작
sudo systemctl reload nginx
```

### 도메인 설정

사용하고 있는 업체에서 `A레코드`를 설정합니다.

:::tip
A 레코드와 CNAME 레코드의 차이

|목적|사용 레코드|설명|
|--|--|--|
|도메인 → IP 연결|A 레코드|aforclinic.xenialsoft.com → 123.123.123.123|
|도메인 → 도메인 연결|CNAME 레코드|clinic.xenialsoft.com → aforclinic.xenialsoft.com|
:::

### 포트 설정

```bash
sudo iptables -L --line
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT
```

## Let's Encrypt SSL 설정

`Let's Encrypt SSL`로 `SSL`을 적용하여 `https`를 사용할 수 있습니다.

### Certbot과 nginx 플러그인 설치

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### SSL 인증서 발급 및 적용

도메인에 대해 SSL 인증서를 발급하고 자동으로 Nginx 설정을 적용하려면 다음 명령어를 실행합니다.

```bash
sudo certbot --nginx -d xenialsoft.com
```

여러 개의 도메인을 적용하려면

```bash
sudo certbot --nginx -d xenialsoft.com -d www.xenialsoft.com
```

이 명령을 실행하면 이메일 입력 및 서비스 약관 동의 등의 과정이 진행되며, 성공적으로 인증서가 발급되면 `nginx` 설정이 자동으로 업데이트됩니다.

### SSL 인증서 자동 갱신 설정

Let's Encrypt SSL 인증서는 90일 동안만 유효하므로 자동 갱신을 설정해야 합니다.

자동 갱신이 잘 작동하는지 테스트하려면 다음 명령어를 실행하세요.

```bash
sudo certbot renew --dry-run
```

이 명령어가 정상적으로 실행되면 실제 갱신도 정상적으로 수행됩니다.

또한, 자동 갱신을 위한 크론 작업을 추가할 수도 있습니다.

```bash
sudo crontab -e
```

그리고 다음 내용을 추가합니다.

```bash
0 3 * * * /usr/bin/certbot renew --quiet
```

이 설정은 매일 새벽 3시에 SSL 인증서를 자동 갱신합니다.

### SSL 인증서 상태 확인

인증서의 상태를 확인하려면 다음 명령어를 실행하세요.

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

### nginx 서비스 재시작

SSL 적용 후 Nginx를 다시 시작하여 변경 사항을 반영합니다.

```bash
sudo systemctl restart nginx
```

### SSL 적용 확인

웹 브라우저에서 `https://xenialsoft.com`으로 접속하여 SSL 인증서가 정상적으로 적용되었는지 확인하세요.

또한, 명령어로 SSL 상태를 확인할 수도 있습니다.

```bash
curl -I https://xenialsoft.com
```

출력 예시:

```text
HTTP/2 200
server: nginx
...
```

이와 같이 응답 헤더에 `HTTP/2` 또는 `Strict-Transport-Security(HSTS)`가 포함되어 있다면 정상적으로 SSL이 적용된 것입니다.

이제 `Let's Encrypt SSL`을 사용하여 `HTTPS`를 적용하는 설정이 완료되었습니다.

## 압축 적용

대부분의 경우 압축(Gzip, Brotli)를 항상 적용하는 것이 좋습니다.

- 속도 향상: 압축을 사용하면 파일 크기가 줄어들어 웹 페이지 로딩 속도가 빨라짐
- 트래픽 절감: 서버와 클라이언트 간의 데이터 전송량이 줄어들어 대역폭 절약 가능
- SEO & 사용자 경험 개선: Google PageSpeed 점수 향상 & 사용자 만족감 증가

:::warning
언제 압축을 비활성화할까요?
- 서버에서 CPU 사용량이 높은 경우
- 비압축이 더 나은 상황(예: 이미 압축된 파일 - jpg, png, zip, mp4 등)
:::

## HTTP2 적용

HTTP2/는 웹사이트 속도를 더욱 빠르게 하기 위해 추천됩니다.

- 멀티플렉싱 지원: 여러 요청을 동시에 처리하여 속도향상
- 헤더 압축: HTTP/1.1보다 네트워크 사용량 절감
- 서버 푸시 지원: 클라이언트가 요청하기 전에 필요한 리소스를 미리 전송

```nginx
server {
    listen 443 ssl http2;  # HTTP/2 활성화
    server_name xenialsoft.com;
}
```