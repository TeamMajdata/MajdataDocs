# Slide

Class: [SlideBase.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideBase.cs)

Method:

- `Judge(float currentSec)`
- `JudgeClassic(float currentSec)`
- `TooLateJudge()`

本文同时覆盖普通Slide（[SlideDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideDrop.cs)）与Wifi（[WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)）。

::: info
MajdataPlay中，Slide存在两种判定模式:

- `Modern`，高度还原maimai DX的Slide判定风格
- `Classic`，尽可能地还原maimai FiNALE的Slide判定风格

两种判定模式的机制完全不同
:::

::: info

- 无论是`Modern`还是`Classic`
  - Slide的可判定区间都是`(-inf,36f]`
  - Slide抵达后强制判定的时间都是`36f`
- `_lastWaitTime`表示Slide在最后一个判定区的停留时间 (unit: `ms`)
- `_table.Const`和`wifiConst`是Slide常数，表示Slide在最后一个判定区滞留时间与Slide时值的比例
- 为实现maimai FiNALE的严判，MajdataPlay自行实现了Perfect子区间
:::

::: warning

- Slide常数由内录/判定区图片叠加分析得出，数值可能不准确
- Slide Deluxe判定实现参考自: [maimai判定详解 - Moying](https://www.bilibili.com/opus/694985211225571337/)
:::

## 判定队列

Slide的判定不是单一按钮，而是一条**判定队列**（`JudgeQueues`）：每个判定区（`SlideArea`）包含一组传感器与触发策略（`AreaPolicy`），按顺序完成后才进入下一区。

- 普通Slide使用一条队列；Wifi使用三条并行队列（`Left` / `Center` / `Right`），三条全部完成才视为完成
- 队列检查时允许同时检查前两个判定区；当前区已被按下（`On`）或可跳过（`IsSkippable`）时才检查下一区
- `SlideSkipping`设置关闭时，所有判定区`IsSkippable = false`，必须逐区触发
- 判定时机由Slide常数决定：`JudgeTiming = StartTiming + Length * (1 - Const)`，`LastWaitTimeSec = Length * Const`；`Const`在`Modern`与`Classic`下取值不同（`_table.Const` / `_table.ClassicConst`），Wifi统一为`0.162870f`

## Modern

在该判定模式中，Perfect区间不是静态的，此区间会根据`_lastWaitTime`动态扩展

Perfect区间由基础区间和扩展区间组成

基础区间: `[-14f, 14f]`

扩展区间: `ext = _lastWaitTime / 4`，最大为`22f`

扩展时，Perfect会挤占Great、Good区间，详情见图:

``` text
扩展前:

| <-  Fast Great(15f)  ->| <-  Perfect(28f)  -> | <-  Late Great(15f)  -> |

扩展后:

| <-  Fast Great(10f)  ->| <-       Perfect(28 + 10f)     -> | <-  Late Great(10f)  -> |

对比:
| <-  Fast Great(15f)  ->| <-  Perfect(28f)  -> | <-  Late Great(15f)  -> |
                | <-           Perfect(28 + 10f)      -> |
```

### 判定区间

| 等级 | 范围 | 累计 |
| :--- | --- | --- |
| FastGood | `(-inf, -29f)` | - |
| FastGreat 3rd | `[-29f, -25f)` | `4f` |
| FastGreat 2nd | `[-25f, -21f)` | `4f` |
| FastGteat 1st | `[-21f, -14f)` | `7f` |
| Perfect | `[-14f, 14f]` | `28f` |
| LateGteat 1st | `(14f, 21f]` | `7f` |
| LateGreat 2nd | `(21f, 25f]` | `4f` |
| LateGreat 3rd | `(25f, 29f]` | `4f` |
| LateGood | `(29f, 36f]` | `7f` |
| Miss | `(36f, inf)` | - |

### Perfect子区间

为实现旧框体的严判，Majdata Play自行实现了Perfect子区间:

- `Perfect`: (`基础区间`+`扩展区间`) * `0.3333`
- `Perfect 2nd`: (`基础区间`+`扩展区间`) * `0.6666`
- `Perfect 3rd`: `基础区间`+`扩展区间`

当严判被关闭时，Slide会自动将Perfect 2nd和Perfect 3rd修正为Perfect

## Classic

::: warning

- MajdataPlay的maimai FiNALE Slide判定没有任何公开数据支撑，**所有数据均为LeZi根据自身对maimai FiNALE的理解推断的**
- 为兼容Break Slide，MajdataPlay自行实现了`Classic`判定模式下的Great子区间
:::

与`Modern`判定模式不同，该判定模式的Perfect区间是静态的，不会根据Slide在最后一个判定区停留时长动态扩展

### 判定区间

| 等级 | 范围 | 累计 |
| :--- | --- | --- |
| FastGood | `(-inf, -24f)` | - |
| FastGreat 3rd | `[-24f, -20f)` | `4f` |
| FastGreat 2nd | `[-20f, -16f)` | `4f` |
| FastGteat 1st | `[-16f, -12f)` | `4f` |
| FastPerfect 3nd | `[-12f, -8f)` | `4f` |
| FastPerfect 2nd | `[-8f, -4f)` | `4f` |
| Perfect | `[-4f, 4f]` | `8f` |
| LatePerfect 2nd | `(4f, 8f]` | `4f` |
| LatePerfect 3nd | `(8f, 12f]` | `4f` |
| LateGteat 1st | `(12f, 16f]` | `4f` |
| LateGreat 2nd | `(16f, 20f]` | `4f` |
| LateGreat 3rd | `(20f, 24f]` | `4f` |
| LateGood | `(24f, 36f]` | `12f` |
| Miss | `(36f, inf)` | - |

## Wifi

Class: [WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)

Wifi是`SlideBase`的子类，判定区间、Perfect扩展与`TooLateJudge`行为与普通Slide完全一致，差异仅在于判定队列的组织方式。

### 判定队列

Wifi使用三条并行判定队列，对应三条分支：

- `Left`：`A1 → B8 → B7 → (A6 ∪ D6)`
- `Center`：`A1 → B1 → C → (A5 ∪ B5)`；`Classic`模式下为`A1 → B1 → C`
- `Right`：`A1 → B2 → B3 → (A4 ∪ D5)`

所有分支共享起点`A1`；`A6∪D6`、`A5∪B5`、`A4∪D5`等复合判定区为`OR`策略，任一传感器触发即可。

### 判定时机

- `wifiConst = 0.162870f`（`Modern`与`Classic`相同）
- `JudgeTiming = StartTiming + Length * (1 - wifiConst)`
- `LastWaitTimeSec = Length * wifiConst`
- 三条队列全部完成后，按完成时刻进入`Judge`/`JudgeClassic`，机制与普通Slide一致

## 特殊行为

### TooLate

超过`36f`仍未完成队列时调用`TooLateJudge()`：

- 队列只剩最后一个判定区（`IsPendingFinish`）→ `LateGood`
- 否则 → `Miss`

### Mine

Mine（地雷）不需要玩家击打——**不去碰它才是正确操作**。Slide / Wifi 被标记为 Mine 后，判定区间不收窄，而是通过判定队列的完成方来区分：

- **安全通过**：由 `MineCheck()` 自动完成判定队列
  - 非连接Slide（或连接Slide末段）：`GetTimeSpanToJudgeTiming() >= 0`（到达判定时刻）时判 `Perfect`，隐藏全部判定条
  - 连接Slide中间段：`GetRemainingTimeWithoutOffset() == 0`（时值耗尽）时由系统清空全部判定队列完成，不设 `JudgeResult`
  - 未到判定时刻时调用 `Autoplay()`（仅推进动画，不判定）
- **误触**：玩家完成判定队列后进入 `Judge()` / `JudgeClassic()`，末尾修正：`JudgeResult >= Perfect`（Fast侧）→ `TooFast`，`JudgeResult < Perfect`（Late侧）→ `Miss`

| 项目 | 普通 Slide | Mine Slide |
| --- | --- | --- |
| 可判定区间 | `(-inf, 36f]` | 不收窄（相同） |
| 安全通过 | 无 | 非连接：`>= 0` 判 `Perfect`；连接中间段：时值耗尽时系统完成 |
| 误触结果 | 正常判定 | `TooFast` / `Miss` |
| Autoplay | 正常 | **禁用**（`AutoplayUpdate()` 在 `IsMine` 为真时直接 `return`） |

::: info 连接Slide（ConnSlide）
连接Slide由多个 Slide 段组成（`ConnectInfo.IsConnSlide`）。只有末段（`IsGroupPartEnd`）或非连接的独立 Slide 才会在到达判定时刻时判 `Perfect`；中间段在时值耗尽时由系统自动清空队列完成，不产生玩家可见的判定结果。
:::

### 判定样式换算

最终结果同样会经过`ConvertJudgeGrade`换算，规则与Tap一致，请参阅Tap相关内容。
