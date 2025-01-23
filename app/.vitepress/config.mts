import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: `XENIALSOFT Inc.`,
  description: `A VitePress Site`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // logo: {
    //   light: `/light.webp`,
    //   dark: `/dark.webp`,
    // },

    nav: [
      { text: `Home`, link: `/` },
      { text: `Examples`, link: `/markdown-examples` }
    ],

    sidebar: [
      {
        text: `Nuxt`,
        items: [
          { text: `배포`, link: `/nuxt/deployment` },
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
