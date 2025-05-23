# AuthController

## 역할

로그인, 로그아웃, 토큰 발급 및 갱신 처리

핵심은 인증과 인가 처리

| 메서드    | 경로                     | 설명                                    |
| ------ | ---------------------- | ------------------------------------- |
| `POST` | `/auth/login`          | 로그인 (JWT + Refresh 토큰 발급)             |
| `POST` | `/auth/logout`         | 로그아웃 (Refresh 토큰 삭제 등)                |
| `POST` | `/auth/reissue-access` | 액세스 토큰 재발급 (Refresh 유효 시 Access만 재발급) |
| `POST` | `/auth/refresh`        | 액세스 + 리프레시 토큰 모두 재발급 (Refresh 만료 시)   |


✅ /auth/reissue-access 와 /auth/refresh 는 기능적으로 구분이 있으므로 이렇게 나누는 것이 좋습니다.

/auth/reissue-access: Refresh는 유효하지만 Access 만료 → Access만 재발급

/auth/refresh: Refresh도 만료됨 → 두 토큰 모두 재발급 (Rotation)

