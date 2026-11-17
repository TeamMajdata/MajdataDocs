# 譜面を編集する

## 検索と置換

`Ctrl` + `F` でテキストを検索し、`Ctrl` + `H` で置換します。検索と置換のパネルは、Visual Studio Code などの一般的なテキストエディタのものとほぼ同じように動作します。

## 譜面テキストツール

これらのツールは、コンテキストメニューと **編集** メニューの両方から使用できます。

![譜面テキストツール](/majdatax/usage/edit/edit-tools.png)

各ツールは、選択したテキストを処理します。

MajdataX に譜面テキストツールを追加するプルリクエストを歓迎します。ツールは `IMajPlugin` を継承したクラスであるだけでかまいません。例として [MirrorPlugin.cs](https://github.com/re-poem/MajdataEdit-Neo/blob/main/Models/Plugins/MirrorPlugin.cs) を参照してください。
