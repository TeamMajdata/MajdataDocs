# ストリーミングでプレイ

::: warning
ストリーミングには安定した Wi-Fi または有線ネットワークが必要です。体験はネイティブのモバイル音ゲーには及ばず、**本物のアーケードコントローラーの代わりにはなりません**。
:::

MajdataPlay を PC 上で実行し、ストリーミングソフトを使って画面とタッチイベントをスマートフォンやタブレットに転送できます。`Sunshine` と `Moonlight` の組み合わせがおすすめです。低遅延、高フレームレート、ネイティブのタッチイベントのパススルーに対応しています。

## PC に Sunshine をインストールする

1. [Sunshine Releases](https://github.com/LizardByte/Sunshine/releases) から Sunshine をダウンロードしてインストールします。
2. Sunshine を開き、ウィザードに従って LAN ストリーミングサービスの設定を完了します。
3. 有線ネットワークのほうが安定します。Android では USB テザリングも使用できます。

> `Apollo` を使うこともできます。これは Sunshine のフォークで、いくつかの機能が変更されています。

## モバイルデバイスに Moonlight をインストールする

1. Android では [Google Play](https://play.google.com/store/apps/details?id=com.limelight) から、iOS では [App Store](https://apps.apple.com/app/moonlight-game-streaming/id1000551566) から Moonlight をインストールします。
2. Moonlight で Sunshine とペアリングします。
3. タッチモードを **ネイティブタッチ** または **ネイティブタッチのみ** に設定します。

## タッチ操作を最適化する

### モバイルデバイス

- マルチタッチジェスチャーをオフにします。iOS では **ガイド付きアクセス** を有効にすると、上スワイプでアプリが終了するのを防げます。
- Moonlight で解像度、ビットレート、フレームレートを調整し、デバイスが安定してストリーミングできる設定を見つけます。

### Windows PC

以下のレジストリ変更は再起動後に有効になります。変更する前にレジストリをバックアップしてください。

タッチジェスチャーのアニメーションを無効にする:

```text
HKEY_CURRENT_USER\Control Panel\Cursors
GestureVisualization = 0
ContactVisualization = 0
```

Windows の起動時に `GestureVisualization` が書き換えられる場合があります。設定を保持したい場合は、レジストリエディターでこのキーの **アクセス許可 > 詳細設定** を開き、継承を無効にして、所有者を管理者に変更し、管理者の読み取りのみのアクセス許可だけを残します。

右クリックの長押しを無効にする:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
TouchMode_hold = 0
TouchModeN_HoldTime_Animation = 0
TouchModeN_HoldTime_BeforeAnimation = 0
```

エッジからのスワイプを無効にする:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
Thumb_Flick_Enabled = 0
Right_Edgy_Enabled = 0
Left_Edgy_Enabled = 0
```

タッチ予測の遅延を無効にする:

```text
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\TouchPrediction
Latency = 1
SampleTime = 1
```

::: warning
`TouchGate` は変更しないでください。Windows のタッチ機能が完全に無効になります。
:::

## ゲーム内の設定

`settings.json` でタッチ半径を適切に大きくすると、ストリーミング経由のタッチが当たりやすくなります。

```json
"Touch": {
  "TouchSimulationRadius": 0.65
}
```

`0.6` から `0.7` の間で調整できます。画面の比率が正しくない場合は、`system-settings.json` の `Rendering` で `MainScreenTransform`、`MainScreenScale`、`MainScreenOffset` を調整してください。

::: tip
ストリーミング時は、GPU やネットワークを占有する OBS などのプログラムを終了し、`Rendering.FPSLimit` をデバイスが安定して受信できるフレームレートに設定することをおすすめします。
:::
