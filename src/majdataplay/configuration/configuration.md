# 配置详解

::: tip
本文逐项解释 [配置文件](/majdataplay/configuration/index) `settings.json` 中的全部设置项, 并给出每项在**首次运行自动生成**时的默认值.
:::


::: warning
修改配置时请确保游戏<mark>已完全关闭</mark>. 在游戏运行中手动改动的文件, 会在游戏保存设置时被覆盖. 若你不熟悉 JSON, 建议使用 [VSCode](https://code.visualstudio.com/) 等带语法检查的编辑器.
:::

阅读下表前请先了解:

- **默认值**指程序内置默认值 (代码中各设置属性的初始化值), 也就是首次运行时生成的值. 你文件里的值可能与下表不同.
- 部分项因平台而异, 会在说明中标注 **Windows** 或 **移动端** (Android / iOS). 下表以 **Windows** 版为主.
- 标有 <mark>隐藏</mark> 的项不会出现在游戏内设置界面, 只能改配置文件.
- 标有 <mark>不写入</mark> 的项不会出现在 `settings.json` 中.

## 顶层结构

| 节 | 中文含义 | 内容 |
| --- | --- | --- |
| `Game` | 游戏设定 | 音符速度、显示信息、重开 / 跳过、随机与镜像等 |
| `Judge` | 判定设定 | 各类偏移与判定模式 |
| `Display` | 显示设定 | 皮肤、判定显示、缩放、渲染与窗口 |
| `Audio` | 音频设定 | 音量、音频后端与缓冲区 |
| `Debug` | 调试 | 触摸模拟、渲染池、日志等级等 |
| `Online` | 联网 | 在线账号与 API 端点 |
| `IO` | 输入 / 输出设备 | 手台、触摸板与 LED |
| `Mod` | Mod | <mark>不写入</mark>, 仅作用于当前谱面 |

## Game —— 游戏设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `TapSpeed` | 浮点 | `7.5` | **Tap 速度**, 调整音符速度. 步进 `0.25`, 可为负数 (反向下落) |
| `TouchSpeed` | 浮点 | `7.5` | **Touch 速度**, 调整 Touch 音符速度. 步进 `0.25` |
| `SlideFadeInOffset` | 浮点 | `0.0` | **Slide 淡入偏移**, 调整 Slide 时机, 右调推迟 |
| `BackgroundDim` | 浮点 | `0.8` | **背景亮度**, 值越大越暗. 范围 `0`~`1`, 步进 `0.05` |
| `StarRotation` | 布尔 | `true` | **星星旋转**, 星星头旋转 |
| `BGInfo` | 枚举 | `"Combo"` | **中央显示**, 调整屏幕中央显示的信息 |
| `SecondaryBGInfo` | 枚举 | `"None"` | **额外信息显示**, 调整屏幕中下方显示的信息 |
| `SubScreenBGInfo` | 枚举 | `"Achievement"` | **副屏信息显示**, 调整副屏显示的信息 |
| `TopInfo` | 枚举 | `"None"` | **外框显示**, 顶部信息显示 (1 和 8 键之间) |
| `EnableJudgeTimingGauge` | 布尔 | `false` | **显示判定偏移指示器**, 显示实时判定偏移与平均判定位置 |
| `TrackSkip` | 布尔 | `true` | **跳过乐曲**, 按住 2、3、6、7 键强制跳过乐曲 |
| `EnforceGameFailure` | 枚举 | `"Disabled"` | **强制乐曲失败**, 当无法达到目标时自动跳过或重试 |
| `FastRetry` | 布尔 | `true` | **快速重开**, 按住 3、4、5、6 键快速重开 |
| `FastPractice` | 布尔 | `false` | **快速练习**, 按住 1、2、7、8 键进入练习模式 (开始前 -5 秒, 按住后 +10 秒) |
| `GameplaySubScreenClickBehavior` | 枚举 | `"TrackSkip"` | **游戏时副屏点击行为**, 调整游玩时点击副屏的行为. 移动端默认为 `"TrackSkip_1_Sec_Delay"` |
| `Mirror` | 枚举 | `"Off"` | **镜像**, 谱面左右 / 上下对称翻转 |
| `Rotation` | 整数 | `0` | **旋转**, 旋转谱面角度, 正数顺时针. 范围 `-7`~`7` |
| `SlideSkipping` | 布尔 | `true` | **Slide 跳区**, 开启 / 关闭 Slide 跳区机制 |
| `Random` | 枚举 | `"Disabled"` | **随机**, 随机打乱音符 |
| `RecordMode` | 枚举 | `"Disable"` | **录制模式**, 仅 Windows / Linux / macOS 存在 |
| `LeadInTime` | 整数 | `1` | **等待时间**, 进入游戏界面后, 正式开始游戏之前的等待秒数. 范围 `1`~`5` |
| `ManualStartGame` | 布尔 | `false` | **手动开始游戏**, 加载后手动按键开始 (用于比赛) |

### Game 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `BGInfo` / `SecondaryBGInfo` / `SubScreenBGInfo` | `CPCombo` | 极致完美 Combo |
| | `PCombo` | 完美 Combo |
| | `Combo` | Combo |
| | `Achievement_101` | 达成率 (101-) |
| | `Achievement_100` | 达成率 (100-) |
| | `Achievement` | 达成率 |
| | `AchievementClassical` | FiNALE 达成率 |
| | `AchievementClassical_100` | FiNALE 达成率 (100-) |
| | `DXScore` | DX 分数 |
| | `DXScoreRank` | DX 分数等级 |
| | `S_Border` | 距 S |
| | `SS_Border` | 距 SS |
| | `SSS_Border` | 距 SSS |
| | `MyBest` | 距最佳成绩 |
| | `Diff` | 判定误差 |
| | `None` | 无 |
| `TopInfo` | `None` | 不显示 |
| | `Judge` | 判定结果 |
| | `Timing` | Fast / Late |
| `EnforceGameFailure` | `Disabled` | 关闭 |
| | `TrackSkip_S` / `Retry_S` | 跳关 / S、重试 / S |
| | `TrackSkip_SS` / `Retry_SS` | 跳关 / SS、重试 / SS |
| | `TrackSkip_SSS` / `Retry_SSS` | 跳关 / SSS、重试 / SSS |
| | `TrackSkip_SSSPlus` / `Retry_SSSPlus` | 跳关 / SSS+、重试 / SSS+ |
| | `TrackSkip_Best` / `Retry_Best` | 跳关 / 最佳成绩、重试 / 最佳成绩 |
| | `TrackSkip_FC` / `Retry_FC` | 跳关 / FC、重试 / FC |
| | `TrackSkip_AP` / `Retry_AP` | 跳关 / AP、重试 / AP |
| `GameplaySubScreenClickBehavior` | `None` | 无 |
| | `TrackSkip` | 跳过乐曲 |
| | `TrackSkip_1_Sec_Delay` | 跳过乐曲 (按住 1 秒) |
| | `FastRetry` | 快速重开 |
| | `FastRetry_1_Sec_Delay` | 快速重开 (按住 1 秒) |
| `Mirror` | `Off` | 关闭 |
| | `LRMirror` | 左右镜像 |
| | `UDMirror` | 上下镜像 |
| `Random` | `Disabled` | 禁用 |
| | `RANDOM` | 按轨道随机 |
| | `S_RANDOM` | 每个音符独立随机 |
| `RecordMode` | `Disable` | 禁用 |
| | `OBSTrigger` | 连接 OBS WebSocket 自动触发录制 |

## Judge —— 判定设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `AudioOffset` | 浮点 | `0.0` | **音频偏移 (A 判)**, 音押. 音符与音乐不同步时调整. Fast 多向左调, Late 多向右调. 该项会移动正解音, 相当于谱面中的 `&first` |
| `JudgeOffset` | 浮点 | `0.0` | **判定偏移 (B 判)**, 目押延迟, 补偿设备输入延迟. Fast 多向左调, Late 多向右调 |
| `AnswerOffset` | 浮点 | `0.0` | **正解音偏移**, 调整正解音播放时机 (不影响判定). 左调提前, 右调延后. 不确定请勿调整 |
| `TouchPanelOffset` | 浮点 | `0.0` | **内屏输入偏移**, 补偿触摸输入延迟. Fast 多向左调, Late 多向右调 |
| `Mode` | 枚举 | `"Modern"` | **判定模式**, 选择游戏判定和分数模式 (旧框 / 新框) |

### Judge 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `Mode` | `Classic` | 旧框 (Classic) |
| | `Modern` | 新框 (Modern) |

## Display —— 显示设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Language` | 字符串 | `""` | **语言**. 源码默认空; 首次运行后由程序按当前语言写入, 形如 `"zh-CN - Majdata"` |
| `Skin` | 字符串 | `"default"` | **Note 皮肤**, 更换音符皮肤. 若配置的皮肤不存在, 程序会回退到第一个可用皮肤 |
| `DisplayCriticalPerfect` | 布尔 | `false` | **显示 Critical 判定**, 显示 Critical 判定 |
| `DisplayBreakScore` | 布尔 | `true` | **显示 Break 分数**, 显示 Break 音符的详细分数 |
| `FastLateType` | 枚举 | `"Disable"` | **Fast / Late 显示等级**, 设置 Note 的 Fast / Late 显示条件, 低于此级别才显示判定文字 |
| `NoteJudgeType` | 枚举 | `"All"` | **Note 判定显示等级**, 设置 Note 判定显示条件, 低于此级别才显示判定文字 |
| `TouchJudgeType` | 枚举 | `"All"` | **Touch 判定显示等级**, 设置 Touch 判定显示条件, 低于此级别才显示判定文字 |
| `SlideJudgeType` | 枚举 | `"All"` | **Slide 判定显示等级**, 设置 Slide 判定显示条件, 低于此级别才显示判定文字 |
| `BreakJudgeType` | 枚举 | `"All"` | **Break 判定显示等级**, 设置 Break 判定显示条件, 低于此级别才显示判定文字 |
| `BreakFastLateType` | 枚举 | `"Disable"` | **Break Fast / Late 显示等级**, 设置 Break 的 Fast / Late 显示条件, 低于此级别才显示判定文字 |
| `SlideSortOrder` | 枚举 | `"Modern"` | **Slide 排列顺序**, Slide 排序: Classic 旧在下, Modern 旧在上 (影响星星变色) |
| `OuterJudgeDistance` | 浮点 | `1.0` | **外圈判定显示距离**, 调整外部判定文字显示距离 (越小越靠中心). 范围 `0`~`1`, 步进 `0.05`, `0` 为关闭 |
| `InnerJudgeDistance` | 浮点 | `1.0` | **内圈判定显示距离**, 调整 Touch 判定文字显示距离 (越小越靠中心). 范围 `0`~`1`, 步进 `0.05`, `0` 为关闭 |
| `DisplayHoldHeadJudgeResult` | 布尔 | `false` | **显示 Hold 头判判定**, 显示 Hold 头的判定结果 |
| `TapScale` | 浮点 | `1.0` | **Tap 缩放级别**, 调整 Tap 大小. 范围 `0`~`2`, 步进 `0.01` |
| `HoldScale` | 浮点 | `1.0` | **Hold 缩放级别**, 调整 Hold 的大小. 范围 `0`~`2`, 步进 `0.01` |
| `TouchScale` | 浮点 | `1.0` | **Touch 缩放级别**, 调整 Touch 大小. 范围 `0`~`2`, 步进 `0.01` |
| `SlideScale` | 浮点 | `1.0` | **Slide 缩放级别**, 调整 Slide 大小 (不影响 Wifi Slide). 范围 `0`~`2`, 步进 `0.01` |
| `TouchFeedback` | 枚举 | `"Outer_Only"` | **触摸反馈**, 设置触摸反馈显示条件 |
| `Resolution` | 字符串 | `"1080x1920"` | **分辨率** <mark>隐藏</mark>, 不可调整. 仅 Windows / Linux / macOS 存在 |
| `MainScreenTransform` | 布尔 | `false` | **自定义画面比例**, 自定义主画面的缩放和位置. 移动端默认为 `true` |
| `MainScreenScale` | 浮点 | `1.0` | **主屏缩放**, 调整主画面整体大小. 范围 `0.05`~`1.5`, 步进 `0.01` |
| `MainScreenOffset` | 浮点 | `1.0` | **主屏位置偏移**, 微调主画面位置. 范围 `-1`~`1`, 步进 `0.01` |
| `MainScreenCachedScreenCenterY` | 浮点 | `960.0` | **主屏中心 Y (缓存)** <mark>隐藏</mark>, 缓存的主屏垂直中心坐标 |
| `SubDisplayOffset` | 浮点 | `0.0` | **副屏位置偏移**, 微调副显示区域位置. 范围 `-5`~`5`, 步进 `0.01` |
| `SubDisplayScale` | 浮点 | `1.0` | **副屏缩放**, 调整副显示区域大小. 步进 `0.01` |
| `GameplayScreenRotationAngle` | 枚举 | `"Zero"` | **游戏画面旋转**, 旋转游戏画面 |
| `RenderQuality` | 枚举 | `"Medium"` | **渲染质量**, 渲染质量, 值越高画面越清晰. 移动端默认为 `"Low"` |
| `RenderScale` | 整数 | `100` | **渲染比例**, 调整内部渲染分辨率. `100` 为原始分辨率; 降低可减轻 GPU 负载, 但画面和文字会变模糊, 不改变布局或判定. 范围 `50`~`100`, 步进 `5`. 移动端默认为 `75` |
| `Topmost` | 布尔 | `false` | **窗口置顶** <mark>隐藏</mark>, 保持窗口置顶. 仅 Windows / Linux / macOS 存在 |
| `FPSLimit` | 整数 | `120` | **帧率限制**, 限制最高帧率. 最小 `-1` (`-1` 表示不限制), 步进 `1` |
| `VSync` | 布尔 | `true` | **垂直同步**, 是否开启垂直同步. 移动端不存在该项 |
| `SkipVideoDownload` | 布尔 | `false` | **跳过视频下载**, 在线谱面不下载视频 |

### Display 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | 全部 |
| | `BelowCP` | Critical 以下 |
| | `BelowP` | Perfect 以下 |
| | `BelowGR` | Great 以下 |
| | `MissOnly` | 仅 Miss |
| | `Disable` | 禁用 |
| `SlideSortOrder` | `Classic` | 旧框排序 (旧音符在下) |
| | `Modern` | 新框排序 (旧音符在上) |
| `TouchFeedback` | `All` | 全部 |
| | `Outer_Only` | 仅外部 |
| | `Inner_Only` | 仅内部 |
| | `Disable` | 禁用 |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |
| `RenderQuality` | `VeryLow` | 极低 |
| | `Low` | 低 |
| | `Medium` | 中 |
| | `High` | 高 |
| | `VeryHigh` | 极高 |
| | `Ultra` | 最高 |

## Audio —— 音频设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `ForceMono` | 布尔 | `false` | **强制单声道**, 将音频混合为单声道输出 |
| `Volume` | 对象 | 见下表 | **音量设定**, 各音轨音量 |
| `Wasapi` | 对象 | 见下表 | **WASAPI 设定**, 仅 Windows 存在 |
| `Asio` | 对象 | 见下表 | **ASIO 设定**, 仅 Windows 存在 |
| `Channel` | 对象 | 见下表 | **声道音量**, 仅 Windows / Linux / macOS 存在 |
| `Bass` | 对象 | 见下表 | **BASS 音频缓冲设定**, 所有平台存在 |
| `Backend` | 枚举 | `"Wasapi"` | **音频后端**. Windows 默认 `"Wasapi"`, 移动端默认 `"BassSimple"` |

### Audio.Volume —— 音量

所有项范围均为 `0`~`2`, 步进 `0.05`.

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Global` | `0.3` | **全局**, 调整主音量 |
| `BGM` | `1.0` | **背景音乐**, 调整非游戏场景 (选曲、结算) 的背景音乐音量 |
| `Track` | `1.0` | **谱面音乐**, 调整游戏内音乐音量 |
| `Answer` | `0.8` | **正解音**, 调整正解音和开场节拍器的音量 |
| `Tap` | `0.3` | **Tap / Hold 判定音**, 调整 Tap / Hold 的判定音量 |
| `Ex` | `0.3` | **Ex 判定音**, 调整 Ex 音符的判定音量 |
| `Break` | `0.3` | **Break 判定音**, 调整 Break 的判定音量 |
| `Slide` | `0.3` | **Slide 判定音**, 调整 Slide 音效音量 |
| `Touch` | `0.3` | **Touch 判定音**, 调整 Touch / TouchHold 的判定音量 |
| `Hanabi` | `0.3` | **Hanabi 音效**, 调整 Touch 烟花音效音量 |
| `Voice` | `1.0` | **小小蓝白**, 调整助手语音音量 |

::: tip
`Global` 的内置默认为 `0.3`; 你文件中若为其他值, 说明该项被修改过 (或来自较早版本的默认值).
:::

### Audio.Wasapi —— WASAPI 设定 (仅 Windows)

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Exclusive` | `true` | **独占模式**, 独占音频设备. 关闭后 OBS 等程序才能同时录制 / 播放声音 |
| `RawMode` | `true` | **原始模式 (Raw Mode)**, 使用未经系统混音处理的原始数据 |
| `AsyncMode` | `true` | **异步模式**, 使用异步音频处理. 部分旧版本生成的配置文件中可能没有该项, 缺失时按 `true` 处理 |
| `BufferSize` | `0.02` | **缓冲区大小**, 单位为秒 |
| `Period` | `0.005` | **周期**, 单位为秒 |

### Audio.Asio —— ASIO 设定 (仅 Windows)

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `DeviceIndex` | `0` | **设备索引**, ASIO 设备序号 |
| `SampleRate` | `44100` | **采样率**, 音频采样率 (Hz) |

### Audio.Channel —— 声道音量 (仅桌面端)

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `FrontVolume` | `1.0` | **前置声道** (LF / RF) 音量 |
| `CenterAndLFEVolume` | `1.0` | **中置与低音声道** (Center / LFE) 音量 |
| `SideVolume` | `1.0` | **侧置声道** (LS / RS) 音量 |
| `RearVolume` | `1.0` | **后置声道** (LR / RR) 音量 |

### Audio.Bass —— BASS 缓冲设定

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `BufferLengthMs` | `1000` | **缓冲区长度**, 单位毫秒 |
| `UpdatePeriodMs` | `200` | **更新周期**, 单位毫秒 |
| `DeviceBufferLengthMs` | `64` | **设备缓冲区长度**, 单位毫秒. 移动端默认为 `32` |
| `DeviceUpdatePeriodMs` | `16` | **设备更新周期**, 单位毫秒. 移动端默认为 `8` |
| `EnableAAudio` | `true` | **启用 AAudio**, 仅 Android 存在 |

### Audio 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `Backend` | `Unity` | Unity 内置音频 |
| | `Wasapi` | WASAPI (Windows) |
| | `Asio` | ASIO (专业声卡低延迟) |
| | `BassSimple` | BASS 简化后端 (移动端默认) |

## Debug —— 调试

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `DisplaySensor` | 布尔 | `false` | **显示传感器**, 高亮显示触发的触摸区域 |
| `TouchSimulationRadius` | 浮点 | `0.5` | **模拟触摸半径**, 模拟触摸点大小, 值越大手指判定越大 (仅游戏中生效). 范围 `0`~`2`, 步进 `0.05` |
| `TouchAAreaExtraRadius` | 浮点 | `0.0` | **模拟触摸 A 区半径**, 扩大 A 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchBAreaExtraRadius` | 浮点 | `0.0` | **模拟触摸 B 区半径**, 扩大 B 触摸区的触发半径 |
| `TouchCAreaExtraRadius` | 浮点 | `0.25` | **模拟触摸 C 区半径**, 扩大 C 触摸区的触发半径 |
| `TouchDAreaExtraRadius` | 浮点 | `0.2` | **模拟触摸 D 区半径**, 扩大 D 触摸区的触发半径 |
| `TouchEAreaExtraRadius` | 浮点 | `0.1` | **模拟触摸 E 区半径**, 扩大 E 触摸区的触发半径 |
| `TouchRadiusAdjust` | 浮点 | `0.0` | **触摸面积比例**, 根据手指接触面积调整触摸触发范围, `0` 为禁用. 范围 `0`~`2` |
| `DisplayRuntimeInfo` | 布尔 | `true` | **显示帧率和版本号**, 在右上角显示帧率和版本号 |
| `FullScreen` | 布尔 | `true` | **强制全屏** <mark>隐藏</mark>, 仅 Windows / Linux / macOS 存在 |
| `MenuOptionIterationSpeed` | 整数 | `45` | **菜单选项连按速度** <mark>隐藏</mark>, 值越大滚动越快 |
| `DisplayOffset` | 浮点 | `0.0` | **帧偏移**, 补偿帧延迟. 不确定请勿调整 |
| `NoteAppearRate` | 浮点 | `0.265` | **Note 淡入偏移**, 调整音符淡入效果. 步进 `0.001` |
| `OffsetUnit` | 枚举 | `"Frame"` | **偏移单位**, 调整各类偏移的单位 |
| `HideCursorInGame` | 布尔 | `true` | **游玩时隐藏光标** <mark>隐藏</mark>, 仅 Windows / Linux / macOS 存在 |
| `NoteFolding` | 布尔 | `true` | **Note 折叠** <mark>隐藏</mark>, 折叠音符显示 |
| `DJAutoPolicy` | 枚举 | `"Strict"` | **DJAuto 策略**, 严格: 只能使用按键或触摸之一. 宽容: 可混合使用 |
| `MaxQueuedFrames` | 整数 | `2` | **最大排队帧数** <mark>隐藏</mark>, 允许排队等待处理的最大帧数 |
| `TapPoolCapacity` | 整数 | `96` | **Tap 对象池容量** <mark>隐藏</mark>, 移动端默认为 `48` |
| `HoldPoolCapacity` | 整数 | `96` | **Hold 对象池容量** <mark>隐藏</mark>, 移动端默认为 `48` |
| `TouchPoolCapacity` | 整数 | `64` | **Touch 对象池容量** <mark>隐藏</mark> |
| `TouchHoldPoolCapacity` | 整数 | `64` | **TouchHold 对象池容量** <mark>隐藏</mark> |
| `EachLinePoolCapacity` | 整数 | `48` | **每条轨道对象池容量** <mark>隐藏</mark>, 移动端默认为 `24` |
| `DebugLevel` | 枚举 | `"Info"` | **日志等级** <mark>隐藏</mark>, 输出日志的最低等级 |

### Debug 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `OffsetUnit` | `Frame` | 帧 |
| | `Second` | 秒 |
| `DJAutoPolicy` | `Strict` | 严格 |
| | `Permissive` | 宽容 |
| `DebugLevel` | `Debug` / `Info` / `Warning` / `Error` / `Fatal` | 调试 / 信息 / 警告 / 错误 / 致命 |

## Online —— 联网

::: tip
想传分打榜 / 记录? 想直接在游戏内游玩在线谱面? 请先阅读 [联网](/majdataplay/configuration/online).
:::

该节中的项在游戏内设置界面里<mark>隐藏</mark>, iOS 版对应设置位于系统"设置" App 中.

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `false` | **启用联网**, 是否启用在线功能 |
| `UseProxy` | 布尔 | `true` | **使用代理**, 仅 Windows / Linux / macOS 存在 |
| `Proxy` | 字符串 | `""` | **代理地址**, 仅 Windows / Linux / macOS 存在 |
| `ApiEndpoints` | 数组 | 见下表 | **API 端点列表**, 可配置多个服务器 |

### Online.ApiEndpoints[] —— 端点

默认包含一项 `MajdataNET`:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Name` | 字符串 | `"MajdataNET"` | **名称**, 端点显示名 |
| `Url` | 字符串 | `"https://majdata.net/api3/api/"` | **接口地址**, 服务器 API 根地址 |
| `Username` | 字符串 | `"YourUsername"` | **用户名**, 预填账号 |
| `Password` | 字符串 | `"YourPassword"` | **密码**, 预填密码 |
| `AutoLogin` | 布尔 | `false` | **自动登录**, 启动时自动登录 |

## IO —— 输入 / 输出设备

该节在游戏内设置界面里<mark>隐藏</mark>, 主要用于外接手台与 LED. 详见 [外置设备](/majdataplay/configuration/external_device).

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Manufacturer` | 枚举 / `null` | `null` | **设备制造商**, `null` 表示自动识别. 仅 Windows / Linux / macOS 存在 |
| `InputDevice` | 对象 | 见下 | **输入设备** |
| `OutputDevice` | 对象 | 见下 | **输出设备**. 仅 Windows / Linux / macOS 存在 |

### IO.InputDevice

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Player` | 整数 | `1` | **玩家编号**, 手柄玩家索引. 仅桌面端存在 |
| `ButtonRing` | 对象 | 见下 | **按键圈 (手台按键)**. 仅桌面端存在 |
| `TouchPanel` | 对象 | 见下 | **触摸板**. 仅桌面端存在 |
| `ExternalButtonRing` | 枚举 | `"None"` | **外接按键圈**, 仅移动端存在. `"None"` 无 / `"Keyboard"` 键盘 / `"Gamepad"` 手柄 |

### IO.InputDevice.ButtonRing

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Enable` | `true` | **启用**, 是否启用按键圈输入 |
| `Type` | `null` | **设备类型**, `null` 自动; 可选 `"Keyboard"` 键盘 / `"HID"` HID 设备 |
| `Debounce` | `false` | **启用去抖**, 是否开启按键去抖 |
| `PollingRateMs` | `0` | **轮询间隔**, 单位毫秒, `0` 表示不限 |
| `DebounceThresholdMs` | `0` | **去抖阈值**, 单位毫秒 |
| `HidOptions` | 见下 | **HID 设备参数** |

### IO.InputDevice.TouchPanel

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Enable` | `true` | **启用**, 是否启用触摸板输入 |
| `Debounce` | `false` | **启用去抖**, 是否开启触摸去抖 |
| `Sensitivities` | `A`~`E` 均为 `0` | **灵敏度**, A~E 各区触摸灵敏度 |
| `PollingRateMs` | `0` | **轮询间隔**, 单位毫秒 |
| `DebounceThresholdMs` | `0` | **去抖阈值**, 单位毫秒 |
| `SerialPortOptions` | 见下 | **串口参数**, `Port` / `BaudRate` 默认均为 `null` |
| `UsbOptions` | 见下 | **USB 设备参数** |
| `CapacitivePanelOptions` | 见下 | **电容触摸板参数** |

### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `TouchRadius` | `30` | **触摸半径**, 电容触摸判定半径 |
| `RadiusOffset` | `A:0` `B:20` `C:0` `D:0` `E:25` | **半径偏移**, A~E 各区半径微调 |

### IO.OutputDevice.Led

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Enable` | `true` | **启用**, 是否启用 LED 输出 |
| `Brightness` | `1.0` | **亮度**, LED 亮度 |
| `RefreshRateMs` | `16` | **刷新间隔**, 单位毫秒 |
| `Throttler` | `true` | **限流**, 限制 LED 刷新频率 |
| `SerialPortOptions` | `Port` / `BaudRate` 均为 `null` | **串口参数** |
| `HidOptions` | 见下 | **HID 设备参数** |

### IO 通用参数

`HidOptions` 与 `UsbOptions` 结构相同:

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `DeviceName` | `null` | **设备名称**, 指定设备名 (留空自动匹配) |
| `ProductId` | `null` | **产品 ID (PID)** |
| `VendorId` | `null` | **厂商 ID (VID)** |
| `Exclusice` | `false` | **独占模式**. 字段名在配置文件中即拼写为 `Exclusice` |

`HidOptions` 额外包含:

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `OpenPriority` | `"VeryHigh"` | **打开优先级**, 可选 `Idle` / `VeryLow` / `Low` / `Normal` / `High` / `VeryHigh` (最低 / 很低 / 低 / 普通 / 高 / 最高) |

### IO 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `Manufacturer` | `General` | 通用 |
| | `Yuan` | 源台 |
| | `Dao` | Dao台 |
| | `Nov` | Nov台 |
| | `null` | 自动识别 |

## 附录: Mod (不写入配置文件)

`Mod` **不会**出现在 `settings.json` 中, 其值仅在游玩当前谱面时生效 (谱面内 Mod 设置保存在谱面文件中). 此处列出默认值供参考.

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **游玩速度**, 调整游戏速度倍率 |
| `AutoPlay` | `"Disable"` | **自动游玩**, 小小蓝白帮你打. 可选 `Disable` 禁用 / `Enable` 开启 / `DJAuto_ButtonRing_First` DJAuto (按键优先) / `DJAuto_TouchPanel_First` DJAuto (内屏优先) |
| `JudgeStyle` | `"DEFAULT"` | **判定风格**, 用更严的判定挑战自己. 可选 `DEFAULT` / `MAJI` / `GACHI` / `GORI` |
| `SubdivideSlideJudgeGrade` | `false` | **细分 Slide 判定等级**, 允许 Slide 出现小 P 判定 |
| `AllBreak` | `false` | **全 Break**, 所有音符变为 Break |
| `AllEx` | `false` | **全 Ex**, 所有音符变为 Ex |
| `AllTouch` | `false` | **全 Touch**, 所有音符变为 Touch |
| `SlideNoHead` | `false` | **无头星星**, 移除 Slide 头 |
| `SlideNoTrack` | `false` | **去掉 Slide**, 移除 Slide 轨迹 |
| `ButtonRingForTouch` | `false` | **纯内屏体验**, 允许按键操作 Slide 和 Touch. 仅桌面端存在 |
| `NoteMask` | `"Disable"` | **Note 遮罩**, 音符遮罩挡板 |


