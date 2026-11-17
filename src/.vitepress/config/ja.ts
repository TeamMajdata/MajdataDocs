import { defineConfig, type DefaultTheme } from 'vitepress'

export const ja = defineConfig({
  lang: 'ja-JP',
  description: 'maimai のファン譜面を作成・プレイするためのオープンソースツールチェーン',

  themeConfig: {
    nav: nav(),

    sidebar: sidebarGuide(),

    editLink: {
      pattern: 'https://github.com/TeamMajdata/MajdataDocs/edit/main/src/:path',
      text: 'GitHub でこのページを編集',
    },

    docFooter: {
      prev: '前のページ',
      next: '次のページ',
    },

    outline: {
      label: 'このページの目次',
    },

    lastUpdated: {
      text: '最終更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    langMenuLabel: '言語',
    returnToTopLabel: 'トップへ戻る',
    sidebarMenuLabel: 'メニュー',
    darkModeSwitchLabel: 'テーマ',
    lightModeSwitchTitle: 'ライトテーマに切り替え',
    darkModeSwitchTitle: 'ダークテーマに切り替え',
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'はじめに',
      link: '/ja/majdataplay/install',
      activeMatch: '/ja/majdataplay/',
    },
    {
      text: '私たちについて',
      link: '/ja/other/about',
      activeMatch: '/ja/other/about',
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'MajdataPlay',
      base: '/ja/majdataplay',
      collapsed: false,
      items: [
        {
          text: '概要',
          link: '/',
        },
        {
          text: 'インストール',
          link: '/install',
        },
        {
          text: '設定',
          base: '/ja/majdataplay/configuration',
          collapsed: true,
          items: [
            {
              text: '設定ファイル',
              link: '/',
            },
            {
              text: '設定リファレンス',
              link: '/configuration',
            },
            {
              text: 'オンライン',
              link: '/online',
            },
            {
              text: '外部デバイス',
              link: '/external_device',
            },
            {
              text: '旧バージョンの設定リファレンス',
              link: '/legacy',
            },
          ],
        },
        {
          text: '機能',
          base: '/ja/majdataplay/feature',
          collapsed: true,
          items: [
            {
              text: '録画',
              link: '/record',
            },
            {
              text: 'プレイリスト',
              link: '/collection',
            },
            {
              text: 'スキン',
              link: '/skin',
            },
            {
              text: '練習モード',
              link: '/practice',
            },
            {
              text: '譜面',
              link: '/chart',
            },
          ],
        },
        {
          text: '判定',
          base: '/ja/majdataplay/judgment',
          collapsed: true,
          items: [
            {
              text: 'タップ',
              link: '/tap',
            },
            {
              text: 'ホールド',
              link: '/hold',
            },
            {
              text: 'スライド',
              link: '/slide',
            },
            {
              text: 'タッチ & タッチホールド',
              link: '/touch',
            },
          ],
        },
        {
          text: '開発',
          base: '/ja/majdataplay/development',
          collapsed: true,
          items: [
            {
              text: 'MajdataPlay のビルド',
              link: '/build',
            },
            {
              text: '外部 IO マネージャー',
              link: '/external-io-manager',
            },
            {
              text: '新しいデバイスの対応',
              link: '/new-device',
            }
          ],
        },
        {
          text: 'よくある質問',
          link: '/faq',
        },
        {
          text: 'プライバシーポリシー',
          link: '/privacy_policy',
        },
      ],
    },
    {
      text: 'MajdataNet',
      base: '/ja/majdatanet',
      collapsed: false,
      items: [
        {
          text: '機能',
          base: '/ja/majdatanet/feature',
          collapsed: true,
          items: [
            {
              text: 'プレイリスト',
              link: '/collection',
            },
          ],
        },
      ],
    },
    {
      text: 'MajdataX',
      base: '/ja/majdatax',
      collapsed: false,
      items: [
        {
          text: '概要',
          link: '/index',
        },
        {
          text: '使い方',
          base: '/ja/majdatax/usage',
          collapsed: true,
          items: [
            {
              text: '譜面の作成',
              link: '/new',
            },
            {
              text: 'メディアの準備',
              link: '/adjust',
            },
            {
              text: '編集',
              link: '/edit',
            },
            {
              text: '復元',
              link: '/recovery',
            },
          ],
        },
        {
          text: '設定',
          base: '/ja/majdatax/settings',
          collapsed: true,
          items: [
            {
              text: 'エディター',
              link: '/editor',
            },
            {
              text: '表示',
              link: '/view',
            },
            {
              text: '音量',
              link: '/volume',
            },
          ],
        },
      ],
    },
    {
      text: 'MajSimai',
      base: '/ja/majsimai',
      collapsed: false,
      items: [
        { text: '概要', link: '/' },
        {
          text: 'スライドコード',
          base: '/ja/majsimai/slidecode',
          collapsed: false,
          items: [
            { text: '概要', link: '/index' },
            { text: 'ノード命令', link: '/nodes' },
            { text: 'トラック命令', link: '/tracks' },
            { text: '展開と Simai 互換性', link: '/shorthand' },
            { text: 'ノードとトラックの接続', link: '/node-paths' },
            { text: 'トラック間の遷移', link: '/track-transitions' },
            { text: '判定キュー', link: '/judgment' },
            { text: '見た目のデザイン', link: '/appearance' },
            { text: 'プレイアビリティのデザイン', link: '/playability' },
            { text: '例', link: '/examples' }
          ]
        }
      ]
    },
    {
      text: 'その他',
      base: '/ja/other',
      collapsed: true,
      items: [
        {
          text: '私たちについて',
          link: '/about',
        },
      ],
    },
  ]
}
