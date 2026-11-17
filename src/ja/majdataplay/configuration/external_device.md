# 外部デバイス

:::tip
ソフトウェアは現在も継続的に更新されているため、関連するオプションや説明が古くなっている可能性があります。このページで要件を満たせない場合は、QQ グループ `667644338` に参加して質問・議論してください。
:::

## Windows/Mac/Linux

Windows/Mac/Linux 版では、多種多様な接続方法を提供しており、自動検出機能も追加しています。

ほとんどの場合、設定ファイルを変更する必要はありません。ゲームが入力方式を自動で検出します。もちろん、`system-settings.json` で関連する設定を自分で変更することもできます。

[`system-settings.json` を開き](/ja/majdataplay/configuration/)、一番下までスクロールしてください。IO 設定はデフォルトで次のようになっています。

``` json
"IO": {
    "Manufacturer": null,
```
サポートされている値は次のとおりです。
- `General`	汎用
- `Yuan` Yuan コントローラー
- `Dao`	Dao コントローラー
- `Nov`	Nov コントローラー
- `NPro` NPro コントローラー
- `null` 自動検出
- `Pipe` [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager)


## モバイルデバイス

[`system-settings.json` を開き](/ja/majdataplay/configuration/)、一番下までスクロールしてください。IO 設定はデフォルトで次のようになっています。

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

コントローラーが使用する入力方式に応じて、値を次のように変更します。

- キーボード入力の場合は `"None"` を `"Keyboard"` に変更します
- ゲームパッド入力の場合は `"None"` を `"Gamepad"` に変更します
