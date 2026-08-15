# Tap

Class: [TapDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/TapDrop.cs)

Method:

- `Judge(float currentSec)` (继承自 [NoteDrop.cs](https://github.com/LingFeng-bbben/MajdataPlay/blob/dev/Assets/Scripts/Scenes/Game/NoteBehaviours/NoteDrop.cs))

总区间: `[-9f,9f]`

详情:

| 等级 | 范围 | 总计 |
| :--- | --- | --- |
| TooFast | `(-inf, -9f)` | - |
| FastGood | `[-9f, -6f)` | `3f` |
| FastGreat 3rd | `[-6f, -5f)` | `1f` |
| FastGreat 2nd | `[-5f, -4f)` | `1f` |
| FastGteat 1st | `[-4f, -3f)` | `1f` |
| FastPerfect 3nd | `[-3f, -2f)` | `1f` |
| FastPerfect 2nd | `[-2f, -1f)` | `1f` |
| Perfect | `[-1f, 1f]` | `2f` |
| LatePerfect 2nd | `(1f, 2f]` | `1f` |
| LatePerfect 3nd | `(2f, 3f]` | `1f` |
| LateGteat 1st | `(3f, 4f]` | `1f` |
| LateGreat 2nd | `(4f, 5f]` | `1f` |
| LateGreat 3rd | `(5f, 6f]` | `1f` |
| LateGood | `(6f, 9f]` | `3f` |
| Miss | `(9f, inf)` | - |
