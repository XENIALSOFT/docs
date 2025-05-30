# 미들웨어를 활용한 주소 이동

## 상황

기존 경로에서 새로운 경로로 이동할 때 기존 경로도 유지하고 싶습니다.

## 문제

경로가 바뀌어서 파일까지 변경하면 기존 경로는 사용할 수 없습니다.

때문에 미들웨어를 사용하여 기존 경로로 오면 새로운 경로로 영구적인 이동을 알려줘야 합니다.

## 해결

리디렉션 맵을 만들어서 기존 경로와 새로운 경로를 매핑시켜주어 미들웨어에서 이동시킵니다.

```ts
// middleware/permanent-redirect.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const redirects: Record<string, string> = {
    '/skin-center': '/skin-solution',
    // 다른 경로도 추가 가능
    // '/old-about': '/about',
  }

  const target = redirects[to.path]
  if (target) {
    return navigateTo(target, {
      redirectCode: 301,
      replace: true
    });
  }
})
```

## 심화

새로운 경로가 미래에 또 다른 경로로 변경될 수 있습니다.

예를 들어 `/alpha`에서 `/beta`로, 다시 `/beta`는 `/gamma`로

이러한 경우 리디렉션 맵이 1:1 매핑만을 지원하기 때문에 최종 목적지를 추적해야합니다.

최종 목적지 추적 대신 목적지를 항상 최신화 시켜주는 방법도 있습니다.

```ts
// middleware/permanent-redirect.global.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

type RedirectMap = Record<string, string>

const redirects: RedirectMap = {
  '/alpha': '/beta',
  '/beta': '/gamma',
  '/old-about': '/new-about',
};

/**
 * 재귀적으로 최종 리디렉션 경로를 찾는다.
 * 순환 참조 방지용 visited 셋을 사용.
 */
function resolve(
  path: string,
  redirects: RedirectMap,
  visited = new Set<string>()
): string | null {
  if (visited.has(path)) {
    return null
  }
  visited.add(path)

  const redirect = redirects[path]
  if (!redirect) return path

  return resolve(redirect, redirects, visited)
}

export default defineNuxtRouteMiddleware((to) => {
  const destination = resolve(to.path, redirects)
  if (destination && destination !== to.path) {
    return navigateTo(destination, {
      redirectCode: 301,
      replace: true
    });
  }
})
```