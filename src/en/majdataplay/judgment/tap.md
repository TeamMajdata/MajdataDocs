# Tap

Class: [TapDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TapDrop.cs)

Method:

- `Judge(float currentSec)` (inherited from [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))

Overall window: `[-9f, 9f]`

Details:

| Judgment | Range | Width |
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
