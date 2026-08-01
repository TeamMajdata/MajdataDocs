# View settings

### Smooth slide animation

Controls how slide arrows disappear when Autoplay is set to `Enable` or **Mine Slide Auto-Advance** is on. Arrows can disappear in groups based on the judgment area or one by one.

### Auto mode

| Mode | Description |
| --- | --- |
| Enable | Every note receives a Critical Perfect judgment, as enforced by the program. |
| DJAuto (Btn) | Simulates play with the outer buttons. It may occasionally produce Perfect judgments and includes full impossible-pattern checking. |
| DJAuto | Simulates an inner-screen player. It works like `DJAuto (Btn)` but does not press the outer buttons. |
| Random | Looks similar to `Enable`, but assigns judgments randomly. |
| Disable | Simulates manual play. |

In simulated-play modes, you can control the game with the mouse or touch screen. The `WEDCXZAQ` keys control the outer buttons.

DJAuto can detect impossible outer-button patterns and determine suitable techniques for touch groups. It sweeps across oversized and full-screen touch notes, merges contact points for overlapping slides and touches along a slide path, and continues to gain more human-like behavior.

### Show AutoPlay hands

When enabled, red circles represent touch events, light-green circles represent the coverage calculated for touch notes, and cyan circles represent triggered judgment areas.

### Export frame rate

Do not set the frame rate below 60 fps when exporting simulated Autoplay. Lower frame rates affect judgment accuracy.

### Export quality

| Encoder | Rate-control mode | Low (0) | Medium (1) | High (2) | Ultra (3) |
| --- | --- | --- | --- | --- | --- |
| libx264 | CRF | 28 | 23 | 18 | 14 |
| h264_nvenc | CQ | 30 | 24 | 18 | 14 |
| h264_qsv | ICQ | 32 | 25 | 18 | 14 |
| h264_amf | QVBR | 30 | 24 | 18 | 14 |
| h264_mf | Bitrate (Mbps at 1080p60) | 4 | 8 | 16 | 32 |

### UI skin

Switch to `TrgUI` to use the side statistics interface designed by TRG.

### Global audio delay

This only changes the delay of `track` audio in preview mode. Because of differences between loading modes, the SFX delay is usually sufficient while the `track` delay is larger. A value of `0.03` works well on the author's computer, but the best value varies by device.

### Use the legacy star layer order

- **New order:** New slides appear beneath older slides.
- **Legacy order:** New slides appear above older slides.

### Mine Slide Auto-Advance

Mine slides are normally completed by the rolling log. If you finish the slide before the log reaches the end, the slide receives a Miss judgment. **Mine Slide Auto-Advance** handles this progression automatically. Autoplay in `Enable` mode is not affected.
