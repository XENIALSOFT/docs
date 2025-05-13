---
prev: false
outline: deep
---

# 시작하기

## 설정 파일 작성

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

## 설정 파일 활성화

`심볼릭 링크`로 `nginx`로 설정 파일을 활성화합니다.

```bash
# 심볼릭 링크
sudo ln -s /etc/nginx/sites-available/[앱 이름] /etc/nginx/sites-enabled/
# 테스트
sudo nginx -t
# nginx 재시작
sudo systemctl reload nginx
```

## 도메인 설정

사용하고 있는 업체에서 `A레코드`를 설정합니다.

:::tip
A 레코드와 CNAME 레코드의 차이

|목적|사용 레코드|설명|
|--|--|--|
|도메인 → IP 연결|A 레코드|aforclinic.xenialsoft.com → 123.123.123.123|
|도메인 → 도메인 연결|CNAME 레코드|clinic.xenialsoft.com → aforclinic.xenialsoft.com|
:::