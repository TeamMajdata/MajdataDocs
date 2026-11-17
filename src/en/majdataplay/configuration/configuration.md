# Configuration reference

::: tip Two configuration files
Starting with **2.1.0-preview6**, the MajdataPlay configuration is split into two files:

- `settings.json`: **user settings**, containing `Game`, `Judge`, `Display`, `Volume` and `Touch`. When you sign in to an online account, this group may be read from and uploaded to the account instead.
- `system-settings.json`: **system settings**, containing `Common`, `Rendering`, `Audio`, `Encoding`, `Decoding`, `Debug`, `Network` and `IO`. This group describes the current device and always stays local.

This page explains every setting in both files and gives the default value of each one **when it is generated automatically on first run**. The single-file `settings.json` reference for versions before 2.1.0-preview6 is kept in the [legacy configuration reference](/en/majdataplay/configuration/legacy).
:::

::: warning
Make sure the game is <mark>fully closed</mark> before changing the configuration. Any file edited manually while the game is running will be overwritten the next time the game saves its settings. If you are not familiar with JSON, use an editor with syntax checking, such as [VSCode](https://code.visualstudio.com/).
:::

Before reading the tables below, note the following:

- **Default value** means the value built into the program (the initial value of each setting property in the code), which is the value generated on first run. The values in your file may differ from the tables below.
- Some items differ by platform and are marked **Windows**, **Desktop** or **Mobile** (Android / iOS) in their description. The tables below focus on the **Windows** version.
- Items marked <mark>Hidden</mark> do not appear in the in-game settings interface and can only be changed in the configuration file.
- Items marked <mark>Not written</mark> do not appear in the corresponding file.
- Enum values are written to JSON as strings, such as `"Modern"` or `"TrackSkip"`; booleans are written as `true` / `false`.
- A missing category or item uses its built-in default. When a file cannot be read, the game backs it up as `.bak` and regenerates it with defaults.

## File locations and upgrades

Both files are located in the same directory described in [Configuration file](/en/majdataplay/configuration/index). On the first launch of 2.1.0-preview6 or later:

- If `system-settings.json` does not exist, the game creates it; system settings from an older `settings.json` are migrated while reading it and removed from `settings.json` on the next save.
- If a setting in an older `settings.json` changed category (for example `Audio.Volume` became `Volume`, or `Display.RenderQuality` became `Rendering.RenderQuality`), the game moves it to the new location automatically. A current key wins over the legacy key with the same name.
- A legacy `machine_description.json` is imported into `Network.Online.Machine` and then renamed to `machine_description.json.bak`.

See [Upgrading from an older version](#upgrading-from-an-older-version) at the end of this page for the full migration rules.

## settings.json — user settings

| Section | Meaning | Contents |
| --- | --- | --- |
| `Game` | Game settings | Note speed, displayed information, retry / skip, random and mirror, and more |
| `Judge` | Judgment settings | Various offsets, judgment mode and judgment text display |
| `Display` | Display settings | Skin, center information, judgment text distances, scaling and sensor display |
| `Volume` | Volume settings | The volume of each track |
| `Touch` | Touch settings | Simulated touch radius and the judgment range of areas A–E |

## Game — game settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `TapSpeed` | Float | `7.5` | **Tap speed**, adjusts note speed. Step `0.25`, can be negative (notes fall in reverse) |
| `TouchSpeed` | Float | `7.5` | **Touch speed**, adjusts Touch note speed. Step `0.25` |
| `SlideFadeInOffset` | Float | `0.0` | **Slide fade-in offset**, adjusts Slide fade-in timing; increasing the value delays it. The step follows the [offset unit](#judge-enum-values) |
| `BackgroundDim` | Float | `0.8` | **Background dim**, the larger the value, the darker. Range `0`–`1`, step `0.05` |
| `SkipVideoDownload` | Boolean | `false` | **Skip video download**, does not download videos for online charts |
| `StarRotation` | Boolean | `true` | **Star rotation**, rotates the star head as it falls |
| `TrackSkip` | Boolean | `true` | **Skip track**, hold keys 2, 3, 6 and 7 to forcibly skip the track |
| `EnforceGameFailure` | Enum | `"Disabled"` | **Force track failure**, automatically skip or retry when the goal cannot be reached |
| `FastRetry` | Boolean | `true` | **Fast retry**, hold keys 3, 4, 5 and 6 to retry quickly |
| `FastPractice` | Boolean | `false` | **Fast practice**, hold keys 1, 2, 7 and 8 to enter practice mode (starts 5 seconds before the section, extends 10 seconds after) |
| `GameplaySubScreenClickBehavior` | Enum | `"TrackSkip"` | **Sub-screen click behavior during gameplay**, adjusts what clicking the sub-screen does while playing. Defaults to `"TrackSkip_1_Sec_Delay"` on mobile |
| `Mirror` | Enum | `"Off"` | **Mirror**, flips the chart horizontally / vertically |
| `Rotation` | Integer | `0` | **Rotation**, rotates the chart by an angle; a positive value is clockwise. Range `-7`–`7`, step `1` |
| `SlideSkipping` | Boolean | `true` | **Slide skipping**, enables / disables the Slide skip mechanism |
| `Random` | Enum | `"Disabled"` | **Random**, shuffles notes randomly |
| `ButtonRingForTouch` | Boolean | `false` | **Inner screen only experience**, allows using the button ring to play Slides and Touches. Defaults to `true` on mobile |
| `LeadInTime` | Integer | `1` | **Lead-in time**, the number of seconds to wait after entering the gameplay screen before the game actually starts. Range `1`–`5`, step `1` |
| `ManualStartGame` | Boolean | `false` | **Manual start**, press a key to start after loading (used for competitions) |
| `NoteAppearRate` | Float | `0.265` | **Note fade-in offset**, adjusts the note fade-in effect. Step `0.001` |

### Game enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `EnforceGameFailure` | `Disabled` | Off |
| | `TrackSkip_S` / `Retry_S` | Skip track / S, retry / S |
| | `TrackSkip_SS` / `Retry_SS` | Skip track / SS, retry / SS |
| | `TrackSkip_SSS` / `Retry_SSS` | Skip track / SSS, retry / SSS |
| | `TrackSkip_SSSPlus` / `Retry_SSSPlus` | Skip track / SSS+, retry / SSS+ |
| | `TrackSkip_Best` / `Retry_Best` | Skip track / best score, retry / best score |
| | `TrackSkip_FC` / `Retry_FC` | Skip track / FC, retry / FC |
| | `TrackSkip_AP` / `Retry_AP` | Skip track / AP, retry / AP |
| `GameplaySubScreenClickBehavior` | `None` | None |
| | `TrackSkip` | Skip track |
| | `TrackSkip_1_Sec_Delay` | Skip track (hold for 1 second) |
| | `FastRetry` | Fast retry |
| | `FastRetry_1_Sec_Delay` | Fast retry (hold for 1 second) |
| `Mirror` | `Off` | Off |
| | `LRMirror` | Left-right mirror |
| | `UDMirror` | Up-down mirror |
| `Random` | `Disabled` | Disabled |
| | `RANDOM` | Random by track |
| | `S_RANDOM` | Random for each note independently |

## Judge — judgment settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `AudioOffset` | Float | `0.0` | **Audio offset (A judgment)**, play by ear. Adjust when notes are out of sync with the music. If you get mostly Fast, decrease the value; if you get mostly Late, increase it. This item moves the answer sound, equivalent to `&first` in a chart |
| `JudgeOffset` | Float | `0.0` | **Judgment offset (B judgment)**, play by sight, compensates for device input latency. If you get mostly Fast, decrease the value; if you get mostly Late, increase it |
| `AnswerOffset` | Float | `0.0` | **Answer sound offset**, adjusts when the answer sound plays (does not affect judgment). Decrease the value to play it earlier, increase it to play it later. Do not change this unless you are sure |
| `TouchPanelOffset` | Float | `0.0` | **Inner screen input offset**, compensates for touch input latency. If you get mostly Fast, decrease the value; if you get mostly Late, increase it |
| `EnableJudgeTimingGauge` | Boolean | `false` | **Show judgment timing indicator**, shows the real-time judgment offset and the average judgment position |
| `OffsetUnit` | Enum | `"Frame"` | **Offset unit**, adjusts the unit of the various offsets |
| `Mode` | Enum | `"Modern"` | **Judgment mode**, selects the game's judgment and scoring mode (old frame / new frame) |
| `DisplayCriticalPerfect` | Boolean | `false` | **Show Critical judgments**, shows Critical judgments |
| `DisplayBreakScore` | Boolean | `true` | **Show Break score**, shows the detailed score of Break notes |
| `FastLateType` | Enum | `"Disable"` | **Fast / Late display level**, sets the condition for showing a note's Fast / Late. The text is only shown below this level |
| `NoteJudgeType` | Enum | `"All"` | **Note judgment display level**, sets the condition for showing Note judgments. The text is only shown below this level |
| `TouchJudgeType` | Enum | `"All"` | **Touch judgment display level**, sets the condition for showing Touch judgments. The text is only shown below this level |
| `SlideJudgeType` | Enum | `"All"` | **Slide judgment display level**, sets the condition for showing Slide judgments. The text is only shown below this level |
| `BreakJudgeType` | Enum | `"All"` | **Break judgment display level**, sets the condition for showing Break judgments. The text is only shown below this level |
| `BreakFastLateType` | Enum | `"Disable"` | **Break Fast / Late display level**, sets the condition for showing a Break's Fast / Late. The text is only shown below this level |
| `SlideSortOrder` | Enum | `"Modern"` | **Slide sort order**, Slide ordering: with Classic, older notes are on the bottom; with Modern, older notes are on top (affects star coloring) |
| `OuterJudgeDistance` | Float | `1.0` | **Outer judgment display distance**, adjusts the display distance of outer judgment text (the smaller, the closer to the center). Range `0`–`1`, step `0.05`, `0` disables it |
| `InnerJudgeDistance` | Float | `1.0` | **Inner judgment display distance**, adjusts the display distance of Touch judgment text (the smaller, the closer to the center). Range `0`–`1`, step `0.05`, `0` disables it |
| `DisplayHoldHeadJudgeResult` | Boolean | `false` | **Show Hold head judgment**, shows the judgment result of the Hold head |

::: tip Offset steps
The step of `AudioOffset`, `JudgeOffset`, `AnswerOffset`, `TouchPanelOffset`, `SlideFadeInOffset` and `Debug.DisplayOffset` follows `OffsetUnit`: `0.001` for `"Second"` and `0.1` for `"Frame"`. The setting UI aligns these values to the current unit; when you edit JSON directly, you may write any value.
:::

### Judge enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `OffsetUnit` | `Second` | Second |
| | `Frame` | Frame |
| `Mode` | `Classic` | Classic (old frame) |
| | `Modern` | Modern (new frame) |
| `SlideSortOrder` | `Classic` | Classic order (older notes on the bottom) |
| | `Modern` | Modern order (older notes on top) |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | All |
| | `BelowCP` | Below Critical |
| | `BelowP` | Below Perfect |
| | `BelowGR` | Below Great |
| | `MissOnly` | Miss only |
| | `Disable` | Disabled |

## Display — display settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Language` | String | `""` | **Language**. Empty by default in the source code; after the first run the program writes the current language, in the form `"zh-CN - Majdata"` |
| `Skin` | String | `"default"` | **Note skin**, changes the note skin. If the configured skin does not exist, the program falls back to the first available skin |
| `BGInfo` | Enum | `"Combo"` | **Center display**, adjusts the information shown in the center of the screen |
| `SecondaryBGInfo` | Enum | `"None"` | **Additional info display**, adjusts the information shown in the lower middle of the screen |
| `SubScreenBGInfo` | Enum | `"Achievement"` | **Sub-screen info display**, adjusts the information shown on the sub-screen |
| `TopInfo` | Enum | `"None"` | **Outer frame display**, the information shown at the top (between keys 1 and 8) |
| `TapScale` | Float | `1.0` | **Tap scale**, adjusts the size of Tap notes. Range `0`–`2`, step `0.01` |
| `HoldScale` | Float | `1.0` | **Hold scale**, adjusts the size of Hold notes. Range `0`–`2`, step `0.01` |
| `TouchScale` | Float | `1.0` | **Touch scale**, adjusts the size of Touch notes. Range `0`–`2`, step `0.01` |
| `SlideScale` | Float | `1.0` | **Slide scale**, adjusts the size of Slide notes (does not affect Wifi Slide). Range `0`–`2`, step `0.01` |
| `SlidePathStyle` | Enum | `"Classic"` | **Connection slide arrow style**, how the arrows of a connection slide (such as `1-4q7`) are arranged |
| `TouchFeedback` | Enum | `"Outer_Only"` | **Touch feedback**, sets the condition for showing touch feedback |
| `DisplaySensor` | Boolean | `false` | **Show sensors**, highlights the touch areas that are being triggered |
| `SensorPosition` | Enum | `"MainScreen"` | **Sensor display position**, selects where the sensor areas are shown |
| `SensorStyle` | Enum | `"RedGreen"` | **Sensor display style**, selects how the sensor areas are shown |
| `SensorOpacity` | Integer | `20` | **Sensor opacity**, adjusts the display strength. Range `10`–`90`, step `10` |

### Display enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `BGInfo` / `SecondaryBGInfo` / `SubScreenBGInfo` | `CPCombo` | Critical Perfect Combo |
| | `PCombo` | Perfect Combo |
| | `Combo` | Combo |
| | `Achievement_101` | Achievement (101-) |
| | `Achievement_100` | Achievement (100-) |
| | `Achievement` | Achievement |
| | `AchievementClassical` | FiNALE achievement |
| | `AchievementClassical_100` | FiNALE achievement (100-) |
| | `DXScore` | DX score |
| | `DXScoreRank` | DX score rank |
| | `S_Border` | Distance to S |
| | `SS_Border` | Distance to SS |
| | `SSS_Border` | Distance to SSS |
| | `MyBest` | Distance to best score |
| | `Diff` | Judgment error |
| | `None` | None |
| `TopInfo` | `None` | Not shown |
| | `Judge` | Judgment result |
| | `Timing` | Fast / Late |
| `SlidePathStyle` | `Classic` | Each segment overlaps the standalone slide exactly; there is a gap where two arcs meet |
| | `Medium` | Like `Classic`, but an arrow fills the gap where two arcs meet |
| | `Perfect` | The arrows continue along the whole connection slide |
| `TouchFeedback` | `All` | All |
| | `Outer_Only` | Outer only |
| | `Inner_Only` | Inner only |
| | `Disable` | Disabled |
| `SensorPosition` | `MainScreen` | Main screen |
| | `SubScreen` | Sub-screen |
| `SensorStyle` | `Brightness` | Brightness |
| | `RedGreen` | Red-green |
| | `Classic` | Classic |

## Volume — volume settings

All items have a range of `0`–`2` with a step of `0.05`.

| Item | Default value | Meaning |
| --- | --- | --- |
| `Global` | `0.3` | **Global**, adjusts the master volume |
| `BGM` | `1.0` | **Background music**, adjusts the volume of background music outside gameplay (song select, results) |
| `Track` | `1.0` | **Chart music**, adjusts the volume of in-game music |
| `Answer` | `0.8` | **Answer sound**, adjusts the volume of the answer sound and the opening metronome |
| `Tap` | `0.3` | **Tap / Hold judgment sound**, adjusts the judgment volume of Tap / Hold |
| `Ex` | `0.3` | **Ex judgment sound**, adjusts the judgment volume of Ex notes |
| `Break` | `0.3` | **Break judgment sound**, adjusts the judgment volume of Break notes |
| `Slide` | `0.3` | **Slide judgment sound**, adjusts the volume of Slide sound effects |
| `Touch` | `0.3` | **Touch judgment sound**, adjusts the judgment volume of Touch / TouchHold |
| `Hanabi` | `0.3` | **Hanabi sound effect**, adjusts the volume of the Touch firework sound effect |
| `Voice` | `1.0` | **Xiaoxiao Lanbai**, adjusts the volume of the assistant voice |

::: tip
Older versions stored the volumes under `Audio.Volume`. In the new version, `Volume` is a top-level category; old values are migrated automatically at startup. The volume menu in the setting UI also corresponds to this category.
:::

## Touch — touch settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `TouchSimulationRadius` | Float | `0.5` | **Simulated touch radius**, the size of the simulated touch point; the larger the value, the larger the finger judgment area (only takes effect during gameplay). Range `0`–`2`, step `0.05` |
| `TouchAAreaExtraRadius` | Float | `0.0` | **Simulated touch area A radius**, expands the trigger radius of touch area A. Range `0`–`2`, step `0.05` |
| `TouchBAreaExtraRadius` | Float | `0.0` | **Simulated touch area B radius**, expands the trigger radius of touch area B. Range `0`–`2`, step `0.05` |
| `TouchCAreaExtraRadius` | Float | `0.25` | **Simulated touch area C radius**, expands the trigger radius of touch area C. Range `0`–`2`, step `0.05` |
| `TouchDAreaExtraRadius` | Float | `0.2` | **Simulated touch area D radius**, expands the trigger radius of touch area D. Range `0`–`2`, step `0.05` |
| `TouchEAreaExtraRadius` | Float | `0.1` | **Simulated touch area E radius**, expands the trigger radius of touch area E. Range `0`–`2`, step `0.05` |
| `TouchRadiusAdjust` | Float | `0.0` | **Touch area ratio**, adjusts the touch trigger range according to the finger contact area; `0` disables it. Range `0`–`2`, step `0.05` |

## system-settings.json — system settings

| Section | Meaning | Contents |
| --- | --- | --- |
| `Common` | Common settings | Record mode, menu repeat speed, cursor, Note folding and DJAuto policy |
| `Rendering` | Rendering settings | Quality presets, frame rate, vertical sync, UI style and screen layout |
| `Audio` | Audio settings | Audio backend, buffers and channel volume. Hidden in the setting UI |
| `Encoding` | Encoding settings | Recording encoder options, shown when the record mode is `FFmpeg` |
| `Decoding` | Decoding settings | Video decoder and read timeout |
| `Debug` | Debug | Frame offset, object pool capacities and log level |
| `Network` | Networking | Online account, API endpoints and proxy. Hidden in the setting UI |
| `IO` | Input / output devices | Arcade controller, touch panel and LED. Hidden in the setting UI |
| `Mod` | Mod | <mark>Not written</mark>, applies only to the current chart |

## Common — common settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `RecordMode` | Enum | `"Disable"` | **Record mode**, selects how recording is triggered. The [Encoding](#encoding-—-encoding-settings) menu is only shown when this is `"FFmpeg"` |
| `MenuOptionIterationSpeed` | Integer | `45` | **Menu option repeat speed** <mark>Hidden</mark>, the larger the value, the faster the scrolling. `0` is treated as `15` |
| `HideCursorInGame` | Boolean | `true` | **Hide cursor during gameplay** <mark>Hidden</mark>, available on desktop only |
| `NoteFolding` | Boolean | `true` | **Note folding** <mark>Hidden</mark>, folds the note display. Not written on iOS |
| `DJAutoPolicy` | Enum | `"Strict"` | **DJAuto policy**, Strict: only one of keys or touch may be used. Permissive: the two may be mixed |

### Common enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `RecordMode` | `Disable` | Disabled |
| | `OBSTrigger` | Connect to the OBS WebSocket to trigger recording automatically. Not selectable on mobile |
| | `FFmpeg` | Record with the built-in FFmpeg encoder |
| `DJAutoPolicy` | `Strict` | Strict |
| | `Permissive` | Permissive |

## Rendering — rendering settings

`Rendering` offers five quality presets. `"EnergySaving"`, `"Performance"`, `"Beautiful"` and `"Refined"` write a fixed set of parameters; only `"Custom"` shows and allows changing the anti-aliasing, texture quality, UI style, output mode and render scale below. Switching back to a named preset overwrites those custom parameters.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `RenderQuality` | Enum | `"Beautiful"` | **Render quality**, controls the global rendering quality. Hidden while compatibility mode is on |
| `FPSLimit` | Integer | `120` | **Frame rate limit**, limits the maximum frame rate. Minimum `-1` (`-1` means unlimited), step `1` |
| `VSync` | Boolean | `true` | **Vertical sync**, whether to enable vertical sync. Hidden in the setting UI on mobile |
| `VulkanLowLatencyVSync` | Boolean | `true` | **Low-latency vertical sync** <mark>Hidden</mark>, only takes effect on Windows. Not written on mobile |
| `VulkanLowLatencyVSyncBackend` | Enum | `"Timer"` | **Low-latency vertical sync backend** <mark>Hidden</mark>, desktop only. Not written on mobile |
| `AntiAliasing` | Enum | `"Disabled"` | **Anti-aliasing**, controls anti-aliasing quality. Shown only for `"Custom"` with compatibility mode off |
| `TextureQuality` | Enum | `"High"` | **Texture quality**, controls the display quality of UI, cover and skin images. Shown only for `"Custom"` with compatibility mode off |
| `UIOutlineMode` | Enum | `"All"` | **UI style**, controls how UI images are rendered. Shown only for `"Custom"` with compatibility mode off |
| `UIBackdropStyle` | Enum | `"GaussianBlur"` | **Backdrop style**, selects the effect used by the Refined quality. Shown only for `"Refined"` |
| `OutputMode` | Enum | `"Direct"` | **Graphics output mode**, selects how the picture is output. Try compatibility output when the screen is black. Shown only for `"Custom"` with compatibility mode off |
| `CompatibilityMode` | Boolean | `false` | **Graphics compatibility mode**, enable this when the screen is black or stuttering |
| `SystemResolutionScaling` | Integer | `100` | **System resolution scaling (experimental)**, adjusts the system display resolution. Range `10`–`100`, step `5`. Shown only for `"Custom"` with compatibility mode off |
| `RenderScale` | Integer | `100` | **Render scale**, adjusts the internal render resolution. `100` is the native resolution; lowering it reduces GPU load, but the image and text become blurry. It does not change the layout or judgment. Range `10`–`200`, step `5`. Any value other than `100` forces `"Intermediate"` output. Shown only for `"Custom"` with compatibility mode off |
| `DisplayRuntimeInfo` | Boolean | `true` | **Show frame rate and version**, shows the frame rate and version in the upper right corner |
| `Resolution` | String | `"1080x1920"` | **Resolution** <mark>Hidden</mark>, desktop only |
| `FullScreen` | Boolean | `true` | **Force full screen** <mark>Hidden</mark>, desktop only |
| `Topmost` | Boolean | `false` | **Always on top** <mark>Hidden</mark>, keeps the window on top. Desktop only |
| `MainScreenTransform` | Boolean | `false` | **Custom screen aspect ratio**, customizes the scale and position of the main screen. Defaults to `true` on mobile |
| `MainScreenScale` | Float | `1.0` | **Main screen scale**, adjusts the overall size of the main screen. Range `0.05`–`1.5`, step `0.01` |
| `MainScreenOffset` | Float | `1.0` | **Main screen position offset**, fine-tunes the position of the main screen. Range `-1`–`1`, step `0.01` |
| `MainScreenCachedScreenCenterY` | Float | `960.0` | **Main screen center Y (cached)** <mark>Hidden</mark>, the cached vertical center coordinate of the main screen |
| `SubDisplayOffset` | Float | `0.0` | **Sub-screen position offset**, fine-tunes the position of the sub-display area. Range `-5`–`5`, step `0.01` |
| `SubDisplayScale` | Float | `1.0` | **Sub-screen scale**, adjusts the size of the sub-display area. Step `0.01` |
| `GameplayScreenRotationAngle` | Enum | `"Zero"` | **Gameplay screen rotation**, rotates the gameplay screen |

`SystemScalingStatus`, `DisplayBufferResolution`, `SceneRenderResolution` and `CurrentOutputPath` are read-only diagnostics. They are not written to JSON and cannot be changed.

### Rendering enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `RenderQuality` | `EnergySaving` | Energy saving |
| | `Performance` | Performance |
| | `Beautiful` | Beautiful (default) |
| | `Refined` | Refined |
| | `Custom` | Custom |
| `AntiAliasing` | `Disabled` | Disabled |
| | `MSAA2x` | MSAA 2× |
| | `MSAA4x` | MSAA 4× |
| | `MSAA8x` | MSAA 8× |
| `TextureQuality` | `Low` | Low |
| | `Medium` | Medium |
| | `High` | High |
| `UIOutlineMode` | `None` | Opaque |
| | `Performance` | Mixed transparency |
| | `All` | Semi-transparent |
| | `GaussianBlur` | Gaussian blur |
| | `LiquidGlass` | Liquid glass |
| `UIBackdropStyle` | `GaussianBlur` | Gaussian blur |
| | `LiquidGlass` | Liquid glass |
| `OutputMode` | `Direct` | Direct output |
| | `Intermediate` | Compatibility output |
| `VulkanLowLatencyVSyncBackend` | `Auto` | Automatically use the available backend |
| | `PresentWait` | Use present wait, falling back to the timer |
| | `Timer` | Always use the timer |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |

## Audio — audio settings

This section is <mark>Hidden</mark> in the setting UI but still applies. The volumes have moved to the [Volume](#volume-—-volume-settings) category in `settings.json`.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `ForceMono` | Boolean | `false` | **Force mono**, mixes the audio down to a mono output |
| `Wasapi` | Object | See below | **WASAPI settings**, only present on Windows |
| `Asio` | Object | See below | **ASIO settings**, only present on Windows |
| `Channel` | Object | See below | **Channel volume**, only present on desktop |
| `Bass` | Object | See below | **BASS audio buffer settings**, present on all platforms |
| `Backend` | Enum | `"Wasapi"` | **Audio backend**. Defaults to `"Wasapi"` on desktop and `"BassSimple"` on mobile |

### Audio.Wasapi — WASAPI settings (Windows only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `Exclusive` | `true` | **Exclusive mode**, takes exclusive control of the audio device. Only when this is off can other programs such as OBS record / play audio at the same time |
| `RawMode` | `true` | **Raw mode**, uses raw data that has not been processed by the system mixer |
| `AsyncMode` | `true` | **Asynchronous mode**, uses asynchronous audio processing. Missing in some older configurations, where it is treated as `true` |
| `BufferSize` | `0.02` | **Buffer size**, in seconds |
| `Period` | `0.005` | **Period**, in seconds |

### Audio.Asio — ASIO settings (Windows only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `DeviceIndex` | `0` | **Device index**, the ASIO device number |
| `SampleRate` | `44100` | **Sample rate**, the audio sample rate (Hz) |

### Audio.Channel — channel volume (desktop only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **Front channel** (LF / RF) volume |
| `CenterAndLFEVolume` | `1.0` | **Center and LFE channel** (Center / LFE) volume |
| `SideVolume` | `1.0` | **Side channel** (LS / RS) volume |
| `RearVolume` | `1.0` | **Rear channel** (LR / RR) volume |

### Audio.Bass — BASS buffer settings

| Item | Default value | Meaning |
| --- | --- | --- |
| `BufferLengthMs` | `1000` | **Buffer length**, in milliseconds |
| `UpdatePeriodMs` | `200` | **Update period**, in milliseconds |
| `DeviceBufferLengthMs` | `64` | **Device buffer length**, in milliseconds. Defaults to `32` on mobile |
| `DeviceUpdatePeriodMs` | `16` | **Device update period**, in milliseconds. Defaults to `8` on mobile |
| `EnableAAudio` | `true` | **Enable AAudio**, only present on Android |

### Audio enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `Backend` | `Unity` | Unity built-in audio |
| | `Wasapi` | WASAPI (Windows) |
| | `Asio` | ASIO (low latency for professional sound cards) |
| | `BassSimple` | BASS simplified backend (default on mobile) |

## Encoding — encoding settings

This menu is only shown when `Common.RecordMode` is `"FFmpeg"`.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `PreferredEncoder` | Enum | `"Hardware"` | **Preferred encoder**, prefers this encoder for encoding when available |
| `EncodingFormat` | Enum | `"H264"` | **Encoding format**, the codec used when recording |
| `FrameRate` | Integer | `60` | **Frame rate**, the recording frame rate. Range `30`–`240`, step `30` |
| `RateControlMode` | Enum | `"VBR"` | **Rate control**, selects constant or variable bitrate control |
| `BitRate` | Integer | `4000000` | **Bitrate**, the base bitrate when recording. Minimum `100000`, step `50000` |
| `MaximumBitRate` | Integer | `8000000` | **Maximum bitrate**, the maximum bitrate in VBR mode. Shown only for `"VBR"`. Minimum `100000`, step `50000` |
| `ResolutionScale` | Float | `1.0` | **Resolution scale**, the actual resolution multiplier of the recording. Range `0.25`–`1`, step `0.25` |
| `ContainerFormat` | Enum | `"MP4"` | **Container format** <mark>Hidden</mark> |

### Encoding enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `PreferredEncoder` | `Software` | Software encoding |
| | `Hardware` | Hardware encoding |
| `EncodingFormat` | `H264` | H.264 / AVC |
| | `HEVC` | H.265 / HEVC |
| | `VP9` | VP9 |
| | `AV1` | AV1 |
| | `MPEG4` | MPEG-4 Part 2 |
| `RateControlMode` | `CBR` | Constant bitrate |
| | `VBR` | Variable bitrate |
| `ContainerFormat` | `MP4` | MP4 |
| | `Matroska` | Matroska (MKV) |

## Decoding — decoding settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `PreferredDecoder` | Enum | `"Hardware"` | **Preferred decoder**, prefers this decoder for decoding when available |
| `IOTimeoutSeconds` | Integer | `15` | **I/O timeout**, the read timeout of the video player in seconds. Minimum `1` |

### Decoding enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `PreferredDecoder` | `Software` | Software decoding |
| | `Hardware` | Hardware decoding |

## Debug — debug

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `DisplayOffset` | Float | `0.0` | **Frame offset**, compensates for frame latency. Minimum `0`; the step follows the offset unit. Do not change this unless you are sure |
| `MaxQueuedFrames` | Integer | `2` | **Maximum queued frames** <mark>Hidden</mark>, the maximum number of frames allowed to wait in the queue to be processed. Not written on mobile |
| `FrameTimingDiagnostics` | Boolean | `false` | **Frame timing diagnostics** <mark>Hidden</mark>, writes frame timing diagnostics |
| `TapPoolCapacity` | Integer | `96` | **Tap object pool capacity** <mark>Hidden</mark>, defaults to `48` on mobile |
| `HoldPoolCapacity` | Integer | `96` | **Hold object pool capacity** <mark>Hidden</mark>, defaults to `48` on mobile |
| `TouchPoolCapacity` | Integer | `64` | **Touch object pool capacity** <mark>Hidden</mark> |
| `TouchHoldPoolCapacity` | Integer | `64` | **TouchHold object pool capacity** <mark>Hidden</mark> |
| `EachLinePoolCapacity` | Integer | `48` | **Object pool capacity per track** <mark>Hidden</mark>, defaults to `24` on mobile |
| `DebugLevel` | Enum | `"Info"` | **Log level** <mark>Hidden</mark>, the minimum level of the logs that are output. Not written on iOS |

### Debug enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `DebugLevel` | `Debug` | Debug |
| | `Info` | Info |
| | `Warning` | Warning |
| | `Error` | Error |
| | `Fatal` | Fatal |

## Network — networking

This section is <mark>Hidden</mark> in the in-game settings interface. On iOS, the corresponding settings are located in the system **Settings** app. To submit scores to leaderboards / save records, or to play online charts directly in the game, read [Online services](/en/majdataplay/configuration/online) first.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Online` | Object | See below | **Online services** |
| `Proxy` | Object | See below | **Proxy** |

### Network.Online

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `false` | **Enable networking**, whether to enable online features. Not written on iOS |
| `ApiEndpoints` | Array | See below | **API endpoint list**, multiple servers can be configured |
| `Machine` | Object | See below | **Machine description**, used for machine registration and QR code authentication |

`ApiEndpoints` contains one `MajdataNET` entry by default (empty on iOS):

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Name` | String | `"MajdataNET"` | **Name**, the display name of the endpoint |
| `Url` | String | `"https://majdata.net/api3/api/"` | **API address**, the server's API root address |
| `Username` | String | `"YourUsername"` | **Username**, the prefilled account |
| `Password` | String | `"YourPassword"` | **Password**, the prefilled password |
| `AutoLogin` | Boolean | `false` | **Auto login**, signs in automatically at startup |

Defaults of `Machine`:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Name` | String | `"MajdataPlay Client"` | **Machine name** |
| `Description` | String | `"MajdataPlay Client QR Code Authentication"` | **Machine description** |

### Network.Proxy

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `true` | **Use proxy** |
| `Url` | String | `""` | **Proxy address** |

::: tip
Older versions stored the online settings under the `Online` category and used the `UseProxy` / `Proxy` keys. The new version migrates them to `Network.Online` and `Network.Proxy`. A legacy standalone `machine_description.json` is also imported into `Network.Online.Machine`.
:::

## IO — input / output devices

This section is <mark>Hidden</mark> in the in-game settings interface and is mainly used for external arcade controllers and LEDs. See [External devices](/en/majdataplay/configuration/external_device) for details.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Manufacturer` | Enum / `null` | `null` | **Device manufacturer**, `null` means auto-detect. Desktop only |
| `Player` | Integer | `1` | **Player number**, the gamepad player index. Desktop only |
| `InputDevice` | Object | See below | **Input device** |
| `OutputDevice` | Object | See below | **Output device**. Desktop only |

### IO.InputDevice

Desktop:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `ButtonRing` | Object | See below | **Button ring (arcade controller buttons)** |
| `TouchPanel` | Object | See below | **Touch panel** |

Mobile:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `ExternalButtonRing` | Enum | `"None"` | **External button ring**, `"None"` none / `"Keyboard"` keyboard / `"Gamepad"` gamepad |

### IO.InputDevice.ButtonRing

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `true` | **Enable**, whether to enable button ring input |
| `Type` | Enum / `null` | `null` | **Device type**, `null` automatic; can be `"Keyboard"` keyboard / `"HID"` HID device / `"Pipe"` external IO manager |
| `Debounce` | Boolean | `false` | **Enable debounce**, whether to enable key debounce |
| `PollingRateMs` | Integer | `0` | **Polling interval**, in milliseconds; `0` means unlimited |
| `DebounceThresholdMs` | Integer | `0` | **Debounce threshold**, in milliseconds |
| `HidOptions` | Object | See below | **HID device parameters** |

### IO.InputDevice.TouchPanel

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `true` | **Enable**, whether to enable touch panel input |
| `Debounce` | Boolean | `false` | **Enable debounce**, whether to enable touch debounce |
| `Sensitivities` | Object | `A`–`E` all `0` | **Sensitivity**, the touch sensitivity of areas A–E |
| `PollingRateMs` | Integer | `0` | **Polling interval**, in milliseconds |
| `DebounceThresholdMs` | Integer | `0` | **Debounce threshold**, in milliseconds |
| `SerialPortOptions` | Object | See below | **Serial port parameters** |
| `UsbOptions` | Object | See below | **USB device parameters** |
| `CapacitivePanelOptions` | Object | See below | **Capacitive touch panel parameters** |

### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `TouchRadius` | Integer | `30` | **Touch radius**, the capacitive touch judgment radius |
| `RadiusOffset` | Object | `A:0` `B:20` `C:0` `D:0` `E:25` | **Radius offset**, fine-tunes the radius of areas A–E |

### IO.OutputDevice.Led

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `true` | **Enable**, whether to enable LED output |
| `Brightness` | Float | `1.0` | **Brightness**, the LED brightness |
| `RefreshRateMs` | Integer | `16` | **Refresh interval**, in milliseconds |
| `Throttler` | Boolean | `true` | **Throttler**, limits the LED refresh rate |
| `SerialPortOptions` | Object | See below | **Serial port parameters** |
| `HidOptions` | Object | See below | **HID device parameters** |

### IO common parameters

`HidOptions` and `UsbOptions` have the same structure:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `DeviceName` | String / `null` | `null` | **Device name**, specifies the device name (leave empty to match automatically) |
| `ProductId` | Integer / `null` | `null` | **Product ID (PID)** |
| `VendorId` | Integer / `null` | `null` | **Vendor ID (VID)** |
| `Exclusice` | Boolean | `false` | **Exclusive mode**. The field name is spelled `Exclusice` in the configuration file |

`SerialPortOptions`:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Port` | Integer / String / `null` | `null` | **Serial port**. An integer on Windows, a string on other platforms |
| `BaudRate` | Integer / `null` | `null` | **Baud rate** |

`HidOptions` additionally contains:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `OpenPriority` | Enum | `"VeryHigh"` | **Open priority** |

### IO enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `Manufacturer` | `General` | General |
| | `Yuan` | Yuan controller |
| | `Dao` | Dao controller |
| | `Nov` | Nov controller |
| | `NPro` | NPro controller |
| | `Pipe` | [External IO manager](/en/majdataplay/development/external-io-manager) |
| | `null` | Auto-detect |
| `ButtonRing.Type` | `Keyboard` | Keyboard |
| | `HID` | HID device |
| | `Pipe` | External IO manager |
| | `null` | Automatic |
| `ExternalButtonRing` | `None` | None |
| | `Keyboard` | Keyboard |
| | `Gamepad` | Gamepad |
| `OpenPriority` | `Idle` | Lowest |
| | `VeryLow` | Very low |
| | `Low` | Low |
| | `Normal` | Normal |
| | `High` | High |
| | `VeryHigh` | Highest |

## Appendix: Mod (not written to the configuration file)

`Mod` does **not** appear in `system-settings.json`; its values only take effect while playing the current chart (per-chart Mod settings are stored in the chart file). The defaults are listed here for reference.

| Item | Default value | Meaning |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **Playback speed**, adjusts the game speed multiplier. Step `0.05` |
| `AutoPlay` | `"Disable"` | **Auto play**, Xiaoxiao Lanbai plays for you. Can be `Disable` disabled / `Enable` enabled / `DJAuto_ButtonRing_First` DJAuto (buttons first) / `DJAuto_TouchPanel_First` DJAuto (inner screen first) |
| `JudgeStyle` | `"DEFAULT"` | **Judgment style**, challenge yourself with stricter judgment. Can be `DEFAULT` / `MAJI` / `GACHI` / `GORI` |
| `SubdivideSlideJudgeGrade` | `false` | **Subdivide Slide judgment grades**, allows Slides to receive a small Perfect judgment |
| `AllBreak` | `false` | **All Break**, turns every note into a Break |
| `AllEx` | `false` | **All Ex**, turns every note into an Ex |
| `AllTouch` | `false` | **All Touch**, turns every note into a Touch |
| `SlideNoHead` | `false` | **Headless stars**, removes Slide heads |
| `SlideNoTrack` | `false` | **No Slide track**, removes Slide paths |
| `NoteMask` | `"Disable"` | **Note mask**, a masking cover for notes. Can be `Disable` / `Outer` / `Inner` |

::: tip
In the new version, `ButtonRingForTouch` is a persisted gameplay setting. It has moved to `Game.ButtonRingForTouch` in `settings.json` and is no longer part of Mod.
:::

## Upgrading from an older version

The first launch of 2.1.0-preview6 reads an older `settings.json` and migrates it automatically, so there is no need to split the file by hand. The main changes are:

- The `Rendering`, `Audio`, `Encoding`, `Decoding`, `Debug`, `Online` and `IO` categories move from `settings.json` to `system-settings.json`.
- `Audio.Volume` moves to `Volume` in `settings.json`.
- `RenderQuality`, `RenderScale`, `FPSLimit` and `VSync` move from `Display` to `Rendering`.
- `Resolution`, `MainScreen*`, `SubDisplay*`, `GameplayScreenRotationAngle` and `Topmost` move from `Display` to `Rendering`.
- `DisplayRuntimeInfo` and `FullScreen` move from `Debug` to `Rendering`; `MenuOptionIterationSpeed`, `HideCursorInGame`, `NoteFolding` and `DJAutoPolicy` move to `Common`; the sensor display settings move to `Display`; the simulated touch settings move to `Touch`.
- The judgment display settings of `Display` move to `Judge`; the displayed-information settings of `Game` such as `BGInfo` move to `Display`, `EnableJudgeTimingGauge` moves to `Judge`, `NoteAppearRate` moves to `Game`, and `SkipVideoDownload` moves from `Display` to `Game`; `Game.RecordMode` moves to `Common.RecordMode`.
- The `Online` category becomes `Network.Online`, the proxy becomes `Network.Proxy`, and `IO.InputDevice.Player` moves to `IO.Player`.
- `machine_description.json` is imported into `Network.Online.Machine` and renamed to `machine_description.json.bak`.

The migration keeps keys already present in the new files and only fills in missing ones from the old keys. A file that cannot be read is backed up as `.bak` and defaults are used. After the next save, both files contain only the current layout.
