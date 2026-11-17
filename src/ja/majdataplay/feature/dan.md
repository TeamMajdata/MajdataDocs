# 段位

段位 (Dan) は、複数の譜面を順番につなげ、HP のルールを加えたチャレンジモードです。段位ファイルは `MaiCharts` ディレクトリに置く JSON ファイルで、ゲームはファイル内の譜面ハッシュを基に、ローカルまたはオンラインの譜面を検索します。

## 段位の作成

1. 各楽曲の `maidata.txt` を探し、その **MD5 の Base64** 値を計算します。
2. 新しい `.json` ファイルを作成し、段位名、楽曲ハッシュ、難易度を記入します。
3. JSON ファイルを `MaiCharts` ディレクトリに置きます (楽曲のサブフォルダーには入れないでください)。
4. ゲームを再起動するか、1P 三角ボタンを長押しして楽曲ライブラリを更新します。
5. 選曲画面の段位カテゴリから、その段位に入ります。

ハッシュを計算する例:

```powershell
$bytes = [System.IO.File]::ReadAllBytes("maidata.txt")
[Convert]::ToBase64String([System.Security.Cryptography.MD5]::Create().ComputeHash($bytes))
```

Linux / macOS:

```bash
openssl dgst -md5 -binary maidata.txt | base64
```

## フィールド

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `Name` | 文字列 | 段位名。選曲画面に表示されます |
| `Description` | 文字列 | 段位の説明。省略可能です |
| `SongHashs` | 文字列配列 | プレイ順に並べた `maidata.txt` の MD5 Base64 ハッシュ |
| `SongLevels` | 整数配列 | 各楽曲で使用する難易度。`SongHashs` と 1 対 1 で対応します |
| `StartHP` | 整数 | 初期 HP。デフォルトは `50` |
| `RestoreHP` | 整数 | 各楽曲の終了後に回復する HP。デフォルトは `10` |
| `IsPlayList` | 真偽値 | 段位では `false` にしてください。`true` にするとプレイリストとして扱われます |
| `IsForceGameover` | 真偽値 | HP が 0 になったときに強制終了するかどうか。デフォルトは `false` |
| `Damages` | オブジェクト | 各判定等級に対応する HP の変化量。負の値はダメージを表します |
| `Mods` | オブジェクト | 任意で指定できる Mod の上書き設定。キーは Mod 名です |

難易度の番号:

| 値 | 難易度 |
| --- | --- |
| `0` | Easy |
| `1` | Basic |
| `2` | Advanced |
| `3` | Expert |
| `4` | Master |
| `5` | Re:Master |
| `6` | UTAGE |

`Damages` のキーには判定等級名を使用します。例えば `Miss`、`TooFast`、`FastGood`、`LateGood`、`FastGreat`、`LateGreat`、`FastGreat2nd`、`FastPerfect3rd`、`Perfect` などです。

## テンプレート

```json
{
  "Name": "私の段位",
  "Description": "3 曲の練習用段位",
  "SongHashs": [
    "<song-1-hash>",
    "<song-2-hash>",
    "<song-3-hash>"
  ],
  "SongLevels": [4, 4, 4],
  "StartHP": 50,
  "RestoreHP": 10,
  "IsPlayList": false,
  "IsForceGameover": true,
  "Damages": {
    "Miss": -5,
    "TooFast": -5,
    "FastGood": -3,
    "LateGood": -3,
    "FastGreat": -2,
    "LateGreat": -2,
    "FastGreat2nd": -2,
    "LateGreat2nd": -2,
    "FastGreat3rd": -2,
    "LateGreat3rd": -2,
    "FastPerfect2nd": 0,
    "LatePerfect2nd": 0,
    "FastPerfect3rd": 0,
    "LatePerfect3rd": 0,
    "Perfect": 0
  }
}
```

::: tip
段位内の楽曲はあらかじめ存在している必要があります。ローカル曲ライブラリでも、有効化済みのオンライン曲ライブラリでもかまいません。ハッシュが一致しない場合、その楽曲はスキップされます。
:::

## プレイリストファイル {#playlist-files}

プレイリストだけを作成したい場合は、同じ JSON 構造を使用し、`"IsPlayList": true` を設定します。`SongLevels`、HP、ダメージのフィールドは不要です。

```json
{
  "Name": "私のプレイリスト",
  "SongHashs": [
    "<song-1-hash>",
    "<song-2-hash>"
  ],
  "IsPlayList": true
}
```

プレイリストファイルも同じく `MaiCharts` ディレクトリに置きます。選曲画面ではプレイリストのカテゴリに表示されます。
