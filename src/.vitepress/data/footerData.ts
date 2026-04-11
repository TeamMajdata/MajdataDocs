import type { FooterData } from '@theojs/lumen'

export const Footer_Data: FooterData = {
  author: { name: 'TeamMajdata', link: 'https://github.com/TeamMajdata' },
  group: [
    {
      title: '工具链',
      icon: 'fa-solid fa-puzzle-piece',
      links: [
        { name: 'MajdataEdit', link: 'https://github.com/LingFeng-bbben/MajdataEdit' },
        { name: 'MajdataView', link: 'https://github.com/LingFeng-bbben/MajdataView' },
        { name: 'MajdataPlay', link: 'https://github.com/LingFeng-bbben/MajdataPlay' },
        { name: 'MajdataNet', link: 'https://majdata.net/' },
      ],
    },
    {
      title: '社区',
      icon: 'fa-solid fa-expand',
      links: [
        { name: 'QQ 群 MajdataPlay', link: 'https://qm.qq.com/q/WLvlmFEXoO' },
        { name: 'Discord 社区', link: 'https://discord.gg/FgyJzHm3As' },
      ],
    },
  ],
}
