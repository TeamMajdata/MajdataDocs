import { defineConfig, type DefaultTheme } from 'vitepress'

export const en = defineConfig({
  lang: 'en-US',
  description: 'A complete, open-source toolchain for creating and playing maimai fan charts',

  themeConfig: {
    nav: nav(),

    sidebar: sidebarGuide(),

    editLink: {
      pattern: 'https://github.com/TeamMajdata/MajdataDocs/edit/main/src/:path',
      text: 'Edit this page on GitHub',
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },

    outline: {
      label: 'On this page',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    langMenuLabel: 'Languages',
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Theme',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Get started',
      link: '/en/majdataplay/install',
      activeMatch: '/en/majdataplay/',
    },
    {
      text: 'About us',
      link: '/en/other/about',
      activeMatch: '/en/other/about',
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'MajdataPlay',
      base: '/en/majdataplay',
      collapsed: false,
      items: [
        {
          text: 'Introduction',
          link: '/',
        },
        {
          text: 'Installation',
          link: '/install',
        },
        {
          text: 'Configuration',
          base: '/en/majdataplay/configuration',
          collapsed: true,
          items: [
            {
              text: 'Configuration file',
              link: '/',
            },
            {
              text: 'Configuration reference',
              link: '/configuration',
            },
            {
              text: 'Online services',
              link: '/online',
            },
            {
              text: 'External devices',
              link: '/external_device',
            },
          ],
        },
        {
          text: 'Features',
          base: '/en/majdataplay/feature',
          collapsed: true,
          items: [
            {
              text: 'Recording',
              link: '/record',
            },
            {
              text: 'Playlists',
              link: '/collection',
            },
            {
              text: 'Skins',
              link: '/skin',
            },
            {
              text: 'Practice mode',
              link: '/practice',
            },
            {
              text: 'Charts',
              link: '/chart',
            },
          ],
        },
        {
          text: 'Judgment',
          base: '/en/majdataplay/judgment',
          collapsed: true,
          items: [
            {
              text: 'Tap',
              link: '/tap',
            },
            {
              text: 'Hold',
              link: '/hold',
            },
            {
              text: 'Slide',
              link: '/slide',
            },
            {
              text: 'Touch & TouchHold',
              link: '/touch',
            },
          ],
        },
        {
          text: 'Development',
          base: '/en/majdataplay/development',
          collapsed: true,
          items: [
            {
              text: 'Build MajdataPlay',
              link: '/build',
            },
            {
              text: 'External IO Manager',
              link: '/external-io-manager',
            },
            {
              text: 'New Device Support',
              link: '/new-device',
            }
          ],
        },
        {
          text: 'FAQ',
          link: '/faq',
        },
        {
          text: 'Privacy policy',
          link: '/privacy_policy',
        },
      ],
    },
    {
      text: 'MajdataNet',
      base: '/en/majdatanet',
      collapsed: false,
      items: [
        {
          text: 'Features',
          base: '/en/majdatanet/feature',
          collapsed: true,
          items: [
            {
              text: 'Playlists',
              link: '/collection',
            },
          ],
        },
      ],
    },
    {
      text: 'MajdataX',
      base: '/en/majdatax',
      collapsed: false,
      items: [
        {
          text: 'Introduction',
          link: '/index',
        },
        {
          text: 'Usage',
          base: '/en/majdatax/usage',
          collapsed: true,
          items: [
            {
              text: 'Create a chart',
              link: '/new',
            },
            {
              text: 'Prepare media',
              link: '/adjust',
            },
            {
              text: 'Edit',
              link: '/edit',
            },
            {
              text: 'Recover',
              link: '/recovery',
            },
          ],
        },
        {
          text: 'Settings',
          base: '/en/majdatax/settings',
          collapsed: true,
          items: [
            {
              text: 'Editor',
              link: '/editor',
            },
            {
              text: 'View',
              link: '/view',
            },
            {
              text: 'Volume',
              link: '/volume',
            },
          ],
        },
      ],
    },
    {
      text: 'MajSimai',
      base: '/en/majsimai',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/' },
        {
          text: 'Slide Code',
          base: '/en/majsimai/slidecode',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/index' },
            { text: 'Node Instructions', link: '/nodes' },
            { text: 'Track Instructions', link: '/tracks' },
            { text: 'Expansion and Simai Compatibility', link: '/shorthand' },
            { text: 'Node and Track Connections', link: '/node-paths' },
            { text: 'Track-to-Track Transitions', link: '/track-transitions' },
            { text: 'Judgment Queue', link: '/judgment' },
            { text: 'Appearance Design Tips', link: '/appearance' },
            { text: 'Playability Design Tips', link: '/playability' },
            { text: 'Examples', link: '/examples' }
          ]
        }
      ]
    },
    {
      text: 'More',
      base: '/en/other',
      collapsed: true,
      items: [
        {
          text: 'About us',
          link: '/about',
        },
      ],
    },
  ]
}
