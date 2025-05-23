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
  ├── constants/
  ├── dto/
  │   ├── ApiPageResponse.java
  │   └── ApiResponse.java
  ├── exception/
  │   ├── AuthException.java
  │   └── GlobalExceptionHandler.java
  ├── support/
  │   ├── convert/
  │   │   ├── Converter.java
  │   │   └── BiConverter.java
  │   ├── Auditable.java
  │   └── RowNumberSupport.java
  └── util/
      └── SecurityUtils.java

- config/
  ├── aspect/
  │   ├── AspectConfig.java
  │   └── LoggingAspect.java
  ├── mybatis/
  │   ├── MyBatisConfig.java
  │   └── typehandle/
  │       └── AESTypeHandler.java
  ├── scheduler/
  │   └── SchedulerConfig.java
  ├── security/
  │   ├── filter/
  │   │   ├── CustomUsernamePasswordAuthenticationFilter.java
  │   │   └── JwtAuthenticationFilter.java
  │   ├── JwtConfig.java
  │   └── SecurityConfig.java
  └── web/
      ├── filter/
      ├── interceptor/
      ├── CorsConfig.java
      └── WebConfig.java (with DataWebConfig.java)

- core/
  ├── auth/
  │   ├── constants/
  │   ├── controller/
  │   │   └── AuthController.java
  │   ├── support/
  │   │   ├── AuthConverter.java
  │   │   └── AuthAssembler.java
  │   ├── domain/
  │   │   └── RefreshToken.java
  │   ├── dto/
  │   │   ├── request/
  │   │   └── response/
  │   │       └── TokenResponse.java
  │   ├── mapper/
  │   │   └── RefreshTokenMapper.java
  │   ├── scheduler/
  │   │   └── RefreshTokenCleanupScheduler.java
  │   └── service/
  │       ├── AuthService.java
  │       └── CustomUserDetailsService.java
  └── member/
      ├── controller/
      ├── domain/
      ├── dto/
      │   ├── request/
      │   └── response/
      ├── mapper/
      └── service/

- admin/
  └── [도메인]/
      ├── controller/
      ├── domain/
      ├── dto/
      │   ├── request/
      │   └── response/
      ├── mapper/
      └── service/

- custom/
  └── [도메인]/
      ├── controller/
      ├── domain/
      ├── dto/
      │   ├── request/
      │   └── response/
      ├── mapper/
      └── service/
```

<!--
https://chatgpt.com/share/68302ca6-a3f0-8004-aae1-5946539441a5
-->

<!--
변환 로직은 엔티티가 담당하고 dto에서는 변환 책임이나 로직은 지양한다.

엔티티가 담당할 변환 로직이 많아진다면 별도의 컨버터를 두어 변환을 담당하도록 한다.

네이밍은 ~Converter나 ~Assembler

public interface Converter<S, T> {
    T convert(S source);
}

public interface BiConverter<S, T> extends Converter<S, T> {
    S reverse(T target);
}
-->

<!--
🧱 구조 정의
📌 Entity (Domain) - Post.java
java
복사
편집
@Getter
@AllArgsConstructor
public class Post {
    private final Long id;
    private final String title;
    private final String content;
    private final Long authorId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static Post create(String title, String content, Long authorId) {
        return new Post(null, title, content, authorId, null, null);
    }

    public Post update(String title, String content) {
        return new Post(this.id, title, content, this.authorId, this.createdAt, LocalDateTime.now());
    }
}
📌 DTO
java
복사
편집
@Getter
@AllArgsConstructor
public class PostRequest {
    private final String title;
    private final String content;
}
java
복사
편집
@Getter
@AllArgsConstructor
public class PostUpdateRequest {
    private final String title;
    private final String content;
}
java
복사
편집
@Getter
@Builder
@AllArgsConstructor
public class PostResponse {
    private final Long id;
    private final String title;
    private final String content;
    private final String authorName;
    private final LocalDateTime createdAt;
}
💾 Mapper
📄 PostMapper.java
java
복사
편집
@Mapper
public interface PostMapper {

    void insert(Post post);

    void update(Post post);

    void delete(@Param("id") Long id);

    Post findById(@Param("id") Long id);

    List<PostResponse> findAllWithAuthorName();
}
📄 PostMapper.xml
xml
복사
편집
<insert id="insert" parameterType="Post">
    INSERT INTO post (title, content, author_id, created_at)
    VALUES (#{title}, #{content}, #{authorId}, NOW())
</insert>

<update id="update" parameterType="Post">
    UPDATE post
    SET title = #{title}, content = #{content}, updated_at = NOW()
    WHERE id = #{id}
</update>

<delete id="delete">
    DELETE FROM post WHERE id = #{id}
</delete>

<select id="findById" resultType="Post">
    SELECT id, title, content, author_id, created_at, updated_at
    FROM post
    WHERE id = #{id}
</select>

<select id="findAllWithAuthorName" resultType="PostResponse">
    SELECT 
        p.id, p.title, p.content, m.username AS authorName, p.created_at
    FROM post p
    JOIN member m ON p.author_id = m.id
    ORDER BY p.created_at DESC
</select>
🧠 Service
📄 PostService.java
java
복사
편집
@RequiredArgsConstructor
@Service
public class PostService {

    private final PostMapper postMapper;

    public List<PostResponse> getAllPosts() {
        return postMapper.findAllWithAuthorName();
    }

    public PostResponse getPost(Long postId) {
        Post post = postMapper.findById(postId);
        // 응답 전용 DTO로 변환
        return PostResponse.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .authorName("작성자 조회 로직 필요")
            .createdAt(post.getCreatedAt())
            .build();
    }

    public void createPost(PostRequest request, Long authorId) {
        Post post = Post.create(request.getTitle(), request.getContent(), authorId);
        postMapper.insert(post);
    }

    public void updatePost(Long postId, PostUpdateRequest request) {
        Post original = postMapper.findById(postId);
        Post updated = original.update(request.getTitle(), request.getContent());
        postMapper.update(updated);
    }

    public void deletePost(Long postId) {
        postMapper.delete(postId);
    }
}
🎯 Controller
java
복사
편집
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    @GetMapping
    public List<PostResponse> list() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public PostResponse detail(@PathVariable Long id) {
        return postService.getPost(id);
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody PostRequest request,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        postService.createPost(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id,
                                       @RequestBody PostUpdateRequest request) {
        postService.updatePost(id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
✅ 정리
계층	역할	사용 객체
Controller	요청/응답 처리	DTO만 사용
Service	비즈니스 로직 처리	DTO ↔ Entity 변환
Mapper	DB 액세스	Entity (조회는 DTO도 가능)
XML	실제 쿼리 정의	Entity for Insert/Update, DTO for Select

필요하시다면 이 게시판 예제를 기반으로 테스트 코드, 댓글 기능 확장, 페이징 처리 등도 이어서 도와드릴 수 있어요.
-->

<!--
🧠 구조 분석: 인증 & 사용자 정보 분리 전략
클라이언트 플로우
리프레시 토큰 쿠키 확인

없다면 "로그아웃 상태"

리프레시 토큰으로 액세스 토큰 요청 (/auth/reissue-access)

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
1. /auth/reissue-access – 액세스 토큰 재발급
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
access 재발급	/auth/reissue-access	refresh 토큰으로 access 발급
세션 정보 조회	/auth/me	access 토큰 기반 사용자 정보 반환
완전 재발급	/auth/refresh	refresh & access 로테이션

이 구조는 스프링 시큐리티 + MyBatis + 커스텀 인증 환경에서 매우 안정적이며, OAuth2 로그인에도 쉽게 확장할 수 있습니다.

필요하다면 각 엔드포인트 컨트롤러/서비스/매퍼도 함께 작성해드릴 수 있어요.
-->

<!--
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService service;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return service.getUserByUsername(username)
            .map(user -> CustomUserDetails.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build())
            .orElseThrow(() -> {
                log.warn("사용자를 찾을 수 없습니다. => username: {}", username);
                return new UsernameNotFoundException("User Not Found");
            });
    }
}
-->

<!--
AuthController에서는

sign-in
sign-out
sign-up
reissue-access
refresh

화면에서는

Sign in: /api/auth/login (POST) => sign-in
Sign out /api/auth/logout (POST) => sign-out
Sign up: /api/auth/register (POST) => sign-up
Get Session: /api/auth/session (GET) => 

/api/auth/token (GET) => reissue-access
/api/auth/refresh (GET) => refresh
-->

<!--
결론: "/auth/sign-in"이 더 명확하고 RESTful한 네이밍입니다.

로그인: /auth/sign-in

로그아웃: /auth/sign-out

회원가입: /auth/sign-up

토큰 갱신: /auth/refresh

토큰 발급(내부 API 용): /auth/token
-->

<!--
CustomUsernamePasswordAuthenticationFilter.java

@Override
protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
        Authentication authentication) throws IOException, ServletException {
    SecurityContextHolder.getContext().setAuthentication(authentication);
    chain.doFilter(request, response);
}

💡 요약
🔒 기본 인증 객체를 그대로 사용하는 것이 바람직하다.

🔧 새로 생성은 특수 상황에서만 고려한다.

📦 현재 구조와 보안 관점에서는 단순하고 명확한 코드가 좋다.
-->

<!--
package config.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.io.IOException;

public class CustomUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    public CustomUsernamePasswordAuthenticationFilter(AuthenticationManager authenticationManager) {
        super.setAuthenticationManager(authenticationManager);
        super.setRequiresAuthenticationRequestMatcher(
                new AntPathRequestMatcher("/auth/issue", "POST")
        );
    }

    /**
     * 로그인 요청에서 사용자 이름과 비밀번호를 추출하여 인증을 시도합니다.
     */
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        String username = obtainUsername(request);
        String password = obtainPassword(request);

        if (username == null) username = "";
        if (password == null) password = "";

        username = username.trim();

        UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(username, password);

        setDetails(request, authRequest);
        return getAuthenticationManager().authenticate(authRequest);
    }

    /**
     * 인증 성공 시 인증 정보를 SecurityContext에 저장하고 체인을 계속 진행합니다.
     */
    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authResult
    ) throws IOException, ServletException {

        SecurityContextHolder.getContext().setAuthentication(authResult);
        chain.doFilter(request, response);
    }

    /**
     * 인증 실패 시 처리 로직. 기본 로직을 사용하되, 커스터마이징 가능.
     */
    @Override
    protected void unsuccessfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException failed
    ) throws IOException, ServletException {
        super.unsuccessfulAuthentication(request, response, failed);
    }
}
-->

<!--
@ConditionalOnProperty(name = "scheduler.refresh-token.enabled", havingValue = "true", matchIfMissing = true)

로
-->

<!--
✅ 결론
추천 경로:

src/main/resources/mapper/[도메인]/[매퍼이름].xml

도메인 기준으로 잘 분리되어 있어서 현재 잡아놓은 core.member.mapper 등의 구조와 완벽히 매칭되며, 실무에서도 가장 널리 사용되는 구조입니다.
-->

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