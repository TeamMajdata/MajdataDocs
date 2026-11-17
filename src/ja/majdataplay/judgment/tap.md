# タップ

クラス：[TapDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TapDrop.cs)

メソッド：

- `Judge(float currentSec)`（[NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs) から継承）

全体の判定区間：`[-9f,9f]`（`Mine` の場合は `[-3f,3f]`）

詳細：

| 等級 | 範囲 | 合計 |
| :--- | --- | --- |
| TooFast | `(-inf, -9f)` | - |
| FastGood | `[-9f, -6f)` | `3f` |
| FastGreat 3rd | `[-6f, -5f)` | `1f` |
| FastGreat 2nd | `[-5f, -4f)` | `1f` |
| FastGreat 1st | `[-4f, -3f)` | `1f` |
| FastPerfect 3rd | `[-3f, -2f)` | `1f` |
| FastPerfect 2nd | `[-2f, -1f)` | `1f` |
| Perfect | `[-1f, 1f]` | `2f` |
| LatePerfect 2nd | `(1f, 2f]` | `1f` |
| LatePerfect 3rd | `(2f, 3f]` | `1f` |
| LateGreat 1st | `(3f, 4f]` | `1f` |
| LateGreat 2nd | `(4f, 5f]` | `1f` |
| LateGreat 3rd | `(5f, 6f]` | `1f` |
| LateGood | `(6f, 9f]` | `3f` |
| Miss | `(9f, inf)` | - |

## 特殊な挙動

### EX Tap

`IsEX` が true のとき、判定結果は `Miss` を除いて無条件に `Perfect` へ強制されます。

### Mine

Mine は叩く必要がありません。**触らずに放置するのが正しい操作です**。タップが Mine としてマークされると、判定ロジックは 2 つの経路に分岐します：

- **安全通過**：プレイヤーが一度も触れず、`GetTimeSpanToJudgeTiming() > 3f` になった時点で `MineCheck()` が自動的に `Perfect` を判定します
- **誤触**：プレイヤーが判定可能な区間内で触れた場合、`Check()` が通常どおり判定したあとで結果を補正します。`JudgeResult >= Perfect`（Fast 側）→ `TooFast`、`JudgeResult < Perfect`（Late 側）→ `Miss` となり、その後すぐに `End()` が呼ばれます

相違点：

| 項目 | 通常のタップ | Mine タップ |
| --- | --- | --- |
| 判定可能区間 | `[-9f, 9f]` | `[-3f, 3f]`（`TAP_JUDGE_SEG_3RD_PERFECT_MSEC` に狭められます） |
| 安全通過 | なし | `> 3f` で `Perfect` |
| 誤触時の結果 | 通常どおり判定 | `TooFast` / `Miss` |
| Autoplay | 通常 | **無効**（`IsMine` が true のとき `Autoplay()` は即座に処理を終了します） |

::: info
`MineCheck()` は `> 3f` の時点で安全通過を発火しますが、`TooLateCheck` のしきい値は `9f` であるため、Mine タップが実際に TooLate の経路へ到達することはありません。
:::

### Miss

- `9f` を超えても未判定の場合、`TapDrop.TooLateCheck()` が `Miss` を強制します
- 各 `OnPreUpdate` は最大 1 回のクリックイベントしか消費しません。同一フレーム内で同じボタン/センサーを複数回クリックしても、重複して判定されることはありません

### 判定スタイルの変換

`Judge` が結果を出したあと、`JudgeStyleOption` 設定に従って 1 回だけ変換されます（`NoteDrop.ConvertJudgeGrade`）：

| スタイル | 変換ルール |
| --- | --- |
| `DEFAULT` | 変換なし |
| `MAJI` | Perfect 3rd → Great、Great 全般 → Good、Good → TooFast / Miss |
| `GACHI` | Perfect 3rd → Good、Perfect 2nd → Great、Great は維持、Good → TooFast / Miss |
| `GORI` | Perfect 以外はすべて → TooFast / Miss |

::: info
変換は Fast/Late の区別を行ったあとに適用されるため、Fast/Late の情報が失われることはありません。
:::
