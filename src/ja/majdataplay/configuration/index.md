# 設定ファイル

::: tip
まず一度ゲームを手動で起動してください。設定の変更はゲームを終了した状態で行う必要があるため、<mark>バックグラウンドプロセスを終了</mark>してください。
:::

本セクションでは、各プラットフォームにおける `MajdataPlay` の設定ファイルの場所を示します。設定関連のドキュメントを読む際は、本セクションを既に読んでいることを前提とします。

::: warning 設定は 2 つのファイルに分割されます
**2.1.0** および **2.1.0 プレビュー版** 以降、設定は 2 つのファイルに分割され、同じディレクトリに配置されます。

- `settings.json`: **ユーザー設定**。`Game`、`Judge`、`Display`、`Volume`、`Touch` を含みます。オンラインアカウントにログインすると、この設定グループはアカウントから読み込まれ、アップロードされる場合があります。
- `system-settings.json`: **システム設定**。`Common`、`Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Network`、`IO` を含みます。この設定グループは現在のデバイスを表すもので、常にローカルに保存されます。

プレイ、判定、画面表示のみを調整したい場合は、通常 `settings.json` を変更するだけで十分です。外付けデバイス、レンダリング、ネットワークなどのシステム設定は `system-settings.json` にあります。旧バージョンには `settings.json` が 1 つだけありましたが、新バージョンの初回起動時に自動で分割・移行されます。詳細は [設定リファレンス](/ja/majdataplay/configuration/configuration) を参照してください。
:::

## Windows

`MajdataPlay.exe` と同じディレクトリにある `settings.json` と `system-settings.json` です。

## iOS

<mark>通常、iOS 版では設定ファイルを手動で変更する必要はありません。`設定` を開き、`MajdataPlay` を全体検索するか、左側のリストで `App` を見つけてタップして開き、右側で `MajdataPlay` を見つけてください。そこに必要なほぼすべての設定があります。</mark>

`ファイル` App を開き、ディレクトリで `このデバイス` (例: `このiPad`) を選択すると、その中に `MajdataPlay` フォルダーがあります。開くと `settings.json` と `system-settings.json` があります。ファイルを変更するには専用の `json` エディターが必要です。`App Store` で `Koder` を検索してインストールできます。

## Android

- apk ファイル版: `/storage/emulated/0/Documents/MajdataPlay/`
- Play ストア版: `/storage/emulated/0/Android/data/net.majdata.majdataplay/files/`

初回起動時、Android 版はストレージの読み取り / 書き込み権限を要求する場合があります。権限を許可すると、ゲームは `Documents/MajdataPlay` をデータディレクトリとして使用します。権限を拒否した場合は、アプリ専用の `Android/data/net.majdata.majdataplay/files` ディレクトリを使用します。

初回起動時には内蔵リソースが展開されますが、カスタムスキン、楽曲、`settings.json` は引き続き手動で storage ディレクトリに配置する必要がある場合があります。上記 2 つのディレクトリにはいずれも `settings.json` と `system-settings.json` があるため、`MT管理器` などエディターを備えたファイル管理アプリで変更することをおすすめします。
