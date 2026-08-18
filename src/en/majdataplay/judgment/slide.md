# Slide

Class: [SlideBase.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/SlideBase.cs)

Methods:

- `Judge(float currentSec)`
- `JudgeClassic(float currentSec)`

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
