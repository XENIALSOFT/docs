# NuxtImage(@nuxt/image)에서 `public/` 이미지가 표시되지 않는 문제 해결

> - **Nuxt**: `3.17.3`
> - **@nuxt/image**: `1.10.0`
> - **Node.js**: `22.11.0 (LTS)`
> - **pnpm**: `10.10.0`

Nuxt3에서 [`@nuxt/image`](https://image.nuxt.com) 모듈을 사용할 때 `public/` 디렉토리에 있는 이미지가 렌더링되지 않고, **500 오류(IPX_ERROR)**가 발생하는 경우가 있습니다.

이 문서는 해당 문제를 해결하기 위한 전체 과정을 설명합니다.

---

## 1. `public/` 폴더에 이미지 설정

예시로 `public/sample.jpg` 이미지를 추가하고, `app.vue` 파일에 다음과 같이 사용합니다.

```vue
<!-- app.vue -->
<template>
  <div class="p-8">
    <NuxtImg src="/sample.jpg" alt="Sample Image" width="300" />
  </div>
</template>
```

## 2. 이미지가 표시되지 않음

로컬 개발 환경에서 위 코드를 실행했을 때, 다음과 같은 현상이 발생할 수 있습니다.

- 이미지가 보이지 않음
- 브라우저 콘솔이나 서버 로그에 오류가 출력됨

## 3. `@nuxt/image`와 `sharp`의 관계

- Nuxt의 이미지 모듈을 내부적으로 IPX(Image Processing eXtension)를 통해 이미지를 최적화 처리 합니다.
- IPX는 `sharp`라는 네이티브(Node.js C++) 이미지 라이브러리에 의존합니다.
- `sharp`가 설치되지 않거나, 제대로 빌드되지 않으면 이미지 최적화 및 표시가 실패하게 됩니다.

## 4. `sharp` 직접 설치

다음 명령어로 `sharp`를 수동으로 설치합니다.

```bash
pnpm add sharp -D
```

## 5. `pnpm approve-builds` 실행

`pnpm` 사용자는 보안 정책상 네이티브 모듈의 자동 빌드를 차단할 수 있습니다. 이를 수동으로 허용하려면 다음 명령어를 실행해야 합니다.

```bash
pnpm approve-builds
```

## 6. `pnpm approve-builds`란?

`pnpm approve-builds`는 네이티브 모듈이 로컬에서 빌드되도록 승인하는 명령어입니다.

- `pnpm`은 보안을 위해 postinstall 스크립트를 제한할 수 있으며, `approve-builds`를 통해 이를 수동으로 허용합니다.
- 이 명령어를 실행하지 않으면 Nuxt 이미지 렌더링이 실패할 수 있습니다.

## 마무리

- 문제 발생 시 가장 먼저 `sharp` 설치 유무를 확인하고,
- `pnpm approve-builds` 실행 여부를 점검하세요.
- 