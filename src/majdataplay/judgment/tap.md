# Tap

Class: [TapDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TapDrop.cs)

Method:

- `Judge(float currentSec)` (继承自 [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))

总区间: `[-9f,9f]`（`Mine` 为 `[-3f,3f]`）

详情:

| 等级 | 范围 | 总计 |
| :--- | --- | --- |
| TooFast | `(-inf, -9f)` | - |
| FastGood | `[-9f, -6f)` | `3f` |
| FastGreat 3rd | `[-6f, -5f)` | `1f` |
| FastGreat 2nd | `[-5f, -4f)` | `1f` |
| FastGteat 1st | `[-4f, -3f)` | `1f` |
| FastPerfect 3nd | `[-3f, -2f)` | `1f` |
| FastPerfect 2nd | `[-2f, -1f)` | `1f` |
| Perfect | `[-1f, 1f]` | `2f` |
| LatePerfect 2nd | `(1f, 2f]` | `1f` |
| LatePerfect 3nd | `(2f, 3f]` | `1f` |
| LateGteat 1st | `(3f, 4f]` | `1f` |
| LateGreat 2nd | `(4f, 5f]` | `1f` |
| LateGreat 3rd | `(5f, 6f]` | `1f` |
| LateGood | `(6f, 9f]` | `3f` |
| Miss | `(9f, inf)` | - |

## 特殊行为

### EX Tap

`IsEX` 为真时，判定结果无条件强制为`Perfect`，`Miss`除外。

### Mine

Mine（地雷）不需要玩家击打——**不去碰它才是正确操作**。Tap 被标记为 Mine 后，判定逻辑变为两条路径：

- **安全通过**：到达判定时刻后玩家始终没有碰到它，`MineCheck()` 在 `GetTimeSpanToJudgeTiming() > 3f` 时自动判定为 `Perfect`
- **误触**：玩家在判定区间内碰到它，`Check()` 正常判定后修正结果：`JudgeResult >= Perfect`（Fast侧）→ `TooFast`，`JudgeResult < Perfect`（Late侧）→ `Miss`，随后立即 `End()`

具体差异：

| 项目 | 普通 Tap | Mine Tap |
| --- | --- | --- |
| 可判定区间 | `[-9f, 9f]` | `[-3f, 3f]`（收窄为 `TAP_JUDGE_SEG_3RD_PERFECT_MSEC`） |
| 安全通过 | 无 | `> 3f` 时判 `Perfect` |
| 误触结果 | 正常判定 | `TooFast` / `Miss` |
| Autoplay | 正常 | **禁用**（`IsMine` 为真时 `Autoplay()` 直接 `return`） |

::: info
`MineCheck()` 在 `> 3f` 时就已触发安全通过，而 `TooLateCheck` 的阈值是 `9f`，因此 Mine Tap 实际不会走到 TooLate 路径。
:::

### Miss

- 超过 `9f` 仍未判定时，`TapDrop.TooLateCheck()` 强制判定为 `Miss`
- 每次 `OnPreUpdate` 最多消费一次点击事件；同一帧内对同一按键/传感器的多次点击不会被重复判定

### 判定样式换算

::: info
换算发生在 Fast/Late 区分之后，即换算不会丢失 Fast/Late 信息。
:::

`Judge` 得到结果后，会按 `JudgeStyleOption` 设置做一次换算（`NoteDrop.ConvertJudgeGrade`）：

| 样式 | 换算规则 |
| --- | --- |
| `DEFAULT` | 不换算 |
| `MAJI` | Perfect 3rd → Great；Great 全系 → Good；Good → TooFast / Miss |
| `GACHI` | Perfect 3rd → Good；Perfect 2nd → Great；Great 保留；Good → TooFast / Miss |
| `GORI` | 除 Perfect 外全部 → TooFast / Miss |
