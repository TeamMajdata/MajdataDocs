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
      link: '/majdataplay/install',
      activeMatch: '/majdataplay/'
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
          text: '简介',
          link: '/'
        },
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
              text: '配置文件',
              link: '/'
            },
            {
              text: '配置详解',
              link: '/configuration'
            },
            {
              text: '联网',
              link: '/online'
            },
            {
              text: '外置设备',
              link: '/external_device'
            }
          ]
        },
        {
          text: '功能',
          base: '/majdataplay/feature',
          collapsed: true,
          items: [
            {
              text: '录制',
              link: '/record'
            },
            {
              text: '歌单',
              link: '/collection'
            },
            {
              text: '皮肤',
              link: '/skin'
            },
            {
              text: '练习模式',
              link: '/practice'
            },
            {
              text: '谱面',
              link: '/chart'
            }
          ]
        },
        {
          text: '判定',
          base: '/majdataplay/judgment',
          collapsed: true,
          items: [
            {
              text: 'Tap',
              link: '/tap'
            },
            {
              text: 'Hold',
              link: '/hold'
            },
            {
              text: 'Slide',
              link: '/slide'
            }
          ]
        },
        {
          text: '开发',
          base: '/majdataplay/development',
          collapsed: true,
          items: [
            {
              text: '编译 MajdataPlay',
              link: '/build'
            },
            {
              text: '外部IO管理器',
              link: '/external-io-manager'
            }
          ]
        },
        {
          text: '常见问题',
          link: '/faq'
        },
        {
          text: '隐私政策',
          link: '/privacy_policy'
        }
      ]
    },
    {
      text: 'MajdataNet',
      base: '/majdatanet',
      collapsed: false,
      items: [
        {
          text: '功能',
          base: '/majdatanet/feature',
          collapsed: true,
          items: [
            {
              text: '歌单',
              link: '/collection'
            }
          ]
        }
      ]
    },
    {
      text: 'MajdataX',
      base: '/majdatax',
      collapsed: false,
      items: [
        {
          text: '简介',
          link: '/index'
        },
        {
          text: '使用',
          base: '/majdatax/usage',
          collapsed: true,
          items: [
            {
              text: '新建',
              link: '/new'
            },
            {
              text: '调整',
              link: '/adjust'
            },
            {
              text: '编辑',
              link: '/edit'
            },
            {
              text: '恢复',
              link: '/recovery'
            }
          ]
        },
        {
          text: '设置',
          base: '/majdatax/settings',
          collapsed: true,
          items: [
            {
              text: '编辑器',
              link: '/editor'
            },
            {
              text: 'View',
              link: '/view'
            },
            {
              text: '音量',
              link: '/volume'
            }
          ]
        },
      ]
    },
    {
      text: 'MajSimai',
      base: '/majsimai',
      collapsed: false,
      items: [
        { text: '简介', link: '/' },
        {
          text: 'Slide Code',
          base: '/majsimai/slidecode',
          collapsed: false,
          items: [
            { text: '概览', link: '/index' },
            { text: '节点指令', link: '/nodes' },
            { text: '轨道指令', link: '/tracks' },
            { text: '省略规则与 Simai 兼容', link: '/shorthand' },
            { text: '节点与轨道的连接', link: '/node-paths' },
            { text: '轨道之间的连接', link: '/track-transitions' },
            { text: '判定队列解析', link: '/judgment' },
            { text: '外观设计建议', link: '/appearance' },
            { text: '玩法设计建议', link: '/playability' },
            { text: '配置样例', link: '/examples' }
          ]
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
