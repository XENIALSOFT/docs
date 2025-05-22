# 패키지 구조

## 현재 패키지 구조

- config
  - aspect
    - 
  - mybatis
  - properties
  - DataWebConfig
  - MessageConfig
  - MyBatisConfig
  - SecurityConfig
- core
- custom

## 개선된 패키지 구조

- common/
  - constants/
  - support/
    - Auditable.java
    - RowNumberSupport.java
  - exception/
    - GlobalExceptionHandler.java
    - AuthException.java
  - dto/
    - ApiResponse.java
    - ApiPageResponse.java
  - util/
    - SecurityUtils.java
- config/
  - settings/
    - MessageProperties.java
  - aspect/
    - LoggingAspect.java
    - AspectConfig.java
  - mybatis/
    - typehandle/
      - JsonTypeHandler.java
    - MyBatisConfig.java
  - security
    - filter/
    - SecurityConfig.java
    - JwtConfig.java
  - web
    - interceptor/
    - filter/
    - CorsConfig.java
    - WebConfig.java (with DataWebConfig.java)
- core/
  - auth/
    - constants/
    - domain/
    - dto/
      - request/
      - response/
    - mapper/
    - service/
    - controller/
  - member
    - domain/
    - dto/
      - request/
      - response/
    - mapper/
    - service/
    - controller/
- admin/
  - member
    - controller/
- custom/
  - member
    - controller/

<!--
📁 위치 추천
- common/
  - util/
    - SecurityUtils.java



package com.example.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {

    private SecurityUtils() {
        // 인스턴스화 방지
    }

    /**
     * 현재 인증된 사용자 이름(ID 또는 username) 반환
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();  // or getId() if overridden
        } else if (principal instanceof String) {
            return (String) principal;
        }

        return null;
    }

    /**
     * 인증 객체 전체 반환 (필요 시 커스텀 UserDetails 사용 가능)
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * 현재 로그인 여부 확인
     */
    public static boolean isAuthenticated() {
        Authentication authentication = getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !(authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser"));
    }

    /**
     * 사용자 ID(Long) 형태로 꺼내고 싶다면 커스텀 UserDetails에 ID 포함시켜야 함
     */
    public static Long getCurrentUserId() {
        Authentication authentication = getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getId(); // 이 부분은 사용자 정의 UserDetails 구현체 기준
        }

        return null;
    }
}
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
✅ 네이밍 팁
상수 클래스: ~Constants, ~Codes, ~Defaults 등의 네이밍이 좋습니다
(예: MemberConstants, AuthErrorCodes, UserDefaults)

유틸 클래스: ~Utils, ~Helper, ~Generator, ~Converter
-->

<!--
com.example.projectname
├── config                  # 전역 설정 관련
│   ├── settings           # @ConfigurationProperties 등 환경 설정 바인딩
│   ├── aspect             # AOP 관련 설정 및 클래스
│   ├── persistence        # DB / MyBatis / JPA 관련 설정
│   ├── security           # Spring Security 관련 설정
│   └── web                # WebMvc, 메시지 변환, CORS 등 설정
│
├── core                   # 비즈니스 핵심 도메인 계층 (관리 대상이 많을 경우 도메인 기준 세분화)
│   ├── auth               # 인증/인가 관련 도메인, 서비스, 인터페이스
│   │   ├── domain         # 핵심 도메인 모델 (User, Token 등)
│   │   ├── service        # 서비스 계층
│   │   ├── infra          # DB, Redis 등 외부 자원 접근 구현
│   │   └── api            # (선택) core-level 자체 API 제공 시
│   ├── member             # 회원 관련 도메인
│   │   ├── domain
│   │   ├── service
│   │   ├── infra
│   │   └── api
│   └── common             # 공통 유틸, 예외, 공통 응답 등
│
├── admin                  # 어드민 전용 API / 기능
│   ├── controller         # 어드민용 API
│   ├── service            # 어드민 전용 서비스 (core에 의존)
│   └── dto                # 어드민용 DTO
│
├── custom                 # 커스터머(일반 사용자) API / 기능
│   ├── controller         # 사용자용 API
│   ├── service            # 사용자 전용 서비스
│   └── dto                # 사용자용 DTO
│
└── Application.java       # SpringBootApplication Entry Point

-->