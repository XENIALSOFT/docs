
# Nuxt 애플리케이션 배포 가이드

이 문서는 Nuxt 애플리케이션을 빌드하고 프로덕션 환경에 배포하는 방법을 설명합니다.

## 개발 환경 설정

먼저 Nuxt 애플리케이션의 개발 환경을 설정합니다.

필요한 패키지들을 설치합니다.

```bash
pnpm install
```

## 애플리케이션 빌드

프로덕션 환경에서 사용할 수 있도록 Nuxt 애플리케이션을 빌드합니다.

다음 명령어를 실행하여 빌드를 수행합니다.

```bash
pnpm build
```

이 명령어는 .output 디렉토리에 빌드된 파일을 생성합니다.

빌드 과정에서는 소스 코드를 최적화하고 필요한 모든 파일을 포함한 프로덕션용 번들을 생성합니다.

## 프로덕션 서버 실행

빌드가 완료되면, 다음 명령어를 사용하여 프로덕션 환경에서 애플리케이션을 실행할 수 있습니다.

```bash
node ./.output/server/index.mjs
```

이 명령어는 Nitro 서버를 사용하여 Nuxt 애플리케이션을 실행합니다.

## 결론

이제 Nuxt 애플리케이션이 프로덕션 환경에서 성공적으로 실행되고 배포되었습니다.

