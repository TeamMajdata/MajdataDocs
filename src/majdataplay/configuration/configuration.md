# 配置详解

::: tip 两个配置文件
从 **2.1.0-preview6** 起, MajdataPlay 的配置拆分为两个文件:

- `settings.json`: **用户设置**, 包含 `Game`、`Judge`、`Display`、`Volume`、`Touch`. 登录在线账号后, 这组设置可能改为从账号读取并上传.
- `system-settings.json`: **系统设置**, 包含 `Common`、`Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Network`、`IO`. 这组设置描述当前设备, 始终保存在本地.

本文逐项解释两个文件中的全部设置项, 并给出每项在**首次运行自动生成**时的默认值. 2.1.0-preview6 之前的单文件 `settings.json` 说明保留在 [旧版配置详解](/majdataplay/configuration/legacy).
:::

::: warning
修改配置时请确保游戏<mark>已完全关闭</mark>. 在游戏运行中手动改动的文件, 会在游戏保存设置时被覆盖. 若你不熟悉 JSON, 建议使用 [VSCode](https://code.visualstudio.com/) 等带语法检查的编辑器.
:::

阅读下表前请先了解:

- **默认值**指程序内置默认值 (代码中各设置属性的初始化值), 也就是首次运行时生成的值. 你文件里的值可能与下表不同.
- 部分项因平台而异, 会在说明中标注 **Windows**、**桌面端** 或 **移动端** (Android / iOS). 下表以 **Windows** 版为主.
- 标有 <mark>隐藏</mark> 的项不会出现在游戏内设置界面, 只能改配置文件.
- 标有 <mark>不写入</mark> 的项不会出现在对应文件中.
- 枚举值在 JSON 中以字符串写入, 例如 `"Modern"`、`"TrackSkip"`; 布尔值写作 `true` / `false`.
- 文件中缺失的分类或项会使用内置默认值. 文件无法读取时, 游戏会把它备份为 `.bak` 后使用默认值重新生成.

## 文件位置与升级

两个文件都位于 [配置文件](/majdataplay/configuration/index) 所述的同一目录. 首次启动 2.1.0-preview6 或更新版本时:

- 如果 `system-settings.json` 不存在, 游戏会创建它; 旧版 `settings.json` 中的系统设置会在读取时迁移进来, 并在下次保存时从 `settings.json` 中移除.
- 若旧版 `settings.json` 里的设置改变了分类 (例如 `Audio.Volume` 变为 `Volume`, `Display.RenderQuality` 变为 `Rendering.RenderQuality`), 游戏会自动把它们移到新位置. 同名的新键优先于旧键.
- 旧版 `machine_description.json` 会被导入 `Network.Online.Machine`, 然后重命名为 `machine_description.json.bak`.

详细迁移规则见文末的 [从旧版升级](#从旧版升级).

## settings.json —— 用户设置

| 节 | 中文含义 | 内容 |
| --- | --- | --- |
| `Game` | 游戏设定 | 音符速度、显示信息、重开 / 跳过、随机与镜像等 |
| `Judge` | 判定设定 | 各类偏移、判定模式与判定文字显示 |
| `Display` | 显示设定 | 皮肤、中央信息、判定显示距离、缩放与传感器显示 |
| `Volume` | 音量设定 | 各音轨音量 |
| `Touch` | 触摸设定 | 模拟触摸半径与 A~E 区判定范围 |

## Game —— 游戏设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `TapSpeed` | 浮点 | `7.5` | **Tap 速度**, 调整音符速度. 步进 `0.25`, 可为负数 (反向下落) |
| `TouchSpeed` | 浮点 | `7.5` | **Touch 速度**, 调整 Touch 音符速度. 步进 `0.25` |
| `SlideFadeInOffset` | 浮点 | `0.0` | **Slide 淡入偏移**, 调整 Slide 淡入时机, 右调推迟. 步进随 [偏移单位](#judge-枚举取值) 变化 |
| `BackgroundDim` | 浮点 | `0.8` | **背景亮度**, 值越大越暗. 范围 `0`~`1`, 步进 `0.05` |
| `SkipVideoDownload` | 布尔 | `false` | **跳过视频下载**, 在线谱面不下载视频 |
| `StarRotation` | 布尔 | `true` | **星星旋转**, 星星下落时旋转 |
| `TrackSkip` | 布尔 | `true` | **跳过乐曲**, 按住 2、3、6、7 键强制跳过乐曲 |
| `EnforceGameFailure` | 枚举 | `"Disabled"` | **强制乐曲失败**, 当无法达到目标时自动跳过或重试 |
| `FastRetry` | 布尔 | `true` | **快速重开**, 按住 3、4、5、6 键快速重开 |
| `FastPractice` | 布尔 | `false` | **快速练习**, 按住 1、2、7、8 键进入练习模式 (开始前 -5 秒, 按住后 +10 秒) |
| `GameplaySubScreenClickBehavior` | 枚举 | `"TrackSkip"` | **游戏时副屏点击行为**, 调整游玩时点击副屏的行为. 移动端默认为 `"TrackSkip_1_Sec_Delay"` |
| `Mirror` | 枚举 | `"Off"` | **镜像**, 谱面左右 / 上下对称翻转 |
| `Rotation` | 整数 | `0` | **旋转**, 旋转谱面角度, 正数顺时针. 范围 `-7`~`7`, 步进 `1` |
| `SlideSkipping` | 布尔 | `true` | **Slide 跳区**, 开启 / 关闭 Slide 跳区机制 |
| `Random` | 枚举 | `"Disabled"` | **随机**, 随机打乱音符 |
| `ButtonRingForTouch` | 布尔 | `false` | **纯内屏体验**, 允许按键操作 Slide 和 Touch. 移动端默认为 `true` |
| `LeadInTime` | 整数 | `1` | **等待时间**, 进入游戏界面后, 正式开始游戏之前的等待秒数. 范围 `1`~`5`, 步进 `1` |
| `ManualStartGame` | 布尔 | `false` | **手动开始游戏**, 加载后手动按键开始 (用于比赛) |
| `NoteAppearRate` | 浮点 | `0.265` | **Note 淡入偏移**, 调整音符淡入效果. 步进 `0.001` |

### Game 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
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

## Judge —— 判定设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `AudioOffset` | 浮点 | `0.0` | **音频偏移 (A 判)**, 音押. 音符与音乐不同步时调整. Fast 多向左调, Late 多向右调. 该项会移动正解音, 相当于谱面中的 `&first` |
| `JudgeOffset` | 浮点 | `0.0` | **判定偏移 (B 判)**, 目押延迟, 补偿设备输入延迟. Fast 多向左调, Late 多向右调 |
| `AnswerOffset` | 浮点 | `0.0` | **正解音偏移**, 调整正解音播放时机 (不影响判定). 左调提前, 右调延后. 不确定请勿调整 |
| `TouchPanelOffset` | 浮点 | `0.0` | **内屏输入偏移**, 补偿触摸输入延迟. Fast 多向左调, Late 多向右调 |
| `EnableJudgeTimingGauge` | 布尔 | `false` | **显示判定偏移指示器**, 显示实时判定偏移与平均判定位置 |
| `OffsetUnit` | 枚举 | `"Frame"` | **偏移单位**, 调整各类偏移的单位 |
| `Mode` | 枚举 | `"Modern"` | **判定模式**, 选择游戏判定和分数模式 (旧框 / 新框) |
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

::: tip 偏移的步进
`AudioOffset`、`JudgeOffset`、`AnswerOffset`、`TouchPanelOffset`、`SlideFadeInOffset` 与 `Debug.DisplayOffset` 的步进由 `OffsetUnit` 决定: `"Second"` 为 `0.001`, `"Frame"` 为 `0.1`. 在设置界面中这些值会按当前单位对齐; 直接编辑 JSON 时可以写入任意数值.
:::

### Judge 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `OffsetUnit` | `Second` | 秒 |
| | `Frame` | 帧 |
| `Mode` | `Classic` | 旧框 (Classic) |
| | `Modern` | 新框 (Modern) |
| `SlideSortOrder` | `Classic` | 旧框排序 (旧音符在下) |
| | `Modern` | 新框排序 (旧音符在上) |
| `FastLateType` / `NoteJudgeType` / `TouchJudgeType` / `SlideJudgeType` / `BreakJudgeType` / `BreakFastLateType` | `All` | 全部 |
| | `BelowCP` | Critical 以下 |
| | `BelowP` | Perfect 以下 |
| | `BelowGR` | Great 以下 |
| | `MissOnly` | 仅 Miss |
| | `Disable` | 禁用 |

## Display —— 显示设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Language` | 字符串 | `""` | **语言**. 源码默认空; 首次运行后由程序按当前语言写入, 形如 `"zh-CN - Majdata"` |
| `Skin` | 字符串 | `"default"` | **Note 皮肤**, 更换音符皮肤. 若配置的皮肤不存在, 程序会回退到第一个可用皮肤 |
| `BGInfo` | 枚举 | `"Combo"` | **中央显示**, 调整屏幕中央显示的信息 |
| `SecondaryBGInfo` | 枚举 | `"None"` | **额外信息显示**, 调整屏幕中下方显示的信息 |
| `SubScreenBGInfo` | 枚举 | `"Achievement"` | **副屏信息显示**, 调整副屏显示的信息 |
| `TopInfo` | 枚举 | `"None"` | **外框显示**, 顶部信息显示 (1 和 8 键之间) |
| `TapScale` | 浮点 | `1.0` | **Tap 缩放级别**, 调整 Tap 大小. 范围 `0`~`2`, 步进 `0.01` |
| `HoldScale` | 浮点 | `1.0` | **Hold 缩放级别**, 调整 Hold 的大小. 范围 `0`~`2`, 步进 `0.01` |
| `TouchScale` | 浮点 | `1.0` | **Touch 缩放级别**, 调整 Touch 大小. 范围 `0`~`2`, 步进 `0.01` |
| `SlideScale` | 浮点 | `1.0` | **Slide 缩放级别**, 调整 Slide 大小 (不影响 Wifi Slide). 范围 `0`~`2`, 步进 `0.01` |
| `SlidePathStyle` | 枚举 | `"Classic"` | **组合星星箭头样式**, 组合星星 (如 `1-4q7`) 的箭头排列方式 |
| `TouchFeedback` | 枚举 | `"Outer_Only"` | **触摸反馈**, 设置触摸反馈显示条件 |
| `DisplaySensor` | 布尔 | `false` | **显示传感器**, 高亮显示触发的触摸区域 |
| `SensorPosition` | 枚举 | `"MainScreen"` | **传感器显示位置**, 选择传感器分区的显示位置 |
| `SensorStyle` | 枚举 | `"RedGreen"` | **传感器显示风格**, 选择传感器分区的显示风格 |
| `SensorOpacity` | 整数 | `20` | **传感器透明度**, 调整显示强度. 范围 `10`~`90`, 步进 `10` |

### Display 枚举取值

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
| `SlidePathStyle` | `Classic` | 每段与单独星星的箭头完全重合, 圆弧相接处有断点 |
| | `Medium` | 与 `Classic` 相同, 但圆弧相接处会补上箭头 |
| | `Perfect` | 箭头沿整条组合星星连续排列 |
| `TouchFeedback` | `All` | 全部 |
| | `Outer_Only` | 仅外部 |
| | `Inner_Only` | 仅内部 |
| | `Disable` | 禁用 |
| `SensorPosition` | `MainScreen` | 主屏 |
| | `SubScreen` | 副屏 |
| `SensorStyle` | `Brightness` | 亮暗 |
| | `RedGreen` | 红绿 |
| | `Classic` | 经典 |

## Volume —— 音量设定

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
旧版把音量放在 `Audio.Volume` 中. 新版的 `Volume` 是独立分类, 旧值会在启动时自动迁移. 设置界面的音量菜单也对应这个分类.
:::

## Touch —— 触摸设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `TouchSimulationRadius` | 浮点 | `0.5` | **模拟触摸半径**, 模拟触摸点大小, 值越大手指判定越大 (仅游戏中生效). 范围 `0`~`2`, 步进 `0.05` |
| `TouchAAreaExtraRadius` | 浮点 | `0.0` | **模拟触摸 A 区半径**, 扩大 A 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchBAreaExtraRadius` | 浮点 | `0.0` | **模拟触摸 B 区半径**, 扩大 B 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchCAreaExtraRadius` | 浮点 | `0.25` | **模拟触摸 C 区半径**, 扩大 C 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchDAreaExtraRadius` | 浮点 | `0.2` | **模拟触摸 D 区半径**, 扩大 D 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchEAreaExtraRadius` | 浮点 | `0.1` | **模拟触摸 E 区半径**, 扩大 E 触摸区的触发半径. 范围 `0`~`2`, 步进 `0.05` |
| `TouchRadiusAdjust` | 浮点 | `0.0` | **触摸面积比例**, 根据手指接触面积调整触摸触发范围, `0` 为禁用. 范围 `0`~`2`, 步进 `0.05` |

## system-settings.json —— 系统设置

| 节 | 中文含义 | 内容 |
| --- | --- | --- |
| `Common` | 通用设定 | 录制模式、菜单滚动速度、光标、Note 折叠与 DJAuto 策略 |
| `Rendering` | 渲染设定 | 画质预设、帧率、垂直同步、UI 风格与画面布局 |
| `Audio` | 音频设定 | 音频后端、缓冲区与声道音量. 设置界面隐藏 |
| `Encoding` | 编码设定 | 录制编码参数, 录制模式为 `FFmpeg` 时显示 |
| `Decoding` | 解码设定 | 视频解码器与读取超时 |
| `Debug` | 调试 | 帧偏移、对象池容量与日志等级 |
| `Network` | 网络 | 在线账号、API 端点与代理. 设置界面隐藏 |
| `IO` | 输入 / 输出设备 | 手台、触摸板与 LED. 设置界面隐藏 |
| `Mod` | Mod | <mark>不写入</mark>, 仅作用于当前谱面 |

## Common —— 通用设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `RecordMode` | 枚举 | `"Disable"` | **录制模式**, 选择录制方式. 设为 `"FFmpeg"` 时才会显示 [Encoding](#encoding-——-编码设定) 菜单 |
| `MenuOptionIterationSpeed` | 整数 | `45` | **菜单选项连按速度** <mark>隐藏</mark>, 值越大滚动越快. `0` 按 `15` 处理 |
| `HideCursorInGame` | 布尔 | `true` | **游玩时隐藏光标** <mark>隐藏</mark>, 仅桌面端可用 |
| `NoteFolding` | 布尔 | `true` | **Note 折叠** <mark>隐藏</mark>, 折叠音符显示. iOS 不写入该项 |
| `DJAutoPolicy` | 枚举 | `"Strict"` | **DJAuto 策略**, 严格: 只能使用按键或触摸之一. 宽容: 可混合使用 |

### Common 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `RecordMode` | `Disable` | 禁用 |
| | `OBSTrigger` | 连接 OBS WebSocket 自动触发录制. 移动端不可选 |
| | `FFmpeg` | 使用内置 FFmpeg 录制 |
| `DJAutoPolicy` | `Strict` | 严格 |
| | `Permissive` | 宽容 |

## Rendering —— 渲染设定

`Rendering` 提供 5 种画质预设. `"EnergySaving"`、`"Performance"`、`"Beautiful"`、`"Refined"` 会自动写入一组固定参数; `"Custom"` 才会显示并允许逐项调整下面的抗锯齿、纹理精度、UI 风格、输出模式与渲染精度. 切换回命名预设会覆盖这些自定义参数.

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `RenderQuality` | 枚举 | `"Beautiful"` | **渲染质量**, 控制全局渲染质量. 图形兼容模式开启时隐藏 |
| `FPSLimit` | 整数 | `120` | **帧率限制**, 限制最高帧率. 最小 `-1` (`-1` 表示不限制), 步进 `1` |
| `VSync` | 布尔 | `true` | **垂直同步**, 是否开启垂直同步. 移动端设置界面隐藏该项 |
| `VulkanLowLatencyVSync` | 布尔 | `true` | **低延迟垂直同步** <mark>隐藏</mark>, 仅 Windows 生效. 移动端不写入 |
| `VulkanLowLatencyVSyncBackend` | 枚举 | `"Timer"` | **低延迟垂直同步后端** <mark>隐藏</mark>, 仅桌面端. 移动端不写入 |
| `AntiAliasing` | 枚举 | `"Disabled"` | **抗锯齿**, 控制抗锯齿质量. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `TextureQuality` | 枚举 | `"High"` | **纹理精度**, 控制 UI、封面、皮肤等图片的显示精度. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `UIOutlineMode` | 枚举 | `"All"` | **UI 风格**, 控制 UI 图片的渲染效果. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `UIBackdropStyle` | 枚举 | `"GaussianBlur"` | **渲染风格**, 选择精致画质的渲染效果. 仅 `"Refined"` 时显示 |
| `OutputMode` | 枚举 | `"Direct"` | **图形输出模式**, 选择画面输出方式. 黑屏时可尝试兼容输出. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `CompatibilityMode` | 布尔 | `false` | **图形兼容模式**, 出现黑屏、卡顿等问题时可以开启 |
| `SystemResolutionScaling` | 整数 | `100` | **系统分辨率缩放 (实验)**, 调整系统显示分辨率. 范围 `10`~`100`, 步进 `5`. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `RenderScale` | 整数 | `100` | **渲染精度**, 调整内部渲染分辨率. `100` 为原始分辨率; 降低可减轻 GPU 负载, 但画面和文字会变模糊, 不改变布局或判定. 范围 `10`~`200`, 步进 `5`. 不为 `100` 时会强制使用 `"Intermediate"` 输出. 仅 `"Custom"` 且兼容模式关闭时显示 |
| `DisplayRuntimeInfo` | 布尔 | `true` | **显示帧率和版本号**, 在右上角显示帧率和版本号 |
| `Resolution` | 字符串 | `"1080x1920"` | **分辨率** <mark>隐藏</mark>, 仅桌面端存在 |
| `FullScreen` | 布尔 | `true` | **强制全屏** <mark>隐藏</mark>, 仅桌面端存在 |
| `Topmost` | 布尔 | `false` | **窗口置顶** <mark>隐藏</mark>, 保持窗口置顶. 仅桌面端存在 |
| `MainScreenTransform` | 布尔 | `false` | **自定义画面比例**, 自定义主画面的缩放和位置. 移动端默认为 `true` |
| `MainScreenScale` | 浮点 | `1.0` | **主屏缩放**, 调整主画面整体大小. 范围 `0.05`~`1.5`, 步进 `0.01` |
| `MainScreenOffset` | 浮点 | `1.0` | **主屏位置偏移**, 微调主画面位置. 范围 `-1`~`1`, 步进 `0.01` |
| `MainScreenCachedScreenCenterY` | 浮点 | `960.0` | **主屏中心 Y (缓存)** <mark>隐藏</mark>, 缓存的主屏垂直中心坐标 |
| `SubDisplayOffset` | 浮点 | `0.0` | **副屏位置偏移**, 微调副显示区域位置. 范围 `-5`~`5`, 步进 `0.01` |
| `SubDisplayScale` | 浮点 | `1.0` | **副屏缩放**, 调整副显示区域大小. 步进 `0.01` |
| `GameplayScreenRotationAngle` | 枚举 | `"Zero"` | **游戏画面旋转**, 旋转游戏画面 |

`SystemScalingStatus`、`DisplayBufferResolution`、`SceneRenderResolution`、`CurrentOutputPath` 是只读的诊断项, 不写入 JSON, 也不接受修改.

### Rendering 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `RenderQuality` | `EnergySaving` | 节能 |
| | `Performance` | 性能 |
| | `Beautiful` | 美观 (默认) |
| | `Refined` | 精致 |
| | `Custom` | 自定义 |
| `AntiAliasing` | `Disabled` | 关闭 |
| | `MSAA2x` | MSAA 2× |
| | `MSAA4x` | MSAA 4× |
| | `MSAA8x` | MSAA 8× |
| `TextureQuality` | `Low` | 低 |
| | `Medium` | 中 |
| | `High` | 高 |
| `UIOutlineMode` | `None` | 不透明 |
| | `Performance` | 混合透明 |
| | `All` | 半透明 |
| | `GaussianBlur` | 高斯模糊 |
| | `LiquidGlass` | 液态玻璃 |
| `UIBackdropStyle` | `GaussianBlur` | 高斯模糊 |
| | `LiquidGlass` | 液态玻璃 |
| `OutputMode` | `Direct` | 直接输出 |
| | `Intermediate` | 兼容输出 |
| `VulkanLowLatencyVSyncBackend` | `Auto` | 自动选择可用后端 |
| | `PresentWait` | 使用 present wait, 不可用时回退计时器 |
| | `Timer` | 始终使用计时器 |
| `GameplayScreenRotationAngle` | `Zero` | 0° |
| | `_90` | 90° |
| | `_180` | 180° |
| | `_270` | 270° |

## Audio —— 音频设定

该节在设置界面中<mark>隐藏</mark>, 但仍会生效. 音量已移到 `settings.json` 的 [Volume](#volume-——-音量设定) 分类.

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `ForceMono` | 布尔 | `false` | **强制单声道**, 将音频混合为单声道输出 |
| `Wasapi` | 对象 | 见下 | **WASAPI 设定**, 仅 Windows 存在 |
| `Asio` | 对象 | 见下 | **ASIO 设定**, 仅 Windows 存在 |
| `Channel` | 对象 | 见下 | **声道音量**, 仅桌面端存在 |
| `Bass` | 对象 | 见下 | **BASS 音频缓冲设定**, 所有平台存在 |
| `Backend` | 枚举 | `"Wasapi"` | **音频后端**. 桌面端默认 `"Wasapi"`, 移动端默认 `"BassSimple"` |

### Audio.Wasapi —— WASAPI 设定 (仅 Windows)

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `Exclusive` | `true` | **独占模式**, 独占音频设备. 关闭后 OBS 等程序才能同时录制 / 播放声音 |
| `RawMode` | `true` | **原始模式 (Raw Mode)**, 使用未经系统混音处理的原始数据 |
| `AsyncMode` | `true` | **异步模式**, 使用异步音频处理. 旧配置缺失时按 `true` 处理 |
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

## Encoding —— 编码设定

该菜单只在 `Common.RecordMode` 为 `"FFmpeg"` 时显示.

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `PreferredEncoder` | 枚举 | `"Hardware"` | **首选编码器**, 设定编码时优先使用的编码器 (如果可用) |
| `EncodingFormat` | 枚举 | `"H264"` | **编码格式**, 设定录制视频时使用的编码格式 |
| `FrameRate` | 整数 | `60` | **帧率**, 录制帧率. 范围 `30`~`240`, 步进 `30` |
| `RateControlMode` | 枚举 | `"VBR"` | **码率控制**, 选择恒定码率或可变码率 |
| `BitRate` | 整数 | `4000000` | **码率**, 设定录制视频时的基本码率. 最小 `100000`, 步进 `50000` |
| `MaximumBitRate` | 整数 | `8000000` | **最大码率**, 设定使用 VBR 录制视频时的最大码率. 仅 `"VBR"` 时显示. 最小 `100000`, 步进 `50000` |
| `ResolutionScale` | 浮点 | `1.0` | **分辨率缩放**, 设定录制视频时的实际分辨率倍率. 范围 `0.25`~`1`, 步进 `0.25` |
| `ContainerFormat` | 枚举 | `"MP4"` | **容器格式** <mark>隐藏</mark> |

### Encoding 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `PreferredEncoder` | `Software` | 软件编码 |
| | `Hardware` | 硬件编码 |
| `EncodingFormat` | `H264` | H.264 / AVC |
| | `HEVC` | H.265 / HEVC |
| | `VP9` | VP9 |
| | `AV1` | AV1 |
| | `MPEG4` | MPEG-4 Part 2 |
| `RateControlMode` | `CBR` | 恒定码率 |
| | `VBR` | 可变码率 |
| `ContainerFormat` | `MP4` | MP4 |
| | `Matroska` | Matroska (MKV) |

## Decoding —— 解码设定

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `PreferredDecoder` | 枚举 | `"Hardware"` | **首选解码器**, 设定解码时优先使用的解码器 (如果可用) |
| `IOTimeoutSeconds` | 整数 | `15` | **IO 超时时间**, 设定视频播放器读取超时时间 (秒). 最小 `1` |

### Decoding 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `PreferredDecoder` | `Software` | 软件解码 |
| | `Hardware` | 硬件解码 |

## Debug —— 调试

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `DisplayOffset` | 浮点 | `0.0` | **帧偏移**, 补偿帧延迟. 最小 `0`, 步进随偏移单位变化. 不确定请勿调整 |
| `MaxQueuedFrames` | 整数 | `2` | **最大排队帧数** <mark>隐藏</mark>, 允许排队等待处理的最大帧数. 移动端不写入 |
| `FrameTimingDiagnostics` | 布尔 | `false` | **帧时序诊断** <mark>隐藏</mark>, 输出帧时序诊断信息 |
| `TapPoolCapacity` | 整数 | `96` | **Tap 对象池容量** <mark>隐藏</mark>, 移动端默认为 `48` |
| `HoldPoolCapacity` | 整数 | `96` | **Hold 对象池容量** <mark>隐藏</mark>, 移动端默认为 `48` |
| `TouchPoolCapacity` | 整数 | `64` | **Touch 对象池容量** <mark>隐藏</mark> |
| `TouchHoldPoolCapacity` | 整数 | `64` | **TouchHold 对象池容量** <mark>隐藏</mark> |
| `EachLinePoolCapacity` | 整数 | `48` | **每条轨道对象池容量** <mark>隐藏</mark>, 移动端默认为 `24` |
| `DebugLevel` | 枚举 | `"Info"` | **日志等级** <mark>隐藏</mark>, 输出日志的最低等级. iOS 不写入 |

### Debug 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `DebugLevel` | `Debug` | 调试 |
| | `Info` | 信息 |
| | `Warning` | 警告 |
| | `Error` | 错误 |
| | `Fatal` | 致命 |

## Network —— 网络

该节在设置界面中<mark>隐藏</mark>, iOS 版对应设置位于系统"设置" App 中. 想传分打榜 / 记录, 或直接在游戏内游玩在线谱面, 请先阅读 [联网](/majdataplay/configuration/online).

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Online` | 对象 | 见下 | **在线服务** |
| `Proxy` | 对象 | 见下 | **代理** |

### Network.Online

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `false` | **启用联网**, 是否启用在线功能. iOS 不写入 |
| `ApiEndpoints` | 数组 | 见下 | **API 端点列表**, 可配置多个服务器 |
| `Machine` | 对象 | 见下 | **机台描述**, 用于机台注册与二维码认证 |

`ApiEndpoints` 默认包含一项 `MajdataNET` (iOS 默认为空):

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Name` | 字符串 | `"MajdataNET"` | **名称**, 端点显示名 |
| `Url` | 字符串 | `"https://majdata.net/api3/api/"` | **接口地址**, 服务器 API 根地址 |
| `Username` | 字符串 | `"YourUsername"` | **用户名**, 预填账号 |
| `Password` | 字符串 | `"YourPassword"` | **密码**, 预填密码 |
| `AutoLogin` | 布尔 | `false` | **自动登录**, 启动时自动登录 |

`Machine` 的默认值:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Name` | 字符串 | `"MajdataPlay Client"` | **机台名称** |
| `Description` | 字符串 | `"MajdataPlay Client QR Code Authentication"` | **机台描述** |

### Network.Proxy

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `true` | **使用代理** |
| `Url` | 字符串 | `""` | **代理地址** |

::: tip
旧版把在线设置放在 `Online` 分类, 并使用 `UseProxy` / `Proxy` 两个键. 新版会把它们迁移到 `Network.Online` 与 `Network.Proxy`. 旧版单独的 `machine_description.json` 也会自动导入 `Network.Online.Machine`.
:::

## IO —— 输入 / 输出设备

该节在设置界面中<mark>隐藏</mark>, 主要用于外接手台与 LED. 详见 [外置设备](/majdataplay/configuration/external_device).

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Manufacturer` | 枚举 / `null` | `null` | **设备制造商**, `null` 表示自动识别. 仅桌面端存在 |
| `Player` | 整数 | `1` | **玩家编号**, 手柄玩家索引. 仅桌面端存在 |
| `InputDevice` | 对象 | 见下 | **输入设备** |
| `OutputDevice` | 对象 | 见下 | **输出设备**. 仅桌面端存在 |

### IO.InputDevice

桌面端:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `ButtonRing` | 对象 | 见下 | **按键圈 (手台按键)** |
| `TouchPanel` | 对象 | 见下 | **触摸板** |

移动端:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `ExternalButtonRing` | 枚举 | `"None"` | **外接按键圈**, `"None"` 无 / `"Keyboard"` 键盘 / `"Gamepad"` 手柄 |

### IO.InputDevice.ButtonRing

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `true` | **启用**, 是否启用按键圈输入 |
| `Type` | 枚举 / `null` | `null` | **设备类型**, `null` 自动; 可选 `"Keyboard"` 键盘 / `"HID"` HID 设备 / `"Pipe"` 外部 IO 管理器 |
| `Debounce` | 布尔 | `false` | **启用去抖**, 是否开启按键去抖 |
| `PollingRateMs` | 整数 | `0` | **轮询间隔**, 单位毫秒, `0` 表示不限 |
| `DebounceThresholdMs` | 整数 | `0` | **去抖阈值**, 单位毫秒 |
| `HidOptions` | 对象 | 见下 | **HID 设备参数** |

### IO.InputDevice.TouchPanel

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `true` | **启用**, 是否启用触摸板输入 |
| `Debounce` | 布尔 | `false` | **启用去抖**, 是否开启触摸去抖 |
| `Sensitivities` | 对象 | `A`~`E` 均为 `0` | **灵敏度**, A~E 各区触摸灵敏度 |
| `PollingRateMs` | 整数 | `0` | **轮询间隔**, 单位毫秒 |
| `DebounceThresholdMs` | 整数 | `0` | **去抖阈值**, 单位毫秒 |
| `SerialPortOptions` | 对象 | 见下 | **串口参数** |
| `UsbOptions` | 对象 | 见下 | **USB 设备参数** |
| `CapacitivePanelOptions` | 对象 | 见下 | **电容触摸板参数** |

### IO.InputDevice.TouchPanel.CapacitivePanelOptions

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `TouchRadius` | 整数 | `30` | **触摸半径**, 电容触摸判定半径 |
| `RadiusOffset` | 对象 | `A:0` `B:20` `C:0` `D:0` `E:25` | **半径偏移**, A~E 各区半径微调 |

### IO.OutputDevice.Led

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Enable` | 布尔 | `true` | **启用**, 是否启用 LED 输出 |
| `Brightness` | 浮点 | `1.0` | **亮度**, LED 亮度 |
| `RefreshRateMs` | 整数 | `16` | **刷新间隔**, 单位毫秒 |
| `Throttler` | 布尔 | `true` | **限流**, 限制 LED 刷新频率 |
| `SerialPortOptions` | 对象 | 见下 | **串口参数** |
| `HidOptions` | 对象 | 见下 | **HID 设备参数** |

### IO 通用参数

`HidOptions` 与 `UsbOptions` 结构相同:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `DeviceName` | 字符串 / `null` | `null` | **设备名称**, 指定设备名 (留空自动匹配) |
| `ProductId` | 整数 / `null` | `null` | **产品 ID (PID)** |
| `VendorId` | 整数 / `null` | `null` | **厂商 ID (VID)** |
| `Exclusice` | 布尔 | `false` | **独占模式**. 字段名在配置文件中即拼写为 `Exclusice` |

`SerialPortOptions`:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `Port` | 整数 / 字符串 / `null` | `null` | **串口端口**. Windows 下为整数, 其他平台为字符串 |
| `BaudRate` | 整数 / `null` | `null` | **波特率** |

`HidOptions` 额外包含:

| 项 | 类型 | 默认值 | 中文含义 |
| --- | --- | --- | --- |
| `OpenPriority` | 枚举 | `"VeryHigh"` | **打开优先级** |

### IO 枚举取值

| 项 | 取值 | 中文含义 |
| --- | --- | --- |
| `Manufacturer` | `General` | 通用 |
| | `Yuan` | 源台 |
| | `Dao` | Dao 台 |
| | `Nov` | Nov 台 |
| | `NPro` | NPro 台 |
| | `Pipe` | [外部 IO 管理器](/majdataplay/development/external-io-manager) |
| | `null` | 自动识别 |
| `ButtonRing.Type` | `Keyboard` | 键盘 |
| | `HID` | HID 设备 |
| | `Pipe` | 外部 IO 管理器 |
| | `null` | 自动 |
| `ExternalButtonRing` | `None` | 无 |
| | `Keyboard` | 键盘 |
| | `Gamepad` | 手柄 |
| `OpenPriority` | `Idle` | 最低 |
| | `VeryLow` | 很低 |
| | `Low` | 低 |
| | `Normal` | 普通 |
| | `High` | 高 |
| | `VeryHigh` | 最高 |

## 附录: Mod (不写入配置文件)

`Mod` **不会**出现在 `system-settings.json` 中, 其值仅在游玩当前谱面时生效 (谱面内 Mod 设置保存在谱面文件中). 此处列出默认值供参考.

| 项 | 默认值 | 中文含义 |
| --- | --- | --- |
| `PlaybackSpeed` | `1.0` | **游玩速度**, 调整游戏速度倍率. 步进 `0.05` |
| `AutoPlay` | `"Disable"` | **自动游玩**, 小小蓝白帮你打. 可选 `Disable` 禁用 / `Enable` 开启 / `DJAuto_ButtonRing_First` DJAuto (按键优先) / `DJAuto_TouchPanel_First` DJAuto (内屏优先) |
| `JudgeStyle` | `"DEFAULT"` | **判定风格**, 用更严的判定挑战自己. 可选 `DEFAULT` / `MAJI` / `GACHI` / `GORI` |
| `SubdivideSlideJudgeGrade` | `false` | **细分 Slide 判定等级**, 允许 Slide 出现小 P 判定 |
| `AllBreak` | `false` | **全 Break**, 所有音符变为 Break |
| `AllEx` | `false` | **全 Ex**, 所有音符变为 Ex |
| `AllTouch` | `false` | **全 Touch**, 所有音符变为 Touch |
| `SlideNoHead` | `false` | **无头星星**, 移除 Slide 头 |
| `SlideNoTrack` | `false` | **去掉 Slide**, 移除 Slide 轨迹 |
| `NoteMask` | `"Disable"` | **Note 遮罩**, 音符遮罩挡板. 可选 `Disable` / `Outer` / `Inner` |

::: tip
`ButtonRingForTouch` 在新版中是持久化的游戏设置, 已移到 `settings.json` 的 `Game.ButtonRingForTouch`, 不再属于 Mod.
:::

## 从旧版升级

2.1.0-preview6 首次启动时会读取旧版 `settings.json` 并自动迁移, 不需要手动拆分. 主要变化如下:

- `Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Online`、`IO` 分类从 `settings.json` 移到 `system-settings.json`.
- `Audio.Volume` 移到 `settings.json` 的 `Volume`.
- `Display` 中的 `RenderQuality`、`RenderScale`、`FPSLimit`、`VSync` 移到 `Rendering`.
- `Display` 中的 `Resolution`、`MainScreen*`、`SubDisplay*`、`GameplayScreenRotationAngle`、`Topmost` 移到 `Rendering`.
- `Debug` 中的 `DisplayRuntimeInfo`、`FullScreen` 移到 `Rendering`; `MenuOptionIterationSpeed`、`HideCursorInGame`、`NoteFolding`、`DJAutoPolicy` 移到 `Common`; 传感器显示移到 `Display`; 触摸模拟项移到 `Touch`.
- `Display` 中的判定显示项移到 `Judge`; `Game` 中的 `BGInfo` 等显示信息项移到 `Display`, `EnableJudgeTimingGauge` 移到 `Judge`, `NoteAppearRate` 移到 `Game`, `SkipVideoDownload` 从 `Display` 移到 `Game`; `Game.RecordMode` 移到 `Common.RecordMode`.
- `Online` 分类改为 `Network.Online`, 代理改为 `Network.Proxy`; `IO.InputDevice.Player` 移到 `IO.Player`.
- `machine_description.json` 导入 `Network.Online.Machine` 后重命名为 `machine_description.json.bak`.

迁移会保留新文件中已有的键, 旧键只补充缺失项; 无法读取的文件会先备份为 `.bak` 再使用默认值. 下一次保存后, 两个文件都只保留当前布局.
