# Nuxt I18n

`Nuxt I18n` 모듈은 `Vue I18n v10`을 사용하고 있습니다.

## Vue I18n과 함께 사용하기

`Nuxt I18n` 모듈의 기본 사항은 `Vue I18n` 옵션을 사용하는 것입니다.

```ts nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n'
  ],
  i18n: {
    defaultLocale: 'ko',
    vueI18n: './i18n.config.ts'
  }
})
```

```ts i18n.config.ts
export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ko',
  messages: {
    ko: {
      welcome: '환영합니다.'
    }
  }
}));
```

:::warning
`i18n.defaultLocale`: 애플리케이션의 기본 언어를 설정합니다.

`i18n.vueI18n.locale`: 인스턴스의 현재 활성화된 언어를 설정합니다.
:::

`i18n.config.ts` 에서는 `Vue I18n`의 `createI18n` 함수와 동일한 옵션을 내보냅니다.

