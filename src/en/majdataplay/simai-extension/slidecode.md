# Slide Code

**Slide Code** is a new syntax for describing Slides. A long and complex slide path can be represented by a short sequence of characters, for example:

`5Q9A1P98CQ49K5`

A Slide Code consists of only two types of elements:

* **Instructions**: uppercase letters `A, B, C, K, P, Q`  
  (Note that the starting instruction `X` is omitted in the actual syntax.)
* **Parameters**: digits `0~9`

## 1. Instructions

Instructions are divided into two categories according to their behavior:

* **Node instructions**: move to a specific point.
* **Track instructions**: rotate along a circular track.

### 1.1. Node Instructions

These instructions cause the Slide to travel in a straight line toward a specific position in the judgment area.

* **`X` instruction**: represents the starting point of the Star Slide. **The letter `X` must be omitted in the actual code; only its parameter is written.** The parameter is `1~8`, corresponding to the eight starting points on the judgment line.

* **`A` instruction**: move in a straight line to the A area. The parameter is `1~8`.
  * Note: the target point lies on the **judgment line** corresponding to the A area, and adjacent positions are allowed.

* **`B` instruction**: move in a straight line to the B area. The parameter is `1~8`.
  * Note: the target point is not at the center of the B-area Touch sensor. It is slightly closer to the center of the screen, at the corresponding geometric intersection.

* **`C` instruction**: move to the C area, i.e. the exact center of the screen. **This instruction must not be followed by a parameter.**

* **`K` instruction**: represents the endpoint of the Slide. Its visual behavior is exactly the same as the `A` instruction, but it marks the end of the entire Slide for judgment. **A Slide Code must end with a `K` instruction and its parameter.** The parameter is `1~8`.

### 1.2. Track Instructions

These instructions cause the Slide to rotate along a specific circular track. If the Slide enters a track from outside, a tangent entry path is calculated automatically.

* **`P` instruction**: rotate **counterclockwise** around the specified circle.
* **`Q` instruction**: rotate **clockwise** around the specified circle.

#### Track Parameters

A `P` or `Q` instruction must be followed by a digit `0~9`, representing one of ten different circles:

* **Circle `0`**: the central circle, corresponding to the circle used by `p` and `q` in the standard syntax.
* **Circles `1~8`**: the side circles, corresponding to the circles used by `pp` and `qq` in the standard syntax. The number of each circle corresponds to the D/E area it passes through. For example, the circle passing through D3 is circle `3`.
* **Circle `9`**: the outermost circle, corresponding to the judgment-line circle used by `<` and `>` in the standard syntax.

---

## 2. Expansion and Shorthand Rules

For convenience, Slide Code allows consecutive identical instructions to be omitted. The parser expands the code into a sequence of `(instruction, parameter)` pairs.

### Expansion Rule

If a numeric parameter is not preceded by an instruction letter, search backward until the most recently encountered instruction is found, and use that instruction.

### Example 1

* **Written:**

  `5Q9A1P98CQ49K5`

* **Fully expanded:**

  `(X)5 - Q9 - A1 - P9 - P8 - C - Q4 - Q9 - K5`

* **Explanation:** In `P98`, the `8` has no instruction letter immediately before it, so the parser searches backward and finds `P`, resulting in `P8`.

  Likewise, the leading `5` has no preceding instruction and is therefore interpreted as the starting point `X5`.

### Example 2

* **Written:**

  `1A3571P9K1`

* **Fully expanded:**

  `(X)1 - A3 - A5 - A7 - A1 - P9 - K1`

* **Explanation:** The shorthand rule makes it convenient to describe paths that repeatedly move between positions in the A area.

---

# 3. Parsing

When parsing a Slide Code, only four types of transitions need to be considered:

1. Node → Node
2. Node → Track
3. Track → Node
4. Track → Track

---

## 3.1. Geometric Definitions

We first define the geometry.

The center of the C area is used as the origin of the complex plane. The positive real axis points to the right, and the positive imaginary axis points upward.

The unit length is defined as 100 pixels. Therefore, the radius of the judgment line is:

$$
R = 4.8
$$

The specific numerical value will not be used below; all formulas are expressed in terms of `R`.

### 3.1.1. Nodes

The angular positions of the eight outer buttons are:

$$
\theta_n = 112.5^\circ - n \times 45^\circ
$$

The angular positions of the D/E areas are:

$$
\phi_n = 135^\circ - n \times 45^\circ
$$

There are 17 nodes in total, corresponding to `A1~8`, `B1~8`, and `C`.

The nodes corresponding to the `X` and `K` instructions are identical to those of the `A` instruction.

#### A Nodes

The A1~8 nodes lie on the judgment line. Their coordinates are:

$$
A_n = R(\cos\theta_n + i\sin\theta_n)
$$

#### B Nodes

The positions of the B1~8 nodes are determined by the geometry shown in the diagram. Their coordinates are:

$$
B_n =
R\frac{\cos 67.5^\circ}{\cos 22.5^\circ}
(\cos\theta_n + i\sin\theta_n)
$$

#### C Node

The C node is simply the origin:

$$
C = 0
$$

---

### 3.1.2. Circular Tracks

There are ten circular tracks, numbered `0~9`.

#### Track 0

Track `0` is centered at C and tangent to the line $A_5A_8$.

Its parametric equation is:

$$
f_0(t) =
R\cos67.5^\circ
(\cos t + i\sin t)
$$

#### Tracks 1~8

Tracks `1~8` are circles passing through C and tangent to the lines connecting adjacent A areas.

Their diameters are:

$$
R\cos22.5^\circ
$$

Therefore, their centers are:

$$
P_n =
R\frac{\cos22.5^\circ}{2}
(\cos\theta_n + i\sin\theta_n)
$$

Their parametric equations are:

$$
f_n(t) =
P_n +
R\frac{\cos22.5^\circ}{2}
(\cos t + i\sin t)
$$

#### Track 9

Track `9` is the outermost circle, i.e. the judgment line itself.

Its parametric equation is:

$$
f_9(t) = R(\cos t + i\sin t)
$$

A diagram is omitted here.

---

# 3.2. The Four Types of Path Connections

## 3.2.1. Node → Node

Suppose we want to move from node $z_1$ to node $z_2$.

The parametric equation is simply:

$$
f(t) = z_1 + t(z_2-z_1)
$$

where $t$ is a real number in the range `0~1`.

The unit tangent vector is constant:

$$
\vec g(t) =
\frac{z_2-z_1}{|z_2-z_1|}
$$

The path length is:

$$
l = |z_2-z_1|
$$

These values can simply be packaged into the corresponding segment of the piecewise path function.

---

## 3.2.2. Node → Track

First, only nodes located **outside the geometric shape of a track** can enter that track.

Specifically:

* B and C nodes cannot enter track `9` (the outermost circle).
* The C node cannot enter track `0` (the central circle).
* B2 and B3 cannot enter track `3`.
* The same rule applies to the other tracks accordingly.

For nodes that lie exactly on a track, there are two special cases:

* A node → track `9`
* C node → tracks `1~8`

In these cases, no tangent entry segment is required.

### Tangent Entry

In all other cases, a suitable tangent must be calculated for entering the track.

Consider the example of A7 entering track 3 counterclockwise (`A7-P3`).

Let the tangent point be $T$. To calculate its coordinates, we first need to calculate $P_3$.

The magnitude of $\overrightarrow{P_3T}$ is obviously the radius of track 3:

$$
r =
R\frac{\cos22.5^\circ}{2}
$$

Therefore, the key problem is to determine its angular position.

Since $\angle A_7TP_3$ is a right angle:

$$
\alpha =
\arccos
\frac{|A_7-P_3|}{r}
$$

Let $\beta$ be the argument of $\overrightarrow{P_3T}$. Then:

$$
\beta =
\arg(\overrightarrow{P_3A_7}) \pm \alpha
$$

The choice between `+` and `−` depends on the entry direction. Since this example enters the track counterclockwise, the `+` sign is used.

Thus, the tangent point is:

$$
T =
P_3 +
R\frac{\cos22.5^\circ}{2}
(\cos\beta+i\sin\beta)
$$

The tangent-entry segment can then be expressed as:

$$
f(t) = A_7+t(T-A_7)
$$

The unit tangent vector and path length are calculated in the same way as above.

After entering the track, how the Slide continues along the track depends on the next instruction, which is discussed below.

---

## 3.2.3. Track → Node

Regardless of the previous instruction, the path is now located on the track and must leave the track along a tangent toward the target node.

Likewise, a node located **inside the geometric shape of the track** cannot be reached.

For nodes that lie exactly on a track:

* Track `9` → A node
* Tracks `1~8` → C node

No tangent exit segment is required.

In all other cases, a tangent must first be calculated. The calculation is the same as above, except that the sign used when calculating the angular position is reversed — because **exiting counterclockwise is equivalent to entering clockwise**.

This gives us the angular position $\beta$ of the tangent point relative to the track center.

If the target node lies exactly on the track, $\beta$ is simply the angular position of that node relative to the center of the track.

We also have the angular position $\beta_0$ of the current path endpoint relative to the track center. This is the tangent-point angle calculated in the previous step.

### Traveling Along the Track

We simply travel along the track from angle $\beta_0$ to angle $\beta$ in the specified direction.

Suppose the current track has radius $r$. The parametric equation is:

$$
f(t) =
r\left(
\cos(\beta_0+t(\beta-\beta_0))
+i\sin(\beta_0+t(\beta-\beta_0))
\right)
$$

The unit tangent vector is:

$$
\vec g(t)
= \pm
\left(
-\sin(\beta_0+t(\beta-\beta_0))
+i\cos(\beta_0+t(\beta-\beta_0))
\right)
$$

* Counterclockwise: use the `+` sign.
* Clockwise: use the `−` sign.

The path length is:

$$
l = r|\beta-\beta_0|
$$

If necessary, a tangent segment from the track to the target node is then appended. The two parametric segments are combined into the corresponding piecewise path function.

### Important: Always Take the Shortest Arc

When traveling along a track, the path should always use the **shortest possible arc** in the specified direction. Under normal circumstances, the path must never make an additional full revolution.

### Special Case: Identical Angles

There is one exception.

If:

$$
\beta=\beta_0
$$

the Slide should travel around the track **exactly one full revolution**. This also prevents the implementation from producing a zero-length segment and potentially encountering a division-by-zero error.

Due to floating-point errors in the actual implementation, the following tolerance is used:

$$
|\beta-\beta_0| < 0.001\text{ rad}
$$

That is, if the angular difference is within **0.057°**, the two angles are considered to represent the same point, and the Slide should make one complete revolution.

### Angle Normalization

There is another issue in the implementation: because $\beta$ and $\beta_0$ are obtained through multiple floating-point calculations, they may not necessarily lie within the principal range.

Python's principal argument range is:

$$
[-\pi,\pi]
$$

Therefore, both angles must first be normalized to this range before calculating the difference $(\beta-\beta_0)$.

In Python, `math.remainder()` can be used to calculate the remainder modulo $2\pi$.

Then, depending on the travel direction:

* For counterclockwise travel, if $\beta < \beta_0$, add $2\pi$ to $\beta$.
* For clockwise travel, apply the opposite adjustment.

---

## 3.2.4. Track → Track

For a Track → Track transition, both track instructions must have the same direction:

* `P` can only connect to `P`.
* `Q` can only connect to `Q`.

`P` and `Q` cannot be connected directly. A node instruction must be placed between them.

### Same Track: Track 3 → Track 3

When the two track instructions refer to the same track, for example:

```text
Track 3 → Track 3
```

the meaning is to travel **one complete revolution** around the current track.

The parametric equation is:

$$
f(t) =
r\left(
\cos(\beta_0\pm2\pi t)
+i\sin(\beta_0\pm2\pi t)
\right)
$$

where $\beta_0$ is the angular position of the current path endpoint relative to the center of the track. It is the angle calculated for the tangent point in the previous step.

The sign depends on the travel direction. The unit tangent vector and path length are calculated in the same way as above.

---

# 3.3. Transitions Between Tracks 0~8

Next, consider transitions between tracks `0~8`, for example:

```text
Track 0 → Track 3
```

This syntax means that the Slide transfers between the two tracks along a suitable **external common tangent**.

First, note that the two tangent points of an external common tangent have the same angular position relative to their respective circle centers, because both radii are perpendicular to the same tangent line.

Therefore, once we calculate the angular position of the tangent point relative to the circle centers, the entire tangent segment is uniquely determined.

## Tracks 1~8

Because tracks `1~8` all have the same radius, calculating the tangent-point angles of their external common tangent is relatively simple.

We only need the perpendicular direction to the line connecting their centers.

For example, consider counterclockwise travel from track 8 to track 3.

Take the vector from the center of track 8 to the center of track 3:

$$
\overrightarrow{P_8P_3}
$$

For counterclockwise travel, simply rotate this vector **90° clockwise** and take its argument. This gives the angular position of the tangent point.

For clockwise travel, rotate the vector **90° counterclockwise** instead.

---

## Track 0 and Tracks 1~8

The transition between track 0 and tracks `1~8` is slightly more complicated because their radii are different.

First, identify the larger circle — in this case, one of tracks `1~8`.

Construct an auxiliary circle centered at the center of the larger circle, with a radius equal to the difference between the two track radii, as shown by the purple circle in the diagram.

Then apply the tangent-calculation procedure described earlier to find a tangent from the center of the smaller circle to this auxiliary circle.

The resulting tangent-point angle is the angular position of the tangent point of the external common tangent.

The appropriate tangent must then be selected according to the travel direction:

* For counterclockwise travel, use the tangent from the small circle toward the large circle in the counterclockwise direction.
* For clockwise travel, use the tangent from the large circle toward the small circle in the clockwise direction.

---

# 3.4. Track Transitions Involving Track 9

Transitions involving track `9`, the outermost track, are considerably more complicated.

First:

* Direct transitions between track `0` and track `9` are **forbidden**.
* Tracks `1~8` are internally contained by track `9`, so there is no common tangent between them.

Instead, an appropriate **common tangent circle** is used to perform the transition.

## Common Tangent Circle Parameters

The derivation of this auxiliary circle is rather complicated, so the resulting formulas are given directly here without explanation.

First, define:

$$
\gamma = 45^\circ
$$

This angle is defined as shown in the diagram. A value of `45°` provides a suitable result.

Then define:

$$
b = \frac{\cos22.5^\circ}{2}
$$

$$
a = 1-b
$$

$$
s =
\frac{a^2+b^2-2ab\cos\gamma}
{2a-2b\cos\gamma}
$$

$$
r = R(b+s)
$$

$$
\beta =
\arccos
\frac{s^2+b^2-(a-s)^2}
{2bs}
$$

where:

* $r$ is the radius of the common tangent circle used for the transition.
* $\beta$ is the angle shown in the diagram.

After that, the process is straightforward: simply travel along the current track until reaching the point labeled **A** or **B** in the diagram, and then follow the arc of the common tangent circle into the other track.
