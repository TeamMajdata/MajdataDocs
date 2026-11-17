# 旧版設定リファレンス (2.1.0-preview6 より前)

::: warning バージョンに関する注意
本ページでは、**2.1.0-preview6 より前**で使用されていた単一ファイル形式の `settings.json` について説明します。2.1.0-preview6 以降、設定は `settings.json` と `system-settings.json` に分割されています。まず[設定リファレンス](/ja/majdataplay/configuration/configuration)をお読みください。本ページは旧バージョンの参照用としてのみ残されており、新しいゲームでは旧設定が自動的に移行されます。
:::

::: tip
本ページでは、[設定ファイル](/ja/majdataplay/configuration/index) `settings.json` 内のすべての設定項目を 1 つずつ解説し、それぞれが**初回起動時に自動生成されたとき**のデフォルト値も記載します。
:::


::: warning
設定を変更する前に、ゲームが<mark>完全に終了している</mark>ことを確認してください。ゲームの実行中に手動で編集したファイルは、次にゲームが設定を保存するときに上書きされます。JSON に慣れていない場合は、[VSCode](https://code.visualstudio.com/) など構文チェック機能のあるエディタの使用をおすすめします。
:::

以下の表を読む前に、次の点を確認してください:

- **デフォルト値**とは、プログラムに組み込まれた値 (コード内の各設定プロパティの初期値) のことで、初回起動時に生成される値を指します。お手元のファイルの値は、以下の表と異なる場合があります。
- 項目によってはプラットフォームごとに異なり、説明に **Windows** または **モバイル** (Android / iOS) と記載しています。以下の表は **Windows** 版を中心にまとめています。
- <mark>非表示</mark>と記された項目はゲーム内の設定画面に表示されず、設定ファイルでのみ変更できます。
- <mark>書き込まれない</mark>と記された項目は `settings.json` に出力されません。

## トップレベル構造

| セクション | 意味 | 内容 |
| --- | --- | --- |
| `Game` | ゲーム設定 | ノート速度、表示情報、リトライ / スキップ、ランダムとミラーなど |
| `Judge` | 判定設定 | 各種オフセットと判定モード |
| `Display` | 表示設定 | スキン、判定表示、拡大縮小、レンダリングとウィンドウ |
| `Audio` | オーディオ設定 | 音量、オーディオバックエンドとバッファー |
| `Debug` | デバッグ | タッチシミュレーション、レンダープール、ログレベルなど |
| `Online` | ネットワーク | オンラインアカウントと API エンドポイント |
| `IO` | 入力 / 出力デバイス | アーケードコントローラー、タッチパネルと LED |
| `Mod` | Mod | <mark>書き込まれない</mark>、現在の譜面にのみ適用 |

## Game —— ゲーム設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `TapSpeed` | 浮動小数点数 | `7.5` | **タップ速度**、ノート速度を調整します。ステップ `0.25`、負の値も指定できます (ノートが逆方向に落下します) |
| `TouchSpeed` | 浮動小数点数 | `7.5` | **タッチ速度**、タッチノートの速度を調整します。ステップ `0.25` |
| `SlideFadeInOffset` | 浮動小数点数 | `0.0` | **スライドフェードインオフセット**、スライドのタイミングを調整します。値を大きくすると遅れます |
| `BackgroundDim` | 浮動小数点数 | `0.8` | **背景の暗さ**、値が大きいほど暗くなります。範囲 `0`–`1`、ステップ `0.05` |
| `StarRotation` | 真偽値 | `true` | **スター回転**、スターの頭を回転させます |
| `BGInfo` | 列挙型 | `"Combo"` | **中央表示**、画面中央に表示する情報を調整します |
| `SecondaryBGInfo` | 列挙型 | `"None"` | **追加情報表示**、画面中下部に表示する情報を調整します |
| `SubScreenBGInfo` | 列挙型 | `"Achievement"` | **サブ画面情報表示**、サブ画面に表示する情報を調整します |
| `TopInfo` | 列挙型 | `"None"` | **外枠表示**、上部 (1 番と 8 番のキーの間) に表示する情報 |
| `EnableJudgeTimingGauge` | 真偽値 | `false` | **判定タイミングインジケーターを表示**、リアルタイムの判定オフセットと平均判定位置を表示します |
| `TrackSkip` | 真偽値 | `true` | **楽曲スキップ**、2、3、6、7 番のキーを押したままにすると楽曲を強制スキップします |
| `EnforceGameFailure` | 列挙型 | `"Disabled"` | **楽曲の強制失敗**、目標に到達できない場合に自動でスキップまたはリトライします |
| `FastRetry` | 真偽値 | `true` | **クイックリトライ**、3、4、5、6 番のキーを押したままにすると素早くリトライします |
| `FastPractice` | 真偽値 | `false` | **クイック練習**、1、2、7、8 番のキーを押したままにすると練習モードに入ります (区間の 5 秒前から開始し、10 秒後まで延長します) |
| `GameplaySubScreenClickBehavior` | 列挙型 | `"TrackSkip"` | **プレイ中のサブ画面クリック動作**、プレイ中にサブ画面をクリックしたときの動作を調整します。モバイルではデフォルトで `"TrackSkip_1_Sec_Delay"` になります |
| `Mirror` | 列挙型 | `"Off"` | **ミラー**、譜面を左右 / 上下に反転します |
| `Rotation` | 整数 | `0` | **回転**、譜面を角度で回転させます。正の値は時計回りです。範囲 `-7`–`7` |
| `SlideSkipping` | 真偽値 | `true` | **スライドスキップ**、スライドのスキップ機構を有効 / 無効にします |
| `Random` | 列挙型 | `"Disabled"` | **ランダム**、ノートをランダムに並べ替えます |
| `RecordMode` | 列挙型 | `"Disable"` | **録画モード**、Windows / Linux / macOS のみ存在します |
| `LeadInTime` | 整数 | `1` | **リードイン時間**、ゲーム画面に入ってから実際にゲームが始まるまでの待機秒数。範囲 `1`–`5` |
| `ManualStartGame` | 真偽値 | `false` | **手動開始**、読み込み後にキーを押して開始します (大会向け) |

### Game の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `BGInfo` / `SecondaryBGInfo` / `SubScreenBGInfo` | `CPCombo` | Critical Perfect Combo |
| | `PCombo` | Perfect Combo |
| | `Combo` | Combo |
| | `Achievement_101` | 達成率 (101-) |
| | `Achievement_100` | 達成率 (100-) |
| | `Achievement` | 達成率 |
| | `AchievementClassical` | FiNALE 達成率 |
| | `AchievementClassical_100` | FiNALE 達成率 (100-) |
| | `DXScore` | DX スコア |
| | `DXScoreRank` | DX スコアランク |
| | `S_Border` | S まで |
| | `SS_Border` | SS まで |
| | `SSS_Border` | SSS まで |
| | `MyBest` | 自己ベストまで |
| | `Diff` | 判定誤差 |
| | `None` | なし |
| `TopInfo` | `None` | 表示しない |
| | `Judge` | 判定結果 |
| | `Timing` | Fast / Late |
| `EnforceGameFailure` | `Disabled` | オフ |
| | `TrackSkip_S` / `Retry_S` | スキップ / S、リトライ / S |
| | `TrackSkip_SS` / `Retry_SS` | スキップ / SS、リトライ / SS |
| | `TrackSkip_SSS` / `Retry_SSS` | スキップ / SSS、リトライ / SSS |
| | `TrackSkip_SSSPlus` / `Retry_SSSPlus` | スキップ / SSS+、リトライ / SSS+ |
| | `TrackSkip_Best` / `Retry_Best` | スキップ / ベストスコア、リトライ / ベストスコア |
| | `TrackSkip_FC` / `Retry_FC` | スキップ / FC、リトライ / FC |
| | `TrackSkip_AP` / `Retry_AP` | スキップ / AP、リトライ / AP |
| `GameplaySubScreenClickBehavior` | `None` | なし |
| | `TrackSkip` | 楽曲スキップ |
| | `TrackSkip_1_Sec_Delay` | 楽曲スキップ (1 秒間押し続ける) |
| | `FastRetry` | クイックリトライ |
| | `FastRetry_1_Sec_Delay` | クイックリトライ (1 秒間押し続ける) |
| `Mirror` | `Off` | オフ |
| | `LRMirror` | 左右ミラー |
| | `UDMirror` | 上下ミラー |
| `Random` | `Disabled` | 無効 |
| | `RANDOM` | トラックごとにランダム |
| | `S_RANDOM` | ノートごとに個別にランダム |
| `RecordMode` | `Disable` | 無効 |
| | `OBSTrigger` | OBS WebSocket に接続して録画を自動的に開始 |

## Judge —— 判定設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `AudioOffset` | 浮動小数点数 | `0.0` | **オーディオオフセット (A 判定)**、音押し用です。ノートと音楽がずれているときに調整します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします。この項目は正解音を移動させるもので、譜面における `&first` に相当します |
| `JudgeOffset` | 浮動小数点数 | `0.0` | **判定オフセット (B 判定)**、目押し用です。デバイスの入力遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `AnswerOffset` | 浮動小数点数 | `0.0` | **正解音オフセット**、正解音が鳴るタイミングを調整します (判定には影響しません)。値を小さくすると早く、大きくすると遅く鳴ります。確信がない場合は変更しないでください |
| `TouchPanelOffset` | 浮動小数点数 | `0.0` | **内側画面入力オフセット**、タッチ入力の遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `Mode` | 列挙型 | `"Modern"` | **判定モード**、ゲームの判定とスコアのモード (旧筐体 / 新筐体) を選択します |

### Judge の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Mode` | `Classic` | クラシック (旧筐体) |
| | `Modern` | モダン (新筐体) |

## Display —— 表示設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Language` | 文字列 | `""` | **言語**。ソースコード上ではデフォルトで空です。初回起動後、プログラムが現在の言語を `"zh-CN - Majdata"` の形式で書き込みます |
| `Skin` | 文字列 | `"default"` | **ノートスキン**、ノートのスキンを変更します。設定されたスキンが存在しない場合、プログラムは最初に利用可能なスキンにフォールバックします |
| `DisplayCriticalPerfect` | 真偽値 | `false` | **Critical 判定を表示**、Critical 判定を表示します |
| `DisplayBreakScore` | 真偽値 | `true` | **Break スコアを表示**、Break ノートの詳細スコアを表示します |
| `FastLateType` | 列挙型 | `"Disable"` | **Fast / Late 表示レベル**、ノートの Fast / Late を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `NoteJudgeType` | 列挙型 | `"All"` | **ノート判定表示レベル**、ノート判定を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `TouchJudgeType` | 列挙型 | `"All"` | **タッチ判定表示レベル**、タッチ判定を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `SlideJudgeType` | 列挙型 | `"All"` | **スライド判定表示レベル**、スライド判定を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `BreakJudgeType` | 列挙型 | `"All"` | **Break 判定表示レベル**、Break 判定を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `BreakFastLateType` | 列挙型 | `"Disable"` | **Break Fast / Late 表示レベル**、Break の Fast / Late を表示する条件を設定します。このレベル未満のときのみ判定文字が表示されます |
| `SlideSortOrder` | 列挙型 | `"Modern"` | **スライドの並び順**、スライドの並び順: クラシックでは古いノートが下、モダンでは古いノートが上になります (スターの発色に影響します) |
| `OuterJudgeDistance` | 浮動小数点数 | `1.0` | **外側判定表示距離**、外側の判定文字の表示距離を調整します (小さいほど中央に近づきます)。範囲 `0`–`1`、ステップ `0.05`、`0` で無効になります |
| `InnerJudgeDistance` | 浮動小数点数 | `1.0` | **内側判定表示距離**、タッチ判定文字の表示距離を調整します (小さいほど中央に近づきます)。範囲 `0`–`1`、ステップ `0.05`、`0` で無効になります |
| `DisplayHoldHeadJudgeResult` | 真偽値 | `false` | **ホールド頭判定を表示**、ホールドの頭の判定結果を表示します |
| `TapScale` | 浮動小数点数 | `1.0` | **タップスケール**、タップノートの大きさを調整します。範囲 `0`–`2`、ステップ `0.01` |
| `HoldScale` | 浮動小数点数 | `1.0` | **ホールドスケール**、ホールドノートの大きさを調整します。範囲 `0`–`2`、ステップ `0.01` |
| `TouchScale` | 浮動小数点数 | `1.0` | **タッチスケール**、タッチノートの大きさを調整します。範囲 `0`–`2`、ステップ `0.01` |
| `SlideScale` | 浮動小数点数 | `1.0` | **スライドスケール**、スライドノートの大きさを調整します (Wifi Slide には影響しません)。範囲 `0`–`2`、ステップ `0.01` |
| `TouchFeedback` | 列挙型 | `"Outer_Only"` | **タッチフィードバック**、タッチフィードバックを表示する条件を設定します |
| `Resolution` | 文字列 | `"1080x1920"` | **解像度** <mark>非表示</mark>、調整できません。Windows / Linux / macOS のみ存在します |
| `MainScreenTransform` | 真偽値 | `false` | **画面アスペクト比のカスタマイズ**、メイン画面の拡大縮小と位置をカスタマイズします。モバイルではデフォルトで `true` です |
| `MainScreenScale` | 浮動小数点数 | `1.0` | **メイン画面スケール**、メイン画面全体の大きさを調整します。範囲 `0.05`–`1.5`、ステップ `0.01` |
| `MainScreenOffset` | 浮動小数点数 | `1.0` | **メイン画面位置オフセット**、メイン画面の位置を微調整します。範囲 `-1`–`1`、ステップ `0.01` |
| `MainScreenCachedScreenCenterY` | 浮動小数点数 | `960.0` | **メイン画面中心 Y (キャッシュ)** <mark>非表示</mark>、メイン画面の垂直中心座標のキャッシュです |
| `SubDisplayOffset` | 浮動小数点数 | `0.0` | **サブ画面位置オフセット**、サブ表示領域の位置を微調整します。範囲 `-5`–`5`、ステップ `0.01` |
| `SubDisplayScale` | 浮動小数点数 | `1.0` | **サブ画面スケール**、サブ表示領域の大きさを調整します。ステップ `0.01` |
| `GameplayScreenRotationAngle` | 列挙型 | `"Zero"` | **ゲーム画面の回転**、ゲーム画面を回転させます |
| `RenderQuality` | 列挙型 | `"Medium"` | **レンダリング品質**、値が高いほど画面が鮮明になります。モバイルではデフォルトで `"Low"` です |
| `RenderScale` | 整数 | `100` | **レンダリングスケール**、内部レンダリング解像度を調整します。`100` がネイティブ解像度です。下げると GPU 負荷は軽減されますが、画面と文字がぼやけます。レイアウトや判定は変わりません。範囲 `50`–`100`、ステップ `5`。モバイルではデフォルトで `75` です |
| `Topmost` | 真偽値 | `false` | **常に最前面** <mark>非表示</mark>、ウィンドウを最前面に保ちます。Windows / Linux / macOS のみ存在します |
| `FPSLimit` | 整数 | `120` | **フレームレート制限**、最大フレームレートを制限します。最小値 `-1` (`-1` は無制限)、ステップ `1` |
| `VSync` | 真偽値 | `true` | **垂直同期**、垂直同期を有効にするかどうか。モバイルには存在しません |
| `SkipVideoDownload` | 真偽値 | `false` | **動画ダウンロードをスキップ**、オンライン譜面の動画をダウンロードしません |

### Display の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | すべて |
| | `BelowCP` | Critical 未満 |
| | `BelowP` | Perfect 未満 |
| | `BelowGR` | Great 未満 |
| | `MissOnly` | Miss のみ |
| | `Disable` | 無効 |
| `SlideSortOrder` | `Classic` | クラシック順 (古いノートが下) |
| | `Modern` | モダン順 (古いノートが上) |
| `TouchFeedback` | `All` | すべて |
| | `Outer_Only` | 外側のみ |
| | `Inner_Only` | 内側のみ |
| | `Disable` | 無効 |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |
| `RenderQuality` | `VeryLow` | 非常に低い |
| | `Low` | 低い |
| | `Medium` | 中 |
| | `High` | 高い |
| | `VeryHigh` | 非常に高い |
| | `Ultra` | 最高 |

## Audio —— オーディオ設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `ForceMono` | 真偽値 | `false` | **強制モノラル**、オーディオをモノラル出力にミックスダウンします |
| `Volume` | オブジェクト | 下記参照 | **音量設定**、各トラックの音量 |
| `Wasapi` | オブジェクト | 下記参照 | **WASAPI 設定**、Windows のみ存在します |
| `Asio` | オブジェクト | 下記参照 | **ASIO 設定**、Windows のみ存在します |
| `Channel` | オブジェクト | 下記参照 | **チャンネル音量**、Windows / Linux / macOS のみ存在します |
| `Bass` | オブジェクト | 下記参照 | **BASS オーディオバッファー設定**、すべてのプラットフォームに存在します |
| `Backend` | 列挙型 | `"Wasapi"` | **オーディオバックエンド**。Windows ではデフォルトで `"Wasapi"`、モバイルでは `"BassSimple"` です |

### Audio.Volume —— 音量

すべての項目の範囲は `0`–`2`、ステップは `0.05` です。

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Global` | `0.3` | **グローバル**、マスター音量を調整します |
| `BGM` | `1.0` | **BGM**、プレイ以外 (選曲、リザルト) の音楽の音量を調整します |
| `Track` | `1.0` | **譜面音楽**、ゲーム内の音楽音量を調整します |
| `Answer` | `0.8` | **正解音**、正解音と開始時のメトロノームの音量を調整します |
| `Tap` | `0.3` | **タップ / ホールド判定音**、タップ / ホールドの判定音量を調整します |
| `Ex` | `0.3` | **Ex 判定音**、Ex ノートの判定音量を調整します |
| `Break` | `0.3` | **Break 判定音**、Break ノートの判定音量を調整します |
| `Slide` | `0.3` | **スライド判定音**、スライド効果音の音量を調整します |
| `Touch` | `0.3` | **タッチ判定音**、タッチ / TouchHold の判定音量を調整します |
| `Hanabi` | `0.3` | **Hanabi 効果音**、タッチ花火効果音の音量を調整します |
| `Voice` | `1.0` | **Xiaoxiao Lanbai**、アシスタントボイスの音量を調整します |

::: tip
`Global` の組み込みデフォルト値は `0.3` です。お手元のファイルがこれと異なる場合、その項目は変更されている (または古いバージョンのデフォルト値である) ことを意味します。
:::

### Audio.Wasapi —— WASAPI 設定 (Windows のみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Exclusive` | `true` | **排他モード**、オーディオデバイスを排他的に占有します。これをオフにした場合のみ、OBS などの他のプログラムが同時に録音 / 再生できます |
| `RawMode` | `true` | **Raw モード**、システムのミキサーで処理されていない生データを使用します |
| `AsyncMode` | `true` | **非同期モード**、非同期のオーディオ処理を使用します。一部の古いバージョンで生成された設定ファイルにはこの項目がない場合があり、その場合は `true` として扱われます |
| `BufferSize` | `0.02` | **バッファーサイズ**、単位は秒 |
| `Period` | `0.005` | **周期**、単位は秒 |

### Audio.Asio —— ASIO 設定 (Windows のみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `DeviceIndex` | `0` | **デバイスインデックス**、ASIO デバイスの番号 |
| `SampleRate` | `44100` | **サンプルレート**、オーディオのサンプルレート (Hz) |

### Audio.Channel —— チャンネル音量 (デスクトップのみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **フロントチャンネル** (LF / RF) の音量 |
| `CenterAndLFEVolume` | `1.0` | **センターと LFE チャンネル** (Center / LFE) の音量 |
| `SideVolume` | `1.0` | **サイドチャンネル** (LS / RS) の音量 |
| `RearVolume` | `1.0` | **リアチャンネル** (LR / RR) の音量 |

### Audio.Bass —— BASS バッファー設定

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `BufferLengthMs` | `1000` | **バッファー長**、単位はミリ秒 |
| `UpdatePeriodMs` | `200` | **更新周期**、単位はミリ秒 |
| `DeviceBufferLengthMs` | `64` | **デバイスバッファー長**、単位はミリ秒。モバイルではデフォルトで `32` |
| `DeviceUpdatePeriodMs` | `16` | **デバイス更新周期**、単位はミリ秒。モバイルではデフォルトで `8` |
| `EnableAAudio` | `true` | **AAudio を有効化**、Android のみ存在します |

### Audio の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Backend` | `Unity` | Unity 内蔵オーディオ |
| | `Wasapi` | WASAPI (Windows) |
| | `Asio` | ASIO (プロ向けサウンドカードの低遅延) |
| | `BassSimple` | BASS 簡易バックエンド (モバイルのデフォルト) |

## Debug —— デバッグ

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `DisplaySensor` | 真偽値 | `false` | **センサーを表示**、トリガーされているタッチ領域を強調表示します |
| `TouchSimulationRadius` | 浮動小数点数 | `0.5` | **シミュレーションタッチ半径**、シミュレーションするタッチ点の大きさです。値が大きいほど指の判定領域が大きくなります (プレイ中のみ有効です)。範囲 `0`–`2`、ステップ `0.05` |
| `TouchAAreaExtraRadius` | 浮動小数点数 | `0.0` | **シミュレーションタッチ A 領域半径**、A タッチ領域のトリガー半径を拡大します。範囲 `0`–`2`、ステップ `0.05` |
| `TouchBAreaExtraRadius` | 浮動小数点数 | `0.0` | **シミュレーションタッチ B 領域半径**、B タッチ領域のトリガー半径を拡大します |
| `TouchCAreaExtraRadius` | 浮動小数点数 | `0.25` | **シミュレーションタッチ C 領域半径**、C タッチ領域のトリガー半径を拡大します |
| `TouchDAreaExtraRadius` | 浮動小数点数 | `0.2` | **シミュレーションタッチ D 領域半径**、D タッチ領域のトリガー半径を拡大します |
| `TouchEAreaExtraRadius` | 浮動小数点数 | `0.1` | **シミュレーションタッチ E 領域半径**、E タッチ領域のトリガー半径を拡大します |
| `TouchRadiusAdjust` | 浮動小数点数 | `0.0` | **タッチ面積比率**、指の接触面積に応じてタッチのトリガー範囲を調整します。`0` で無効になります。範囲 `0`–`2` |
| `DisplayRuntimeInfo` | 真偽値 | `true` | **フレームレートとバージョンを表示**、右上にフレームレートとバージョンを表示します |
| `FullScreen` | 真偽値 | `true` | **強制全画面** <mark>非表示</mark>、Windows / Linux / macOS のみ存在します |
| `MenuOptionIterationSpeed` | 整数 | `45` | **メニュー項目の連打速度** <mark>非表示</mark>、値が大きいほど速くスクロールします |
| `DisplayOffset` | 浮動小数点数 | `0.0` | **フレームオフセット**、フレーム遅延を補正します。確信がない場合は変更しないでください |
| `NoteAppearRate` | 浮動小数点数 | `0.265` | **ノートフェードインオフセット**、ノートのフェードイン効果を調整します。ステップ `0.001` |
| `OffsetUnit` | 列挙型 | `"Frame"` | **オフセット単位**、各種オフセットの単位を調整します |
| `HideCursorInGame` | 真偽値 | `true` | **プレイ中はカーソルを隠す** <mark>非表示</mark>、Windows / Linux / macOS のみ存在します |
| `NoteFolding` | 真偽値 | `true` | **ノート折りたたみ** <mark>非表示</mark>、ノート表示を折りたたみます |
| `DJAutoPolicy` | 列挙型 | `"Strict"` | **DJAuto ポリシー**、Strict ではキーとタッチのどちらか一方のみ使用できます。Permissive では両者を混在させることができます |
| `MaxQueuedFrames` | 整数 | `2` | **最大キューイングフレーム数** <mark>非表示</mark>、処理待ちキューに許可される最大フレーム数 |
| `TapPoolCapacity` | 整数 | `96` | **タップオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `48` |
| `HoldPoolCapacity` | 整数 | `96` | **ホールドオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `48` |
| `TouchPoolCapacity` | 整数 | `64` | **タッチオブジェクトプール容量** <mark>非表示</mark> |
| `TouchHoldPoolCapacity` | 整数 | `64` | **TouchHold オブジェクトプール容量** <mark>非表示</mark> |
| `EachLinePoolCapacity` | 整数 | `48` | **トラックごとのオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `24` |
| `DebugLevel` | 列挙型 | `"Info"` | **ログレベル** <mark>非表示</mark>、出力されるログの最低レベル |

### Debug の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `OffsetUnit` | `Frame` | フレーム |
| | `Second` | 秒 |
| `DJAutoPolicy` | `Strict` | 厳格 |
| | `Permissive` | 寛容 |
| `DebugLevel` | `Debug` / `Info` / `Warning` / `Error` / `Fatal` | Debug / Info / Warning / Error / Fatal |

## Online —— ネットワーク

::: tip
スコアをランキングに送信したり、記録を保存したりしたいですか? オンライン譜面をゲーム内で直接プレイしたいですか? まず[オンラインサービス](/ja/majdataplay/configuration/online)をお読みください。
:::

このセクションの項目は、ゲーム内の設定画面では<mark>非表示</mark>です。iOS では、対応する設定はシステムの**設定**アプリにあります。

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `false` | **ネットワークを有効化**、オンライン機能を有効にするかどうか |
| `UseProxy` | 真偽値 | `true` | **プロキシを使用**、Windows / Linux / macOS のみ存在します |
| `Proxy` | 文字列 | `""` | **プロキシアドレス**、Windows / Linux / macOS のみ存在します |
| `ApiEndpoints` | 配列 | 下記参照 | **API エンドポイント一覧**、複数のサーバーを設定できます |

### Online.ApiEndpoints[] —— エンドポイント

デフォルトで `MajdataNET` の項目が 1 つ含まれます:

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Name` | 文字列 | `"MajdataNET"` | **名前**、エンドポイントの表示名 |
| `Url` | 文字列 | `"https://majdata.net/api3/api/"` | **API アドレス**、サーバーの API ルートアドレス |
| `Username` | 文字列 | `"YourUsername"` | **ユーザー名**、あらかじめ入力されるアカウント |
| `Password` | 文字列 | `"YourPassword"` | **パスワード**、あらかじめ入力されるパスワード |
| `AutoLogin` | 真偽値 | `false` | **自動ログイン**、起動時に自動でログインします |

## IO —— 入力 / 出力デバイス

このセクションはゲーム内の設定画面では<mark>非表示</mark>で、主に外付けのアーケードコントローラーと LED に使用します。詳細は[外付けデバイス](/ja/majdataplay/configuration/external_device)を参照してください。

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Manufacturer` | 列挙型 / `null` | `null` | **デバイスメーカー**、`null` は自動検出を意味します。Windows / Linux / macOS のみ存在します |
| `InputDevice` | オブジェクト | 下記参照 | **入力デバイス** |
| `OutputDevice` | オブジェクト | 下記参照 | **出力デバイス**。Windows / Linux / macOS のみ存在します |

### IO.InputDevice

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Player` | 整数 | `1` | **プレイヤー番号**、ゲームパッドのプレイヤーインデックス。デスクトップのみ存在します |
| `ButtonRing` | オブジェクト | 下記参照 | **ボタンリング (アーケードコントローラーのボタン)**。デスクトップのみ存在します |
| `TouchPanel` | オブジェクト | 下記参照 | **タッチパネル**。デスクトップのみ存在します |
| `ExternalButtonRing` | 列挙型 | `"None"` | **外付けボタンリング**、モバイルのみ存在します。`"None"` なし / `"Keyboard"` キーボード / `"Gamepad"` ゲームパッド |

### IO.InputDevice.ButtonRing

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Enable` | `true` | **有効化**、ボタンリング入力を有効にするかどうか |
| `Type` | `null` | **デバイス種別**、`null` は自動。`"Keyboard"` キーボード / `"HID"` HID デバイスを指定できます |
| `Debounce` | `false` | **デバウンスを有効化**、キーのデバウンスを有効にするかどうか |
| `PollingRateMs` | `0` | **ポーリング間隔**、単位はミリ秒。`0` は無制限 |
| `DebounceThresholdMs` | `0` | **デバウンスしきい値**、単位はミリ秒 |
| `HidOptions` | 下記参照 | **HID デバイスパラメーター** |

### IO.InputDevice.TouchPanel

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Enable` | `true` | **有効化**、タッチパネル入力を有効にするかどうか |
| `Debounce` | `false` | **デバウンスを有効化**、タッチのデバウンスを有効にするかどうか |
| `Sensitivities` | `A`–`E` すべて `0` | **感度**、A–E 各領域のタッチ感度 |
| `PollingRateMs` | `0` | **ポーリング間隔**、単位はミリ秒 |
| `DebounceThresholdMs` | `0` | **デバウンスしきい値**、単位はミリ秒 |
| `SerialPortOptions` | 下記参照 | **シリアルポートパラメーター**、`Port` / `BaudRate` はどちらもデフォルトで `null` |
| `UsbOptions` | 下記参照 | **USB デバイスパラメーター** |
| `CapacitivePanelOptions` | 下記参照 | **静電容量式タッチパネルのパラメーター** |

### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `TouchRadius` | `30` | **タッチ半径**、静電容量式タッチの判定半径 |
| `RadiusOffset` | `A:0` `B:20` `C:0` `D:0` `E:25` | **半径オフセット**、A–E 各領域の半径を微調整します |

### IO.OutputDevice.Led

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Enable` | `true` | **有効化**、LED 出力を有効にするかどうか |
| `Brightness` | `1.0` | **明るさ**、LED の明るさ |
| `RefreshRateMs` | `16` | **リフレッシュ間隔**、単位はミリ秒 |
| `Throttler` | `true` | **スロットラー**、LED のリフレッシュレートを制限します |
| `SerialPortOptions` | `Port` / `BaudRate` どちらも `null` | **シリアルポートパラメーター** |
| `HidOptions` | 下記参照 | **HID デバイスパラメーター** |

### IO 共通パラメーター

`HidOptions` と `UsbOptions` は同じ構造です:

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `DeviceName` | `null` | **デバイス名**、デバイス名を指定します (空欄で自動マッチング) |
| `ProductId` | `null` | **プロダクト ID (PID)** |
| `VendorId` | `null` | **ベンダー ID (VID)** |
| `Exclusice` | `false` | **排他モード**。設定ファイル内ではフィールド名が `Exclusice` と綴られています |

`HidOptions` にはさらに以下が含まれます:

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `OpenPriority` | `"VeryHigh"` | **オープン優先度**、`Idle` / `VeryLow` / `Low` / `Normal` / `High` / `VeryHigh` (最低 / 非常に低い / 低い / 普通 / 高い / 最高) を指定できます |

### IO の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Manufacturer` | `General` | 汎用 |
| | `Yuan` | Yuan コントローラー |
| | `Dao` | Dao コントローラー |
| | `Nov` | Nov コントローラー |
| | `null` | 自動検出 |

## 付録: Mod (設定ファイルには書き込まれない)

`Mod` は `settings.json` に**出力されません**。その値は現在の譜面をプレイしている間のみ有効です (譜面ごとの Mod 設定は譜面ファイルに保存されます)。ここでは参考としてデフォルト値を示します。

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **プレイ速度**、ゲームの速度倍率を調整します |
| `AutoPlay` | `"Disable"` | **自動プレイ**、Xiaoxiao Lanbai が代わりにプレイします。`Disable` 無効 / `Enable` 有効 / `DJAuto_ButtonRing_First` DJAuto (ボタンを優先) / `DJAuto_TouchPanel_First` DJAuto (内側画面を優先) |
| `JudgeStyle` | `"DEFAULT"` | **判定スタイル**、より厳しい判定で自分を試します。`DEFAULT` / `MAJI` / `GACHI` / `GORI` を指定できます |
| `SubdivideSlideJudgeGrade` | `false` | **スライド判定グレードの細分化**、スライドに小さな Perfect 判定が付くことを許可します |
| `AllBreak` | `false` | **全 Break**、すべてのノートを Break にします |
| `AllEx` | `false` | **全 Ex**、すべてのノートを Ex にします |
| `AllTouch` | `false` | **全タッチ**、すべてのノートをタッチノートにします |
| `SlideNoHead` | `false` | **ヘッドなしスター**、スライドの頭を削除します |
| `SlideNoTrack` | `false` | **スライド軌跡なし**、スライドの軌跡を削除します |
| `ButtonRingForTouch` | `false` | **内側画面のみの体験**、ボタンリングでスライドとタッチを操作できるようにします。デスクトップのみ存在します |
| `NoteMask` | `"Disable"` | **ノートマスク**、ノートのマスクカバー |

