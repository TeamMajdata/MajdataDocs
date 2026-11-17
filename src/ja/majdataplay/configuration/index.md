# 設定ファイル

::: tip
このガイドに従う前に、一度ゲームを起動してください。設定の変更はゲームを終了した状態で行う必要があるため、バックグラウンドで起動したままになっていないことを確認してください。
:::

このページでは、各プラットフォームにおける MajdataPlay の設定ファイルの場所を説明します。ほかの設定ガイドは、このページを読んでいることを前提としています。

**2.1.0-preview6** 以降、設定は同じディレクトリ内の 2 つのファイルに分割されています。

- `settings.json`: **ユーザー設定**。`Game`、`Judge`、`Display`、`Volume`、`Touch` を含みます。オンラインアカウントにサインインすると、このグループはアカウントから読み込まれ、アカウントへアップロードされる場合があります。
- `system-settings.json`: **システム設定**。`Common`、`Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Network`、`IO` を含みます。このグループは現在のデバイスを表すもので、常にローカルに保持されます。

プレイ内容、判定、表示の動作を変更したい場合は、通常 `settings.json` を編集するだけで十分です。外部デバイス、レンダリング、ネットワークなどのシステム設定は `system-settings.json` にあります。旧バージョンには `settings.json` が 1 つだけありましたが、新バージョンでは初回起動時に自動で分割・移行されます。詳しくは[設定リファレンス](/ja/majdataplay/configuration/configuration)を参照してください。

## Windows

`MajdataPlay.exe` と同じディレクトリにある `settings.json` と `system-settings.json` を開いてください。

## iOS

<mark>iOS では通常、設定ファイルを手動で編集する必要はありません。**設定** を開いて **MajdataPlay** を検索するか、サイドバーの **アプリ** を選択してから **MajdataPlay** を選択してください。必要な設定はほぼすべてそこにあります。</mark>

ファイルを直接編集する場合は、**ファイル**アプリを開き、**このiPhone内**または**このiPad内**を選択してください。`MajdataPlay` フォルダを開くと、`settings.json` と `system-settings.json` があります。これらのファイルを変更するには JSON エディタが必要です。App Store から Koder などのエディタをインストールできます。

## Android

- APK 版: `/storage/emulated/0/Documents/MajdataPlay/`
- Google Play 版: `/storage/emulated/0/Android/data/net.majdata.majdataplay/files/`

どちらのディレクトリにも `settings.json` と `system-settings.json` があります。MT Manager など、エディタを内蔵したファイルマネージャーの使用をおすすめします。
