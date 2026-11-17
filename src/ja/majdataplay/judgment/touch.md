# タッチ & タッチホールド

クラス：[TouchDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchDrop.cs)、[TouchHoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchHoldDrop.cs)

メソッド：

- `Judge(float currentSec)`（TouchDrop は [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs) から継承し、TouchHoldDrop はオーバーライドしています）
- `HoldEndJudge(float currentSec)`（TouchHoldDrop。[NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs) から継承）

このページではタッチとタッチホールドの両方を扱います。

::: info

- タッチとタッチホールドの判定可能区間はどちらも `[-9f, 18f]` です（`JudgableRange = [JudgeTimingWithOffset - 9f, JudgeTimingWithOffset + 18f]`）
- どちらもボタンで判定できます。デスクトップで `ButtonRingForTouch` を有効にすると、対応するボタンのクリックがタッチと同等になります
- タッチホールドの頭部判定区間はタッチと同じで、Fast 側は Perfect のみです
:::

## タッチ判定 {#touch-judgment}

`TouchDrop` は `Judge` をオーバーライドし、専用の `TOUCH_JUDGE_*` 区間を使用します（タッチホールドの頭部判定と同じです）。Fast 側は Perfect のみを残し（`9f` を超える Fast 側の入力はそのまま無視されます）、Late 側は Perfect/Great の 1st を区別しません：

| 等級 | Fast 側 | Late 側 | 幅 |
| :--- | --- | --- | --- |
| Perfect | `[-9f, 9f]` | - | `18f` |
| Perfect 2nd | - | `(9f, 10.5f]` | `1.5f` |
| Perfect 3rd | - | `(10.5f, 12f]` | `1.5f` |
| Great | - | `(12f, 13f]` | `1f` |
| Great 2nd | - | `(13f, 14f]` | `1f` |
| Great 3rd | - | `(14f, 15f]` | `1f` |
| Good | - | `(15f, 18f]` | `3f` |
| Miss | - | `(18f, inf)` | - |

### Miss

`18f`（`TOUCH_JUDGE_GOOD_AREA_MSEC`）を超えても未判定の場合、`TooLateCheck` が `Miss` を強制します。

## タッチホールド判定

### 頭部判定

タッチホールドの頭部判定はタッチとまったく同じで、同じ `TOUCH_JUDGE_*` 区間を使用します。上記の[タッチ判定](#touch-judgment)の表を参照してください。

### 押下判定

ホールドの押下判定（`HoldEndJudge`）と同じですが、次の点が異なります：

- 押下判定は最初の `15f` と最後の `12f` を無視します（`TOUCH_HOLD_HEAD_IGNORE_LENGTH_SEC` / `TOUCH_HOLD_TAIL_IGNORE_LENGTH_SEC`）
- 離したときには `2f` の許容があります
- 完了割合 `p` の補正ルールはホールドとまったく同じです。詳細は[ホールド](/ja/majdataplay/judgment/hold)の押下判定を参照してください
- Classic モードではタッチホールドは尾部判定を行いません（`HoldClassicEndJudge` は適用されません）

## タッチグループ

同時刻に隣接するセンサー領域にある複数のタッチ/タッチホールドは 1 つのグループにまとめられます。[NoteLoader.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteLoader.cs) が `TOUCH_GROUPS` テーブルを使ってセンサーの隣接関係でクラスタリングします：

- 各グループ（`TouchGroup`）は、判定済みメンバーの割合 `Percent` と、Miss/TooFast 以外の最初の結果 `JudgeResult` を記録します
- メンバーが正常に判定されると `RegisterResult` を呼び、結果をグループに登録します
- `TooLateCheck` では、未判定のメンバーは `Percent > 0.5f` かつグループにすでに結果がある場合、グループの `JudgeResult` と `JudgeDiff` を継承します
- タッチホールドの押下チェックにはさらに `TouchHoldGroup` があり、グループのメンバーは押下状態を共有します。過半数のメンバーが押されている（`Percent > 0.5f`）場合、そのメンバーは押されているものとみなされます

::: info
グループ判定の典型的なシナリオは、`C` エリアの 2 つの TapTouch（C1/C2 を同時に置いた場合）や、エリアをまたぐ多点タッチです。過半数のメンバーが判定されれば、残りのメンバーは自動的にグループの結果に従います。
:::

## 特殊な挙動

### Mine

Mine は叩く必要がありません。**触らずに放置するのが正しい操作です**。タッチまたはタッチホールドが Mine としてマークされると：

**タッチ：**

- **安全通過**：`GetTimeSpanToJudgeTiming() > 0` のとき `MineCheck()` が自動的に `Perfect` を判定します（しきい値は `> 0` であり、タップ/ホールドの `> 3f` ではない点に注意してください）
- **誤触**：`Check()` が通常どおり判定したあとで結果を補正します。`JudgeResult >= Perfect`（Fast 側）→ `TooFast`、`JudgeResult < Perfect`（Late 側）→ `Miss` となり、その後すぐに `End()` が呼ばれます
- 判定可能区間は狭められません（通常のタッチと同じ）
- Autoplay **無効**

**タッチホールド：**

- **安全通過**：`GetTimeSpanToJudgeTiming() > 0` のとき `MineHeadCheck()` が自動的に `Perfect` を判定し、ホールドエフェクトを再生して押下状態をマークします
- **誤触**：`HeadCheck()` が通常どおり判定したあと、タッチと同じルールで補正し、その後 `isMineForceEnd = true` としてすぐに `End()` が呼ばれます
- **押下チェック**：安全通過の後、`MineBodyCheck()` が毎フレーム、センサーが `On` かどうかを検査します。押下を検出すると `Miss` を強制して `End()` を呼びます
- `IsMine` が true のとき `BodyCheck()` は即座に処理を終了し、通常の押下判定は行われません
- `IsMine` が true のとき `End()` は `HoldEndJudge` をスキップします
- 判定可能区間は狭められません
- Autoplay は**無効になりません**（タップ/ホールド/タッチとは異なり、タッチホールドの `Autoplay()` は `IsMine` を確認しません）

### 判定スタイルの変換

最終結果も、タップと同じ `ConvertJudgeGrade` 変換を受けます。[タップ](/ja/majdataplay/judgment/tap)のページを参照してください。
