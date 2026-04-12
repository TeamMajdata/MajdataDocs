# 安装

## Windows

### 使用 Majdata Hub

Majdata Hub (以下简称 Hub) 是一款基于浏览器的 MajdataPlay 小工具, <mark>内置有海外的 GitHub 源和大陆的腾讯源</mark>, 可以用于下载和更新 MajdataPlay 的稳定版.

(顺便求一下 star !!)
[![MajdataHubCard](https://readme-stats.vanillaaaa.org/api/pin/?username=kirisamevanilla&repo=MajdataHub)](https://github.com/KirisameVanilla/MajdataHub)

<Links
  :grid="2"
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'GitHub Release',
      desc: '海外用我',
      link: 'https://github.com/KirisameVanilla/MajdataHub/releases/latest',
      linkText: '前往 GitHub Release 页面'
    },
    {
      image: 'https://cnb.cool/images/favicon.png',
      name: '腾讯 CNB',
      desc: '大陆用我. 腾讯总算干人事了',
      link: 'https://cnb.cool/TeamMajdata/MajdataHub-Build',
      linkText: '前往仓库页面'
    }
  ]"
/>

如果你只需要下载和更新功能的话, 大概是不需要更新 Hub 的.

打开 Hub 后, 你的浏览器会被自动唤出. 请先前往 Setting 页面更改游戏目录路径, 选择一个你想用于存放 MajdataPlay 的文件夹, 然后更改下载源. **最后请记得点击保存设置.**

修改好 Hub 的设置后, 请前往 Game 页面, 点击下载游戏, 等待下载完成后即可点击下方的启动游戏进行游玩.

### 直接下载

直接下载分为稳定版和测试版. 其中稳定版有海外的 GitHub 源, 大陆的腾讯源和 LeZi 的源, 而测试版只有 GitHub 源.

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: '测试版',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: '前往 GitHub Release 页面'
    }
  ]"
/>

<Links
  :grid="3"
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'MajdataPlay_Build',
      desc: '稳定版',
      link: 'https://github.com/TeamMajdata/MajdataPlay_Build',
      linkText: '前往 GitHub 页面'
    },
    {
      image: 'https://cnb.cool/images/favicon.png',
      name: '腾讯 CNB',
      desc: '依旧稳定版. 腾讯总算干人事了',
      link: 'https://cnb.cool/TeamMajdata/MajdataPlay_Build/-/git/archive/LATEST.zip',
      linkText: '立刻下载'
    },
    {
      image: 'https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg',
      name: 'LeZi 窝',
      desc: '仍然稳定版. 你猜你连不连得进去',
      link: 'https://storage.leziblog.com/MajdataPlay',
      linkText: '前往刺杀 LeZi'
    }
  ]"
/>

## iOS

iOS 分为稳定版和测试版, 其中测试版有 TestFlight 和 .ipa 文件, 稳定版有 App Store(国区也有)

<Links
  :grid="3"
  :items="[
    {
      image: 'https://testflight.apple.com/images/testflight-iOS-400x400_1x_40.png',
      name: 'TestFlight',
      desc: '要加入测试, 请先在 iPhone 或 iPad上安装 TestFlight, 然后打开链接.',
      link: 'https://testflight.apple.com/join/PwxCNk5n',
      linkText: '点击加入测试'
    },
    {
      image: 'https://apps.apple.com/assets/favicon/favicon-180.png',
      name: 'App Store',
      desc: '稳定版, 但也许比测试版更不稳定',
      link: 'https://apps.apple.com/app/majdataplay/id6760295251',
      linkText: '在 App Store 上获取'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: '需要自签的 ipa 文件, 现在应该用不上了',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: '前往 GitHub Release 页面'
    }
  ]"
/>

## Android

安卓分为稳定版和测试版

<Links
  :grid="2"
  :items="[
    {
      image: 'https://www.gstatic.com/android/market_images/web/favicon_v3.ico',
      name: 'Play 商店',
      desc: '稳定版.',
      link: 'https://play.google.com/store/apps/details?id=net.majdata.majdataplay',
      linkText: '立刻获取'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: 'apk 文件, 需要匠心手动安装',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: '前往 GitHub Release 页面'
    }
  ]"
/>
