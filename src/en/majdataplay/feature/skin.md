# Skins

Public skins are available from [GitHub](https://github.com/TeamMajdata/MajdataPlay-Skins) or [Tencent CNB](https://cnb.cool/TeamMajdata/MajdataPlay-Skins).

Place the skin you want to use in the `Skins` folder under the same directory as the [configuration file](/en/majdataplay/configuration/). Refer to the default skin for the exact structure, shown below.

``` txt
Skins/
│
├── Light2/
│   ├── outline.png
│   ├── SubBackgourd.png ~~why is there a typo here too~~
│   └── ...
│
├── Skin name/
│   ├── outline.png
│   └── ...
│
└── Skin name/
    ├── outline.png
    └── ...
```

A skin folder usually contains:

- the various notes, judgment lines, touch feedback, sub-screen backgrounds and loading images
- the skin's own textures and configuration

Select the skin name in the in-game settings or in `Display.Skin` in `settings.json`; if the skin does not exist, the game falls back to the first available skin.

## Sound effects, voice lines and backgrounds

Sound effects, BGM and assistant voice lines are located in the game's `StreamingAssets` directory. A Windows build usually places them in `MajdataPlay_Data/StreamingAssets`; on other platforms they are in `StreamingAssets` under the game data directory.

Content you can replace includes:

- `bgm` and the various judgment sound effects
- the voice lines of Xiaoxiao Lanbai
- some UI sound effects

## AP / FC effects and UI backgrounds

AP / FC effects and some UI backgrounds are located under `StreamingAssets/MovieBG`. Back up the original files before replacing them, and keep the file names unchanged.

::: warning
Other runtime effects cannot currently be replaced through skins; to change them, you need to download the Unity Editor and rebuild the game.
:::
