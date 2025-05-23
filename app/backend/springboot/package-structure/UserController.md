# UserController

## 역할

사용자 CRUD 처리

핵심은 사용자 도메인에 대한 모든 처리

| 메서드      | 경로          | 설명               |
| -------- | ----------- | ---------------- |
| `POST`   | `/users`    | 회원가입             |
| `GET`    | `/users/me` | 내 정보 조회 (JWT 기반) |
| `PATCH`  | `/users/me` | 내 정보 수정          |
| `DELETE` | `/users/me` | 회원 탈퇴            |
