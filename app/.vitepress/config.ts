import { DefaultTheme, defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: `ko`,
  title: `XENIALSOFT Inc.`,
  description: `XENIALSOFT Inc.`,
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: logo(),

    nav: nav(),

    sidebar: sidebar(),

    search: {
      provider: `local`,
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "검색",
                buttonAriaLabel: "검색"
              },
              modal: {
                backButtonTitle: "뒤로가기",
                displayDetails: "더보기",
                footer: {
                  closeKeyAriaLabel: "닫기",
                  closeText: "닫기",
                  navigateDownKeyAriaLabel: "아래로",
                  navigateText: "이동",
                  navigateUpKeyAriaLabel: "위로",
                  selectKeyAriaLabel: "선택",
                  selectText: "선택"
                },
                noResultsText: "검색 결과를 찾지 못했어요.",
                resetButtonTitle: "모두 지우기"
              }
            }
          }
        }
      }
    },

    docFooter: {
      prev: '이전 페이지',
      next: '다음 페이지'
    },

    outline: {
      label: '페이지 내용'
    },

    socialLinks: [
      { icon: `github`, link: `https://github.com/xenialsoft/docs` }
    ],

    footer: {
      copyright: `Copyright © XENIALSOFT Inc. All rights reserved.`
    },
    
  },
});

function logo(): DefaultTheme.ThemeableImage {
  return {
    light: `/logo_light.webp`,
    dark: `/logo_dark.webp`,
  }
}

function nav(): DefaultTheme.NavItem[] {
  return [
    { text: `Home`, link: `/` },
  ]
};

function sidebar(): DefaultTheme.Sidebar {
  return [
    {
      text: `시작하기`,
      items: [
        { text: `소개`, link: `/getting-started/intro` }
      ]
    },
    {
      text: `스타일 가이드`,
      items: [
        { text: `Vue.js`, link: `/style-guide/vuejs` }
      ]
    },
    {
      text: `백엔드`,
      items: [
        {
          text: `스프링부트`,
          items: [
            {
              text: `소개`,
              link: `/backend/springboot/intro`
            },
            {
              text: `순번 설정`,
              link: `/backend/springboot/rownumber`
            }
          ]
        }
      ]
    },
    {
      text: `프론트엔드`,
      items: [
        {
          text: `Nuxt`,
          items: [
            {
              text: `@nuxt/image 문제 해결`,
              link: `/frontend/nuxt/nuxt-image-sharp-issue`
            }
          ]
        },
        {
          text: `Tailwind CSS`,
        },
        {
          text: `Daisy UI`,
        },
        {
          text: `Headless UI`,
        }
      ]
    },
    {
      text: `배포 및 운영`,
      items: [
        {
          text: `시작하기`,
          link: `/devops/getting-started`
        },
        {
          text: `MariaDB`,
          items: [
            {
              text: `설치`,
              link: `/devops/mariadb/installation`
            },
            {
              text: `설정`,
              link: `/devops/mariadb/configuration`
            }
          ]
        },
        {
          text: `nginx`,
          items: [
            {
              text: `시작하기`,
              link: `/devops/nginx/getting-started`
            },
            {
              text: `SSL 설정`,
              link: `/devops/nginx/ssl`
            },
            {
              text: `압축 설정`,
              link: `/devops/nginx/compression`
            },
            {
              text: `HTTP/2 설정`,
              link: `/devops/nginx/http2`
            },
            {
              text: `파일 업로드 용량 제한 설정`,
              link: `/devops/nginx/file-upload-limit`
            }
          ]
        },
        {
          text: `pm2`,
          items: [
            
          ]
        }
      ]
    },
    {
      text: `성능 최적화`,
      items: [
        {
          text: `프론트엔드 성능 도구`,
          items: [
            {
              text: `Lighthouse`,
              link: `/performance/frontend/lighthouse`,
            },
            {
              text: `PageSpeed Insights`,
              link: `/performance/frontend/pagespeed-insights`
            }
          ]
        }
      ]
    },
    //
    {
      text: `클라이언트`,
      items: [
        {
          text: `시작하기`,
          link: `/client/getting-started`
        },
      ]
    },
    // {
    //   text: `서버`,
    //   items: [
    //     {
    //       text: `시작하기`,
    //       link: `/server/getting-started`
    //     },
    //     {
    //       text: `타임존 변경하기`,
    //       link: `/server/change-timezone`
    //     },
    //     {
    //       text: `nginx`,
    //       items: [
    //         {
    //           text: `시작하기`,
    //           link: `/server/nginx/getting-started`
    //         },
    //         {
    //           text: `SSL 설정`,
    //           link: `/server/nginx/ssl`
    //         },
    //         {
    //           text: `압축 설정`,
    //           link: `/server/nginx/compression`
    //         },
    //         {
    //           text: `HTTP/2 설정`,
    //           link: `/server/nginx/http2`
    //         },
    //         {
    //           text: `파일 업로드 용량 제한 설정`,
    //           link: `/server/nginx/file-upload-limit`
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   text: `MariaDB`,
    //   items: [
    //     {
    //       text: `설치`,
    //       link: `/mariadb/installation`
    //     },
    //     {
    //       text: `설정`,
    //       link: `/mariadb/configuration`
    //     }
    //   ]
    // },
    // {
    //   text: `SpringBoot`,
    //   items: [
    //     {
    //       text: `순번 설정`,
    //       link: `/springboot/rownumber`
    //     }
    //   ]
    // },
    // {
    //   text: `Nuxt`,
    //   items: [
    //     {
    //       text: `@nuxt/image 사용 중 이미지가 표시되지 않는 문제 해결`,
    //       link: `/nuxt/nuxt-image-public-sharp-issue`
    //     }
    //   ]
    // },
    {
      text: `Oracle Cloud`,
      items: [
        // { text: `언어 변경`, link: `/oracle-cloud/change-language` },
        // { text: `인스턴스 생성`, link: `/oracle-cloud/create-instance` },
        { text: `앱 배포`, link: `/oracle-cloud/deployment` }
      ]
    }
  ]
}