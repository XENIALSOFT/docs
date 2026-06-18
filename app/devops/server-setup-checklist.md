# 서버 설치·배포 체크리스트

> **대상 스택**: MariaDB · Nginx · Spring Boot API · Nuxt Admin · Nuxt Site · PM2 · Certbot  

---

## 0. 아키텍처 요약

```
[브라우저]
   │  HTTPS (80→443 리다이렉트)
   ▼
[Nginx :443]
   ├─ example.com        → Site Nitro (loopback :3000)  pm2: web
   └─ admin.example.com  → Admin Nitro (loopback :4000) pm2: admin

[루프백 전용 — 외부 비노출]
   Spring API :8080  pm2: api
   MariaDB     :3306

브라우저는 Spring API(:8080)를 직접 호출하지 않음.
Admin·Site Nitro BFF만 `NUXT_API_BASE_URL=http://127.0.0.1:8080` 으로 upstream 호출.
```

| 구성요소 | 배포 경로 (예시) | PM2 이름 | 루프백 포트 |
|----------|------------------|----------|-------------|
| API JAR | `/var/www/api/` | `api` | `8080` |
| Admin `.output` | `/var/www/admin/` | `admin` | `4000` |
| Site `.output` | `/var/www/web/` | `web` | `3000` |

---

## 1. 사전 준비 (서버 생성 직후)

### 1.1 DNS

- [ ] `A` 레코드: `example.com` → 서버 공인 IP
- [ ] `A` 레코드: `admin.example.com` → 서버 공인 IP
- [ ] (선택) `www` → `example.com` CNAME 또는 리다이렉트 정책 결정

### 1.2 OS·기본 설정

- [ ] Ubuntu 22.04/24.04 LTS 등 지원 OS 확인
- [ ] 타임존: `Asia/Seoul`
- [ ] 호스트명·`/etc/hosts` 정리
- [ ] `apt update && apt upgrade`
- [ ] 배포용 계정 생성 (예: `deploy`), SSH 키 로그인
- [ ] `sudo` 권한 부여
- [ ] (권장) `ufw` 또는 클라우드 방화벽:
  - **허용**: `22`, `80`, `443`
  - **차단(외부)**: `3306`, `8080`, `3000`, `4000`

### 1.3 런타임 버전

| 항목 | 버전 |
|------|------|
| JDK (API 실행) | **25** (Temurin 권장) |
| Node.js (Nuxt 실행) | **≥ 24** |
| pnpm (빌드 시) | **11.5+** (`packageManager` 고정) |

> 운영 서버에서는 CI(GitHub Actions)가 빌드·전송하고, 서버는 **실행만** 하는 구성을 권장합니다.

---

## 2. MariaDB

### 2.1 설치·보안

- [ ] `mariadb-server` 설치
- [ ] `mysql_secure_installation` 실행
- [ ] `bind-address = 127.0.0.1` (외부 접속 차단)
- [ ] 서비스 자동 시작: `systemctl enable mariadb`

### 2.2 DB·계정 생성

```sql
CREATE DATABASE xenial
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'xenial'@'localhost' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON xenial.* TO 'xenial'@'localhost';
FLUSH PRIVILEGES;
```

- [ ] DB명: `xenial`
- [ ] 문자셋: `utf8mb4`
- [ ] JDBC URL 예: `jdbc:mariadb://localhost:3306/xenial?serverTimezone=Asia/Seoul`

### 2.3 스키마

- [ ] `prod` 프로필은 `ddl-auto: validate` — **빈 DB로는 API 기동 실패**
- [ ] 최초 설치: 개발사 제공 스키마/마이그레이션 절차에 따라 테이블 생성
- [ ] API 기동 시 `*SchemaInitializer`가 idempotent DDL 보완 (업그레이드 시 로그 확인)

### 2.4 백업 (운영)

- [ ] 일일 `mysqldump` 또는 스냅샷 정책
- [ ] 복구 리허설 1회 이상

---

## 3. 파일 저장소 디렉터리

API 기본값: `STORAGE_ROOT=/app/data/storage`

- [ ] 디렉터리 생성: `/app/data/storage`
- [ ] API 프로세스 사용자에게 읽기/쓰기 권한
- [ ] (accel 사용 시) Nginx `alias` 경로와 동일하게 유지
- [ ] 디스크 용량 모니터링 (이미지·동영상 누적)

---

## 4. Spring Boot API (xenial-api)

### 4.1 배포 디렉터리

- [ ] `/var/www/api/` 생성
- [ ] JAR 배치: `api-0.0.1-SNAPSHOT.jar` (CI SCP 기준)

### 4.2 필수 환경 변수 (prod)

| 변수 | 설명 |
|------|------|
| `SPRING_PROFILES_ACTIVE` | `prod` (고객) / `staging` (벤더 스테이징) |
| `SPRING_DATASOURCE_URL` | MariaDB JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | HS256 서명 키 (**최소 256bit**) |
| `PII_ENCRYPTION_KEY` | AES-256-GCM 32바이트 Base64 |
| `PII_LOOKUP_PEPPER` | PII lookup HMAC pepper |
| `REFRESH_TOKEN_PURGE_GRACE_PERIOD` | 예: `24h` |
| `OAUTH_PUBLIC_BASE_URL` | **Site 공개 URL** (예: `https://example.com`) — 소셜 로그인 redirect |
| `LICENSE_KEY` | **prod 필수** — 개발사 발급 compact JWS |

### 4.3 선택 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `STORAGE_ROOT` | `/app/data/storage` | 파일 저장 루트 |
| `STORAGE_DELIVERY` | `direct` | `direct` \| `accel` (NGINX X-Accel) |
| `STORAGE_MAX_FILE_SIZE` | `10MB` | 업로드 최대 크기 — **Nginx와 반드시 일치** |
| `STORAGE_STAGED_TTL` | `24h` | 임시 업로드 TTL |
| `STORAGE_GC_RUN_INTERVAL` | `1h` | 고아 파일 GC 주기 |
| `KAKAO_OAUTH_CLIENT_ID` / `SECRET` | — | 카카오 로그인 |
| `NAVER_OAUTH_CLIENT_ID` / `SECRET` | — | 네이버 로그인 |
| `AUDIT_RETENTION_PERIOD` | `1095d` | 감사 로그 보존 |

### 4.4 PM2 — API 예시

```javascript
// /var/www/ecosystem.config.cjs (발췌)
{
  name: 'api',
  script: 'java',
  cwd: '/var/www/api',
  args: '-jar api-0.0.1-SNAPSHOT.jar',
  env: {
    SPRING_PROFILES_ACTIVE: 'prod',
    SPRING_DATASOURCE_URL: 'jdbc:mariadb://localhost:3306/xenial?serverTimezone=Asia/Seoul',
    SPRING_DATASOURCE_USERNAME: 'xenial',
    SPRING_DATASOURCE_PASSWORD: '<db-password>',
    JWT_SECRET: '<256bit+>',
    PII_ENCRYPTION_KEY: '<base64-32bytes>',
    PII_LOOKUP_PEPPER: '<pepper>',
    REFRESH_TOKEN_PURGE_GRACE_PERIOD: '24h',
    OAUTH_PUBLIC_BASE_URL: 'https://example.com',
    LICENSE_KEY: '<compact-jws>',
    STORAGE_ROOT: '/app/data/storage',
    STORAGE_MAX_FILE_SIZE: '10MB',   // 동영상 상향 시 Nginx도 같이
  },
  max_memory_restart: '1G',
  error_file: '/var/log/xenial/api-error.log',
  out_file: '/var/log/xenial/api-out.log',
}
```

- [ ] `pm2 start ecosystem.config.cjs --only api`
- [ ] `pm2 save`
- [ ] 헬스 확인: `curl -s http://127.0.0.1:8080/api/v1/health`

### 4.5 라이선스 (고객 prod)

- [ ] JWS는 **개발사 PC에서 오프라인 발급** (`generateLicenseKey`)
- [ ] `--site-origin`, `--admin-origin`이 실제 HTTPS 도메인과 일치
- [ ] 기능 확대(upsell) 시 `LICENSE_KEY` 교체 후 `pm2 restart api`

### 4.6 벤더 스테이징 (참고)

- [ ] `SPRING_PROFILES_ACTIVE=staging` → `LICENSE_KEY` 불필요
- [ ] Admin·Site pm2: `LICENSE_ENABLED=false`

---

## 5. Nuxt Admin (apps/admin)

### 5.1 배포

- [ ] `/var/www/admin/` 에 `.output/` 전개 (CI: `deploy.tar.gz` 압축 해제)
- [ ] 실행 엔트리: `.output/server/index.mjs`

### 5.2 필수 환경 변수

| 변수 | 예시 |
|------|------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `NUXT_API_BASE_URL` | `http://127.0.0.1:8080` |
| `NUXT_PUBLIC_SITE_ORIGIN` | `https://example.com` |
| `NUXT_PUBLIC_ADMIN_ORIGIN` | `https://admin.example.com` |

### 5.3 PM2 — Admin 예시

```javascript
{
  name: 'admin',
  script: '.output/server/index.mjs',
  cwd: '/var/www/admin',
  env: {
    NODE_ENV: 'production',
    PORT: 4000,
    NUXT_API_BASE_URL: 'http://127.0.0.1:8080',
    NUXT_PUBLIC_SITE_ORIGIN: 'https://example.com',
    NUXT_PUBLIC_ADMIN_ORIGIN: 'https://admin.example.com',
    LICENSE_ENABLED: 'false',  // 고객: host-policy (JWS 불필요)
  },
}
```

- [ ] `pm2 restart admin` 후 `curl -I http://127.0.0.1:4000`

---

## 6. Nuxt Site

### 6.1 배포

- [ ] `/var/www/web/` 에 `.output/` 전개
- [ ] PM2 이름: `web`

### 6.2 필수 환경 변수

| 변수 | 예시 |
|------|------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `NUXT_API_BASE_URL` | `http://127.0.0.1:8080` |
| `NUXT_PUBLIC_SITE_ORIGIN` | `https://example.com` |

### 6.3 PM2 — Site 예시

```javascript
{
  name: 'web',
  script: '.output/server/index.mjs',
  cwd: '/var/www/web',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
    NUXT_API_BASE_URL: 'http://127.0.0.1:8080',
    NUXT_PUBLIC_SITE_ORIGIN: 'https://example.com',
    LICENSE_ENABLED: 'false',
  },
}
```

---

## 7. PM2 공통·로그 로테이션

### 7.1 PM2 기본

- [ ] `npm i -g pm2`
- [ ] `pm2 startup` 출력 명령 실행 (재부팅 자동 기동)
- [ ] `pm2 save`

### 7.2 pm2-logrotate

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:workerInterval 3600
```

- [ ] 로그 디렉터리 생성: `/var/log/xenial/`
- [ ] `pm2 logs`로 api / admin / web 기동 확인

---

## 8. Nginx

### 8.1 설치

- [ ] `nginx` 설치·`systemctl enable nginx`
- [ ] `nginx -t` 문법 검사 습관화

### 8.2 업로드 크기 제한 (중요)

업로드 경로: **브라우저 → Nginx(Admin) → Nitro → Spring**  
세 곳의 한도를 **동일하게** 맞춥니다.

| 계층 | 설정 | 기본 |
|------|------|------|
| Nginx | `client_max_body_size` | `10m` (Spring 기본과 동일) |
| Spring | `STORAGE_MAX_FILE_SIZE` | `10MB` |
| Spring multipart | `spring.servlet.multipart.max-*` | env와 연동 |

동영상 등 상향 예: **전부 `50m` / `50MB`로 통일**

```nginx
# http { } 블록 또는 server 블록
client_max_body_size 10m;

# Admin 업로드만 별도 상향이 필요하면 location으로 분리 가능
location /api/files/upload {
    client_max_body_size 50m;
    proxy_pass http://127.0.0.1:4000;
    # ... proxy 헤더 (아래 8.4)
}
```

- [ ] 대용량 업로드 시 `proxy_read_timeout`, `proxy_send_timeout` (예: `300s`) 검토
- [ ] `STORAGE_MAX_FILE_SIZE` 변경 후 **Nginx reload + pm2 restart api** 함께 수행

### 8.3 프록시 공통 헤더 (감사 로그·OAuth·SSL 모니터링)

Nitro BFF가 `X-Forwarded-For`, `User-Agent`를 API로 전달합니다. Nginx에서 반드시 설정:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
proxy_set_header Connection "";
```

`/etc/nginx/snippets/proxy-headers.conf`로 묶어 `include` 하는 것을 권장합니다.

### 8.4 Site 서버 블록 예시

```nginx
# /etc/nginx/sites-available/example.com
server {
    listen 443 ssl http2;
    server_name example.com;

    # ssl_certificate ... (certbot이 채움)

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/snippets/proxy-headers.conf;
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

### 8.5 Admin 서버 블록 예시

```nginx
# /etc/nginx/sites-available/admin.example.com
server {
    listen 443 ssl http2;
    server_name admin.example.com;

    client_max_body_size 10m;   # 업로드 — Spring 한도와 동일

    location / {
        proxy_pass http://127.0.0.1:4000;
        include /etc/nginx/snippets/proxy-headers.conf;
    }
}
```

### 8.6 (선택) X-Accel-Redirect — `STORAGE_DELIVERY=accel`

Phase 1 기본은 `direct`. accel 전환 시:

**API env**

```bash
STORAGE_DELIVERY=accel
STORAGE_ROOT=/app/data/storage
# internal-prefix 기본: /protected/storage/
```

**Nginx internal location**

```nginx
location /protected/storage/ {
    internal;
    alias /app/data/storage/;   # STORAGE_ROOT와 동일, trailing slash 주의
}
```

- [ ] `alias` 경로 = `STORAGE_ROOT` 실제 경로
- [ ] 외부에서 `/protected/storage/` 직접 접근 불가 (`internal`)

### 8.7 보안·성능

- [ ] Spring `:8080` 에 대한 `server` 블록 **생성 금지** (외부 비노출)
- [ ] (권장) `limit_req` / `limit_conn` — 로그인·업로드 엔드포인트
- [ ] 정적 에셋 캐시는 Nuxt Nitro에 위임 (별도 root 불필요)

---

## 9. Certbot (Let's Encrypt)

### 9.1 최초 발급

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d example.com -d admin.example.com
```

- [ ] DNS 전파 완료 후 실행
- [ ] `nginx -t && systemctl reload nginx`
- [ ] HTTPS 접속 확인

### 9.2 자동 갱신

- [ ] `systemctl status certbot.timer` — active 확인
- [ ] `certbot renew --dry-run` 성공
- [ ] **Admin UI에서 SSL 갱신 버튼 없음** — `certbot.timer`가 하루 2회 `renew` 실행
- [ ] Admin **시스템 설정 → SSL 인증서** (`/settings/ssl`)에서 만료일 모니터링
  - `NUXT_PUBLIC_SITE_ORIGIN`, `NUXT_PUBLIC_ADMIN_ORIGIN` 정확히 설정되어 있어야 함

---

## 10. 최초 기동·데이터 시드

### 10.1 API 기동 순서

1. [ ] MariaDB 기동
2. [ ] `pm2 start api` → health OK
3. [ ] `pm2 start admin`, `pm2 start web`
4. [ ] Nginx reload

### 10.2 앱 초기화 (Admin 로그인 후)

- [ ] **앱 메타 초기화**: Admin → 시스템 또는 BFF `POST /api/system/app-info/initialize`
- [ ] **최초 SUPER_ADMIN**: prod에는 mock 계정 없음 — 개발사 제공 절차(SQL/일회성)로 생성
- [ ] 사이트 기본 설정(레이아웃·SEO·영업시간 등) 초기화

### 10.3 OAuth (사이트 회원 로그인)

- [ ] 카카오·네이버 개발자 콘솔 Redirect URI:
  - `https://example.com/login/oauth2/code/kakao`
  - `https://example.com/login/oauth2/code/naver`
- [ ] API pm2에 `KAKAO_OAUTH_*`, `NAVER_OAUTH_*` 설정
- [ ] `OAUTH_PUBLIC_BASE_URL=https://example.com`

---

## 11. 배포 후 검증 체크리스트

### 11.1 인프라

- [ ] `ss -tlnp` — `8080`/`3000`/`4000` 이 `127.0.0.1` 에만 바인딩
- [ ] 외부에서 `:8080` 접근 불가 확인
- [ ] `443` TLS 등급·인증서 만료일 확인

### 11.2 API

- [ ] `GET http://127.0.0.1:8080/api/v1/health` → 200
- [ ] Swagger UI 비활성 (prod)
- [ ] 라이선스 오류 없이 기동 (`LICENSE_KEY` 유효)

### 11.3 Site (`https://example.com`)

- [ ] 홈 SSR 렌더링
- [ ] `GET /api/health` (Nitro BFF) → upstream 정상
- [ ] 공개 파일 URL 형식: `{SITE_ORIGIN}/api/files/{id}/download`
- [ ] (해당 시) 회원 로그인·OAuth 플로우

### 11.4 Admin (`https://admin.example.com`)

- [ ] 로그인·세션 쿠키 (`accesstoken` / `refreshtoken`)
- [ ] 파일 업로드 테스트 (10MB 이하 기본)
- [ ] SSL 모니터링 화면에 Site·Admin origin 표시
- [ ] 감사 로그에 IP·User-Agent 기록 확인

### 11.5 업로드 한도 교차 검증

- [ ] Admin에서 `STORAGE_MAX_FILE_SIZE` 경계 크기 파일 업로드 성공
- [ ] 한도 초과 시 413 (Nginx) 또는 API ProblemDetail
- [ ] Nginx·Spring 한도 불일치 없음

---

## 12. CI/CD (GitHub Actions) — 참고

| 워크플로 | 산출물 | 서버 경로 | PM2 |
|----------|--------|-----------|-----|
| `deploy.yaml` (API) | `api-0.0.1-SNAPSHOT.jar` | `/var/www/api` | `pm2 restart api` |
| `deploy-admin.yaml` | `apps/admin/.output` tarball | `/var/www/admin` | `pm2 restart admin` |
| `deploy-web.yaml` | `apps/sites/**/*/.output` tarball | `/var/www/web` | `pm2 restart web` |

- [ ] Lightsail(또는 서버) SSH 시크릿 등록
- [ ] 배포 후 §11 검증 재실행

---

## 13. 운영·유지보수

| 주기 | 항목 |
|------|------|
| 일일 | `pm2 status`, 디스크·DB 용량 |
| 주간 | `certbot.timer`, 에러 로그 review |
| 배포 시 | `STORAGE_MAX_FILE_SIZE` ↔ Nginx 동기화 여부 |
| 기능 확대 | `LICENSE_KEY` 재발급 → `pm2 restart api` |
| 보안 | OS·MariaDB·Nginx 패치, `JWT_SECRET`·DB 비밀번호 주기 교체 정책 |

### 장애 시 빠른 확인

```bash
pm2 status
pm2 logs api --lines 100
curl -s http://127.0.0.1:8080/api/v1/health
curl -sI http://127.0.0.1:3000
curl -sI http://127.0.0.1:4000
nginx -t && systemctl status nginx
systemctl status mariadb
```

---

## 14. 환경별 빠른 참조

### 고객 prod (설치형)

```
API:   SPRING_PROFILES_ACTIVE=prod, LICENSE_KEY=필수
Admin: LICENSE_ENABLED=false, NUXT_PUBLIC_*=실제 HTTPS origin
Site:  LICENSE_ENABLED=false, NUXT_PUBLIC_SITE_ORIGIN=실제 HTTPS origin
```

### 벤더 staging

```
API:   SPRING_PROFILES_ACTIVE=staging (LICENSE_KEY 불필요)
Admin/Site: LICENSE_ENABLED=false
```

---

## 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-06-18 | 최초 작성 — MariaDB·Nginx·API·Admin·Site·PM2·Certbot·업로드 한도 |
