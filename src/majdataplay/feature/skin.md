# 皮肤

公开皮肤可以在 [GitHub](https://github.com/TeamMajdata/MajdataPlay-Skins) 或[腾讯 CNB](https://cnb.cool/TeamMajdata/MajdataPlay-Skins) 获取

请将想要使用的皮肤放置在和[配置文件](/majdataplay/configuration/)同级的目录下的`Skins`文件夹里. 具体结构参照默认皮肤, 如下.

``` txt
Skins/
│
├── Light2/
│   ├── outline.png
│   ├── SubBackgourd.png ~~为什么这里也有typo~~
│   └── ...
│
├── 皮肤名/
│   ├── outline.png
│   └── ...
│
└── 皮肤名/
    ├── outline.png
    └── ...
```

皮肤文件夹中通常包含:

- 各类 Note、判定线、触摸反馈、副屏背景和加载图
- 皮肤自己的贴图与配置

在游戏内设置或 `settings.json` 的 `Display.Skin` 中选择皮肤名; 如果皮肤不存在, 游戏会回退到第一个可用皮肤.

## 音效、语音与背景

音效、BGM 和助手语音位于游戏的 `StreamingAssets` 目录. Windows 构建通常位于 `MajdataPlay_Data/StreamingAssets`, 其他平台位于游戏数据目录下的 `StreamingAssets`.

可以替换的内容包括:

- `bgm` 与各类判定音效
- 小小蓝白的语音
- 部分 UI 音效

## AP / FC 特效与 UI 背景

AP / FC 特效、部分 UI 背景位于 `StreamingAssets/MovieBG` 下. 替换前请先备份原文件, 并保持文件名一致.

::: warning
其他运行时特效暂不支持通过皮肤替换; 如需修改, 需要下载 Unity Editor 并重新编译游戏.
:::
