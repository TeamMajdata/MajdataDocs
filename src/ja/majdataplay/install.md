# MajdataPlay をインストールする

::: warning Linux と macOS のテスターを募集しています
Linux と macOS で MajdataPlay をプレイする人はごく少ないため、テストは限定的です。Linux は**部分的にサポート**しており、macOS では DAO デバイスのみが完全にテストされています。これらのプラットフォームのテストにご協力いただける方を強く求めています。ご協力いただける場合は、OS のバージョン、デバイスの型番、再現手順、`Logs/` 以下のログを [Issues](https://github.com/LingFeng-bbben/MajdataPlay/issues) で報告してください。
:::

## Windows

### Majplay-update-cli を使う

Majplay-update-cli は MajdataPlay の Windows 向けダウンロード・更新ツールです。安定版とナイトリー版、システムプロキシ、GitHub ミラーに対応しており、更新後にゲームを起動します。

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Majplay-update-cli',
      desc: 'Windows でインストール・更新する推奨の方法',
      link: 'https://github.com/TeamMajdata/Majplay-update-cli',
      linkText: 'GitHub リポジトリを開く'
    }
  ]"
/>

使い方：

1. リポジトリから `Update-MajdataPlay.ps1` と `Start-MajdataPlay-Updater.cmd` を取得します。
2. 任意の書き込み可能なフォルダーに置き、`Start-MajdataPlay-Updater.cmd` をダブルクリックします。
3. 初回実行時に安定版またはナイトリー版を選択します。ゲームはスクリプトと同じフォルダー内の `MajdataPlay` フォルダーにインストールされます。
4. 以降は再度実行すると更新を確認し、ゲームを起動します。

`StreamingAssets` 以下にある既存のカスタムスキン、効果音、譜面アセットはデフォルトで保持されます。すべてのオプションについては[リポジトリの README](https://github.com/TeamMajdata/Majplay-update-cli#readme)を参照してください。

### RhythmHub を使う

RhythmHub は MajdataPlay のデスクトップランチャーで、ゲームのダウンロード、更新、起動を行えます。

<Links
  :grid="2"
  :items="[
    {
      image: 'https://rhythmhub.sparkbarry.com/favicon.ico',
      name: 'RhythmHub',
      desc: 'デスクトップランチャーをダウンロード',
      link: 'https://rhythmhub.sparkbarry.com/en/',
      linkText: 'RhythmHub を開く'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'GitHub 上の RhythmHub',
      desc: 'ソースコードとリリース',
      link: 'https://github.com/sparkbarry/RhythmHub',
      linkText: 'GitHub リポジトリを開く'
    }
  ]"
/>

### 直接ダウンロードする

安定版のインストールと自動更新には、上記の Majplay-update-cli を使用してください。ナイトリー版を手動で入手する場合は次のとおりです。

<Links
  :items="[
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: 'テスト版',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'GitHub リリースページを開く'
    }
  ]"
/>

## Linux

Linux 版は現在ナイトリー版として配布されており、公式のインストーラーはありません。提供されているのは **x64** ビルドのみです。

1. [Nightly Release](https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly) から `MajdataPlay-StandaloneLinux64-nightly.zip` をダウンロードします。
2. 任意のディレクトリに展開し、実行ファイルに実行権限を付与します：`chmod +x MajdataPlay`
3. そのディレクトリで `./MajdataPlay` を実行します。

Linux 版はお使いのディストリビューションのグラフィックと音声のスタックに依存します。起動に失敗する場合は、ターミナルの出力と `Logs/` 以下のログを添えて報告してください。

## macOS

macOS 版は現在 **Apple Silicon (ARM64)** のみです。[RhythmHub](https://rhythmhub.sparkbarry.com/en/) でのインストールと更新を推奨します。また、[Nightly Release](https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly) から `MajdataPlay-StandaloneOSX-nightly.zip` をダウンロードして手動で展開することもできます。Intel Mac 向けのビルド済みバイナリはありません。

初めて `MajdataPlay.app` を開いたときに macOS が開発元を確認できないと表示した場合は、右クリックして**開く**を選択するか、**システム設定 > プライバシーとセキュリティ**で許可してください。

## iOS

iOS には安定版とテスト版があります。テスト版は TestFlight または `.ipa` ファイルで入手できます。安定版は App Store から入手でき、中国本土のストアも対象です。

<Links
  :grid="3"
  :items="[
    {
      image: 'https://testflight.apple.com/images/testflight-iOS-400x400_1x_40.png',
      name: 'TestFlight',
      desc: 'このリンクを開く前に、iPhone または iPad に TestFlight をインストールしてください。',
      link: 'https://testflight.apple.com/join/PwxCNk5n',
      linkText: 'ベータ版に参加する'
    },
    {
      image: 'https://apps.apple.com/assets/favicon/favicon-180.png',
      name: 'App Store',
      desc: '安定版',
      link: 'https://apps.apple.com/app/majdataplay/id6760295251',
      linkText: 'App Store で入手'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: '手動での署名が必要な IPA ファイル',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'GitHub リリースページを開く'
    }
  ]"
/>

## Android

Android には安定版とナイトリー版があります。

<Links
  :grid="2"
  :items="[
    {
      image: 'https://www.gstatic.com/android/market_images/web/favicon_v3.ico',
      name: 'Google Play',
      desc: '安定版',
      link: 'https://play.google.com/store/apps/details?id=net.majdata.majdataplay',
      linkText: '今すぐ入手'
    },
    {
      image: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
      name: 'Nightly Build',
      desc: '手動でインストールする必要がある APK ファイル',
      link: 'https://github.com/LingFeng-bbben/MajdataPlay/releases/tag/nightly',
      linkText: 'GitHub リリースページを開く'
    }
  ]"
/>
