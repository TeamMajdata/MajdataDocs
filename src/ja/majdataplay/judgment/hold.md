# ホールド

クラス：[HoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/HoldDrop.cs)

メソッド：

- `Judge(float currentSec)`（[NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs) から継承）
- `HoldEndJudge(float currentSec)`（[NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs) から継承）
- `HoldClassicEndJudge(float currentSec)`（[NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs) から継承）

## 頭部判定

ホールドの頭部判定はタップの判定と同じです。タップのページを参照してください。

## 押下判定

::: info

- 押下判定は Modern 判定モードでのみ実行されます
- 押下チェックと頭部判定は直列ではありません。つまり、頭部判定の結果が得られる前にも押下チェックが実行されます
:::

### 挙動

- 押下判定は最初の `6f` と最後の `12f` を無視します
- 押下チェックは 7 フレーム目から開始されます
- 離したときには `2f` の許容があります
- 頭部判定に応じてホールドの長さが補正されます：
  - 頭部判定が Fast の場合、ホールドの長さは補正されません
  - 頭部判定が Late の場合、`Length` から `_judgeDiff` が減算されます
  - 補正後の長さが `18f` 以下の場合、尾部判定は行われず、最終結果は頭部判定になります

### 詳細

::: info

以降の説明では、便宜上 `p` で「ホールドの完了割合」を表します：
:::

- p >= 1
  - 頭部判定が `Great 2nd/3rd` の場合、`Great` まで上方修正されます
  - 頭部判定が `Good` の場合、`Great` まで上方修正されます
  - 頭部判定が `Miss` の場合、`Good` まで上方修正されます
  - その他の等級は修正されません
- p >= 0.67
  - 頭部判定が `Critical` の場合、`Perfect 2nd` まで下方修正されます
  - 頭部判定が `Great 2nd/3rd` の場合、`Great` まで上方修正されます
  - 頭部判定が `Good` の場合、`Great` まで上方修正されます
  - 頭部判定が `Miss` の場合、`Good` まで上方修正されます
- p >= 0.33
  - 頭部判定が `Great` より高い場合、`Great` まで下方修正されます
  - 頭部判定が `Great 2nd/3rd` の場合、`Great` まで上方修正されます
  - 頭部判定が `Good` の場合、`Great` まで上方修正されます
  - 頭部判定が `Miss` の場合、`Good` まで上方修正されます
- p >= 0.05
  - 頭部判定が `Good` より高い場合、`Good` まで下方修正されます
  - 頭部判定が `Miss` の場合、`Good` まで上方修正されます
- p >= 0
  - 頭部判定が `Good` より高い場合、`Good` まで下方修正されます

## 尾部判定

::: info

尾部判定は Classic 判定モードでのみ実行されます。
:::

::: warning

MajdataPlay の尾部判定は公開データに基づくものではありません。**すべての値は、LeZi が自身の maimai FiNALE の理解に基づいて推定した値です。**
:::

### 挙動

- 尾部判定には許容がありません
- 押下判定とは異なり、尾部判定は離した時刻とホールド終了時刻との差分に基づいて行われます
- 等級は Perfect と LateGood のみで、Fast と Late の区間は完全には対称ではありません
- ホールドがすでに終了しているのに押している時間が `20f`（`CLASSIC_HOLD_ALLOW_OVER_LENGTH_SEC`）を超えた場合、ホールドは強制的に尾部判定を行います

### 詳細

| 等級 | 範囲 | 合計 |
| :--- | --- | --- |
| FastGood | `(-inf, -9f)` | - |
| Perfect | `[-9f, 12f]` | `21f` |
| LateGood | `(12f, 20f]` | `8f` |

## 特殊な挙動

### Mine

Mine は叩く必要がありません。**触らずに放置するのが正しい操作です**。ホールドが Mine としてマークされると：

- **安全通過**：プレイヤーが一度も触れず、`GetTimeSpanToJudgeTiming() > 3f` になった時点で `MineHeadCheck()` が自動的に `Perfect` を判定し、ホールドエフェクトを再生して押下状態をマークします
- **誤触**：プレイヤーが判定可能な区間内で触れた場合、`HeadCheck()` が通常どおり判定したあとで結果を補正します。`JudgeResult >= Perfect`（Fast 側）→ `TooFast`、`JudgeResult < Perfect`（Late 側）→ `Miss` となり、その後 `isMineForceEnd = true` としてすぐに `End()` が呼ばれます
- **押下チェック**：安全通過の後、`MineBodyCheck()` が毎フレーム、ボタンまたはセンサーが `On` かどうかを検査します。押下を検出すると `Miss` を強制して `End()` を呼びます

相違点：

| 項目 | 通常のホールド | Mine ホールド |
| --- | --- | --- |
| 判定可能区間 | `[-9f, 9f]` | `[-3f, 3f]`（`TAP_JUDGE_SEG_3RD_PERFECT_MSEC` に狭められます） |
| 安全通過 | なし | `> 3f` で `Perfect` |
| 誤触時の結果 | 通常どおり判定 | `TooFast` / `Miss` |
| 押下判定 | 通常どおり | **行われません**（`IsMine` が true のとき `BodyCheck()` は即座に処理を終了します） |
| 尾部判定 / 押下割合の補正 | 通常どおり | **スキップ**（`IsMine` が true のとき `End()` は `HoldEndJudge` / `HoldClassicEndJudge` をスキップします） |
| Autoplay | 通常 | **無効** |

### 判定スタイルの変換

最終結果も、タップと同じ `ConvertJudgeGrade` 変換を受けます。タップのページを参照してください。
