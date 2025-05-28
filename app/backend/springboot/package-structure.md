# 패키지 구조

## 현재 패키지 구조

- config
  - aspect
  - mybatis
  - properties
  - DataWebConfig
  - MessageConfig
  - MyBatisConfig
  - SecurityConfig
- core
- custom

## 개선된 패키지 구조

```markdown
- common/
  ├── annotation/
  ├── constant/
  │   ├── ApplicationCoreVersion.java
  ├── dto/
  │   ├── ApiPageRequest.java
  │   ├── ApiPageResponse.java
  │   └── ApiResponse.java
  ├── exception/
  │   ├── CustomRuntimeException.java
  │   └── GlobalExceptionHandler.java
  ├── support/
  │   ├── convert/
  │   │   ├── Converter.java
  │   │   └── BiConverter.java
  │   ├── CodeBasedEnum.java
  │   └── RowNumberSupport.java
  └── util/
      ├── AESUtils.java
      ├── HttpRequestUtils.java
      ├── NanoIdGenerator.java
      ├── RowNumberUtils.java
      └── SecurityUtils.java

- config/
  ├── aspect/
  │   ├── AspectConfig.java
  │   ├── AuditAspect.java
  │   └── LoggingAspect.java
  ├── cache/
  │   └── CacheConfig.java
  ├── mybatis/
  │   ├── MyBatisConfig.java
  │   └── typehandler/
  │       └── AESStringTypeHandler.java
  ├── properties/
  │   ├── ApplicationProperties.java
  │   ├── CorsProperties.java
  │   ├── JwtProperties.java
  │   ├── OAuth2Properties.java
  │   └── StorageProperties.java
  ├── scheduler/
  │   └── SchedulerConfig.java
  ├── security/
  │   ├── filter/
  │   │   ├── CustomUsernamePasswordAuthenticationFilter.java
  │   │   └── JwtAuthenticationFilter.java
  │   ├── handler/
  │   │   ├── JwtAccessDeniedHandler.java
  │   │   └── JwtAuthenticationEntryPoint.java
  │   ├── JwtProvider.java
  │   ├── MethodSecurityConfig.java
  │   └── SecurityConfig.java
  └── web/
      ├── filter/
      ├── interceptor/
      ├── MessageConfig.java
      └── WebConfig.java

- core/
  ├── auth/
  │   ├── constant/
  │   │   └── SystemRole.java
  │   ├── controller/
  │   │   └── AuthController.java
  │   ├── domain/
  │   │   ├── CustomUserDetails.java
  │   │   └── RefreshToken.java
  │   ├── dto/
  │   │   ├── request/
  │   │   │   └── RefreshTokenRequest.java
  │   │   └── response/
  │   │       ├── AccessTokenResponse.java
  │   │       └── TokenResponse.java
  │   ├── mapper/
  │   │   └── RefreshTokenMapper.java
  │   ├── scheduler/
  │   │   └── RefreshTokenCleanupScheduler.java
  │   └── service/
  │       ├── AuthService.java
  │       ├── CustomUserDetailsService.java
  │       └── RefreshTokenService.java
  └── member/
      ├── controller/
      ├── domain/
      ├── dto/
      │   ├── request/
      │   └── response/
      ├── mapper/
      └── service/

- modules/
  ├── admin/
  │   └── [도메인]
  │       ├── controller/
  │       ├── domain/
  │       ├── dto/
  │       │   ├── request/
  │       │   └── response/
  │       ├── mapper/
  │       └── service/
  └── custom/
      └── [도메인]
          ├── controller/
          ├── domain/
          ├── dto/
          │   ├── request/
          │   └── response/
          ├── mapper/
          └── service/
```

<!--
 {
  id=4173230255,
  connected_at=2025-05-27T05:12:27Z, 
  properties={
    nickname=멍, 
    profile_image=http://k.kakaocdn.net/dn/tJRky/btrZjZ8qwam/iGYjRKPvPLCKlF4ULVtbu1/img_640x640.jpg, 
    thumbnail_image=http://k.kakaocdn.net/dn/tJRky/btrZjZ8qwam/iGYjRKPvPLCKlF4ULVtbu1/img_110x110.jpg
  }, 
  kakao_account={
    profile_needs_agreement=false, 
    profile={
      nickname=멍, 
      thumbnail_image_url=http://k.kakaocdn.net/dn/tJRky/btrZjZ8qwam/iGYjRKPvPLCKlF4ULVtbu1/img_110x110.jpg, 
      profile_image_url=http://k.kakaocdn.net/dn/tJRky/btrZjZ8qwam/iGYjRKPvPLCKlF4ULVtbu1/img_640x640.jpg, 
      is_default_image=false, 
      is_default_nickname=false
    }, 
    has_phone_number=true, 
    phone_number_needs_agreement=false, 
    phone_number=+82 10-1234-1234
  }
}
-->

<!--
Nitro               Api
/api/auth/sign-in   /auth/sign-in           [credentials]   => [accesstoken, refreshtoken]
/api/auth/sign-out  /auth/sign-out          [refreshtoken]  => []
/api/auth/refresh   /auth/refresh           [refreshtoken]  => [accesstoken, refreshtoken]
/api/auth/token     /auth/refresh-token     [refreshtoken]  => [accesstoken]

/api/users/me       /users/me               []
-->

<!--
🧠 구조 분석: 인증 & 사용자 정보 분리 전략
클라이언트 플로우
리프레시 토큰 쿠키 확인

없다면 "로그아웃 상태"

리프레시 토큰으로 액세스 토큰 요청 (/auth/refresh-access)

성공 시 새 액세스 토큰 발급 (리프레시 토큰은 그대로 유지)

실패 시 → "로그아웃 처리"

액세스 토큰으로 세션 정보 요청 (/auth/me 또는 /users/me)

성공 시 사용자 정보 수신 → 로그인 유지

실패 시 → "로그아웃 처리"

✅ 장점
항목	설명
🔒 보안 강화	JWT만으로 인증하지 않고 사용자 정보를 명시적으로 검증
⚙ 세션 상태 없음	서버는 상태를 저장하지 않음 (stateless)
🪪 사용자 정보 최신화	JWT에 포함된 오래된 정보 대신 DB 기반 정보 반환 가능
🔁 갱신 로직 분리	액세스 토큰 재발급과 사용자 정보 조회를 분리 관리

✨ 추천 설계
1. /auth/refresh-access – 액세스 토큰 재발급
입력: refreshToken (쿠키 또는 Authorization 헤더)

출력: accessToken (Authorization 헤더 또는 응답 바디)

리프레시 토큰은 로테이션하지 않음 (access-only 갱신)

2. /auth/me – 사용자 세션 정보 조회
입력: Authorization: Bearer {accessToken}

처리: JWT에서 userId 파싱 → DB 조회

출력: UserInfoResponse (username, nickname, role 등)

java
복사
편집
@GetMapping("/auth/me")
public ResponseEntity<UserInfoResponse> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
    return ResponseEntity.ok(userService.getUserInfo(userDetails.getId()));
}
3. /auth/refresh – 액세스 + 리프레시 로테이션
리프레시 토큰 만료 or 명시적 요청 시 사용

📌 주의할 점
accessToken이 유효해도, 그 사용자 정보가 DB에서 삭제되었거나 탈퇴된 상태라면 /auth/me는 401 Unauthorized 를 리턴해야 합니다.

로컬스토리지에는 절대 refreshToken 저장 금지 (XSS 위험). 쿠키만 사용하세요 (HttpOnly, Secure 설정).

🎯 요약
목적	경로	설명
access 재발급	/auth/refresh-access	refresh 토큰으로 access 발급
세션 정보 조회	/auth/me	access 토큰 기반 사용자 정보 반환
완전 재발급	/auth/refresh	refresh & access 로테이션

이 구조는 스프링 시큐리티 + MyBatis + 커스텀 인증 환경에서 매우 안정적이며, OAuth2 로그인에도 쉽게 확장할 수 있습니다.

필요하다면 각 엔드포인트 컨트롤러/서비스/매퍼도 함께 작성해드릴 수 있어요.
-->

<!--
@ConditionalOnProperty(name = "scheduler.refresh-token.enabled", havingValue = "true", matchIfMissing = true)

로
-->

<!--
update 등은 read then write 패턴이 일반적임

public void updateMember(UpdateMemberRequest request) {
    Member member = memberMapper.findById(request.getId());

    if (member == null) {
        throw new NotFoundException("Member not found");
    }

    if (request.getUsername() != null) {
        member.setUsername(request.getUsername());
    }

    // Auditing 처리 (AOP나 직접)
    member.setUpdatedBy(SecurityUtils.getCurrentUserId());

    memberMapper.update(member);
}
-->

<!--
✅ 권장 방식:
AdminMemberController → AdminMemberService → MemberService

✅ 이유 1: 표현 계층과 도메인 계층을 분리
AdminMemberController는 관리자 요청의 특수성을 담당합니다.

MemberService는 도메인 로직을 담당합니다.

이 둘 사이에 AdminMemberService가 있으면, 컨트롤러가 도메인 서비스와 직접 얽히지 않음 → 역할 분리, 유지보수성 상승.
-->

<!--
1. security.filter
보안 흐름에 직접 관여하는 Spring Security 필터 체인용 필터
(보통 OncePerRequestFilter 또는 GenericFilterBean 확장)

| 예시                        | 설명                      |
| ------------------------- | ----------------------- |
| `JwtAuthenticationFilter` | JWT 토큰 기반 인증 필터         |
| `ExceptionHandlingFilter` | 인증 예외 변환                |
| `TokenValidationFilter`   | 헤더에 토큰이 존재할 경우 유효성 체크 등 |


2. web.filter
전역 요청 처리나 공통 HTTP 흐름 처리용 일반적인 웹 필터
(Spring Security와 직접 무관)

| 예시                | 설명                          |
| ----------------- | --------------------------- |
| `LoggingFilter`   | 요청/응답 로그 처리                 |
| `RequestIdFilter` | 추적용 UUID 생성 및 MDC 등록        |
| `XSSFilter`       | XSS 방지용 HTML sanitizer 필터 등 |

-->

<!--
com.xenialsoft.api
├── common                     # 공통 유틸리티, DTO, 예외, 보안 등
│   ├── annotation             # @Auditable 등 AOP 대상 어노테이션
│   ├── dto                    # ApiResponse, ApiPageRequest, ApiPageResponse 등
│   ├── exception              # GlobalExceptionHandler, 커스텀 예외
│   ├── support                # RowNumberSupport, Auditable 인터페이스 등
│   └── util                   # AESUtils, LoggingUtils, NanoIdGenerator 등
│
├── config                     # 설정
│   ├── aspect                 # AuditAspect, LoggingAspect 등
│   ├── security               # SecurityConfig, JwtProvider, 필터 등
│   ├── scheduler              # RefreshTokenCleanupScheduler 등
│   ├── web                    # WebMvc 설정, Interceptor, 등
│   ├── mybatis                # MyBatis 설정, TypeHandler, Mapper XML 등
│   └── properties             # AesProperties, MessageProperties 등
│
├── core                       # 핵심 도메인 계층
│   ├── auth                   # 로그인/인증/토큰 관련
│   │   ├── controller
│   │   ├── service
│   │   ├── mapper
│   │   ├── domain             # 엔티티 (RefreshToken 등)
│   │   ├── dto                # TokenRequest, TokenResponse 등
│   │   └── support            # AuthConverter, AuthAssembler
│   │
│   ├── member                 # 사용자 도메인
│   │   ├── controller
│   │   ├── service
│   │   ├── mapper
│   │   ├── domain
│   │   └── dto
│   │
│   └── [추가 도메인]          # 예: 게시판, 예약 등
│
├── admin                      # 관리자 전용 기능
│   └── [도메인 단위로 구성]   # admin.member, admin.appointment 등
│
├── custom                     # 사이트/지점별 커스터마이징 기능
│   └── [도메인 단위로 구성]   # custom.notice, custom.member 등
│
└── Application.java           # 메인 실행 클래스
-->