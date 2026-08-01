# Install MajdataPlay

## Windows

### Use Majdata Hub

Majdata Hub (Hub) is a browser-based companion utility for MajdataPlay. It includes both an international GitHub source and a Tencent source for mainland China, and it can download and update the stable version of MajdataPlay.

(A star would be appreciated!)
[![Majdata Hub repository card](https://readme-stats.vanillaaaa.org/api/pin/?username=kirisamevanilla&repo=MajdataHub)](https://github.com/KirisameVanilla/MajdataHub)

<Links
  :grid="2"
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'GitHub Release',
      desc: 'Recommended outside mainland China',
      link: 'https://github.com/KirisameVanilla/MajdataHub/releases/latest',
      linkText: 'Open the GitHub Releases page'
    },
    {
      image: 'https://cnb.cool/images/favicon.png',
      name: 'Tencent CNB',
      desc: 'Recommended in mainland China',
      link: 'https://cnb.cool/TeamMajdata/MajdataHub-Build',
      linkText: 'Open the repository'
    }
  ]"
/>

If you only use Hub to download and update MajdataPlay, you generally do not need to update Hub itself.

After opening Hub, go to **Setting** and select the folder where you want to install MajdataPlay. Then choose a download source and click **Save Settings**.

Go to **Game**, click **Download Game**, and wait for the download to finish. You can then click **Launch Game** below it to start playing.

### Download directly

Direct downloads are available as stable and nightly builds. Stable builds are available from GitHub, Tencent CNB, and LeZi's mirror. Nightly builds are available only from GitHub.

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: 'Test version',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'Open the GitHub Releases page'
    }
  ]"
/>

<Links
  :grid="3"
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'MajdataPlay_Build',
      desc: 'Stable version',
      link: 'https://github.com/TeamMajdata/MajdataPlay_Build',
      linkText: 'Open the GitHub page'
    },
    {
      image: 'https://cnb.cool/images/favicon.png',
      name: 'Tencent CNB',
      desc: 'Stable version for mainland China',
      link: 'https://cnb.cool/TeamMajdata/MajdataPlay_Build/-/git/archive/LATEST.zip',
      linkText: 'Download now'
    },
    {
      image: 'https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg',
      name: `LeZi's mirror`,
      desc: 'Another stable-version mirror',
      link: 'https://storage.leziblog.com/MajdataPlay',
      linkText: 'Open the mirror'
    }
  ]"
/>

## iOS

iOS has stable and test versions. The test version is available through TestFlight or as an `.ipa` file. The stable version is available from the App Store, including the mainland China storefront.

<Links
  :grid="3"
  :items="[
    {
      image: 'https://testflight.apple.com/images/testflight-iOS-400x400_1x_40.png',
      name: 'TestFlight',
      desc: 'Install TestFlight on your iPhone or iPad before opening this link.',
      link: 'https://testflight.apple.com/join/PwxCNk5n',
      linkText: 'Join the beta'
    },
    {
      image: 'https://apps.apple.com/assets/favicon/favicon-180.png',
      name: 'App Store',
      desc: 'Stable version',
      link: 'https://apps.apple.com/app/majdataplay/id6760295251',
      linkText: 'Get it on the App Store'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: 'An IPA file that requires manual signing',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'Open the GitHub Releases page'
    }
  ]"
/>

## Android

Android has stable and nightly versions.

<Links
  :grid="2"
  :items="[
    {
      image: 'https://www.gstatic.com/android/market_images/web/favicon_v3.ico',
      name: 'Google Play',
      desc: 'Stable version',
      link: 'https://play.google.com/store/apps/details?id=net.majdata.majdataplay',
      linkText: 'Get it now'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: 'An APK file that must be installed manually',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'Open the GitHub Releases page'
    }
  ]"
/>
