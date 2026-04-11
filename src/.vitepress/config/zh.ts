import { defineConfig, type DefaultTheme } from 'vitepress'

export const zh = defineConfig({
  lang: 'zh-CN',
  description: '新时代完全体开源的 maimai 自制工具链',

  themeConfig: {
    nav: nav(),

    sidebar: sidebarGuide(),

    editLink: {
      pattern: 'https://github.com/TeamMajdata/MajdataDocs/edit/main/src/:path',
      text: '在 GitHub 上编辑此页面'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '快速开始',
      link: '/guide/start-install',
      activeMatch: '/guide/'
    },
    {
      text: '关于我们',
      link: '/other/about',
      activeMatch: '/other/about'
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'MajdataPlay',
      base: '/majdataplay',
      collapsed: false,
      items: [
        {
          text: '安装',
          link: '/install'
        },
        {
          text: '配置',
          base: '/majdataplay/configuration',
          collapsed: true,
          items: [
            {
              text: '联网',
              link: '/online'
            }
          ]
        },
        {
          text: '隐私政策',
          link: '/privacy_policy'
        }
      ]
    },
    {
      text: '其余',
      base: '/other',
      collapsed: true,
      items: [
        {
          text: '关于我们',
          link: '/about'
        }
      ]
    },
  ]
}
