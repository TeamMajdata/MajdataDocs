# Touch

Class: [TouchDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchDrop.cs)、[TouchHoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchHoldDrop.cs)

Method:

- `Judge(float currentSec)`（TouchDrop 继承自 [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs)；TouchHoldDrop 重写）
- `HoldEndJudge(float currentSec)`（TouchHoldDrop，继承自 [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs)）

本文同时覆盖 Touch（`tap`/`hanabi` 等单点触摸）与 TouchHold（触摸Hold，`fp`/`fh` 等）。

::: info

- Touch 与 TouchHold 的可判定区间均为 `[-9f, 18f]`（`JudgableRange = [JudgeTimingWithOffset - 9f, JudgeTimingWithOffset + 18f]`）
- 启用`ButtonRingForTouch`时，对应按键点击等效于触摸
- TouchHold 的头判区间与 Touch 一致，Fast侧只有Perfect
:::

## Touch 判定

TouchDrop 重写了`Judge`，使用独立的`TOUCH_JUDGE_*`区间（与 TouchHold 头判一致）。Fast侧只保留Perfect（Fast侧超过`9f`的输入被直接忽略），Late侧不区分Perfect/Great的1st：

| 等级 | Fast侧 | Late侧 | 总计 |
| :--- | --- | --- | --- |
| Perfect | `[-9f, 9f]` | - | `18f` |
| Perfect 2nd | - | `(9f, 10.5f]` | `1.5f` |
| Perfect 3rd | - | `(10.5f, 12f]` | `1.5f` |
| Great | - | `(12f, 13f]` | `1f` |
| Great 2nd | - | `(13f, 14f]` | `1f` |
| Great 3rd | - | `(14f, 15f]` | `1f` |
| Good | - | `(15f, 18f]` | `3f` |
| Miss | `(18f, inf)` | - | - |

### Miss

超过 `18f`（`TOUCH_JUDGE_GOOD_AREA_MSEC`）仍未判定时，`TooLateCheck` 强制`Miss`。

## TouchHold 判定

### 头部判定

TouchHoldDrop 的头部判定与 Touch 完全一致，使用同一套 `TOUCH_JUDGE_*` 区间，请参阅上文 [Touch 判定](#touch-判定) 表。

### 按压判定

与Hold的按压判定机制一致（`HoldEndJudge`），差异如下：

- 按压判定忽略首`15f`和尾`12f`（`TOUCH_HOLD_HEAD_IGNORE_LENGTH_SEC` / `TOUCH_HOLD_TAIL_IGNORE_LENGTH_SEC`）
- 松手具有`2f`容错
- 完成比例`p`的修正规则与Hold完全相同，请参阅[Hold](/majdataplay/judgment/hold)的按压判定详情
- Classic模式下TouchHold不进行尾部判定（`HoldClassicEndJudge`不适用）

## 触摸组

同一时刻在相邻传感器区域上的多个Touch/TouchHold会被归入一个组，由[NoteLoader.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteLoader.cs)的`TOUCH_GROUPS`邻接表按传感器邻接关系聚类：

- 每个组（`TouchGroup`）记录已成功判定的成员比例`Percent`与首个非Miss/TooFast结果`JudgeResult`
- 成员判定成功后调用`RegisterResult`将结果登记到组
- 未判定的成员在`TooLateCheck`时若发现`Percent > 0.5f`且组已有结果，直接继承组的`JudgeResult`与`JudgeDiff`
- TouchHold 的按压检查另有`TouchHoldGroup`：同组成员共享按压状态，过半成员被按住（`Percent > 0.5f`）即视为该成员按住

::: info
组判定的典型场景是`C`区两个 TapTouch（C1/C2 同时给出）与跨区的多点触摸：只需过半成员判定成功，剩余成员自动跟随组结果。
:::

## 特殊行为

### Mine

Mine（地雷）不需要玩家击打——**不去碰它才是正确操作**。Touch 和 TouchHold 被标记为 Mine 后：

**Touch：**

- **安全通过**：`MineCheck()` 在 `GetTimeSpanToJudgeTiming() > 0` 时自动判定为 `Perfect`（注意：Touch 的阈值是 `> 0`，不是 Tap/Hold 的 `> 3f`）
- **误触**：`Check()` 正常判定后修正：`JudgeResult >= Perfect`（Fast侧）→ `TooFast`，`JudgeResult < Perfect`（Late侧）→ `Miss`，随后立即 `End()`
- 可判定区间不收窄（与普通 Touch 相同）
- Autoplay **禁用**

**TouchHold：**

- **安全通过**：`MineHeadCheck()` 在 `GetTimeSpanToJudgeTiming() > 0` 时自动判定为 `Perfect`，播放 Hold 效果并标记按压状态
- **误触**：`HeadCheck()` 正常判定后修正规则同 Touch，随后 `isMineForceEnd = true` 立即 `End()`
- **按压检查**：头判通过后，`MineBodyCheck()` 每帧检测传感器是否处于 `On` 状态——一旦检测到按压，直接判 `Miss` 并 `End()`
- `BodyCheck()` 在 `IsMine` 为真时直接 `return`，不进行正常按压判定
- `End()` 在 `IsMine` 为真时跳过 `HoldEndJudge`
- 可判定区间不收窄
- Autoplay **不禁用**（与 Tap/Hold/Touch 不同，TouchHold 的 `Autoplay()` 不检查 `IsMine`）

### 判定样式换算

最终结果同样会经过`ConvertJudgeGrade`换算，规则与Tap一致，请参阅[Tap](/majdataplay/judgment/tap)相关内容。
