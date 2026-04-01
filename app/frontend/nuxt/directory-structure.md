# 디렉토리 구조

```markdown
- app/

- server/

- shared/
```

<!--
const { data } = await useAsyncData('dashboard', async () => {
  const [userResult, settingsResult] = await Promise.allSettled([
    $api('/user/me'),
    $api('/settings')
  ]);

  return {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    settings: settingsResult.status === 'fulfilled' ? settingsResult.value : null,
    userError: userResult.status === 'rejected' ? userResult.reason : null,
    settingsError: settingsResult.status === 'rejected' ? settingsResult.reason : null
  };
});
-->

<!--
<script setup lang="ts">
import { ref } from 'vue'

/** 헬퍼 함수: 실패 시 기본값으로 대체 */
function unwrap<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback
}

// 반응형 상태 선언
const categories = ref([])
const products = ref([])
const recommended = ref([])

const results = await Promise.allSettled([
  $api('/api/categories'),
  $api('/api/products'),
  $api('/api/products/recommended')
])

// unwrap으로 안전하게 추출
categories.value = unwrap(results[0], categories.value)
products.value = unwrap(results[1], products.value)
recommended.value = unwrap(results[2], recommended.value)
</script>
-->

<!--
oauth.get.ts에서

const referer = event.node.req.headers.referer || '/';

대신 클라이언트에서 값을 주어서 받는 형식으로 하는 것이 좋음

1. 클라이언트에서 주어진 값
2. 레퍼러
3. 루트
-->

<!--
useAuth
  status
  data
  token
  getSession(f)
  signIn(f)
  signOut(f)
-->

<!--
export const usAuth = defineStore(`auth`, () => {
  const status = ref<`unauthenticated` | `loading ` | `authenticated`>(`unauthenticated`);
  const data = ref<SessionData | undefined | null>(); // undefined는 초기, 인증 실패 시 null, 인증 성공 시 SessionData
  const token = ref<string>();

  async function signIn(credentials: {
    username: string;
    password: string;
  }): Promise<boolean> {

    status.value = `loading`;

    try {
      const response = await $fetch(`/api/auth/sign-in`, {
        method: `post`,
        body: credentials,
      });

      if (response.accessToken) {
        token.value = response.accessToken;
        status.value = `authenticated`;
        return true;
      } else {
        token.value = null;
        status.value = `unauthenticated`;
        return false;
      }
    } catch (error) {
      console.error(`로그인 실패:`, error);
      token.value = null;
      status.value = `unauthenticated`;
      return false;
    }
  }

  async function signOut() {
    try {
      await $fetch(`/api/auth/sign-out`, {
        method: `post`,
        credentials: `include`,
      });
    } catch (error) {
      console.warn(`로그아웃 실패(무시):`, error);
    } finally {
      $reset();
    }

    return navigateTo({ path: '/' }, { replace: true });
  }

  // SessionData
  async function getSession() {
    try {
      const response = await $api<ApiResponse<SessionData>>(`/users/me`);
      data.value = response.data;
      status.value = `authenticated`;
    } catch (error) {
      console.warn(`세션 정보 불러오기 실패:`, error);
      data.value = null;
      status.value = `unauthenticated`;
    }
  }

  function $reset() {
    status.value = `unauthenticated`;
    data.value = undefined;
    token.value = undefined;
  }

  return {
    status,
    data,
    token,
    signIn,
    signOut,
    getSession,
  }
});
-->