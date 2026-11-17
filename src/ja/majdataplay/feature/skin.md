# スキン

公開スキンは [GitHub](https://github.com/TeamMajdata/MajdataPlay-Skins) または [Tencent CNB](https://cnb.cool/TeamMajdata/MajdataPlay-Skins) から入手できます。

使用するスキンは、[設定ファイル](/ja/majdataplay/configuration/) と同じ階層にある `Skins` フォルダーに配置してください。具体的な構造はデフォルトのスキンを参照してください。以下に示します。

``` txt
Skins/
│
├── Light2/
│   ├── outline.png
│   ├── SubBackgourd.png ~~なぜここにも typo があるのでしょう~~
│   └── ...
│
├── スキン名/
│   ├── outline.png
│   └── ...
│
└── スキン名/
    ├── outline.png
    └── ...
```

スキンフォルダーには通常、次のものが含まれます。

- 各種 Note、判定線、タッチフィードバック、サブ画面の背景、ローディング画像
- スキン独自のテクスチャと設定

ゲーム内の設定、または `settings.json` の `Display.Skin` でスキン名を選択します。スキンが存在しない場合、ゲームは最初の利用可能なスキンにフォールバックします。

## 効果音、ボイス、背景

効果音、BGM、アシスタントボイスはゲームの `StreamingAssets` ディレクトリにあります。Windows ビルドでは通常 `MajdataPlay_Data/StreamingAssets` にあり、その他のプラットフォームではゲームデータディレクトリ内の `StreamingAssets` にあります。

置き換え可能な内容は次のとおりです。

- `bgm` と各種判定音
- Xiaoxiao Lanbai のボイス
- 一部の UI 効果音

## AP / FC エフェクトと UI 背景

AP / FC エフェクトと一部の UI 背景は `StreamingAssets/MovieBG` にあります。置き換える前に元のファイルをバックアップし、ファイル名を一致させてください。

::: warning
その他の実行時エフェクトは現在スキンによる置き換えに対応していません。変更する場合は Unity Editor を入手してゲームを再ビルドする必要があります。
:::
