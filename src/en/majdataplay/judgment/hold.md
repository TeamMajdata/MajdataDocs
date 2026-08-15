# Hold

Class: [HoldDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/HoldDrop.cs)

Methods:

- `Judge(float currentSec)` (inherited from [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))
- `HoldEndJudge(float currentSec)` (inherited from [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))
- `HoldClassicEndJudge(float currentSec)` (inherited from [NoteLongDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteLongDrop.cs))

## Head judgment

The head of a Hold uses the same judgment as a Tap. See the [Tap judgment documentation](/en/majdataplay/judgment/tap).

## Hold judgment

::: info

- Hold judgment is performed only in Modern judgment mode.
- Hold-state checks do not wait for the head judgment. They are performed even before a head-judgment result is available.
:::

### Behavior

- Hold judgment ignores the first `6f` and the final `12f`.
- Hold-state checks start on frame 7.
- Releasing the Hold has a `2f` tolerance.
- The Hold duration is adjusted according to the head judgment:
  - A Fast head judgment does not adjust the Hold duration.
  - A Late head judgment subtracts `_judgeDiff` from `Length`.
  - If the adjusted duration is `18f` or less, no end judgment is performed, and the head judgment becomes the final judgment.

### Details

::: info

For brevity, `p` below represents the proportion of the Hold that was completed.
:::

- `p >= 1`
  - A `Great 2nd/3rd` head judgment is upgraded to `Great`.
  - A `Good` head judgment is upgraded to `Great`.
  - A `Miss` head judgment is upgraded to `Good`.
  - Other judgments are unchanged.
- `p >= 0.67`
  - A `Critical` head judgment is downgraded to `Perfect 2nd`.
  - A `Great 2nd/3rd` head judgment is upgraded to `Great`.
  - A `Good` head judgment is upgraded to `Great`.
  - A `Miss` head judgment is upgraded to `Good`.
- `p >= 0.33`
  - A head judgment above `Great` is downgraded to `Great`.
  - A `Great 2nd/3rd` head judgment is upgraded to `Great`.
  - A `Good` head judgment is upgraded to `Great`.
  - A `Miss` head judgment is upgraded to `Good`.
- `p >= 0.05`
  - A head judgment above `Good` is downgraded to `Good`.
  - A `Miss` head judgment is upgraded to `Good`.
- `p >= 0`
  - A head judgment above `Good` is downgraded to `Good`.

## End judgment

::: info

End judgment is performed only in Classic judgment mode.
:::

::: warning

There is no publicly available data supporting MajdataPlay's end-judgment implementation. **All values are LeZi's estimates based on their understanding of maimai FiNALE.**
:::

### Behavior

- End judgment has no tolerance.
- Unlike Hold judgment, end judgment uses the difference between the release time and the end time of the Hold.
- End judgment has only two outcomes, Perfect and Good, and its Fast and Late windows are not fully symmetrical.
- If the Hold has ended but remains pressed for more than `19f`, an end judgment is forced.

### Details

| Judgment | Range | Width |
| :--- | --- | --- |
| FastGood | `(-inf, -9f)` | - |
| Perfect | `[-9f, 12f]` | `21f` |
| LateGood | `(12f, 19f]` | `7f` |
