# Slide

Class: [SlideBase.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideBase.cs)

Method:

- `Judge(float currentSec)`
- `JudgeClassic(float currentSec)`

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
| LateGood | `(36f, 29f]` | `7f` |
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
| LateGood | `(36f, 24f]` | `12f` |
| Miss | `(36f, inf)` | - |
