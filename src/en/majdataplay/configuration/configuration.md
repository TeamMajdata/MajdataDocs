# Configuration reference

::: tip
This page explains every setting in the [configuration file](/en/majdataplay/configuration/index) `settings.json` item by item, and gives the default value of each one **when it is generated automatically on first run**.
:::


::: warning
Make sure the game is <mark>fully closed</mark> before changing the configuration. Any file edited manually while the game is running will be overwritten the next time the game saves its settings. If you are not familiar with JSON, use an editor with syntax checking, such as [VSCode](https://code.visualstudio.com/).
:::

Before reading the tables below, note the following:

- **Default value** means the value built into the program (the initial value of each setting property in the code), which is the value generated on first run. The values in your file may differ from the tables below.
- Some items differ by platform and are marked **Windows** or **Mobile** (Android / iOS) in their description. The tables below focus on the **Windows** version.
- Items marked <mark>Hidden</mark> do not appear in the in-game settings interface and can only be changed in the configuration file.
- Items marked <mark>Not written</mark> do not appear in `settings.json`.

## Top-level structure

| Section | Meaning | Contents |
| --- | --- | --- |
| `Game` | Game settings | Note speed, displayed information, retry / skip, random and mirror, and more |
| `Judge` | Judgment settings | Various offsets and judgment modes |
| `Display` | Display settings | Skin, judgment display, scaling, rendering and window |
| `Audio` | Audio settings | Volume, audio backend and buffers |
| `Debug` | Debug | Touch simulation, render pools, log level, and more |
| `Online` | Networking | Online account and API endpoints |
| `IO` | Input / output devices | Arcade controller, touch panel and LED |
| `Mod` | Mod | <mark>Not written</mark>, applies only to the current chart |

## Game —— Game settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `TapSpeed` | Float | `7.5` | **Tap speed**, adjusts note speed. Step `0.25`, can be negative (notes fall in reverse) |
| `TouchSpeed` | Float | `7.5` | **Touch speed**, adjusts Touch note speed. Step `0.25` |
| `SlideFadeInOffset` | Float | `0.0` | **Slide fade-in offset**, adjusts Slide timing; increasing the value delays it |
| `BackgroundDim` | Float | `0.8` | **Background dim**, the larger the value, the darker. Range `0`–`1`, step `0.05` |
| `StarRotation` | Boolean | `true` | **Star rotation**, rotates the star head |
| `BGInfo` | Enum | `"Combo"` | **Center display**, adjusts the information shown in the center of the screen |
| `SecondaryBGInfo` | Enum | `"None"` | **Additional info display**, adjusts the information shown in the lower middle of the screen |
| `SubScreenBGInfo` | Enum | `"Achievement"` | **Sub-screen info display**, adjusts the information shown on the sub-screen |
| `TopInfo` | Enum | `"None"` | **Outer frame display**, the information shown at the top (between keys 1 and 8) |
| `EnableJudgeTimingGauge` | Boolean | `false` | **Show judgment timing indicator**, shows the real-time judgment offset and the average judgment position |
| `TrackSkip` | Boolean | `true` | **Skip track**, hold keys 2, 3, 6 and 7 to forcibly skip the track |
| `EnforceGameFailure` | Enum | `"Disabled"` | **Force track failure**, automatically skip or retry when the goal cannot be reached |
| `FastRetry` | Boolean | `true` | **Fast retry**, hold keys 3, 4, 5 and 6 to retry quickly |
| `FastPractice` | Boolean | `false` | **Fast practice**, hold keys 1, 2, 7 and 8 to enter practice mode (starts 5 seconds before the section, extends 10 seconds after) |
| `GameplaySubScreenClickBehavior` | Enum | `"TrackSkip"` | **Sub-screen click behavior during gameplay**, adjusts what clicking the sub-screen does while playing. Defaults to `"TrackSkip_1_Sec_Delay"` on mobile |
| `Mirror` | Enum | `"Off"` | **Mirror**, flips the chart horizontally / vertically |
| `Rotation` | Integer | `0` | **Rotation**, rotates the chart by an angle; a positive value is clockwise. Range `-7`–`7` |
| `SlideSkipping` | Boolean | `true` | **Slide skipping**, enables / disables the Slide skip mechanism |
| `Random` | Enum | `"Disabled"` | **Random**, shuffles notes randomly |
| `RecordMode` | Enum | `"Disable"` | **Record mode**, only present on Windows / Linux / macOS |
| `LeadInTime` | Integer | `1` | **Lead-in time**, the number of seconds to wait after entering the gameplay screen before the game actually starts. Range `1`–`5` |
| `ManualStartGame` | Boolean | `false` | **Manual start**, press a key to start after loading (used for competitions) |

### Game enum values

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
| `RecordMode` | `Disable` | Disabled |
| | `OBSTrigger` | Connect to the OBS WebSocket to trigger recording automatically |

## Judge —— Judgment settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `AudioOffset` | Float | `0.0` | **Audio offset (A judgment)**, play by ear. Adjust when notes are out of sync with the music. If you get mostly Fast, decrease the value; if you get mostly Late, increase it. This item moves the answer sound, equivalent to `&first` in a chart |
| `JudgeOffset` | Float | `0.0` | **Judgment offset (B judgment)**, play by sight, compensates for device input latency. If you get mostly Fast, decrease the value; if you get mostly Late, increase it |
| `AnswerOffset` | Float | `0.0` | **Answer sound offset**, adjusts when the answer sound plays (does not affect judgment). Decrease the value to play it earlier, increase it to play it later. Do not change this unless you are sure |
| `TouchPanelOffset` | Float | `0.0` | **Inner screen input offset**, compensates for touch input latency. If you get mostly Fast, decrease the value; if you get mostly Late, increase it |
| `Mode` | Enum | `"Modern"` | **Judgment mode**, selects the game's judgment and scoring mode (old frame / new frame) |

### Judge enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `Mode` | `Classic` | Classic (old frame) |
| | `Modern` | Modern (new frame) |

## Display —— Display settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Language` | String | `""` | **Language**. Empty by default in the source code; after the first run the program writes the current language, in the form `"zh-CN - Majdata"` |
| `Skin` | String | `"default"` | **Note skin**, changes the note skin. If the configured skin does not exist, the program falls back to the first available skin |
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
| `TapScale` | Float | `1.0` | **Tap scale**, adjusts the size of Tap notes. Range `0`–`2`, step `0.01` |
| `HoldScale` | Float | `1.0` | **Hold scale**, adjusts the size of Hold notes. Range `0`–`2`, step `0.01` |
| `TouchScale` | Float | `1.0` | **Touch scale**, adjusts the size of Touch notes. Range `0`–`2`, step `0.01` |
| `SlideScale` | Float | `1.0` | **Slide scale**, adjusts the size of Slide notes (does not affect Wifi Slide). Range `0`–`2`, step `0.01` |
| `TouchFeedback` | Enum | `"Outer_Only"` | **Touch feedback**, sets the condition for showing touch feedback |
| `Resolution` | String | `"1080x1920"` | **Resolution** <mark>Hidden</mark>, cannot be adjusted. Only present on Windows / Linux / macOS |
| `MainScreenTransform` | Boolean | `false` | **Custom screen aspect ratio**, customizes the scale and position of the main screen. Defaults to `true` on mobile |
| `MainScreenScale` | Float | `1.0` | **Main screen scale**, adjusts the overall size of the main screen. Range `0.05`–`1.5`, step `0.01` |
| `MainScreenOffset` | Float | `1.0` | **Main screen position offset**, fine-tunes the position of the main screen. Range `-1`–`1`, step `0.01` |
| `MainScreenCachedScreenCenterY` | Float | `960.0` | **Main screen center Y (cached)** <mark>Hidden</mark>, the cached vertical center coordinate of the main screen |
| `SubDisplayOffset` | Float | `0.0` | **Sub-screen position offset**, fine-tunes the position of the sub-display area. Range `-5`–`5`, step `0.01` |
| `SubDisplayScale` | Float | `1.0` | **Sub-screen scale**, adjusts the size of the sub-display area. Step `0.01` |
| `GameplayScreenRotationAngle` | Enum | `"Zero"` | **Gameplay screen rotation**, rotates the gameplay screen |
| `RenderQuality` | Enum | `"Medium"` | **Render quality**, the higher the value, the sharper the image. Defaults to `"Low"` on mobile |
| `RenderScale` | Integer | `100` | **Render scale**, adjusts the internal render resolution. `100` is the native resolution; lowering it reduces GPU load, but the image and text become blurry. It does not change the layout or judgment. Range `50`–`100`, step `5`. Defaults to `75` on mobile |
| `Topmost` | Boolean | `false` | **Always on top** <mark>Hidden</mark>, keeps the window on top. Only present on Windows / Linux / macOS |
| `FPSLimit` | Integer | `120` | **Frame rate limit**, limits the maximum frame rate. Minimum `-1` (`-1` means unlimited), step `1` |
| `VSync` | Boolean | `true` | **Vertical sync**, whether to enable vertical sync. Not present on mobile |
| `SkipVideoDownload` | Boolean | `false` | **Skip video download**, does not download videos for online charts |

### Display enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | All |
| | `BelowCP` | Below Critical |
| | `BelowP` | Below Perfect |
| | `BelowGR` | Below Great |
| | `MissOnly` | Miss only |
| | `Disable` | Disabled |
| `SlideSortOrder` | `Classic` | Classic order (older notes on the bottom) |
| | `Modern` | Modern order (older notes on top) |
| `TouchFeedback` | `All` | All |
| | `Outer_Only` | Outer only |
| | `Inner_Only` | Inner only |
| | `Disable` | Disabled |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |
| `RenderQuality` | `VeryLow` | Very low |
| | `Low` | Low |
| | `Medium` | Medium |
| | `High` | High |
| | `VeryHigh` | Very high |
| | `Ultra` | Ultra |

## Audio —— Audio settings

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `ForceMono` | Boolean | `false` | **Force mono**, mixes the audio down to a mono output |
| `Volume` | Object | See below | **Volume settings**, the volume of each track |
| `Wasapi` | Object | See below | **WASAPI settings**, only present on Windows |
| `Asio` | Object | See below | **ASIO settings**, only present on Windows |
| `Channel` | Object | See below | **Channel volume**, only present on Windows / Linux / macOS |
| `Bass` | Object | See below | **BASS audio buffer settings**, present on all platforms |
| `Backend` | Enum | `"Wasapi"` | **Audio backend**. Defaults to `"Wasapi"` on Windows and `"BassSimple"` on mobile |

### Audio.Volume —— Volume

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
The built-in default of `Global` is `0.3`; if your file contains a different value, the item has been changed (or comes from an earlier version's default).
:::

### Audio.Wasapi —— WASAPI settings (Windows only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `Exclusive` | `true` | **Exclusive mode**, takes exclusive control of the audio device. Only when this is off can other programs such as OBS record / play audio at the same time |
| `RawMode` | `true` | **Raw mode**, uses raw data that has not been processed by the system mixer |
| `AsyncMode` | `true` | **Asynchronous mode**, uses asynchronous audio processing. Configuration files generated by some older versions may not contain this item; when it is missing, it is treated as `true` |
| `BufferSize` | `0.02` | **Buffer size**, in seconds |
| `Period` | `0.005` | **Period**, in seconds |

### Audio.Asio —— ASIO settings (Windows only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `DeviceIndex` | `0` | **Device index**, the ASIO device number |
| `SampleRate` | `44100` | **Sample rate**, the audio sample rate (Hz) |

### Audio.Channel —— Channel volume (desktop only)

| Item | Default value | Meaning |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **Front channel** (LF / RF) volume |
| `CenterAndLFEVolume` | `1.0` | **Center and LFE channel** (Center / LFE) volume |
| `SideVolume` | `1.0` | **Side channel** (LS / RS) volume |
| `RearVolume` | `1.0` | **Rear channel** (LR / RR) volume |

### Audio.Bass —— BASS buffer settings

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

## Debug —— Debug

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `DisplaySensor` | Boolean | `false` | **Show sensors**, highlights the touch areas that are being triggered |
| `TouchSimulationRadius` | Float | `0.5` | **Simulated touch radius**, the size of the simulated touch point; the larger the value, the larger the finger judgment area (only takes effect during gameplay). Range `0`–`2`, step `0.05` |
| `TouchAAreaExtraRadius` | Float | `0.0` | **Simulated touch area A radius**, expands the trigger radius of touch area A. Range `0`–`2`, step `0.05` |
| `TouchBAreaExtraRadius` | Float | `0.0` | **Simulated touch area B radius**, expands the trigger radius of touch area B |
| `TouchCAreaExtraRadius` | Float | `0.25` | **Simulated touch area C radius**, expands the trigger radius of touch area C |
| `TouchDAreaExtraRadius` | Float | `0.2` | **Simulated touch area D radius**, expands the trigger radius of touch area D |
| `TouchEAreaExtraRadius` | Float | `0.1` | **Simulated touch area E radius**, expands the trigger radius of touch area E |
| `TouchRadiusAdjust` | Float | `0.0` | **Touch area ratio**, adjusts the touch trigger range according to the finger contact area; `0` disables it. Range `0`–`2` |
| `DisplayRuntimeInfo` | Boolean | `true` | **Show frame rate and version**, shows the frame rate and version in the upper right corner |
| `FullScreen` | Boolean | `true` | **Force full screen** <mark>Hidden</mark>, only present on Windows / Linux / macOS |
| `MenuOptionIterationSpeed` | Integer | `45` | **Menu option repeat speed** <mark>Hidden</mark>, the larger the value, the faster the scrolling |
| `DisplayOffset` | Float | `0.0` | **Frame offset**, compensates for frame latency. Do not change this unless you are sure |
| `NoteAppearRate` | Float | `0.265` | **Note fade-in offset**, adjusts the note fade-in effect. Step `0.001` |
| `OffsetUnit` | Enum | `"Frame"` | **Offset unit**, adjusts the unit of the various offsets |
| `HideCursorInGame` | Boolean | `true` | **Hide cursor during gameplay** <mark>Hidden</mark>, only present on Windows / Linux / macOS |
| `NoteFolding` | Boolean | `true` | **Note folding** <mark>Hidden</mark>, folds the note display |
| `DJAutoPolicy` | Enum | `"Strict"` | **DJAuto policy**, Strict: only one of keys or touch may be used. Permissive: the two may be mixed |
| `MaxQueuedFrames` | Integer | `2` | **Maximum queued frames** <mark>Hidden</mark>, the maximum number of frames allowed to wait in the queue to be processed |
| `TapPoolCapacity` | Integer | `96` | **Tap object pool capacity** <mark>Hidden</mark>, defaults to `48` on mobile |
| `HoldPoolCapacity` | Integer | `96` | **Hold object pool capacity** <mark>Hidden</mark>, defaults to `48` on mobile |
| `TouchPoolCapacity` | Integer | `64` | **Touch object pool capacity** <mark>Hidden</mark> |
| `TouchHoldPoolCapacity` | Integer | `64` | **TouchHold object pool capacity** <mark>Hidden</mark> |
| `EachLinePoolCapacity` | Integer | `48` | **Object pool capacity per track** <mark>Hidden</mark>, defaults to `24` on mobile |
| `DebugLevel` | Enum | `"Info"` | **Log level** <mark>Hidden</mark>, the minimum level of the logs that are output |

### Debug enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `OffsetUnit` | `Frame` | Frame |
| | `Second` | Second |
| `DJAutoPolicy` | `Strict` | Strict |
| | `Permissive` | Permissive |
| `DebugLevel` | `Debug` / `Info` / `Warning` / `Error` / `Fatal` | Debug / Info / Warning / Error / Fatal |

## Online —— Networking

::: tip
Want to submit scores to leaderboards / save records? Want to play online charts directly in the game? Read [Online services](/en/majdataplay/configuration/online) first.
:::

The items in this section are <mark>Hidden</mark> in the in-game settings interface. On iOS, the corresponding settings are located in the system **Settings** app.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Enable` | Boolean | `false` | **Enable networking**, whether to enable online features |
| `UseProxy` | Boolean | `true` | **Use proxy**, only present on Windows / Linux / macOS |
| `Proxy` | String | `""` | **Proxy address**, only present on Windows / Linux / macOS |
| `ApiEndpoints` | Array | See below | **API endpoint list**, multiple servers can be configured |

### Online.ApiEndpoints[] —— Endpoints

Contains one `MajdataNET` entry by default:

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Name` | String | `"MajdataNET"` | **Name**, the display name of the endpoint |
| `Url` | String | `"https://majdata.net/api3/api/"` | **API address**, the server's API root address |
| `Username` | String | `"YourUsername"` | **Username**, the prefilled account |
| `Password` | String | `"YourPassword"` | **Password**, the prefilled password |
| `AutoLogin` | Boolean | `false` | **Auto login**, signs in automatically at startup |

## IO —— Input / output devices

This section is <mark>Hidden</mark> in the in-game settings interface and is mainly used for external arcade controllers and LEDs. See [External devices](/en/majdataplay/configuration/external_device) for details.

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Manufacturer` | Enum / `null` | `null` | **Device manufacturer**, `null` means auto-detect. Only present on Windows / Linux / macOS |
| `InputDevice` | Object | See below | **Input device** |
| `OutputDevice` | Object | See below | **Output device**. Only present on Windows / Linux / macOS |

### IO.InputDevice

| Item | Type | Default value | Meaning |
| --- | --- | --- | --- |
| `Player` | Integer | `1` | **Player number**, the gamepad player index. Only present on desktop |
| `ButtonRing` | Object | See below | **Button ring (arcade controller buttons)**. Only present on desktop |
| `TouchPanel` | Object | See below | **Touch panel**. Only present on desktop |
| `ExternalButtonRing` | Enum | `"None"` | **External button ring**, only present on mobile. `"None"` none / `"Keyboard"` keyboard / `"Gamepad"` gamepad |

### IO.InputDevice.ButtonRing

| Item | Default value | Meaning |
| --- | --- | --- |
| `Enable` | `true` | **Enable**, whether to enable button ring input |
| `Type` | `null` | **Device type**, `null` automatic; can be `"Keyboard"` keyboard / `"HID"` HID device |
| `Debounce` | `false` | **Enable debounce**, whether to enable key debounce |
| `PollingRateMs` | `0` | **Polling interval**, in milliseconds; `0` means unlimited |
| `DebounceThresholdMs` | `0` | **Debounce threshold**, in milliseconds |
| `HidOptions` | See below | **HID device parameters** |

### IO.InputDevice.TouchPanel

| Item | Default value | Meaning |
| --- | --- | --- |
| `Enable` | `true` | **Enable**, whether to enable touch panel input |
| `Debounce` | `false` | **Enable debounce**, whether to enable touch debounce |
| `Sensitivities` | `A`–`E` all `0` | **Sensitivity**, the touch sensitivity of areas A–E |
| `PollingRateMs` | `0` | **Polling interval**, in milliseconds |
| `DebounceThresholdMs` | `0` | **Debounce threshold**, in milliseconds |
| `SerialPortOptions` | See below | **Serial port parameters**, `Port` / `BaudRate` both default to `null` |
| `UsbOptions` | See below | **USB device parameters** |
| `CapacitivePanelOptions` | See below | **Capacitive touch panel parameters** |

### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| Item | Default value | Meaning |
| --- | --- | --- |
| `TouchRadius` | `30` | **Touch radius**, the capacitive touch judgment radius |
| `RadiusOffset` | `A:0` `B:20` `C:0` `D:0` `E:25` | **Radius offset**, fine-tunes the radius of areas A–E |

### IO.OutputDevice.Led

| Item | Default value | Meaning |
| --- | --- | --- |
| `Enable` | `true` | **Enable**, whether to enable LED output |
| `Brightness` | `1.0` | **Brightness**, the LED brightness |
| `RefreshRateMs` | `16` | **Refresh interval**, in milliseconds |
| `Throttler` | `true` | **Throttler**, limits the LED refresh rate |
| `SerialPortOptions` | `Port` / `BaudRate` both `null` | **Serial port parameters** |
| `HidOptions` | See below | **HID device parameters** |

### IO common parameters

`HidOptions` and `UsbOptions` have the same structure:

| Item | Default value | Meaning |
| --- | --- | --- |
| `DeviceName` | `null` | **Device name**, specifies the device name (leave empty to match automatically) |
| `ProductId` | `null` | **Product ID (PID)** |
| `VendorId` | `null` | **Vendor ID (VID)** |
| `Exclusice` | `false` | **Exclusive mode**. The field name is spelled `Exclusice` in the configuration file |

`HidOptions` additionally contains:

| Item | Default value | Meaning |
| --- | --- | --- |
| `OpenPriority` | `"VeryHigh"` | **Open priority**, can be `Idle` / `VeryLow` / `Low` / `Normal` / `High` / `VeryHigh` (lowest / very low / low / normal / high / highest) |

### IO enum values

| Item | Value | Meaning |
| --- | --- | --- |
| `Manufacturer` | `General` | General |
| | `Yuan` | Yuan controller |
| | `Dao` | Dao controller |
| | `Nov` | Nov controller |
| | `null` | Auto-detect |

## Appendix: Mod (not written to the configuration file)

`Mod` does **not** appear in `settings.json`; its values only take effect while playing the current chart (per-chart Mod settings are stored in the chart file). The defaults are listed here for reference.

| Item | Default value | Meaning |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **Playback speed**, adjusts the game speed multiplier |
| `AutoPlay` | `"Disable"` | **Auto play**, Xiaoxiao Lanbai plays for you. Can be `Disable` disabled / `Enable` enabled / `DJAuto_ButtonRing_First` DJAuto (buttons first) / `DJAuto_TouchPanel_First` DJAuto (inner screen first) |
| `JudgeStyle` | `"DEFAULT"` | **Judgment style**, challenge yourself with stricter judgment. Can be `DEFAULT` / `MAJI` / `GACHI` / `GORI` |
| `SubdivideSlideJudgeGrade` | `false` | **Subdivide Slide judgment grades**, allows Slides to receive a small Perfect judgment |
| `AllBreak` | `false` | **All Break**, turns every note into a Break |
| `AllEx` | `false` | **All Ex**, turns every note into an Ex |
| `AllTouch` | `false` | **All Touch**, turns every note into a Touch |
| `SlideNoHead` | `false` | **Headless stars**, removes Slide heads |
| `SlideNoTrack` | `false` | **No Slide track**, removes Slide paths |
| `ButtonRingForTouch` | `false` | **Inner screen only experience**, allows using the button ring to play Slides and Touches. Only present on desktop |
| `NoteMask` | `"Disable"` | **Note mask**, a masking cover for notes |

