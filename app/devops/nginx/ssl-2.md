새 서버를 Xenial(nginx + certbot + PM2 + Admin SSL 모니터링) 기준으로 구성할 때 **권장 순서**입니다. “인프라 → 인증서 → 앱 → Admin SSL” 순이 안전합니다.

---

## Phase 0 — 사전 (서버 만들기 전)

1. **도메인 DNS**
   - Site: `alpha.xenialsoft.com` (또는 고객 도메인)
   - Admin: `admin.xenialsoft.com`
   - 둘 다 **같은 서버 IP** A 레코드
2. **방화벽**: 22, **80**, **443** 개방 (Lightsail 네트워킹)
3. **실행 사용자**: `ubuntu` (PM2도 이 사용자로 통일)

---

## Phase 1 — OS·런타임

```text
1. 패키지 업데이트
2. nginx
3. certbot (+ nginx 플러그인: python3-certbot-nginx 등)
4. Node.js 24 + pnpm + PM2
5. Java 21 + DB(PostgreSQL 등) — API용
```

Spring API는 **8080 루프백만** — 외부에 8080 열지 않음.

---

## Phase 2 — nginx (HTTP 먼저)

1. Site vhost → `127.0.0.1:3000`
2. Admin vhost → `127.0.0.1:4000`
3. **먼저 HTTP(80)** 로 certbot이 챌린지 통과할 수 있게 설정
4. `sudo nginx -t && sudo systemctl reload nginx`

---

## Phase 3 — SSL 최초 발급 (certbot)

**앱 배포 전/후 모두 가능하지만, 80이 열려 있어야 함.**

```bash
sudo certbot --nginx -d alpha.xenialsoft.com
sudo certbot --nginx -d admin.xenialsoft.com
sudo certbot certificates   # cert-name 확인
sudo certbot renew --dry-run
```

**자동 갱신 cron** (root crontab):

```bash
sudo crontab -e
```

```bash
0 3 * * * certbot renew --quiet --deploy-hook "nginx -t && systemctl reload nginx"
```

(또는 distro `certbot.timer` — cron과 **하나만**)

---

## Phase 4 — 애플리케이션 배포

| 순서 | 구성 | 포트 | 비고 |
|------|------|------|------|
| 1 | DB + Spring API | 8080 | `127.0.0.1`만 |
| 2 | Site (Nuxt) | 3000 | PM2 |
| 3 | Admin (Nuxt) | 4000 | PM2 |

Admin PM2 `env_production` 예:

```javascript
NODE_ENV: 'production',
PORT: 4000,
HOST: '127.0.0.1',
NUXT_API_BASE_URL: 'http://127.0.0.1:8080',        // 서버 전용 (PUBLIC 아님)
NUXT_PUBLIC_SITE_ORIGIN: 'https://alpha.xenialsoft.com',
NUXT_PUBLIC_ADMIN_ORIGIN: 'https://admin.xenialsoft.com',
NUXT_SSL_RENEW_SCRIPT_PATH: '/var/www/admin/scripts/ssl-renew.sh',
```

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## Phase 5 — Admin UI SSL 갱신용 (UI 갱신 버튼 쓸 때)

### 5-1. 스크립트 배치

`/var/www/admin/scripts/ssl-renew.sh` (예시 repo: `apps/admin/scripts/ssl-renew.example.sh` 기준, **아래 내용 권장**):

```bash
#!/bin/bash
set -euo pipefail
CERT_NAME="${1:?cert name required}"

sudo -n certbot renew \
  --cert-name "$CERT_NAME" \
  --force-renewal \
  --non-interactive \
  --no-random-sleep-on-renew

sudo -n nginx -t
sudo -n systemctl reload nginx
```

```bash
chmod +x /var/www/admin/scripts/ssl-renew.sh
```

### 5-2. sudoers (PM2=ubuntu, no stdin)

```bash
sudo visudo -f /etc/sudoers.d/xenial-ssl-renew
```

```text
Defaults:ubuntu !requiretty
ubuntu ALL=(root) NOPASSWD: /usr/bin/certbot, /usr/sbin/nginx, /usr/bin/systemctl reload nginx
```

(`which certbot nginx systemctl` 로 경로 확인)

### 5-3. **필수 검증** (터미널 A vs PM2/UI B)

```bash
# A — 터미널 (참고용, 성공해야 함)
time sudo -u ubuntu /var/www/admin/scripts/ssl-renew.sh alpha.xenialsoft.com

# B — PM2/UI와 동일 (반드시 성공해야 UI 갱신 가능)
time sudo -u ubuntu /var/www/admin/scripts/ssl-renew.sh alpha.xenialsoft.com </dev/null
```

B가 5~10초에 끝나지 않으면 **`--non-interactive` / sudoers** 를 다시 확인.

---

## Phase 6 — nginx 운영 튜닝 (선택)

- Admin `location /api/system/ssl-renew` 에 `proxy_read_timeout 120s;` (여유)
- `--non-interactive` 로 보통 10초 이내라 필수는 아님

---

## Phase 7 — Admin에서 확인

1. **시스템 설정 → SSL 인증서** — Site·Admin 만료일 2행
2. **다시 조회** — TLS 조회 OK
3. **갱신** (선택) — B 테스트 통과 후

---

## 한 페이지 체크리스트

```text
□ DNS (Site + Admin → 서버 IP)
□ 80/443 개방
□ nginx HTTP → certbot 최초 발급 (2 cert)
□ certbot cron/timer
□ API :8080 (루프백)
□ Site PM2 :3000, Admin PM2 :4000
□ Admin env: NUXT_PUBLIC_*_ORIGIN, NUXT_SSL_RENEW_SCRIPT_PATH, NUXT_API_BASE_URL
□ ssl-renew.sh (--non-interactive, sudo -n)
□ sudoers (ubuntu NOPASSWD)
□ B 테스트 (script </dev/null) Site + Admin 각각
□ Admin SSL 화면 확인
```

---

## UI 갱신 버튼을 안 쓸 때

**Phase 5(sudoers·ssl-renew.sh)는 생략 가능**합니다.  
cron 자동 갱신 + Admin **만료 모니터링만** 쓰면 됩니다.

---

## 흔한 실수 (이번에 겪은 것)

| 실수 | 결과 |
|------|------|
| `NUXT_SSL_RENEW_SCRIPT` (PATH 없음) | 503 |
| 스크립트에 `--non-interactive` 없음 | B/UI hang |
| sudoers 없이 `sudo certbot` | no-stdin hang |
| certbot lock 잔여 | “Another instance…” |
| `NUXT_PUBLIC_API_BASE_URL`만 설정 | API upstream 오류 가능 → **`NUXT_API_BASE_URL`** |

새 서버는 **Phase 3(certbot+cron)까지 먼저**, 앱 올린 뒤 **Phase 5 + B 테스트**까지 한 번에 마치는 흐름을 추천합니다.  
runbook을 repo `docs/`에 문서로 남기고 싶으시면 Agent 모드에서 정리해 드릴 수 있습니다.