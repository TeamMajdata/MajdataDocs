# Hold

Class: [HoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/HoldDrop.cs)

Method:

- `Judge(float currentSec)` (继承自 [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))
- `HoldEndJudge(float currentSec)` (继承自 [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))
- `HoldClassicEndJudge(float currentSec)` (继承自 [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))

## 头部判定

Hold的头部判定与Tap判定一致，请参阅Tap相关内容

## 按压判定

::: info

- 仅在Modern判定模式下才会进行按压判定
- 值得注意的是，Hold的按压检查与头判不是串行的，也就是说在未获得头判结果时也会进行按压检查
:::

### 行为

- 按压判定会忽略首`6f`和尾`12f`
- 按压检查开始的时机是第7帧
- 松手具有`2f`容错
- 会根据头部判定对Hold时值进行修正
  - 当头判为Fast时，不对Hold时值进行修正
  - 当头判为Late时，会从`Length`减去`_judgeDiff`
  - 如果修正后的时值小于等于`18f`，不会进行尾判，最终判定为头部判定

### 详情

::: info

为方便表述，下面将使用`p`表示“Hold完成比例”
:::

- p >= 1
  - 如果头判为`Great 2nd/3rd`，向上修正为`Great`
  - 如果头判为`Good`，向上修正为`Great`
  - 如果头判为`Miss`，向上修正为`Good`
  - 其他等级不进行任何修正
- p >= 0.67
  - 如果头判为`Critical`， 向下修正为`Perfect 2nd`
  - 如果头判为`Great 2nd/3rd`，向上修正为`Great`
  - 如果头判为`Good`，向上修正为`Great`
  - 如果头判为`Miss`，向上修正为`Good`
- p >= 0.33
  - 如果头判等级比`Great`高，向下修正为`Great`
  - 如果头判为`Great 2nd/3rd`，向上修正为`Great`
  - 如果头判为`Good`，向上修正为`Great`
  - 如果头判为`Miss`，向上修正为`Good`
- p >= 0.05
  - 如果头判等级比`Good`高，向下修正为`Good`
  - 如果头判为`Miss`，向上修正为`Good`
- p >= 0
  - 如果头判等级比`Good`高，向下修正为`Good`

## 尾部判定

::: info

仅在Classic判定模式下才会进行尾部判定
:::

::: warning

MajdataPlay的尾部判定没有任何公开数据支撑，**所有数据均为LeZi根据自身对maimai FiNALE的理解推断的**
:::

### 行为

- 尾部判定没有任何容错
- 与按压判定不同，尾部判定是根据松手时间与Hold结束时间之间的差值进行判定的
- 尾部判定只有Pefect和Good两种，并且Fast和Late区间不是完全对称的
- 当Hold已结束，但是按压时间超过`20f`（`CLASSIC_HOLD_ALLOW_OVER_LENGTH_SEC`），Hold会强制进行尾部判定

### 详情

| 等级 | 范围 | 总计 |
| :--- | --- | --- |
| FastGood | `(-inf, -9f)` | - |
| Perfect | `[-9f, 12f]` | `21f` |
| LateGood | `(12f, 20f]` | `8f` |

## 特殊行为

### Mine

Mine（地雷）不需要玩家击打——**不去碰它才是正确操作**。Hold 被标记为 Mine 后：

- **安全通过**：到达判定时刻后玩家始终没有碰到它，`MineHeadCheck()` 在 `GetTimeSpanToJudgeTiming() > 3f` 时自动判定为 `Perfect`，播放 Hold 效果并标记按压状态
- **误触**：玩家在判定区间内碰到它，`HeadCheck()` 正常判定后修正：`JudgeResult >= Perfect`（Fast侧）→ `TooFast`，`JudgeResult < Perfect`（Late侧）→ `Miss`，随后 `isMineForceEnd = true` 立即 `End()`
- **按压检查**：头判通过后，`MineBodyCheck()` 每帧检测按键或传感器是否处于 `On` 状态——一旦检测到按压，直接判 `Miss` 并 `End()`

具体差异：

| 项目 | 普通 Hold | Mine Hold |
| --- | --- | --- |
| 可判定区间 | `[-9f, 9f]` | `[-3f, 3f]`（收窄为 `TAP_JUDGE_SEG_3RD_PERFECT_MSEC`） |
| 安全通过 | 无 | `> 3f` 时判 `Perfect` |
| 误触结果 | 正常判定 | `TooFast` / `Miss` |
| 按压判定 | 正常进行 | **不进行**（`BodyCheck()` 在 `IsMine` 为真时直接 `return`） |
| 尾判 / 按压比例修正 | 正常进行 | **跳过**（`End()` 在 `IsMine` 为真时跳过 `HoldEndJudge` / `HoldClassicEndJudge`） |
| Autoplay | 正常 | **禁用** |

### 判定样式换算

最终结果同样会经过`ConvertJudgeGrade`换算，规则与Tap一致，请参阅Tap相关内容。
