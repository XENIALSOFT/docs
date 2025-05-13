# 파일 업로드 용량 제한 설정

업로드 시 다음 에러가 발생하면 `Nginx` 설정이 부족한 경우입니다.

- `413 Request Entity Too Large`

## 설정 파일 위치(Ubuntu 24 기준)

`/etc/nginx` 디렉토리에 설정 파일들이 있습니다.

|파일/디렉토리|설명|
|-----------|----|
|`/etc/nginx/nginx.conf`|메일 설정 파일|
|`/etc/nginx/sites-available/`|가상 호스트 설정 파일이 위치하는 디렉토리|
|`/etc/nginx/sites-enabled/`|실제로 적용되는 설정 (sites-available의 심볼릭 링크)|

## `client_max_body_size` 설정 방법

### 전체 서버에 적용(`nginx.conf`)

```bash
sudo vi /etc/nginx/nginx.conf
```

```nginx
http {
    ...
    client_max_body_size 10M;
    ...
}
```

이 설정은 모든 도메인과 모든 요청에 적용됩니다.

### 특정 사이트에만 적용(`sites-available/`)

```bash
sudo vi /etc/nginx/sites-available/[앱]
```

```nginx
server {
    listen 80;
    server_name example.com;

    # 이 부분에서 파일 사이즈 설정
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;
        ...
    }
}
```

## 설정 테스트 및 적용

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

## 설정 반영 확인

`413 Request Entity Too Large` 오류가 없어졌다면 설정이 완료된 것입니다.

## 추가

- `Spring Boot`에서의 업로드 설정(`application.yml`)과 `Nginx`의 설정을 일치시키는 것이 좋습니다.
- 너무 크게 설정한 경우 DOS 공격 등 보안 이슈에 대비해 제한을 걸어두는 것이 좋습니다.