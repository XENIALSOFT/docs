---
outline: deep
---
# OAuth2

## OAuth2 인증 후 원래 보던 화면으로 이동 하는 방법

### `referer`를 이용하여 리디렉션하는 방식

**장점**

1. OAuth 로그인 후 사용자가 원래 보던 페이지로 이동 가능
  - 사용자가 로그인하기 전 페이지로 돌아갈 수 있어 UX가 개선될 수 있습니다.
2. 별도의 리디렉션 URL을 관리할 필요가 없습니다.
  - 일반적으로 OAuth 로그인 후 특정 경로로 이동하는 설정을 해야 하는데, `referer`를 사용하면 자동으로 이전 페이지로 이동합니다.
3. 로그인 과정이 보다 자연스러움
  - 로그인 후 특정 고정 페이지로 이동하는 방식보다 사용자가 원하는 흐름을 유지할 수 있습니다.

**단점 및 고려해야 할 점**

1. 보안 이슈(Open Redirect)
  - `referer` 값이 공격자가 조작한 URL일 경우, 악성 사이트로 리디렉션될 위험이 있습니다.
2. `referer`가 항상 존재하는 것은 아님
  - 브라우저나 보안 설정에 따라 `referer` 값이 비어있을 수 있습니다.
  - 이 경우 `NullPointerException`이 발생하거나, 로그인 후 이동할 페이지가 없어질 수 있습니다.
3. OAuth 로그인 시 외부 사이트에서 진입하는 경우
  - 사용자가 검색 엔진에서 직접 OAuth 로그인 페이지로 온 경우 `referer` 값이 없거나 원하지 않는 값일 수 있습니다.

**안전한 방식으로 개선하는 방법**

1. `referer` 값이 유효한지 검증
  ```java
  String referer = request.getHeader(HttpHeaders.REFERER);
  if (referer == null || !referer.startsWith("https://xenialsoft.com")) {
    referer = "https://xenialsoft.com"
  }
  response.sendRedirect(referer);
  ```
  - `referer` 값이 **내 도메인**인지 검증 후 리디렉션합니다.
  - `referer` 값이 없거나 유효하지 않다면 특정 URL로 이동합니다.

2. 로그인 전에 `session` 또는 `state` 값으로 리디렉션 URL 저장
  - OAuth 인증을 시작할 때, `session` 또는 `state` 값에 원래 방문했던 URL을 저장합니다.
  - 로그인 후 해당 URL로 리디렉션합니다.
  ```java
  String redirectUrl = (String) request.getSession().getAttribute("redirectUrl");
  response.sendRedirect(redirectUrl != null ? redirectUrl : "/");
  ```
