# スライド

クラス：[SlideBase.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideBase.cs)

メソッド：

- `Judge(float currentSec)`
- `JudgeClassic(float currentSec)`
- `TooLateJudge()`

このページでは、通常のスライド（[SlideDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideDrop.cs)）と Wi-Fi スライド（[WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)）についても扱います。

::: info
MajdataPlay にはスライドの判定モードが 2 つあります：

- `Modern`：maimai DX のスライド判定スタイルを忠実に再現したモードです。
- `Classic`：maimai FiNALE のスライド判定スタイルを可能な限り再現したモードです。

2 つのモードはまったく異なる判定機構を使用します。
:::

::: info

- `Modern` と `Classic` のどちらの場合でも：
  - スライドの判定区間は `(-inf, 36f]` です。
  - スライド到着から `36f` 後に判定が強制されます。
- `_lastWaitTime` はスライドが最後の判定エリアに留まる時間です（単位：`ms`）。
- `_table.Const` と `wifiConst` はスライド定数です。スライドが最後の判定エリアに留まる時間とスライドの長さとの比を表します。
- MajdataPlay は、旧筐体の厳しい判定を再現するために Perfect サブ区間を独自に実装しています。
:::

::: warning

- スライド定数は録画と判定エリア画像の重ね合わせを分析して導出されたため、値が不正確である可能性があります。
- スライド Deluxe 判定の実装は [maimai 判定の詳細解説 - Moying](https://www.bilibili.com/opus/694985211225571337/) を参考にしています。
:::

## 判定キュー

スライドは単一のボタンではなく、**判定キュー**（`JudgeQueues`）で判定されます。各判定エリア（`SlideArea`）はセンサーの組とトリガーポリシー（`AreaPolicy`）を持ち、判定エリアは順番に完了させる必要があります。

- 通常のスライドは 1 本のキューを使用します。Wi-Fi スライドは 3 本の並列キュー（`Left` / `Center` / `Right`）を使用し、3 本すべてを完了しないとスライドは完了しません。
- キューの検査では、最初の 2 つの判定エリアを同時に検査できます。次の判定エリアは、現在の判定エリアが押下済み（`On`）であるか、スキップ可能（`IsSkippable`）である場合にのみ検査されます。
- `SlideSkipping` 設定がオフの場合、すべての判定エリアで `IsSkippable = false` となり、1 エリアずつトリガーする必要があります。
- 判定タイミングはスライド定数から導出されます。`JudgeTiming = StartTiming + Length * (1 - Const)`、`LastWaitTimeSec = Length * Const` となります。`Const` は `Modern` と `Classic` で異なり（`_table.Const` / `_table.ClassicConst`）、Wi-Fi ではどちらも `0.162870f` です。

## Modern

この判定モードでは、Perfect 区間は静的ではありません。`_lastWaitTime` に応じて動的に拡張されます。

Perfect 区間は基礎区間と拡張区間で構成されます。

基礎区間：`[-14f, 14f]`

拡張区間：`ext = _lastWaitTime / 4`、最大 `22f` まで

Perfect 区間が拡張すると、以下に示すように Great と Good の区間を侵食します：

``` text
拡張前:

| <-  Fast Great (15f)  ->| <-  Perfect (28f)  -> | <-  Late Great (15f)  -> |

拡張後:

| <-  Fast Great (10f)  ->| <-       Perfect (28 + 10f)     -> | <-  Late Great (10f)  -> |

比較:
| <-  Fast Great (15f)  ->| <-  Perfect (28f)  -> | <-  Late Great (15f)  -> |
                | <-           Perfect (28 + 10f)      -> |
```

### 判定区間

| 判定 | 範囲 | 幅 |
| :--- | --- | --- |
| FastGood | `(-inf, -29f)` | - |
| FastGreat 3rd | `[-29f, -25f)` | `4f` |
| FastGreat 2nd | `[-25f, -21f)` | `4f` |
| FastGreat 1st | `[-21f, -14f)` | `7f` |
| Perfect | `[-14f, 14f]` | `28f` |
| LateGreat 1st | `(14f, 21f]` | `7f` |
| LateGreat 2nd | `(21f, 25f]` | `4f` |
| LateGreat 3rd | `(25f, 29f]` | `4f` |
| LateGood | `(29f, 36f]` | `7f` |
| Miss | `(36f, inf)` | - |

### Perfect サブ区間

旧筐体の厳しい判定を再現するため、MajdataPlay は Perfect サブ区間を実装しています：

- `Perfect`：(`base window` + `extension window`) * `0.3333`
- `Perfect 2nd`：(`base window` + `extension window`) * `0.6666`
- `Perfect 3rd`：`base window` + `extension window`

厳格判定が無効な場合、スライドは Perfect 2nd と Perfect 3rd の判定を自動的に Perfect へ変換します。

## Classic

::: warning

- MajdataPlay の maimai FiNALE スライド判定には公開データの裏付けがありません。**すべての値は、LeZi が自身の maimai FiNALE の理解に基づいて推定した値です。**
- MajdataPlay は Break スライドに対応するため、`Classic` モードで Great サブ区間を実装しています。
:::

`Modern` モードとは異なり、このモードの Perfect 区間は静的です。スライドが最後の判定エリアに留まる時間に応じて動的に拡張されることはありません。

### 判定区間

| 判定 | 範囲 | 幅 |
| :--- | --- | --- |
| FastGood | `(-inf, -24f)` | - |
| FastGreat 3rd | `[-24f, -20f)` | `4f` |
| FastGreat 2nd | `[-20f, -16f)` | `4f` |
| FastGreat 1st | `[-16f, -12f)` | `4f` |
| FastPerfect 3rd | `[-12f, -8f)` | `4f` |
| FastPerfect 2nd | `[-8f, -4f)` | `4f` |
| Perfect | `[-4f, 4f]` | `8f` |
| LatePerfect 2nd | `(4f, 8f]` | `4f` |
| LatePerfect 3rd | `(8f, 12f]` | `4f` |
| LateGreat 1st | `(12f, 16f]` | `4f` |
| LateGreat 2nd | `(16f, 20f]` | `4f` |
| LateGreat 3rd | `(20f, 24f]` | `4f` |
| LateGood | `(24f, 36f]` | `12f` |
| Miss | `(36f, inf)` | - |

## Wi-Fi

クラス：[WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)

Wi-Fi は `SlideBase` のサブクラスです。判定区間、Perfect の拡張、`TooLateJudge` の挙動は通常のスライドとまったく同じで、違いは判定キューの構成方法だけです。

### 判定キュー

Wi-Fi スライドは 3 本の並列キューを使用し、それぞれが 1 つの分岐に対応します：

- `Left`：`A1 → B8 → B7 → (A6 ∪ D6)`
- `Center`：`A1 → B1 → C → (A5 ∪ B5)`。`Classic` モードでは `A1 → B1 → C` です
- `Right`：`A1 → B2 → B3 → (A4 ∪ D5)`

すべての分岐は開始エリア `A1` を共有します。`A6∪D6`、`A5∪B5`、`A4∪D5` などの複合判定エリアは `OR` ポリシーを使用し、エリアのいずれかのセンサーがトリガーすれば成立します。

### 判定タイミング

- `wifiConst = 0.162870f`（`Modern` と `Classic` で共通）
- `JudgeTiming = StartTiming + Length * (1 - wifiConst)`
- `LastWaitTimeSec = Length * wifiConst`
- **3 本すべて**の分岐のキューが完了すると、その完了時刻で `Judge`/`JudgeClassic` が実行されます。挙動は通常のスライドとまったく同じです

## 特殊な挙動

### TooLate

`36f` を超えてもキューが未完了の場合、`TooLateJudge()` が実行されます：

- 最後の判定エリアだけが残っている場合（`IsPendingFinish`）→ `LateGood`
- それ以外 → `Miss`

### Mine

Mine は叩く必要がありません。**触らずに放置するのが正しい操作です**。スライド / Wi-Fi が Mine としてマークされた場合、判定可能区間は狭められず、代わりに判定キューの完了元によって 2 つの経路を区別します：

- **安全通過**：`MineCheck()` が判定キューを自動的に完了させます
  - 非接続スライド（または接続スライドの最終セグメント）：`GetTimeSpanToJudgeTiming() >= 0`（判定タイミングに到達）のとき `Perfect` を判定し、すべての判定バーを非表示にします
  - 接続スライドの中間セグメント：`GetRemainingTimeWithoutOffset() == 0`（長さを使い切った）ときにシステムがすべての判定キューをクリアして完了させ、`JudgeResult` は設定しません
  - 判定タイミングより前は `Autoplay()` を呼びます（アニメーションのみを進行し、判定は行いません）
- **誤触**：プレイヤーがキューを完了すると `Judge()` / `JudgeClassic()` に入り、末尾で補正します。`JudgeResult >= Perfect`（Fast 側）→ `TooFast`、`JudgeResult < Perfect`（Late 側）→ `Miss`

| 項目 | 通常のスライド | Mine スライド |
| --- | --- | --- |
| 判定可能区間 | `(-inf, 36f]` | 狭められません（同じ） |
| 安全通過 | なし | 非接続：`>= 0` で `Perfect`、接続中間セグメント：長さを使い切るとシステムが完了 |
| 誤触時の結果 | 通常どおり判定 | `TooFast` / `Miss` |
| Autoplay | 通常 | **無効**（`IsMine` が true のとき `AutoplayUpdate()` は即座に処理を終了します） |

::: info 接続スライド（ConnSlide）
接続スライドは複数のセグメントで構成されます（`ConnectInfo.IsConnSlide`）。判定タイミングに到達したときに `Perfect` が判定されるのは、最終セグメント（`IsGroupPartEnd`）または非接続の独立したスライドのみです。中間セグメントは長さを使い切るとシステムによって自動的にキューがクリアされて完了し、プレイヤーに見える判定結果は生成されません。
:::

### 判定スタイルの変換

最終結果も、タップと同じ `ConvertJudgeGrade` 変換を受けます。タップのページを参照してください。
