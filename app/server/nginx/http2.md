---
next: false
outline: deep
---

# HTTP2 적용

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