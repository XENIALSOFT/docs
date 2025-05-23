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
  │   ├── ApiPageRequest.java
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
  │   ├── AuditAspect.java
  │   └── LoggingAspect.java
  ├── mybatis/
  │   ├── MyBatisConfig.java
  │   └── typehandler/
  │       └── AESStringTypeHandler.java
  ├── scheduler/
  │   └── SchedulerConfig.java
  ├── security/
  │   ├── filter/
  │   │   ├── CustomUsernamePasswordAuthenticationFilter.java
  │   │   └── JwtAuthenticationFilter.java
  │   ├── handler/
  │   │   ├── JwtAccessDeniedHandler.java
  │   │   └── JwtAuthenticationEntryPoint.java
  │   ├── JwtConfig.java
  │   └── SecurityConfig.java
  └── web/
      ├── filter/
      ├── interceptor/
      ├── CorsConfig.java
      ├── MessageConfig.java
      └── WebConfig.java

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
│   ├── web                    # WebMvc 설정, Interceptor, CorsConfig 등
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