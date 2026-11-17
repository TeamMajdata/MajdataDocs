# ゲームプレイを録画する

MajdataPlay は次の 2 つの録画方法をサポートしています。

| モード | プラットフォーム | 説明 |
| --- | --- | --- |
| `OBSTrigger` | デスクトップのみ | OBS WebSocket 経由で OBS の録画を制御します。カスタムシーン、カメラ、オーバーレイが必要な場合に適しています |
| `FFmpeg` | デスクトップとモバイル | 内蔵の FFmpeg でゲーム画面と音声を録画し、`RecordOutputs` に出力します |

録画モードは `system-settings.json` の `Common.RecordMode` で設定します。デフォルト値は `"Disable"` です。

## 内蔵 FFmpeg で録画する

1. `system-settings.json` の `Common.RecordMode` を `"FFmpeg"` に変更します。
2. ゲームを再起動します。設定画面に **Encoding** メニューが表示されます。
3. **Encoding** でエンコーダー、フレームレート、ビットレート、解像度スケールを設定します。コンテナ形式は `system-settings.json` の `Encoding.ContainerFormat` で設定します (デフォルトは MP4)。
4. プレイを開始します。録画はゲーム開始時に自動で始まり、楽曲を終了するかゲームを終了すると自動で保存されます。

デフォルトの出力形式は MP4 で、ファイルはゲームのデータディレクトリにある `RecordOutputs` フォルダーに保存されます。ファイル名は `曲名_譜面作者_2026-01-01_12_00_00.mp4` のようになります。音声トラックの多重化に失敗した場合は、映像のみの `.mkv` ファイルが残ります。

### エンコードの推奨設定

- デスクトップでは `Hardware` を優先して使用してください。画面にノイズが入る、録画に失敗する、ドライバーが対応していないといった場合は `Software` に切り替えてください。
- モバイルでは `Hardware` のまま使用することをおすすめします。システムのハードウェアエンコーダーが処理します。デバイスが過熱したりフレーム落ちが発生したりする場合は、`ResolutionScale`、`FrameRate`、`BitRate` を下げてください。
- `RateControlMode` が `VBR` の場合は `MaximumBitRate` を設定できます。配信やアップロード先のプラットフォームにビットレートの制限がある場合は、各自で調整してください。
- 録画は GPU、CPU、ストレージを消費します。長時間の録画の前に、空き容量を確認してください。

### モバイル

Android と iOS のどちらでも `FFmpeg` モードを使用できます。出力ファイルはアプリのデータディレクトリにある `RecordOutputs` フォルダーに保存されます。

- Android でストレージ権限を許可した場合：`Documents/MajdataPlay/RecordOutputs`
- Android でストレージ権限を許可していない場合：`Android/data/net.majdata.majdataplay/files/RecordOutputs`
- iOS：`MajdataPlay` フォルダー内の `RecordOutputs`

モバイルでは `OBSTrigger` を使用できません。モバイル版ではこのオプションを選択できないためです。

## OBS で録画する

OBS モードはデスクトップ版でのみ使用できます。この機能は Xiaoxiao Lanbai が代わりに録画ボタンを押す仕組みなので、まず OBS でシーンを設定し、MajdataPlay を<mark>画面キャプチャまたはゲームキャプチャ</mark>でキャプチャしてください。他のキャプチャ方法を使用すると録画できない場合があります。

![OBS の設定](/majdataplay/feature/record/obs_configuration.png)

1. 上部の `ツール` をクリックします。
2. ドロップダウンメニューの `WebSocket サーバー設定` をクリックします。
3. `WebSocket サーバーを有効にする` にチェックを入れます。
4. `サーバーポート` を `4455` に設定し、`認証を有効にする` のチェックを<mark>外し</mark>ます。

その後、`system-settings.json` で `Common.RecordMode` を `"OBSTrigger"` に設定します。

## 録画状態

録画モードを有効にすると、プレイを開始したときにサブ画面の Xiaoxiao Lanbai の下にカメラアイコンが表示されます。

- 未接続：レコーダーの準備がまだできていません
- 接続済み：レコーダーの準備ができています
- 録画中：現在のプレイを録画しています

::: tip
OBS でも FFmpeg でも、録画状態のアイコンは現在のレコーダーが接続されているか、録画中であるかを示します。
:::
