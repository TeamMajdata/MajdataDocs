# Slide

Class: [SlideBase.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideBase.cs)

Method:

- `Judge(float currentSec)`
- `JudgeClassic(float currentSec)`
- `TooLateJudge()`

This page also covers regular Slides ([SlideDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideDrop.cs)) and Wi-Fi Slides ([WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)).

::: info
MajdataPlay provides two Slide judgment modes:

- `Modern`, which closely reproduces the Slide judgment style of maimai DX.
- `Classic`, which reproduces the Slide judgment style of maimai FiNALE as closely as possible.

The two modes use completely different judgment mechanisms.
:::

::: info

- In both `Modern` and `Classic` modes:
  - The Slide judgment window is `(-inf, 36f]`.
  - A judgment is forced `36f` after the Slide arrives.
- `_lastWaitTime` is the time the Slide remains in the final judgment area (unit: `ms`).
- `_table.Const` and `wifiConst` are Slide constants. They represent the ratio between the time a Slide remains in the final judgment area and the Slide duration.
- MajdataPlay implements Perfect sub-windows to reproduce the stricter judgment of older cabinets.
:::

::: warning

- The Slide constants were derived by analyzing recordings and overlaid images of judgment areas, so their values may be inaccurate.
- The Slide Deluxe judgment implementation is based on [Detailed explanation of maimai judgments - Moying](https://www.bilibili.com/opus/694985211225571337/).
:::

## Judgment Queue

A Slide is not judged on a single button but on a **judgment queue** (`JudgeQueues`): each judgment area (`SlideArea`) contains a set of sensors and a trigger policy (`AreaPolicy`), and areas must be completed in order.

- A regular Slide uses one queue; a Wi-Fi Slide uses three parallel queues (`Left` / `Center` / `Right`), and all three must be completed to finish the Slide.
- While checking the queue, the first two judgment areas may be checked simultaneously; the next area is only checked when the current one has been pressed (`On`) or is skippable (`IsSkippable`).
- When the `SlideSkipping` setting is off, every area has `IsSkippable = false` and must be triggered one by one.
- The judgment timing is derived from the Slide constant: `JudgeTiming = StartTiming + Length * (1 - Const)` and `LastWaitTimeSec = Length * Const`. `Const` differs between `Modern` and `Classic` (`_table.Const` / `_table.ClassicConst`); Wi-Fi uses `0.162870f` for both.

## Modern

In this judgment mode, the Perfect window is not static. It expands dynamically according to `_lastWaitTime`.

The Perfect window consists of a base window and an extension window.

Base window: `[-14f, 14f]`

Extension window: `ext = _lastWaitTime / 4`, up to a maximum of `22f`

As the Perfect window expands, it takes space from the Great and Good windows, as shown below:

``` text
Before expansion:

| <-  Fast Great (15f)  ->| <-  Perfect (28f)  -> | <-  Late Great (15f)  -> |

After expansion:

| <-  Fast Great (10f)  ->| <-       Perfect (28 + 10f)     -> | <-  Late Great (10f)  -> |

Comparison:
| <-  Fast Great (15f)  ->| <-  Perfect (28f)  -> | <-  Late Great (15f)  -> |
                | <-           Perfect (28 + 10f)      -> |
```

### Judgment windows

| Judgment | Range | Width |
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

### Perfect sub-windows

To reproduce the stricter judgment of older cabinets, MajdataPlay implements Perfect sub-windows:

- `Perfect`: (`base window` + `extension window`) * `0.3333`
- `Perfect 2nd`: (`base window` + `extension window`) * `0.6666`
- `Perfect 3rd`: `base window` + `extension window`

When strict judgment is disabled, Slide automatically converts Perfect 2nd and Perfect 3rd judgments to Perfect.

## Classic

::: warning

- There is no publicly available data supporting MajdataPlay's maimai FiNALE Slide judgment implementation. **All values are LeZi's estimates based on their understanding of maimai FiNALE.**
- MajdataPlay implements Great sub-windows in `Classic` mode to support Break Slides.
:::

Unlike `Modern` mode, the Perfect window in this mode is static. It does not expand according to the time the Slide remains in the final judgment area.

### Judgment windows

| Judgment | Range | Width |
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

Class: [WifiDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/WifiDrop.cs)

Wi-Fi is a subclass of `SlideBase`. Its judgment windows, Perfect expansion and `TooLateJudge` behavior are identical to regular Slides; the only difference is how the judgment queues are organized.

### Judgment queues

A Wi-Fi Slide uses three parallel queues, one per branch:

- `Left`: `A1 → B8 → B7 → (A6 ∪ D6)`
- `Center`: `A1 → B1 → C → (A5 ∪ B5)`; in `Classic` mode it is `A1 → B1 → C`
- `Right`: `A1 → B2 → B3 → (A4 ∪ D5)`

All branches share the starting area `A1`; composite areas such as `A6∪D6`, `A5∪B5` and `A4∪D5` use the `OR` policy — any sensor of the area may trigger it.

### Judgment timing

- `wifiConst = 0.162870f` (identical in `Modern` and `Classic`)
- `JudgeTiming = StartTiming + Length * (1 - wifiConst)`
- `LastWaitTimeSec = Length * wifiConst`
- Once **all three** branches' queues are fully completed, `Judge`/`JudgeClassic` runs with the completion time, exactly like a regular Slide

## Special Behavior

### TooLate

If the queue is still unfinished past `36f`, `TooLateJudge()` runs:

- Only the last judgment area remains (`IsPendingFinish`) → `LateGood`
- Otherwise → `Miss`

### Mine

A Mine does not need to be hit — **leaving it alone is the correct action**. When a Slide / Wi-Fi is flagged as Mine, the judgeable window is not narrowed; instead, the completion source of the judgment queue distinguishes the two paths:

- **Safe pass**: `MineCheck()` auto-completes the judgment queue
  - Non-connected Slide (or the last segment of a connected Slide): judges `Perfect` when `GetTimeSpanToJudgeTiming() >= 0` (judgment timing reached), hides all bars
  - Connected Slide middle segment: the system clears all judgment queues when `GetRemainingTimeWithoutOffset() == 0` (duration exhausted), without setting `JudgeResult`
  - Before the judgment timing, calls `Autoplay()` (advances animation only, no judgment)
- **Accidental hit**: the player completes the queue and enters `Judge()` / `JudgeClassic()`, which corrects at the end: `JudgeResult >= Perfect` (Fast side) → `TooFast`, `JudgeResult < Perfect` (Late side) → `Miss`

| Item | Normal Slide | Mine Slide |
| --- | --- | --- |
| Judgeable window | `(-inf, 36f]` | Not narrowed (same) |
| Safe pass | None | Non-connected: `Perfect` at `>= 0`; connected middle: system completes on duration exhaust |
| Accidental hit result | Normal judgment | `TooFast` / `Miss` |
| Autoplay | Normal | **Disabled** (`AutoplayUpdate()` returns immediately when `IsMine` is true) |

::: info Connected Slides (ConnSlide)
A connected Slide consists of multiple segments (`ConnectInfo.IsConnSlide`). Only the last segment (`IsGroupPartEnd`) or a standalone non-connected Slide judges `Perfect` when the judgment timing is reached; middle segments are auto-completed by the system when their duration is exhausted, producing no player-visible result.
:::

### Judge Style Conversion

The final result goes through the same `ConvertJudgeGrade` conversion as Tap. See the Tap page.
