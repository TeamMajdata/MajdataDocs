# Playability Design Tips

MajdataPlay now supports Slide Code, meaning charts using Slide Code can actually be played on a real cabinet. So, just as when making traditional custom charts, unless the chart is intended as a showcase from the start, the play experience must be considered when writing configurations.

First, let's discuss sight-reading difficulty. Since Slides written with Slide Code are generally shapes that players have never seen before — unless, as mentioned in [Appearance Design Tips](./appearance), there is a deliberate effort to "mimic" official Slide shapes — players will have significant sight-reading difficulty, simply put, they "can't understand it."

This aspect is actually quite similar to using Festival-era connected Slides. The more complex and "ahead of their time" the Slide shape, the more it should appear in a context with no other interference before and after, and with enough "defusal" time. Therefore, the long Slides using symmetry or various figure shapes described above are typically suitable for rest sections where long Slides can be placed — for pop songs this might be the bridge after the chorus, for electronic music a break after a drop, etc. Sections with relatively high note density are better suited to simple Slide Codes that resemble official shapes (or simply don't use Slide Code at all).

A special mention goes to Slides that "go around the same circle many times," such as `1P00000K8` below. These are actually very hard to read from a player's perspective, because it is difficult to directly see how many revolutions to make. So this shape is better suited for slow Slides, again giving the player time to "defuse."

![1P00000K8.png](./assets/1P00000K8.png)

Generally, going around the same circle more than about one and a half revolutions makes it difficult to judge the revolution count at a glance (and one and a half is already very long — Slides with long trajectories are inherently unsuitable for fast speeds).

Then there is the old topic of inner-screen impossibilities. This is something that needs to be considered whenever there are Slides, but nowadays you can write the chart and let DJAuto check it, so it won't be elaborated further.

In essence, for playability-related issues, if conditions permit, directly opening MajdataPlay and playing through it once is more useful than any advice. Without that, at least gesturing at a computer screen can solve 80% of problems. This is especially true for charts using a syntax with as much freedom as Slide Code (unless it is a showcase chart).
