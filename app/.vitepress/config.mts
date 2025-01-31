import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: `XENIALSOFT Inc.`,
  description: `A VitePress Site`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      light: `/logo_light.webp`,
      dark: `/logo_dark.webp`,
    },

    nav: [
      { text: `Home`, link: `/` },
      { text: `Examples`, link: `/markdown-examples` }
    ],

    sidebar: [
      {
        text: `Nuxt`,
        items: [
          { text: `프로덕션 배포`, link: `/nuxt/deployment` },
          {
            text: `모듈`,
            items: [
              { text: `Nuxt I18n`, link: `/nuxt/modules/nuxt-i18n` }
            ]
          },
        ]
      }
    ],

    search: {
      provider: `local`
    },

    socialLinks: [
      { icon: `github`, link: `https://github.com/xenialsoft/docs` }
    ],

    footer: {
      copyright: `Copyright © XENIALSOFT Inc. All rights reserved.`
    },
    
  },

  lastUpdated: true,

})
