# Record

::: warning
本功能在移动端不可用
:::

## OBS 配置

本功能的原理是请小小蓝白帮你按录制键, 所以请先在 OBS 内配置好场景, 将 MajdataPlay 使用<mark>屏幕录制或游戏录制</mark>捕获, 如使用其他捕获模式可能无法录制

![OBS Configuration](./record/obs_configuration.png)

1. 点击顶部的`工具`
2. 点击下拉菜单中的`WebSocket 服务器设置`
3. 勾选`开启 WebSocket 服务器`
4. 将`服务器端口`设置为`4455`并<mark>取消</mark>勾选`开启身份认证`

## 游戏内设置

应该只需要把录制选项调为`OBS`

## 生效表现

如配置成功, 进入游玩后, 副屏的小小蓝白下方会有摄像头图标, ~~小小蓝白正在盗摄~~

<Links
  :grid="3"
  :items="[
    {
      icon: {
        svg: {
          light: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#000000'><path d='M880-275 720-435v111l-60-60v-356H304l-60-60h416q24 0 42 18t18 42v215l160-160v410ZM848-27 39-836l42-42L890-69l-42 42ZM484-560Zm-87 82ZM159-800l60 60h-79v520h520v-79l60 60v19q0 24-18 42t-42 18H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h19Z'/></svg>`,
          dark: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#FFFFFF'><path d='M880-275 720-435v111l-60-60v-356H304l-60-60h416q24 0 42 18t18 42v215l160-160v410ZM848-27 39-836l42-42L890-69l-42 42ZM484-560Zm-87 82ZM159-800l60 60h-79v520h520v-79l60 60v19q0 24-18 42t-42 18H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h19Z'/></svg>`
        }
      },
      name: 'OBS 未准备好',
      desc: '',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
    },
    {
      icon: {
        svg: {
          light: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#000000'><path d='M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h520q24 0 42 18t18 42v215l160-160v410L720-435v215q0 24-18 42t-42 18H140Zm0-60h520v-520H140v520Zm0 0v-520 520Z'/></svg>`,
          dark: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#FFFFFF'><path d='M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h520q24 0 42 18t18 42v215l160-160v410L720-435v215q0 24-18 42t-42 18H140Zm0-60h520v-520H140v520Zm0 0v-520 520Z'/></svg>`
        }
      },
      name: 'OBS 准备就绪',
      desc: '',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
    },
    {
      icon: {
        svg: {
          light: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#000000'><path d='M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h520q24 0 42 18t18 42v215l160-160v410L720-435v215q0 24-18 42t-42 18H140Zm0-60h520v-520H140v520Zm0 0v-520 520Z'/><circle cx='820' cy='-140' r='70' fill='#ff2d2d'/></svg>`,
          dark: `<svg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 -960 960 960' width='48px' fill='#FFFFFF'><path d='M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h520q24 0 42 18t18 42v215l160-160v410L720-435v215q0 24-18 42t-42 18H140Zm0-60h520v-520H140v520Zm0 0v-520 520Z'/><circle cx='820' cy='-140' r='70' fill='#ff2d2d'/></svg>`
        }
      },
      name: 'OBS 录制中',
      desc: '',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
    }
  ]"
/>
