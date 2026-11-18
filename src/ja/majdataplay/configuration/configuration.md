# 設定リファレンス

::: tip 設定は 2 つのファイルに分割されました
**2.1.0** および **2.1.0 プレビュー版** では、MajdataPlay の設定は 2 つのファイルに分割され、同じディレクトリに置かれます:

- `settings.json`: **ユーザー設定**。`Game`、`Judge`、`Display`、`Volume`、`Touch` を含みます。この設定はプレイヤーに追従し、オンラインアカウントにサインインするとアカウントから読み込まれ、アップロードされる場合があります。
- `system-settings.json`: **システム設定**。`Common`、`Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Network`、`IO` を含みます。この設定は現在のデバイスを表し、常にローカルに保存されます。

分割後は、各設定項目がいずれか一方のファイルだけに現れ、旧版のように 1 つのファイルへ混在することはありません:

| ファイル | 担当する内容 | 主な用途 |
| --- | --- | --- |
| `settings.json` | プレーの手感、判定、表示、音量、タッチシミュレーション | ノーツ速度、判定オフセット、スキン |
| `system-settings.json` | デバイス依存のレンダリング、オーディオバックエンド、エンコード/デコード、デバッグ、ネットワーク、外部 IO | 筐体、レンダリングバックエンド、サーバー |

本ページでは 2 つの部分に分けて説明します。[第 1 部](#new-configuration) は分割後の新しい設定を説明し、[第 2 部](#legacy-configuration) は旧バージョン向けに単一ファイル `settings.json` の説明を残しています。新しいバージョンは初回起動時に旧設定を自動で移行します。詳細は [旧バージョンからのアップグレード](#upgrading-from-an-older-version) を参照してください。
:::

::: warning
設定を変更する前に、ゲームが<mark>完全に終了</mark>していることを確認してください。ゲームの実行中に手動で編集したファイルは、次回ゲームが設定を保存するときに上書きされます。JSON に慣れていない場合は、[VSCode](https://code.visualstudio.com/) など構文チェック機能のあるエディタを使用してください。
:::

以下の表を読む前に、次の点に注意してください。

- **デフォルト値**とは、プログラムに組み込まれている値 (コード内の各設定プロパティの初期値) を意味し、初回実行時に生成される値です。ファイル内の値は以下の表と異なる場合があります。
- 一部の項目はプラットフォームによって異なり、説明内で **Windows**、**デスクトップ**、**モバイル** (Android / iOS) と記載しています。以下の表は主に **Windows** 版を対象としています。
- <mark>非表示</mark> と記載された項目はゲーム内の設定画面には表示されず、設定ファイルでのみ変更できます。
- <mark>書き込まれない</mark> と記載された項目は、対応するファイルに現れません。
- 列挙値は `"Modern"` や `"TrackSkip"` のように JSON に文字列として書き込まれ、真偽値は `true` / `false` として書き込まれます。
- カテゴリや項目が欠けている場合は、組み込みのデフォルト値が使用されます。ファイルを読み取れない場合、ゲームはそれを `.bak` としてバックアップし、デフォルト値で再生成します。

## 新しい設定 (2.1.0 以降) {#new-configuration}

本節では分割後の `settings.json` と `system-settings.json` を説明します。2.1.0、2.1.0 プレビュー版以降を使用している場合は本節を参照してください。

### ファイルの場所とアップグレード

両方のファイルは、[設定ファイル](/ja/majdataplay/configuration/index) で説明されている同じディレクトリにあります。**2.1.0**、**2.1.0 プレビュー版** 以降の初回起動時:

- `system-settings.json` が存在しない場合、ゲームがそれを作成します。古い `settings.json` のシステム設定は読み込み時に移行され、次回の保存時に `settings.json` から削除されます。
- 古い `settings.json` 内の設定がカテゴリを変更した場合 (たとえば `Audio.Volume` が `Volume` に、`Display.RenderQuality` が `Rendering.RenderQuality` になった場合)、ゲームは自動的に新しい場所へ移動します。同名の場合、現在のキーがレガシーキーより優先されます。
- レガシーの `machine_description.json` は `Network.Online.Machine` にインポートされ、その後 `machine_description.json.bak` に名前が変更されます。

完全な移行ルールについては、このページの末尾にある [旧バージョンからのアップグレード](#upgrading-from-an-older-version) を参照してください。

### settings.json — ユーザー設定

| セクション | 説明 | 内容 |
| --- | --- | --- |
| `Game` | ゲーム設定 | ノート速度、表示情報、リトライ / スキップ、ランダムとミラーなど |
| `Judge` | 判定設定 | 各種オフセット、判定モード、判定文字の表示 |
| `Display` | 表示設定 | スキン、中央情報、判定文字の距離、スケーリング、センサー表示 |
| `Volume` | 音量設定 | 各音声トラックの音量 |
| `Touch` | タッチ設定 | 模擬タッチ半径と A–E エリアの判定範囲 |

### Game — ゲーム設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `TapSpeed` | 浮動小数点 | `7.5` | **タップ速度**、ノート速度を調整します。刻み `0.25`、負の値も指定できます (逆方向に落下) |
| `TouchSpeed` | 浮動小数点 | `7.5` | **タッチ速度**、タッチノートの速度を調整します。刻み `0.25` |
| `SlideFadeInOffset` | 浮動小数点 | `0.0` | **スライドフェードインオフセット**、スライドのフェードインタイミングを調整します。値を大きくすると遅くなります。刻みは [オフセット単位](#judge-enum-values) に従います |
| `BackgroundDim` | 浮動小数点 | `0.8` | **背景の暗さ**、値が大きいほど暗くなります。範囲 `0`–`1`、刻み `0.05` |
| `SkipVideoDownload` | 真偽値 | `false` | **動画ダウンロードをスキップ**、オンライン譜面の動画をダウンロードしません |
| `StarRotation` | 真偽値 | `true` | **スター回転**、スターが落下中に回転します |
| `TrackSkip` | 真偽値 | `true` | **トラックをスキップ**、2、3、6、7 キーを押し続けると強制的にトラックをスキップします |
| `EnforceGameFailure` | 列挙型 | `"Disabled"` | **トラック失敗を強制**、目標に達せない場合に自動的にスキップまたはリトライします |
| `FastRetry` | 真偽値 | `true` | **高速リトライ**、3、4、5、6 キーを押し続けると素早くリトライします |
| `FastPractice` | 真偽値 | `false` | **高速プラクティス**、1、2、7、8 キーを押し続けるとプラクティスモードに入ります (セクションの 5 秒前から開始し、10 秒後まで延長します) |
| `GameplaySubScreenClickBehavior` | 列挙型 | `"TrackSkip"` | **プレイ中のサブ画面クリック動作**、プレイ中にサブ画面をクリックしたときの動作を調整します。モバイルではデフォルトで `"TrackSkip_1_Sec_Delay"` です |
| `Mirror` | 列挙型 | `"Off"` | **ミラー**、譜面を左右 / 上下に反転します |
| `Rotation` | 整数 | `0` | **回転**、譜面を回転させます。正の値は時計回りです。範囲 `-7`–`7`、刻み `1` |
| `SlideSkipping` | 真偽値 | `true` | **スライドスキップ**、スライドのスキップ機構を有効 / 無効にします |
| `Random` | 列挙型 | `"Disabled"` | **ランダム**、ノートをランダムに並べ替えます |
| `ButtonRingForTouch` | 真偽値 | `false` | **内側画面のみの体験**、ボタンリングでスライドとタッチをプレイできるようにします。モバイルではデフォルトで `true` です |
| `LeadInTime` | 整数 | `1` | **リードイン時間**、プレイ画面に入ってから実際にゲームが始まるまでの待機秒数。範囲 `1`–`5`、刻み `1` |
| `ManualStartGame` | 真偽値 | `false` | **手動開始**、読み込み後にキーを押して開始します (大会向け) |
| `NoteAppearRate` | 浮動小数点 | `0.265` | **ノートフェードインオフセット**、ノートのフェードイン効果を調整します。刻み `0.001` |

#### Game 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `EnforceGameFailure` | `Disabled` | オフ |
| | `TrackSkip_S` / `Retry_S` | スキップ / S、リトライ / S |
| | `TrackSkip_SS` / `Retry_SS` | スキップ / SS、リトライ / SS |
| | `TrackSkip_SSS` / `Retry_SSS` | スキップ / SSS、リトライ / SSS |
| | `TrackSkip_SSSPlus` / `Retry_SSSPlus` | スキップ / SSS+、リトライ / SSS+ |
| | `TrackSkip_Best` / `Retry_Best` | スキップ / ベストスコア、リトライ / ベストスコア |
| | `TrackSkip_FC` / `Retry_FC` | スキップ / FC、リトライ / FC |
| | `TrackSkip_AP` / `Retry_AP` | スキップ / AP、リトライ / AP |
| `GameplaySubScreenClickBehavior` | `None` | なし |
| | `TrackSkip` | トラックをスキップ |
| | `TrackSkip_1_Sec_Delay` | トラックをスキップ (1 秒間押し続ける) |
| | `FastRetry` | 高速リトライ |
| | `FastRetry_1_Sec_Delay` | 高速リトライ (1 秒間押し続ける) |
| `Mirror` | `Off` | オフ |
| | `LRMirror` | 左右ミラー |
| | `UDMirror` | 上下ミラー |
| `Random` | `Disabled` | 無効 |
| | `RANDOM` | トラックごとにランダム |
| | `S_RANDOM` | ノートごとに独立してランダム |

### Judge — 判定設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `AudioOffset` | 浮動小数点 | `0.0` | **オーディオオフセット (A 判定)**、音押し用です。ノートが音楽とずれているときに調整します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします。この項目は正解音を移動させ、譜面の `&first` に相当します |
| `JudgeOffset` | 浮動小数点 | `0.0` | **判定オフセット (B 判定)**、目押し用で、デバイスの入力遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `AnswerOffset` | 浮動小数点 | `0.0` | **正解音オフセット**、正解音が再生されるタイミングを調整します (判定には影響しません)。値を小さくすると早く、大きくすると遅く再生されます。確信がない限り変更しないでください |
| `TouchPanelOffset` | 浮動小数点 | `0.0` | **内側画面入力オフセット**、タッチ入力の遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `EnableJudgeTimingGauge` | 真偽値 | `false` | **判定タイミングインジケーターを表示**、リアルタイムの判定オフセットと平均判定位置を表示します |
| `OffsetUnit` | 列挙型 | `"Frame"` | **オフセット単位**、各種オフセットの単位を調整します |
| `Mode` | 列挙型 | `"Modern"` | **判定モード**、ゲームの判定とスコアリングのモードを選択します (旧フレーム / 新フレーム) |
| `DisplayCriticalPerfect` | 真偽値 | `false` | **Critical 判定を表示**、Critical 判定を表示します |
| `DisplayBreakScore` | 真偽値 | `true` | **Break スコアを表示**、Break ノートの詳細スコアを表示します |
| `FastLateType` | 列挙型 | `"Disable"` | **Fast / Late 表示レベル**、ノートの Fast / Late を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `NoteJudgeType` | 列挙型 | `"All"` | **ノート判定表示レベル**、ノート判定を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `TouchJudgeType` | 列挙型 | `"All"` | **タッチ判定表示レベル**、タッチ判定を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `SlideJudgeType` | 列挙型 | `"All"` | **スライド判定表示レベル**、スライド判定を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `BreakJudgeType` | 列挙型 | `"All"` | **Break 判定表示レベル**、Break 判定を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `BreakFastLateType` | 列挙型 | `"Disable"` | **Break Fast / Late 表示レベル**、Break の Fast / Late を表示する条件を設定します。このレベルより下の場合にのみ判定文字が表示されます |
| `SlideSortOrder` | 列挙型 | `"Modern"` | **スライドの並び順**、スライドが重なったときにどちらが手前になるかを決めます。`"Classic"` では古いスライドが手前 (上)、`"Modern"` では古いスライドが奥 (下) になります。スターの発色に影響します |
| `OuterJudgeDistance` | 浮動小数点 | `1.0` | **外側判定表示距離**、外側の判定文字の表示距離を調整します (小さいほど中心に近づきます)。範囲 `0`–`1`、刻み `0.05`、`0` で無効になります |
| `InnerJudgeDistance` | 浮動小数点 | `1.0` | **内側判定表示距離**、タッチ判定文字の表示距離を調整します (小さいほど中心に近づきます)。範囲 `0`–`1`、刻み `0.05`、`0` で無効になります |
| `DisplayHoldHeadJudgeResult` | 真偽値 | `false` | **ホールド頭の判定を表示**、ホールド頭の判定結果を表示します |

::: tip オフセットの刻み
`AudioOffset`、`JudgeOffset`、`AnswerOffset`、`TouchPanelOffset`、`SlideFadeInOffset`、`Debug.DisplayOffset` の刻みは `OffsetUnit` に従います。`"Second"` では `0.001`、`"Frame"` では `0.1` です。設定 UI ではこれらの値が現在の単位に合わせて整列されますが、JSON を直接編集する場合は任意の値を書き込めます。
:::

#### Judge 列挙値 {#judge-enum-values}

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `OffsetUnit` | `Second` | 秒 |
| | `Frame` | フレーム |
| `Mode` | `Classic` | Classic (旧フレーム) |
| | `Modern` | Modern (新フレーム) |
| `SlideSortOrder` | `Classic` | Classic 順 (古いスライドが手前 / 上) |
| | `Modern` | Modern 順 (古いスライドが奥 / 下) |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | すべて |
| | `BelowCP` | Critical 未満 |
| | `BelowP` | Perfect 未満 |
| | `BelowGR` | Great 未満 |
| | `MissOnly` | Miss のみ |
| | `Disable` | 無効 |

### Display — 表示設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Language` | 文字列 | `""` | **言語**。ソースコード上ではデフォルトで空です。初回実行後、プログラムが現在の言語を `"zh-CN - Majdata"` の形式で書き込みます |
| `Skin` | 文字列 | `"default"` | **ノートスキン**、ノートのスキンを変更します。設定されたスキンが存在しない場合、プログラムは最初に利用可能なスキンにフォールバックします |
| `BGInfo` | 列挙型 | `"Combo"` | **中央表示**、画面中央に表示する情報を調整します |
| `SecondaryBGInfo` | 列挙型 | `"None"` | **追加情報表示**、画面中央下部に表示する情報を調整します |
| `SubScreenBGInfo` | 列挙型 | `"Achievement"` | **サブ画面情報表示**、サブ画面に表示する情報を調整します |
| `TopInfo` | 列挙型 | `"None"` | **外枠表示**、上部に表示する情報 (キー 1 と 8 の間) |
| `TapScale` | 浮動小数点 | `1.0` | **タップ倍率**、タップノートの大きさを調整します。範囲 `0`–`2`、刻み `0.01` |
| `HoldScale` | 浮動小数点 | `1.0` | **ホールド倍率**、ホールドノートの大きさを調整します。範囲 `0`–`2`、刻み `0.01` |
| `TouchScale` | 浮動小数点 | `1.0` | **タッチ倍率**、タッチノートの大きさを調整します。範囲 `0`–`2`、刻み `0.01` |
| `SlideScale` | 浮動小数点 | `1.0` | **スライド倍率**、スライドノートの大きさを調整します (Wifi Slide には影響しません)。範囲 `0`–`2`、刻み `0.01` |
| `SlidePathStyle` | 列挙型 | `"Classic"` | **連結スライドの矢印スタイル**、連結スライド (例: `1-4q7`) の矢印の並び方 |
| `TouchFeedback` | 列挙型 | `"Outer_Only"` | **タッチフィードバック**、タッチフィードバックを表示する条件を設定します |
| `DisplaySensor` | 真偽値 | `false` | **センサーを表示**、トリガーされているタッチエリアを強調表示します |
| `SensorPosition` | 列挙型 | `"MainScreen"` | **センサー表示位置**、センサーエリアを表示する位置を選択します |
| `SensorStyle` | 列挙型 | `"RedGreen"` | **センサー表示スタイル**、センサーエリアの表示スタイルを選択します |
| `SensorOpacity` | 整数 | `20` | **センサーの不透明度**、表示の強さを調整します。範囲 `10`–`90`、刻み `10` |

#### Display 列挙値

| 項目 | 値 | 説明 |
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
| | `MyBest` | ベストスコアまで |
| | `Diff` | 判定誤差 |
| | `None` | なし |
| `TopInfo` | `None` | 表示しない |
| | `Judge` | 判定結果 |
| | `Timing` | Fast / Late |
| `SlidePathStyle` | `Classic` | 各セグメントが単体スライドの矢印と完全に重なり、2 つの円弧が接する箇所に隙間ができます |
| | `Medium` | `Classic` と同様ですが、2 つの円弧が接する隙間を矢印が埋めます |
| | `Perfect` | 矢印が連結スライド全体に沿って連続します |
| `TouchFeedback` | `All` | すべて |
| | `Outer_Only` | 外側のみ |
| | `Inner_Only` | 内側のみ |
| | `Disable` | 無効 |
| `SensorPosition` | `MainScreen` | メイン画面 |
| | `SubScreen` | サブ画面 |
| `SensorStyle` | `Brightness` | 明暗 |
| | `RedGreen` | 赤緑 |
| | `Classic` | クラシック |

### Volume — 音量設定 {#volume-settings}

すべての項目の範囲は `0`–`2`、刻みは `0.05` です。

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `Global` | `0.3` | **グローバル**、マスター音量を調整します |
| `BGM` | `1.0` | **BGM**、プレイ外 (選曲、リザルト) の BGM 音量を調整します |
| `Track` | `1.0` | **譜面音楽**、ゲーム内音楽の音量を調整します |
| `Answer` | `0.8` | **正解音**、正解音と開始時のメトロノームの音量を調整します |
| `Tap` | `0.3` | **タップ / ホールド判定音**、タップ / ホールドの判定音量を調整します |
| `Ex` | `0.3` | **Ex 判定音**、Ex ノートの判定音量を調整します |
| `Break` | `0.3` | **Break 判定音**、Break ノートの判定音量を調整します |
| `Slide` | `0.3` | **スライド判定音**、スライド効果音の音量を調整します |
| `Touch` | `0.3` | **タッチ判定音**、タッチ / TouchHold の判定音量を調整します |
| `Hanabi` | `0.3` | **Hanabi 効果音**、タッチ花火効果音の音量を調整します |
| `Voice` | `1.0` | **Xiaoxiao Lanbai**、アシスタントボイスの音量を調整します |

::: tip
旧バージョンでは音量は `Audio.Volume` に保存されていました。新バージョンでは `Volume` が最上位の分類で、古い値は起動時に自動的に移行されます。設定 UI の音量メニューもこの分類に対応しています。
:::

### Touch — タッチ設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `TouchSimulationRadius` | 浮動小数点 | `0.5` | **模擬タッチ半径**、模擬タッチポイントの大きさ。値が大きいほど指の判定範囲が大きくなります (プレイ中のみ有効)。範囲 `0`–`2`、刻み `0.05` |
| `TouchAAreaExtraRadius` | 浮動小数点 | `0.0` | **模擬タッチ A エリア半径**、タッチ A エリアのトリガー半径を拡大します。範囲 `0`–`2`、刻み `0.05` |
| `TouchBAreaExtraRadius` | 浮動小数点 | `0.0` | **模擬タッチ B エリア半径**、タッチ B エリアのトリガー半径を拡大します。範囲 `0`–`2`、刻み `0.05` |
| `TouchCAreaExtraRadius` | 浮動小数点 | `0.25` | **模擬タッチ C エリア半径**、タッチ C エリアのトリガー半径を拡大します。範囲 `0`–`2`、刻み `0.05` |
| `TouchDAreaExtraRadius` | 浮動小数点 | `0.2` | **模擬タッチ D エリア半径**、タッチ D エリアのトリガー半径を拡大します。範囲 `0`–`2`、刻み `0.05` |
| `TouchEAreaExtraRadius` | 浮動小数点 | `0.1` | **模擬タッチ E エリア半径**、タッチ E エリアのトリガー半径を拡大します。範囲 `0`–`2`、刻み `0.05` |
| `TouchRadiusAdjust` | 浮動小数点 | `0.0` | **タッチ面積比率**、指の接触面積に応じてタッチのトリガー範囲を調整します。`0` で無効になります。範囲 `0`–`2`、刻み `0.05` |

### system-settings.json — システム設定

| セクション | 説明 | 内容 |
| --- | --- | --- |
| `Common` | 共通設定 | 録画モード、メニューの連続入力速度、カーソル、ノート折りたたみ、DJAuto ポリシー |
| `Rendering` | レンダリング設定 | 画質プリセット、フレームレート、垂直同期、UI スタイル、画面レイアウト |
| `Audio` | オーディオ設定 | オーディオバックエンド、バッファ、チャンネル音量。設定 UI では非表示 |
| `Encoding` | エンコード設定 | 録画エンコーダーのオプション。録画モードが `FFmpeg` の場合に表示 |
| `Decoding` | デコード設定 | 動画デコーダーと読み取りタイムアウト |
| `Debug` | デバッグ | フレームオフセット、オブジェクトプール容量、ログレベル |
| `Network` | ネットワーク | オンラインアカウント、API エンドポイント、プロキシ。設定 UI では非表示 |
| `IO` | 入力 / 出力デバイス | アーケードコントローラー、タッチパネル、LED。設定 UI では非表示 |
| `Mod` | Mod | <mark>書き込まれない</mark>、現在の譜面にのみ適用されます |

### Common — 共通設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `RecordMode` | 列挙型 | `"Disable"` | **録画モード**、録画の開始方法を選択します。[Encoding](#encoding-settings) メニューはこれが `"FFmpeg"` の場合にのみ表示されます |
| `MenuOptionIterationSpeed` | 整数 | `45` | **メニュー項目の連続入力速度** <mark>非表示</mark>、値が大きいほどスクロールが速くなります。`0` は `15` として扱われます |
| `HideCursorInGame` | 真偽値 | `true` | **プレイ中にカーソルを隠す** <mark>非表示</mark>、デスクトップでのみ利用できます |
| `NoteFolding` | 真偽値 | `true` | **ノート折りたたみ** <mark>非表示</mark>、ノートの表示を折りたたみます。iOS では書き込まれません |
| `DJAutoPolicy` | 列挙型 | `"Strict"` | **DJAuto ポリシー**、Strict: キーかタッチのどちらか一方のみ使用できます。Permissive: 両者を混在できます |

#### Common 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `RecordMode` | `Disable` | 無効 |
| | `OBSTrigger` | OBS WebSocket に接続して録画を自動的に開始します。モバイルでは選択できません |
| | `FFmpeg` | 内蔵 FFmpeg エンコーダーで録画します |
| `DJAutoPolicy` | `Strict` | 厳格 |
| | `Permissive` | 寛容 |

### Rendering — レンダリング設定

`Rendering` には 5 つの画質プリセットがあります。`"EnergySaving"`、`"Performance"`、`"Beautiful"`、`"Refined"` は固定のパラメータセットを書き込みます。`"Custom"` の場合のみ、以下のアンチエイリアス、テクスチャ品質、UI スタイル、出力モード、レンダースケールが表示され、変更できるようになります。名前付きプリセットに戻すと、これらのカスタムパラメータは上書きされます。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `RenderQuality` | 列挙型 | `"Beautiful"` | **レンダリング品質**、全体のレンダリング品質を制御します。互換モードがオンの間は非表示になります |
| `FPSLimit` | 整数 | `120` | **フレームレート上限**、最大フレームレートを制限します。最小 `-1` (`-1` は無制限)、刻み `1` |
| `VSync` | 真偽値 | `true` | **垂直同期**、垂直同期を有効にするかどうか。モバイルの設定 UI では非表示になります |
| `VulkanLowLatencyVSync` | 真偽値 | `true` | **低遅延垂直同期** <mark>非表示</mark>、Windows でのみ有効です。モバイルでは書き込まれません |
| `VulkanLowLatencyVSyncBackend` | 列挙型 | `"Timer"` | **低遅延垂直同期バックエンド** <mark>非表示</mark>、デスクトップ専用です。モバイルでは書き込まれません |
| `AntiAliasing` | 列挙型 | `"Disabled"` | **アンチエイリアス**、アンチエイリアスの品質を制御します。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `TextureQuality` | 列挙型 | `"High"` | **テクスチャ品質**、UI、ジャケット、スキン画像の表示品質を制御します。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `UIOutlineMode` | 列挙型 | `"All"` | **UI スタイル**、UI 画像のレンダリング方法を制御します。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `UIBackdropStyle` | 列挙型 | `"GaussianBlur"` | **背景スタイル**、Refined 画質で使用するエフェクトを選択します。`"Refined"` の場合にのみ表示されます |
| `OutputMode` | 列挙型 | `"Direct"` | **グラフィック出力モード**、画面の出力方法を選択します。画面が黒い場合は互換出力を試してください。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `CompatibilityMode` | 真偽値 | `false` | **グラフィック互換モード**、画面が黒くなる、またはカクつく場合に有効にします |
| `SystemResolutionScaling` | 整数 | `100` | **システム解像度スケーリング (実験的)**、システムの表示解像度を調整します。範囲 `10`–`100`、刻み `5`。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `RenderScale` | 整数 | `100` | **レンダースケール**、内部レンダリング解像度を調整します。`100` がネイティブ解像度で、下げると GPU 負荷は減りますが、画像と文字がぼやけます。レイアウトや判定は変わりません。範囲 `10`–`200`、刻み `5`。`100` 以外の値では `"Intermediate"` 出力が強制されます。互換モードがオフの `"Custom"` の場合にのみ表示されます |
| `DisplayRuntimeInfo` | 真偽値 | `true` | **フレームレートとバージョンを表示**、右上にフレームレートとバージョンを表示します |
| `Resolution` | 文字列 | `"1080x1920"` | **解像度** <mark>非表示</mark>、デスクトップ専用です |
| `FullScreen` | 真偽値 | `true` | **強制全画面** <mark>非表示</mark>、デスクトップ専用です |
| `Topmost` | 真偽値 | `false` | **常に最前面** <mark>非表示</mark>、ウィンドウを最前面に保ちます。デスクトップ専用です |
| `MainScreenTransform` | 真偽値 | `false` | **画面比率のカスタマイズ**、メイン画面のスケールと位置をカスタマイズします。モバイルではデフォルトで `true` です |
| `MainScreenScale` | 浮動小数点 | `1.0` | **メイン画面スケール**、メイン画面全体の大きさを調整します。範囲 `0.05`–`1.5`、刻み `0.01` |
| `MainScreenOffset` | 浮動小数点 | `1.0` | **メイン画面位置オフセット**、メイン画面の位置を微調整します。範囲 `-1`–`1`、刻み `0.01` |
| `MainScreenCachedScreenCenterY` | 浮動小数点 | `960.0` | **メイン画面中心 Y (キャッシュ)** <mark>非表示</mark>、メイン画面の垂直中心座標のキャッシュ |
| `SubDisplayOffset` | 浮動小数点 | `0.0` | **サブ画面位置オフセット**、サブ表示領域の位置を微調整します。範囲 `-5`–`5`、刻み `0.01` |
| `SubDisplayScale` | 浮動小数点 | `1.0` | **サブ画面スケール**、サブ表示領域の大きさを調整します。刻み `0.01` |
| `GameplayScreenRotationAngle` | 列挙型 | `"Zero"` | **プレイ画面の回転**、プレイ画面を回転させます |

`SystemScalingStatus`、`DisplayBufferResolution`、`SceneRenderResolution`、`CurrentOutputPath` は読み取り専用の診断項目です。JSON には書き込まれず、変更もできません。

#### Rendering 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `RenderQuality` | `EnergySaving` | 省電力 |
| | `Performance` | パフォーマンス |
| | `Beautiful` | 美麗 (デフォルト) |
| | `Refined` | 洗練 |
| | `Custom` | カスタム |
| `AntiAliasing` | `Disabled` | 無効 |
| | `MSAA2x` | MSAA 2× |
| | `MSAA4x` | MSAA 4× |
| | `MSAA8x` | MSAA 8× |
| `TextureQuality` | `Low` | 低 |
| | `Medium` | 中 |
| | `High` | 高 |
| `UIOutlineMode` | `None` | 不透明 |
| | `Performance` | 混合透過 |
| | `All` | 半透明 |
| | `GaussianBlur` | ガウスぼかし |
| | `LiquidGlass` | リキッドグラス |
| `UIBackdropStyle` | `GaussianBlur` | ガウスぼかし |
| | `LiquidGlass` | リキッドグラス |
| `OutputMode` | `Direct` | 直接出力 |
| | `Intermediate` | 互換出力 |
| `VulkanLowLatencyVSyncBackend` | `Auto` | 利用可能なバックエンドを自動的に使用します |
| | `PresentWait` | present wait を使用し、利用できない場合はタイマーにフォールバックします |
| | `Timer` | 常にタイマーを使用します |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |

### Audio — オーディオ設定

このセクションは設定 UI では <mark>非表示</mark> ですが、引き続き有効です。音量は `settings.json` の [Volume](#volume-settings) カテゴリに移動しました。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `ForceMono` | 真偽値 | `false` | **強制モノラル**、音声をモノラル出力にミックスダウンします |
| `Wasapi` | オブジェクト | 下記参照 | **WASAPI 設定**、Windows にのみ存在します |
| `Asio` | オブジェクト | 下記参照 | **ASIO 設定**、Windows にのみ存在します |
| `Channel` | オブジェクト | 下記参照 | **チャンネル音量**、デスクトップにのみ存在します |
| `Bass` | オブジェクト | 下記参照 | **BASS オーディオバッファ設定**、すべてのプラットフォームに存在します |
| `Backend` | 列挙型 | `"Wasapi"` | **オーディオバックエンド**。デスクトップでは `"Wasapi"`、モバイルでは `"BassSimple"` がデフォルトです |

#### Audio.Wasapi — WASAPI 設定 (Windows のみ)

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `Exclusive` | `true` | **排他モード**、オーディオデバイスを排他的に制御します。オフの場合にのみ、OBS などのプログラムが同時に音声を録音 / 再生できます |
| `RawMode` | `true` | **Raw モード**、システムミキサーで処理されていない生データを使用します |
| `AsyncMode` | `true` | **非同期モード**、非同期オーディオ処理を使用します。一部の古い設定で欠けている場合は `true` として扱われます |
| `BufferSize` | `0.02` | **バッファサイズ**、単位は秒 |
| `Period` | `0.005` | **周期**、単位は秒 |

#### Audio.Asio — ASIO 設定 (Windows のみ)

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `DeviceIndex` | `0` | **デバイスインデックス**、ASIO デバイス番号 |
| `SampleRate` | `44100` | **サンプルレート**、オーディオのサンプルレート (Hz) |

#### Audio.Channel — チャンネル音量 (デスクトップのみ)

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **フロントチャンネル** (LF / RF) 音量 |
| `CenterAndLFEVolume` | `1.0` | **センターと LFE チャンネル** (Center / LFE) 音量 |
| `SideVolume` | `1.0` | **サイドチャンネル** (LS / RS) 音量 |
| `RearVolume` | `1.0` | **リアチャンネル** (LR / RR) 音量 |

#### Audio.Bass — BASS バッファ設定

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `BufferLengthMs` | `1000` | **バッファ長**、単位はミリ秒 |
| `UpdatePeriodMs` | `200` | **更新周期**、単位はミリ秒 |
| `DeviceBufferLengthMs` | `64` | **デバイスバッファ長**、単位はミリ秒。モバイルではデフォルトで `32` です |
| `DeviceUpdatePeriodMs` | `16` | **デバイス更新周期**、単位はミリ秒。モバイルではデフォルトで `8` です |
| `EnableAAudio` | `true` | **AAudio を有効化**、Android にのみ存在します |

#### Audio 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `Backend` | `Unity` | Unity 内蔵オーディオ |
| | `Wasapi` | WASAPI (Windows) |
| | `Asio` | ASIO (プロ向けサウンドカードの低遅延) |
| | `BassSimple` | BASS 簡易バックエンド (モバイルのデフォルト) |

### Encoding — エンコード設定 {#encoding-settings}

このメニューは `Common.RecordMode` が `"FFmpeg"` の場合にのみ表示されます。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `PreferredEncoder` | 列挙型 | `"Hardware"` | **優先エンコーダー**、利用可能な場合にこのエンコーダーを優先して使用します |
| `EncodingFormat` | 列挙型 | `"H264"` | **エンコード形式**、録画時に使用するコーデック |
| `FrameRate` | 整数 | `60` | **フレームレート**、録画のフレームレート。範囲 `30`–`240`、刻み `30` |
| `RateControlMode` | 列挙型 | `"VBR"` | **レート制御**、固定ビットレートか可変ビットレートかを選択します |
| `BitRate` | 整数 | `4000000` | **ビットレート**、録画時の基本ビットレート。最小 `100000`、刻み `50000` |
| `MaximumBitRate` | 整数 | `8000000` | **最大ビットレート**、VBR モードでの最大ビットレート。`"VBR"` の場合にのみ表示されます。最小 `100000`、刻み `50000` |
| `ResolutionScale` | 浮動小数点 | `1.0` | **解像度スケール**、録画の実際の解像度倍率。範囲 `0.25`–`1`、刻み `0.25` |
| `ContainerFormat` | 列挙型 | `"MP4"` | **コンテナ形式** <mark>非表示</mark> |

#### Encoding 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `PreferredEncoder` | `Software` | ソフトウェアエンコード |
| | `Hardware` | ハードウェアエンコード |
| `EncodingFormat` | `H264` | H.264 / AVC |
| | `HEVC` | H.265 / HEVC |
| | `VP9` | VP9 |
| | `AV1` | AV1 |
| | `MPEG4` | MPEG-4 Part 2 |
| `RateControlMode` | `CBR` | 固定ビットレート |
| | `VBR` | 可変ビットレート |
| `ContainerFormat` | `MP4` | MP4 |
| | `Matroska` | Matroska (MKV) |

### Decoding — デコード設定

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `PreferredDecoder` | 列挙型 | `"Hardware"` | **優先デコーダー**、利用可能な場合にこのデコーダーを優先して使用します |
| `IOTimeoutSeconds` | 整数 | `15` | **I/O タイムアウト**、動画プレイヤーの読み取りタイムアウト (秒)。最小 `1` |

#### Decoding 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `PreferredDecoder` | `Software` | ソフトウェアデコード |
| | `Hardware` | ハードウェアデコード |

### Debug — デバッグ

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `DisplayOffset` | 浮動小数点 | `0.0` | **フレームオフセット**、フレーム遅延を補正します。最小 `0`、刻みはオフセット単位に従います。確信がない限り変更しないでください |
| `MaxQueuedFrames` | 整数 | `2` | **最大キューイングフレーム数** <mark>非表示</mark>、処理待ちとしてキューに置ける最大フレーム数。モバイルでは書き込まれません |
| `FrameTimingDiagnostics` | 真偽値 | `false` | **フレームタイミング診断** <mark>非表示</mark>、フレームタイミングの診断情報を書き込みます |
| `TapPoolCapacity` | 整数 | `96` | **タップオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `48` です |
| `HoldPoolCapacity` | 整数 | `96` | **ホールドオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `48` です |
| `TouchPoolCapacity` | 整数 | `64` | **タッチオブジェクトプール容量** <mark>非表示</mark> |
| `TouchHoldPoolCapacity` | 整数 | `64` | **TouchHold オブジェクトプール容量** <mark>非表示</mark> |
| `EachLinePoolCapacity` | 整数 | `48` | **トラックごとのオブジェクトプール容量** <mark>非表示</mark>、モバイルではデフォルトで `24` です |
| `DebugLevel` | 列挙型 | `"Info"` | **ログレベル** <mark>非表示</mark>、出力されるログの最低レベル。iOS では書き込まれません |

#### Debug 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `DebugLevel` | `Debug` | デバッグ |
| | `Info` | 情報 |
| | `Warning` | 警告 |
| | `Error` | エラー |
| | `Fatal` | 致命的 |

### Network — ネットワーク

このセクションはゲーム内の設定画面では <mark>非表示</mark> です。iOS では、対応する設定はシステムの **設定** アプリにあります。スコアをリーダーボードに送信する / 記録を保存する場合、またはゲーム内でオンライン譜面を直接プレイする場合は、先に [オンラインサービス](/ja/majdataplay/configuration/online) をお読みください。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Online` | オブジェクト | 下記参照 | **オンラインサービス** |
| `Proxy` | オブジェクト | 下記参照 | **プロキシ** |

#### Network.Online

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `false` | **ネットワークを有効化**、オンライン機能を有効にするかどうか。iOS では書き込まれません |
| `ApiEndpoints` | 配列 | 下記参照 | **API エンドポイント一覧**、複数のサーバーを設定できます |
| `Machine` | オブジェクト | 下記参照 | **マシン記述**、マシン登録と QR コード認証に使用します |

`ApiEndpoints` にはデフォルトで 1 つの `MajdataNET` エントリが含まれます (iOS では空です)。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Name` | 文字列 | `"MajdataNET"` | **名前**、エンドポイントの表示名 |
| `Url` | 文字列 | `"https://majdata.net/api3/api/"` | **API アドレス**、サーバーの API ルートアドレス |
| `Username` | 文字列 | `"YourUsername"` | **ユーザー名**、事前入力されるアカウント |
| `Password` | 文字列 | `"YourPassword"` | **パスワード**、事前入力されるパスワード |
| `AutoLogin` | 真偽値 | `false` | **自動ログイン**、起動時に自動的にサインインします |

`Machine` のデフォルト値:

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Name` | 文字列 | `"MajdataPlay Client"` | **マシン名** |
| `Description` | 文字列 | `"MajdataPlay Client QR Code Authentication"` | **マシン記述** |

#### Network.Proxy

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `true` | **プロキシを使用** |
| `Url` | 文字列 | `""` | **プロキシアドレス** |

::: tip
旧バージョンではオンライン設定を `Online` カテゴリに保存し、`UseProxy` / `Proxy` キーを使用していました。新バージョンではこれらを `Network.Online` と `Network.Proxy` に移行します。旧バージョンの単独の `machine_description.json` も `Network.Online.Machine` にインポートされます。
:::

### IO — 入力 / 出力デバイス

このセクションはゲーム内の設定画面では <mark>非表示</mark> で、主に外付けのアーケードコントローラーと LED に使用します。詳細は [外付けデバイス](/ja/majdataplay/configuration/external_device) を参照してください。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Manufacturer` | 列挙型 / `null` | `null` | **デバイスメーカー**、`null` は自動検出を意味します。デスクトップ専用です |
| `Player` | 整数 | `1` | **プレイヤー番号**、ゲームパッドのプレイヤーインデックス。デスクトップ専用です |
| `InputDevice` | オブジェクト | 下記参照 | **入力デバイス** |
| `OutputDevice` | オブジェクト | 下記参照 | **出力デバイス**。デスクトップ専用です |

#### IO.InputDevice

デスクトップ:

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `ButtonRing` | オブジェクト | 下記参照 | **ボタンリング (アーケードコントローラーのボタン)** |
| `TouchPanel` | オブジェクト | 下記参照 | **タッチパネル** |

モバイル:

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `ExternalButtonRing` | 列挙型 | `"None"` | **外付けボタンリング**、`"None"` なし / `"Keyboard"` キーボード / `"Gamepad"` ゲームパッド |

#### IO.InputDevice.ButtonRing

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `true` | **有効化**、ボタンリング入力を有効にするかどうか |
| `Type` | 列挙型 / `null` | `null` | **デバイス種別**、`null` は自動。`"Keyboard"` キーボード / `"HID"` HID デバイス / `"Pipe"` 外部 IO マネージャー |
| `Debounce` | 真偽値 | `false` | **デバウンスを有効化**、キーのデバウンスを有効にするかどうか |
| `PollingRateMs` | 整数 | `0` | **ポーリング間隔**、単位はミリ秒。`0` は無制限を意味します |
| `DebounceThresholdMs` | 整数 | `0` | **デバウンスしきい値**、単位はミリ秒 |
| `HidOptions` | オブジェクト | 下記参照 | **HID デバイスパラメータ** |

#### IO.InputDevice.TouchPanel

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `true` | **有効化**、タッチパネル入力を有効にするかどうか |
| `Debounce` | 真偽値 | `false` | **デバウンスを有効化**、タッチのデバウンスを有効にするかどうか |
| `Sensitivities` | オブジェクト | `A`–`E` すべて `0` | **感度**、A–E エリアのタッチ感度 |
| `PollingRateMs` | 整数 | `0` | **ポーリング間隔**、単位はミリ秒 |
| `DebounceThresholdMs` | 整数 | `0` | **デバウンスしきい値**、単位はミリ秒 |
| `SerialPortOptions` | オブジェクト | 下記参照 | **シリアルポートパラメータ** |
| `UsbOptions` | オブジェクト | 下記参照 | **USB デバイスパラメータ** |
| `CapacitivePanelOptions` | オブジェクト | 下記参照 | **静電容量式タッチパネルパラメータ** |

#### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `TouchRadius` | 整数 | `30` | **タッチ半径**、静電容量式タッチの判定半径 |
| `RadiusOffset` | オブジェクト | `A:0` `B:20` `C:0` `D:0` `E:25` | **半径オフセット**、A–E エリアの半径の微調整 |

#### IO.OutputDevice.Led

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Enable` | 真偽値 | `true` | **有効化**、LED 出力を有効にするかどうか |
| `Brightness` | 浮動小数点 | `1.0` | **明るさ**、LED の明るさ |
| `RefreshRateMs` | 整数 | `16` | **リフレッシュ間隔**、単位はミリ秒 |
| `Throttler` | 真偽値 | `true` | **スロットル**、LED のリフレッシュレートを制限します |
| `SerialPortOptions` | オブジェクト | 下記参照 | **シリアルポートパラメータ** |
| `HidOptions` | オブジェクト | 下記参照 | **HID デバイスパラメータ** |

#### IO 共通パラメータ

`HidOptions` と `UsbOptions` は同じ構造です。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `DeviceName` | 文字列 / `null` | `null` | **デバイス名**、デバイス名を指定します (空のままにすると自動的に一致させます) |
| `ProductId` | 整数 / `null` | `null` | **プロダクト ID (PID)** |
| `VendorId` | 整数 / `null` | `null` | **ベンダー ID (VID)** |
| `Exclusice` | 真偽値 | `false` | **排他モード**。フィールド名は設定ファイル内では `Exclusice` と綴られています |

`SerialPortOptions`:

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `Port` | 整数 / 文字列 / `null` | `null` | **シリアルポート**。Windows では整数、他のプラットフォームでは文字列 |
| `BaudRate` | 整数 / `null` | `null` | **ボーレート** |

`HidOptions` にはさらに以下が含まれます。

| 項目 | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `OpenPriority` | 列挙型 | `"VeryHigh"` | **オープン優先度** |

#### IO 列挙値

| 項目 | 値 | 説明 |
| --- | --- | --- |
| `Manufacturer` | `General` | 汎用 |
| | `Yuan` | Yuan コントローラー |
| | `Dao` | Dao コントローラー |
| | `Nov` | Nov コントローラー |
| | `NPro` | NPro コントローラー |
| | `Pipe` | [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager) |
| | `null` | 自動検出 |
| `ButtonRing.Type` | `Keyboard` | キーボード |
| | `HID` | HID デバイス |
| | `Pipe` | 外部 IO マネージャー |
| | `null` | 自動 |
| `ExternalButtonRing` | `None` | なし |
| | `Keyboard` | キーボード |
| | `Gamepad` | ゲームパッド |
| `OpenPriority` | `Idle` | 最低 |
| | `VeryLow` | 非常に低い |
| | `Low` | 低い |
| | `Normal` | 普通 |
| | `High` | 高い |
| | `VeryHigh` | 最高 |

### 付録: Mod (設定ファイルには書き込まれない)

`Mod` は `system-settings.json` には **出現しません**。その値は現在の譜面をプレイしている間のみ有効です (譜面ごとの Mod 設定は譜面ファイルに保存されます)。ここでは参考としてデフォルト値を示します。

| 項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **再生速度**、ゲームの速度倍率を調整します。刻み `0.05` |
| `AutoPlay` | `"Disable"` | **自動プレイ**、Xiaoxiao Lanbai が代わりにプレイします。`Disable` 無効 / `Enable` 有効 / `DJAuto_ButtonRing_First` DJAuto (ボタン優先) / `DJAuto_TouchPanel_First` DJAuto (内側画面優先) を指定できます |
| `JudgeStyle` | `"DEFAULT"` | **判定スタイル**、より厳しい判定で自分を試します。`DEFAULT` / `MAJI` / `GACHI` / `GORI` を指定できます |
| `SubdivideSlideJudgeGrade` | `false` | **スライド判定グレードを細分化**、スライドに小さな Perfect 判定を付与できるようにします |
| `AllBreak` | `false` | **全 Break**、すべてのノートを Break にします |
| `AllEx` | `false` | **全 Ex**、すべてのノートを Ex にします |
| `AllTouch` | `false` | **全 Touch**、すべてのノートを Touch にします |
| `SlideNoHead` | `false` | **頭なしスター**、スライドの頭を削除します |
| `SlideNoTrack` | `false` | **スライド軌跡なし**、スライドの軌跡を削除します |
| `NoteMask` | `"Disable"` | **ノートマスク**、ノートを覆うマスク。`Disable` / `Outer` / `Inner` を指定できます |

::: tip
新バージョンでは `ButtonRingForTouch` は永続化されるゲームプレイ設定です。`settings.json` の `Game.ButtonRingForTouch` に移動し、Mod の一部ではなくなりました。
:::

### 旧バージョンからのアップグレード {#upgrading-from-an-older-version}

2.1.0 および 2.1.0 プレビュー版は初回起動時に古い `settings.json` を読み込んで自動的に移行するため、手作業でファイルを分割する必要はありません。主な変更点は次のとおりです。

- `Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Online`、`IO` の各カテゴリが `settings.json` から `system-settings.json` に移動します。
- `Audio.Volume` が `settings.json` の `Volume` に移動します。
- `RenderQuality`、`RenderScale`、`FPSLimit`、`VSync` が `Display` から `Rendering` に移動します。
- `Resolution`、`MainScreen*`、`SubDisplay*`、`GameplayScreenRotationAngle`、`Topmost` が `Display` から `Rendering` に移動します。
- `DisplayRuntimeInfo` と `FullScreen` が `Debug` から `Rendering` に移動します。`MenuOptionIterationSpeed`、`HideCursorInGame`、`NoteFolding`、`DJAutoPolicy` は `Common` に移動します。センサー表示設定は `Display` に、模擬タッチ設定は `Touch` に移動します。
- `Display` の判定表示設定は `Judge` に移動します。`BGInfo` など `Game` の表示情報設定は `Display` に、`EnableJudgeTimingGauge` は `Judge` に、`NoteAppearRate` は `Game` に移動し、`SkipVideoDownload` は `Display` から `Game` に移動します。`Game.RecordMode` は `Common.RecordMode` に移動します。
- `Online` カテゴリは `Network.Online` になり、プロキシは `Network.Proxy` になります。`IO.InputDevice.Player` は `IO.Player` に移動します。
- `machine_description.json` は `Network.Online.Machine` にインポートされた後、`machine_description.json.bak` に名前が変更されます。

移行では、新しいファイルにすでに存在するキーは保持され、古いキーのうち不足している項目だけが補完されます。読み取れないファイルは `.bak` としてバックアップされ、デフォルト値が使用されます。次回の保存後、両方のファイルには現在のレイアウトのみが含まれます。

## 旧バージョンの設定 (2.1.0 プレビュー版より前) {#legacy-configuration}

本節は **2.1.0 プレビュー版より前** の単一ファイル `settings.json` の説明を残したもので、旧バージョンを調べるためのものです。2.1.0 および 2.1.0 プレビュー版以降は設定が 2 つのファイルに分割されているため、まず [新しい設定](#new-configuration) を参照してください。新しいバージョンのゲームは初回起動時に旧設定を自動で移行します。

### 旧版 トップレベル構造

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

### 旧版 Game —— ゲーム設定

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

#### 旧版 Game の列挙値

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

### 旧版 Judge —— 判定設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `AudioOffset` | 浮動小数点数 | `0.0` | **オーディオオフセット (A 判定)**、音押し用です。ノートと音楽がずれているときに調整します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします。この項目は正解音を移動させるもので、譜面における `&first` に相当します |
| `JudgeOffset` | 浮動小数点数 | `0.0` | **判定オフセット (B 判定)**、目押し用です。デバイスの入力遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `AnswerOffset` | 浮動小数点数 | `0.0` | **正解音オフセット**、正解音が鳴るタイミングを調整します (判定には影響しません)。値を小さくすると早く、大きくすると遅く鳴ります。確信がない場合は変更しないでください |
| `TouchPanelOffset` | 浮動小数点数 | `0.0` | **内側画面入力オフセット**、タッチ入力の遅延を補正します。Fast が多い場合は値を小さく、Late が多い場合は値を大きくします |
| `Mode` | 列挙型 | `"Modern"` | **判定モード**、ゲームの判定とスコアのモード (旧筐体 / 新筐体) を選択します |

#### 旧版 Judge の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Mode` | `Classic` | クラシック (旧筐体) |
| | `Modern` | モダン (新筐体) |

### 旧版 Display —— 表示設定

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
| `SlideSortOrder` | 列挙型 | `"Modern"` | **スライドの並び順**、スライドが重なったときにどちらが手前になるかを決めます。クラシックでは古いスライドが手前 (上)、モダンでは古いスライドが奥 (下) になります。スターの発色に影響します |
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

#### 旧版 Display の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | すべて |
| | `BelowCP` | Critical 未満 |
| | `BelowP` | Perfect 未満 |
| | `BelowGR` | Great 未満 |
| | `MissOnly` | Miss のみ |
| | `Disable` | 無効 |
| `SlideSortOrder` | `Classic` | クラシック順 (古いスライドが手前 / 上) |
| | `Modern` | モダン順 (古いスライドが奥 / 下) |
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

### 旧版 Audio —— オーディオ設定

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `ForceMono` | 真偽値 | `false` | **強制モノラル**、オーディオをモノラル出力にミックスダウンします |
| `Volume` | オブジェクト | 下記参照 | **音量設定**、各トラックの音量 |
| `Wasapi` | オブジェクト | 下記参照 | **WASAPI 設定**、Windows のみ存在します |
| `Asio` | オブジェクト | 下記参照 | **ASIO 設定**、Windows のみ存在します |
| `Channel` | オブジェクト | 下記参照 | **チャンネル音量**、Windows / Linux / macOS のみ存在します |
| `Bass` | オブジェクト | 下記参照 | **BASS オーディオバッファー設定**、すべてのプラットフォームに存在します |
| `Backend` | 列挙型 | `"Wasapi"` | **オーディオバックエンド**。Windows ではデフォルトで `"Wasapi"`、モバイルでは `"BassSimple"` です |

#### 旧版 Audio.Volume —— 音量

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

#### 旧版 Audio.Wasapi —— WASAPI 設定 (Windows のみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Exclusive` | `true` | **排他モード**、オーディオデバイスを排他的に占有します。これをオフにした場合のみ、OBS などの他のプログラムが同時に録音 / 再生できます |
| `RawMode` | `true` | **Raw モード**、システムのミキサーで処理されていない生データを使用します |
| `AsyncMode` | `true` | **非同期モード**、非同期のオーディオ処理を使用します。一部の古いバージョンで生成された設定ファイルにはこの項目がない場合があり、その場合は `true` として扱われます |
| `BufferSize` | `0.02` | **バッファーサイズ**、単位は秒 |
| `Period` | `0.005` | **周期**、単位は秒 |

#### 旧版 Audio.Asio —— ASIO 設定 (Windows のみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `DeviceIndex` | `0` | **デバイスインデックス**、ASIO デバイスの番号 |
| `SampleRate` | `44100` | **サンプルレート**、オーディオのサンプルレート (Hz) |

#### 旧版 Audio.Channel —— チャンネル音量 (デスクトップのみ)

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **フロントチャンネル** (LF / RF) の音量 |
| `CenterAndLFEVolume` | `1.0` | **センターと LFE チャンネル** (Center / LFE) の音量 |
| `SideVolume` | `1.0` | **サイドチャンネル** (LS / RS) の音量 |
| `RearVolume` | `1.0` | **リアチャンネル** (LR / RR) の音量 |

#### 旧版 Audio.Bass —— BASS バッファー設定

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `BufferLengthMs` | `1000` | **バッファー長**、単位はミリ秒 |
| `UpdatePeriodMs` | `200` | **更新周期**、単位はミリ秒 |
| `DeviceBufferLengthMs` | `64` | **デバイスバッファー長**、単位はミリ秒。モバイルではデフォルトで `32` |
| `DeviceUpdatePeriodMs` | `16` | **デバイス更新周期**、単位はミリ秒。モバイルではデフォルトで `8` |
| `EnableAAudio` | `true` | **AAudio を有効化**、Android のみ存在します |

#### 旧版 Audio の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Backend` | `Unity` | Unity 内蔵オーディオ |
| | `Wasapi` | WASAPI (Windows) |
| | `Asio` | ASIO (プロ向けサウンドカードの低遅延) |
| | `BassSimple` | BASS 簡易バックエンド (モバイルのデフォルト) |

### 旧版 Debug —— デバッグ

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

#### 旧版 Debug の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `OffsetUnit` | `Frame` | フレーム |
| | `Second` | 秒 |
| `DJAutoPolicy` | `Strict` | 厳格 |
| | `Permissive` | 寛容 |
| `DebugLevel` | `Debug` / `Info` / `Warning` / `Error` / `Fatal` | Debug / Info / Warning / Error / Fatal |

### 旧版 Online —— ネットワーク

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

#### 旧版 Online.ApiEndpoints[] —— エンドポイント

デフォルトで `MajdataNET` の項目が 1 つ含まれます:

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Name` | 文字列 | `"MajdataNET"` | **名前**、エンドポイントの表示名 |
| `Url` | 文字列 | `"https://majdata.net/api3/api/"` | **API アドレス**、サーバーの API ルートアドレス |
| `Username` | 文字列 | `"YourUsername"` | **ユーザー名**、あらかじめ入力されるアカウント |
| `Password` | 文字列 | `"YourPassword"` | **パスワード**、あらかじめ入力されるパスワード |
| `AutoLogin` | 真偽値 | `false` | **自動ログイン**、起動時に自動でログインします |

### 旧版 IO —— 入力 / 出力デバイス

このセクションはゲーム内の設定画面では<mark>非表示</mark>で、主に外付けのアーケードコントローラーと LED に使用します。詳細は[外付けデバイス](/ja/majdataplay/configuration/external_device)を参照してください。

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Manufacturer` | 列挙型 / `null` | `null` | **デバイスメーカー**、`null` は自動検出を意味します。Windows / Linux / macOS のみ存在します |
| `InputDevice` | オブジェクト | 下記参照 | **入力デバイス** |
| `OutputDevice` | オブジェクト | 下記参照 | **出力デバイス**。Windows / Linux / macOS のみ存在します |

#### 旧版 IO.InputDevice

| 項目 | 型 | デフォルト値 | 意味 |
| --- | --- | --- | --- |
| `Player` | 整数 | `1` | **プレイヤー番号**、ゲームパッドのプレイヤーインデックス。デスクトップのみ存在します |
| `ButtonRing` | オブジェクト | 下記参照 | **ボタンリング (アーケードコントローラーのボタン)**。デスクトップのみ存在します |
| `TouchPanel` | オブジェクト | 下記参照 | **タッチパネル**。デスクトップのみ存在します |
| `ExternalButtonRing` | 列挙型 | `"None"` | **外付けボタンリング**、モバイルのみ存在します。`"None"` なし / `"Keyboard"` キーボード / `"Gamepad"` ゲームパッド |

#### 旧版 IO.InputDevice.ButtonRing

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Enable` | `true` | **有効化**、ボタンリング入力を有効にするかどうか |
| `Type` | `null` | **デバイス種別**、`null` は自動。`"Keyboard"` キーボード / `"HID"` HID デバイスを指定できます |
| `Debounce` | `false` | **デバウンスを有効化**、キーのデバウンスを有効にするかどうか |
| `PollingRateMs` | `0` | **ポーリング間隔**、単位はミリ秒。`0` は無制限 |
| `DebounceThresholdMs` | `0` | **デバウンスしきい値**、単位はミリ秒 |
| `HidOptions` | 下記参照 | **HID デバイスパラメーター** |

#### 旧版 IO.InputDevice.TouchPanel

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

#### 旧版 IO.InputDevice.TouchPanel.CapacitivePanelOptions

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `TouchRadius` | `30` | **タッチ半径**、静電容量式タッチの判定半径 |
| `RadiusOffset` | `A:0` `B:20` `C:0` `D:0` `E:25` | **半径オフセット**、A–E 各領域の半径を微調整します |

#### 旧版 IO.OutputDevice.Led

| 項目 | デフォルト値 | 意味 |
| --- | --- | --- |
| `Enable` | `true` | **有効化**、LED 出力を有効にするかどうか |
| `Brightness` | `1.0` | **明るさ**、LED の明るさ |
| `RefreshRateMs` | `16` | **リフレッシュ間隔**、単位はミリ秒 |
| `Throttler` | `true` | **スロットラー**、LED のリフレッシュレートを制限します |
| `SerialPortOptions` | `Port` / `BaudRate` どちらも `null` | **シリアルポートパラメーター** |
| `HidOptions` | 下記参照 | **HID デバイスパラメーター** |

#### 旧版 IO 共通パラメーター

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

#### 旧版 IO の列挙値

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `Manufacturer` | `General` | 汎用 |
| | `Yuan` | Yuan コントローラー |
| | `Dao` | Dao コントローラー |
| | `Nov` | Nov コントローラー |
| | `null` | 自動検出 |

### 旧版 付録: Mod (設定ファイルには書き込まれない)

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
