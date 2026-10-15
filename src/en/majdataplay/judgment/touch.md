# Touch & TouchHold

Class: [TouchDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchDrop.cs), [TouchHoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TouchHoldDrop.cs)

Method:

- `Judge(float currentSec)` (TouchDrop inherits from [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs); TouchHoldDrop overrides it)
- `HoldEndJudge(float currentSec)` (TouchHoldDrop, inherited from [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))

This page covers both Touch and TouchHold.

::: info

- The judgeable window of both Touch and TouchHold is `[-9f, 18f]` (`JudgableRange = [JudgeTimingWithOffset - 9f, JudgeTimingWithOffset + 18f]`)
- Both can be judged by buttons: with `ButtonRingForTouch` enabled on desktop, clicking the matching button is equivalent to touching
- TouchHold's head-judgment window is identical to Touch's; the Fast side only has Perfect
:::

## Touch Judgment

`TouchDrop` overrides `Judge` with the dedicated `TOUCH_JUDGE_*` windows (same as the TouchHold head judgment). The Fast side only keeps Perfect (Fast inputs past `9f` are ignored outright), and the Late side does not use the 1st variants of Perfect/Great:

| Grade | Fast side | Late side | Width |
| :--- | --- | --- | --- |
| Perfect | `[-9f, 9f]` | - | `18f` |
| Perfect 2nd | - | `(9f, 10.5f]` | `1.5f` |
| Perfect 3rd | - | `(10.5f, 12f]` | `1.5f` |
| Great | - | `(12f, 13f]` | `1f` |
| Great 2nd | - | `(13f, 14f]` | `1f` |
| Great 3rd | - | `(14f, 15f]` | `1f` |
| Good | - | `(15f, 18f]` | `3f` |
| Miss | - | `(18f, inf)` | - |

### Miss

If still unjudged past `18f` (`TOUCH_JUDGE_GOOD_AREA_MSEC`), `TooLateCheck` forces a `Miss`.

## TouchHold Judgment

### Head Judgment

The TouchHold head judgment is identical to Touch's, using the same `TOUCH_JUDGE_*` windows; see the [Touch Judgment](#touch-judgment) table above.

### Press Judgment

Identical to the Hold press judgment (`HoldEndJudge`), with these differences:

- Press judgment ignores the first `15f` and the last `12f` (`TOUCH_HOLD_HEAD_IGNORE_LENGTH_SEC` / `TOUCH_HOLD_TAIL_IGNORE_LENGTH_SEC`)
- Releasing has a `2f` tolerance
- The correction rules for the completion ratio `p` are the same as Hold's; see the [Hold](/en/majdataplay/judgment/hold) press-judgment details
- TouchHold does not perform the end judgment in Classic mode (`HoldClassicEndJudge` does not apply)

## Touch Groups

Multiple Touch/TouchHold notes on adjacent sensor areas at the same time are grouped together: [NoteLoader.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteLoader.cs) clusters them by sensor adjacency using the `TOUCH_GROUPS` table:

- Each group (`TouchGroup`) tracks the judged-member ratio `Percent` and the first non-Miss/TooFast result `JudgeResult`
- When a member is judged successfully it calls `RegisterResult` to register the result with the group
- In `TooLateCheck`, an unjudged member inherits the group's `JudgeResult` and `JudgeDiff` if `Percent > 0.5f` and the group already has a result
- TouchHold press checks additionally have `TouchHoldGroup`: group members share press state, and a member counts as held when more than half of the members are held (`Percent > 0.5f`)

::: info
A typical scenario for group judgment: two TapTouches in the `C` area (C1/C2 given together) and multi-point touches across areas — once more than half of the members are judged, the remaining members automatically follow the group result.
:::

## Special Behavior

### Mine

A Mine does not need to be hit — **leaving it alone is the correct action**. When a Touch or TouchHold is flagged as Mine:

**Touch:**

- **Safe pass**: `MineCheck()` auto-judges `Perfect` when `GetTimeSpanToJudgeTiming() > 0` (note: the threshold is `> 0`, not `> 3f` like Tap/Hold)
- **Accidental hit**: `Check()` judges normally then corrects: `JudgeResult >= Perfect` (Fast side) → `TooFast`, `JudgeResult < Perfect` (Late side) → `Miss`, followed by an immediate `End()`
- The judgeable window is not narrowed (same as a normal Touch)
- Autoplay **disabled**

**TouchHold:**

- **Safe pass**: `MineHeadCheck()` auto-judges `Perfect` when `GetTimeSpanToJudgeTiming() > 0`, plays the hold effect and marks the press state
- **Accidental hit**: `HeadCheck()` judges normally then corrects the same way as Touch, followed by `isMineForceEnd = true` and an immediate `End()`
- **Press check**: after the safe pass, `MineBodyCheck()` checks every frame whether the sensor is `On` — if a press is detected, it forces `Miss` and `End()`
- `BodyCheck()` returns immediately when `IsMine` is true; normal press judgment is not performed
- `End()` skips `HoldEndJudge` when `IsMine` is true
- The judgeable window is not narrowed
- Autoplay **not disabled** (unlike Tap/Hold/Touch, TouchHold's `Autoplay()` does not check `IsMine`)

### Judge Style Conversion

The final result goes through the same `ConvertJudgeGrade` conversion as Tap. See the [Tap](/en/majdataplay/judgment/tap) page.
