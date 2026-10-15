# Tap

Class: [TapDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TapDrop.cs)

Method:

- `Judge(float currentSec)` (inherited from [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))

Total window: `[-9f,9f]` (`Mine`: `[-3f,3f]`)

Details:

| Grade | Range | Total |
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

## Special Behavior

### EX Tap

When `IsEX` is true, the judgment result is unconditionally forced to `Perfect`, except for `Miss`.

### Mine

A Mine does not need to be hit — **leaving it alone is the correct action**. When a Tap is flagged as Mine, the judgment logic switches to two paths:

- **Safe pass**: the player never touches it; `MineCheck()` auto-judges `Perfect` when `GetTimeSpanToJudgeTiming() > 3f`
- **Accidental hit**: the player touches it within the judgeable window; `Check()` judges normally then corrects: `JudgeResult >= Perfect` (Fast side) → `TooFast`, `JudgeResult < Perfect` (Late side) → `Miss`, followed by an immediate `End()`

Differences:

| Item | Normal Tap | Mine Tap |
| --- | --- | --- |
| Judgeable window | `[-9f, 9f]` | `[-3f, 3f]` (narrowed to `TAP_JUDGE_SEG_3RD_PERFECT_MSEC`) |
| Safe pass | None | `Perfect` at `> 3f` |
| Accidental hit result | Normal judgment | `TooFast` / `Miss` |
| Autoplay | Normal | **Disabled** (`Autoplay()` returns immediately when `IsMine` is true) |

::: info
`MineCheck()` triggers the safe pass at `> 3f`, while `TooLateCheck`'s threshold is `9f`, so a Mine Tap never actually reaches the TooLate path.
:::

### Miss

- If still unjudged past `9f`, `TapDrop.TooLateCheck()` forces a `Miss`
- Each `OnPreUpdate` consumes at most one click event; multiple clicks on the same button/sensor within one frame are not judged repeatedly

### Judge Style Conversion

After `Judge` produces a result, it is converted once according to the `JudgeStyleOption` setting (`NoteDrop.ConvertJudgeGrade`):

| Style | Conversion rule |
| --- | --- |
| `DEFAULT` | No conversion |
| `MAJI` | Perfect 3rd → Great; all Greats → Good; Good → TooFast / Miss |
| `GACHI` | Perfect 3rd → Good; Perfect 2nd → Great; Great kept; Good → TooFast / Miss |
| `GORI` | Everything except Perfect → TooFast / Miss |

::: info
The conversion happens after the Fast/Late distinction, so it never loses Fast/Late information.
:::
