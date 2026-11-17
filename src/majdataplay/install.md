# 安装

## Windows

### 使用 Majplay-update-cli

Majplay-update-cli 是 MajdataPlay 的 Windows 下载与更新工具，支持稳定版和 Nightly、系统代理和 GitHub 镜像，并会在更新完成后自动启动游戏。

[![Majplay-update-cli repository card](https://readme-stats.vanillaaaa.org/api/pin/?username=TeamMajdata&repo=Majplay-update-cli)](https://github.com/TeamMajdata/Majplay-update-cli)

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Majplay-update-cli',
      desc: '推荐的 Windows 下载 / 更新方式',
      link: 'https://github.com/TeamMajdata/Majplay-update-cli',
      linkText: '前往 GitHub 仓库'
    }
  ]"
/>

使用方式：

1. 从仓库获取 `Update-MajdataPlay.ps1` 和 `Start-MajdataPlay-Updater.cmd`。
2. 将文件放在任意可写目录，双击 `Start-MajdataPlay-Updater.cmd`。
3. 首次运行选择稳定版或 Nightly；游戏会安装到脚本目录下的 `MajdataPlay` 文件夹。
4. 之后再运行会检查更新并启动游戏。

默认保留 `StreamingAssets` 中已有的自定义皮肤、音效和谱面资源。完整参数和说明见 [仓库 README](https://github.com/TeamMajdata/Majplay-update-cli#readme)。

### 使用 RhythmHub

RhythmHub 是另一个 MajdataPlay 下载与启动入口，适合希望通过网页界面安装的用户。

<Links
  :items="[
    {
      image: 'https://rhythmhub.sparkbarry.com/favicon.ico',
      name: 'RhythmHub',
      desc: '网页下载 / 启动器',
      link: 'https://rhythmhub.sparkbarry.com/en/',
      linkText: '打开 RhythmHub'
    }
  ]"
/>

### 直接下载

稳定版建议使用上面的 Majplay-update-cli 自动安装与更新。若只需要手动获取 Nightly：

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
