# Hold

Class: [HoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/HoldDrop.cs)

Method:

- `Judge(float currentSec)` (inherited from [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))
- `HoldEndJudge(float currentSec)` (inherited from [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))
- `HoldClassicEndJudge(float currentSec)` (inherited from [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))

## Head Judgment

The head judgment of a Hold is identical to the Tap judgment. See the Tap page.

## Press Judgment

::: info

- Press judgment only runs in the Modern judgment mode
- Note that the press check and the head judgment are not serial: the press check also runs before a head result has been obtained
:::

### Behavior

- Press judgment ignores the first `6f` and the last `12f`
- The press check starts at frame 7
- Releasing has a `2f` tolerance
- The Hold duration is corrected according to the head judgment:
  - A Fast head judgment does not correct the Hold duration
  - A Late head judgment subtracts `_judgeDiff` from `Length`
  - If the corrected duration is `18f` or less, no end judgment is performed and the final result is the head judgment

### Details

::: info

For convenience, `p` below denotes the "Hold completion ratio":
:::

- p >= 1
  - A head judgment of `Great 2nd/3rd` is corrected up to `Great`
  - A head judgment of `Good` is corrected up to `Great`
  - A head judgment of `Miss` is corrected up to `Good`
  - Other grades are not modified
- p >= 0.67
  - A head judgment of `Critical` is corrected down to `Perfect 2nd`
  - A head judgment of `Great 2nd/3rd` is corrected up to `Great`
  - A head judgment of `Good` is corrected up to `Great`
  - A head judgment of `Miss` is corrected up to `Good`
- p >= 0.33
  - A head judgment higher than `Great` is corrected down to `Great`
  - A head judgment of `Great 2nd/3rd` is corrected up to `Great`
  - A head judgment of `Good` is corrected up to `Great`
  - A head judgment of `Miss` is corrected up to `Good`
- p >= 0.05
  - A head judgment higher than `Good` is corrected down to `Good`
  - A head judgment of `Miss` is corrected up to `Good`
- p >= 0
  - A head judgment higher than `Good` is corrected down to `Good`

## End Judgment

::: info

The end judgment only runs in the Classic judgment mode.
:::

::: warning

MajdataPlay's end judgment is not backed by any public data. **All values are LeZi's estimates based on their own understanding of maimai FiNALE.**
:::

### Behavior

- The end judgment has no tolerance
- Unlike press judgment, the end judgment is based on the difference between the release time and the Hold end time
- It only has Perfect and LateGood grades, and the Fast and Late windows are not fully symmetric
- When the Hold has ended but the held time exceeds `20f` (`CLASSIC_HOLD_ALLOW_OVER_LENGTH_SEC`), the Hold forcibly performs the end judgment

### Details

| Grade | Range | Total |
| :--- | --- | --- |
| FastGood | `(-inf, -9f)` | - |
| Perfect | `[-9f, 12f]` | `21f` |
| LateGood | `(12f, 20f]` | `8f` |

## Special Behavior

### Mine

A Mine does not need to be hit — **leaving it alone is the correct action**. When a Hold is flagged as Mine:

- **Safe pass**: the player never touches it; `MineHeadCheck()` auto-judges `Perfect` when `GetTimeSpanToJudgeTiming() > 3f`, plays the hold effect and marks the press state
- **Accidental hit**: the player touches it within the judgeable window; `HeadCheck()` judges normally then corrects: `JudgeResult >= Perfect` (Fast side) → `TooFast`, `JudgeResult < Perfect` (Late side) → `Miss`, followed by `isMineForceEnd = true` and an immediate `End()`
- **Press check**: after the safe pass, `MineBodyCheck()` checks every frame whether the button or sensor is `On` — if a press is detected, it forces `Miss` and `End()`

Differences:

| Item | Normal Hold | Mine Hold |
| --- | --- | --- |
| Judgeable window | `[-9f, 9f]` | `[-3f, 3f]` (narrowed to `TAP_JUDGE_SEG_3RD_PERFECT_MSEC`) |
| Safe pass | None | `Perfect` at `> 3f` |
| Accidental hit result | Normal judgment | `TooFast` / `Miss` |
| Press judgment | Normal | **Skipped** (`BodyCheck()` returns immediately when `IsMine` is true) |
| End judgment / press-ratio correction | Normal | **Skipped** (`End()` skips `HoldEndJudge` / `HoldClassicEndJudge` when `IsMine` is true) |
| Autoplay | Normal | **Disabled** |

### Judge Style Conversion

The final result goes through the same `ConvertJudgeGrade` conversion as Tap. See the Tap page.
