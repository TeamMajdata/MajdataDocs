# Expansion and Simai Compatibility

For convenience, Slide Code **allows consecutive identical instruction letters to be omitted**. When the parser reads a numeric parameter not preceded by an instruction letter, it searches backward and uses the most recently encountered instruction.

**Example 1:**

* **Full**: `5Q9A1P9P8CQ4Q9K5`
* **Shorthand**: `5Q9A1P98CQ49K5`
* **Result**: `(X)5 - Q9 - A1 - P9 - P8 - C - Q4 - Q9 - K5`
* *Explanation: the leading `5` has no preceding letter, so it is technically interpreted as the starting instruction `X5`; in `P98`, the `8` has no preceding letter, so the parser searches back and finds `P`, parsing it as `P9 - P8`; `Q49` works the same way.*

**Example 2:**

* **Full**: `1P0P0P0P0P0K8`
* **Shorthand**: `1P00000K8`
* **Fully expanded**: `(X)1 - P0 - P0 - P0 - P0 - P0 - K8`
* *Explanation: using the omission rule, when a track instruction needs to go around multiple times, you don't need to write `P, Q` repeatedly. In fact, this omission rule was created specifically for this purpose.*

**Example 3:**

* **Full**: `1A3A5A7K1`
* **Shorthand**: `1A357K1`
* **Fully expanded**: `(X)1 - A3 - A5 - A7 - K1`
* *Explanation: using the omission rule, you can quickly write paths that bounce back and forth between A-area positions.*

## Simai Compatibility

From the above examples you may notice that a complete Slide Code string always starts with a digit and ends with a digit. The standard Simai Slide syntax also starts and ends with digits. Therefore, when writing Simai chart files, we simply treat the middle part of the Slide Code (after removing the head and tail digits) as a shape string similar to `<, >, p, q, pp, qq` in Simai, and apply standard Simai modifiers to the Slide. For example, `1bxA357K1b[2:1]` describes a Slide with path `1A357K1`, a Break+EX star, and a total duration of one half note — a Break Slide, very straightforward. Same-head Slides work the same way, using `*` to replace the starting key.

In fact, although it's unclear why anyone would do this, Slide Code can also be chained with standard Slide syntax to form connected Slides, e.g. `1bA357K1>1[1:1]` splices `1A357K1` and `1>1` together.

> Visually, a Slide described entirely by Slide Code and a connected Slide composed of standard Slides and Slide Code have subtle differences, in that the arrow positions on the trajectory differ. Similar to how in standard Simai, `1-3-5[4:1]*V35[4:1]` has completely overlapping paths but different arrow positions on the second segment. In situations that are extremely particular about visual effects, this technique may be useful.
