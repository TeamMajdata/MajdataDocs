# Install MajdataPlay

## Windows

### Use Majplay-update-cli

Majplay-update-cli is the Windows download and update tool for MajdataPlay. It supports stable and nightly builds, system proxies and GitHub mirrors, and launches the game after updating.

[![Majplay-update-cli repository card](https://readme-stats.vanillaaaa.org/api/pin/?username=TeamMajdata&repo=Majplay-update-cli)](https://github.com/TeamMajdata/Majplay-update-cli)

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Majplay-update-cli',
      desc: 'Recommended way to install and update on Windows',
      link: 'https://github.com/TeamMajdata/Majplay-update-cli',
      linkText: 'Open the GitHub repository'
    }
  ]"
/>

How to use it:

1. Get `Update-MajdataPlay.ps1` and `Start-MajdataPlay-Updater.cmd` from the repository.
2. Put them in any writable folder and double-click `Start-MajdataPlay-Updater.cmd`.
3. On first run, choose Stable or Nightly; the game is installed into the `MajdataPlay` folder next to the script.
4. Run it again later to check for updates and launch the game.

Existing custom skins, sounds, and chart assets under `StreamingAssets` are preserved by default. See the [repository README](https://github.com/TeamMajdata/Majplay-update-cli#readme) for all options.

### Use RhythmHub

RhythmHub is a desktop launcher for MajdataPlay that can download, update, and launch the game.

<Links
  :grid="2"
  :items="[
    {
      image: 'https://rhythmhub.sparkbarry.com/favicon.ico',
      name: 'RhythmHub',
      desc: 'Download the desktop launcher',
      link: 'https://rhythmhub.sparkbarry.com/en/',
      linkText: 'Open RhythmHub'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'RhythmHub on GitHub',
      desc: 'Source code and releases',
      link: 'https://github.com/sparkbarry/RhythmHub',
      linkText: 'Open the GitHub repository'
    }
  ]"
/>

### Download directly

Use Majplay-update-cli above for stable builds and automatic updates. To get a nightly build manually:

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
