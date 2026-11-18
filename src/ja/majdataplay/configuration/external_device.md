# 外付けデバイス

:::tip
ソフトウェアは現在も継続的に更新されているため、関連するオプションや説明が古くなっている可能性があります。このページで要件を満たせない場合は、QQ グループ `667644338` に参加して質問・議論してください。
:::

MajdataPlay は一般的な maimai 用コントローラーに対応しています。キーボードエミュレーション、HID ボタンリング、シリアルポート接続のタッチパネル、シリアル / HID LED などが含まれます。ほとんどの場合、ゲームがデバイスを自動で認識します。認識できない場合は、`system-settings.json` の `IO` セクションで手動で指定してください。

## Windows / macOS / Linux

設定は `system-settings.json` にあります。

```json
"IO": {
  "Manufacturer": "General",
  "Player": 1,
  "InputDevice": {
    "ButtonRing": {
      "Type": "HID",
      "Debounce": true,
      "PollingRateMs": 2,
      "DebounceThresholdMs": 5,
      "HidOptions": {
        "ProductId": 33,
        "VendorId": 3235
      }
    },
    "TouchPanel": {
      "SerialPortOptions": {
        "Port": 3,
        "BaudRate": 9600
      }
    }
  },
  "OutputDevice": {
    "Led": {
      "SerialPortOptions": {
        "Port": 21,
        "BaudRate": 115200
      }
    }
  }
}
```

`null` は自動認識を意味します。サポートされている `Manufacturer` の値は次のとおりです。

| 値 | 説明 |
| --- | --- |
| `General` | 汎用 / IO4 クラスのデバイス |
| `Yuan` | Yuan コントローラー (ADX) |
| `Dao` | Dao コントローラー |
| `Nov` | Nov コントローラー |
| `NPro` | NPro コントローラー |
| `Pipe` | [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager) |
| `null` | 自動認識 |

`IO.InputDevice.ButtonRing.Type` には `"Keyboard"`、`"HID"`、`"Pipe"` を指定できます。`null` の場合、ボタンリングはデフォルトでキーボードとして扱われます。一般的な組み合わせは次のとおりです。

| コントローラー | `Manufacturer` | `ButtonRing.Type` |
| --- | --- | --- |
| キーボード | `General` | `Keyboard` |
| ADX / Yuan コントローラー HID | `Yuan` | `HID` |
| IO4 / 汎用 HID | `General` | `HID` |
| Dao HID (実験的) | `Dao` | `HID` |
| 外部 IO マネージャー | `Pipe` | `Pipe` |

## シリアルポート

デフォルトでは、1P のタッチパネルは `COM3`、LED は `COM21` を使用します。2P はそれぞれ `COM4` と `COM22` を使用します。タッチパネルのデフォルトのボーレートは `9600`、LED のデフォルトのボーレートは `115200` です。

デバイスがデフォルトのポートにない場合は、次の項目を変更してください。

- `IO.InputDevice.TouchPanel.SerialPortOptions.Port` / `BaudRate`
- `IO.OutputDevice.Led.SerialPortOptions.Port` / `BaudRate`

Windows ではポートを整数で指定します (例: `3` は `COM3`)。その他のプラットフォームでは文字列で指定します (例: `"/dev/ttyACM0"`)。

::: warning 手動シリアル設定が有効になる条件
`SerialPortOptions` の `Port` / `BaudRate` が使用されるのは、次のいずれかの場合だけです。

- `IO.Manufacturer` を `"General"`、`"Yuan"`、`"Nov"` のいずれかに明示的に設定している
- `IO.InputDevice.ButtonRing.Type` を `"Keyboard"` に明示的に設定している

`Manufacturer` が `null` で、`ButtonRing.Type` が `"Keyboard"` でない場合、ゲームはデバイスを自動検出し、これらのシリアル設定を無視します。`Dao`、`NPro`、`Pipe` は HID / 外部 IO を使用し、シリアル設定を読み取りません。`Nov` のタッチパネルは USB を使用しますが、LED はカスタムシリアルポートを使用します。`ButtonRing.Type` を `"Keyboard"` にしない限り、これらのデバイスはカスタムのタッチパネル用シリアルポートを使用しません。
:::

## HID ボタンリング

`"HID"` を使用する場合は、通常 PID と VID も入力する必要があります。以下は一般的なコントローラーのデフォルト値です。いずれも `HidOptions` に**10 進数**で入力します。

| コントローラー | `ProductId` (PID) | `VendorId` (VID) |
| --- | --- | --- |
| ADX / Yuan コントローラー HID | `22352` | `11836` |
| IO4 / 汎用 HID | `33` | `3235` |
| Dao HID | `4644` | `3727` |

デバイスの PID / VID がわからない場合は、Windows のデバイスマネージャーで該当する HID デバイスを見つけ、**プロパティ > 詳細** を開いて **デバイス インスタンス パス** を選択してください。そこに含まれる `VID_xxxx` と `PID_xxxx` は**16 進数**です。まず 10 進数に変換してから `system-settings.json` に入力してください。

## デバウンスとポーリング

- ボタンが二重に反応したり、「キーのチャタリング」を感じる場合は、`IO.InputDevice.ButtonRing.DebounceThresholdMs` を大きくしてください。
- 入力のカクつきやフレーム落ちを感じる場合は、`IO.InputDevice.ButtonRing.PollingRateMs` を適切に大きくしてください (例: `2`)。ただし、値が大きすぎると判定が悪化する可能性があります。
- タッチパネルと LED にも対応する `PollingRateMs` / `DebounceThresholdMs` があり、構造は同じです。

## Linux の権限

コントローラーを接続してもボタンとタッチパネルが反応しない場合は、現在のユーザーを `dialout` グループ (ほとんどのディストリビューション) または `uucp` グループ (Arch Linux 系) に追加してから、再ログインするか再起動してください。

```bash
sudo usermod -a -G dialout,uucp $USER
```

続いて udev ルールを追加します。

```bash
sudo nano /etc/udev/rules.d/99-maicontrollers-hid.rules
```

ルールの内容は次のとおりです。

```
KERNEL=="ttyACM[0-9]*", MODE="0666", GROUP="dialout"
KERNEL=="ttyUSB[0-9]*", MODE="0666", GROUP="dialout"
# General IO4 Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0ca3", ATTRS{idProduct}=="0021", GROUP="plugdev", MODE="0660"
# ADX Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="2e3c", ATTRS{idProduct}=="5750", GROUP="plugdev", MODE="0660"
# Dao Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0e8f", ATTRS{idProduct}=="1224", GROUP="plugdev", MODE="0660"
```

デバイスが上記の 3 種類と一致しない場合は、対応する `idVendor` (VID) と `idProduct` (PID) を変更してください。udev ルール内の値は**16 進数**です。

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

その後、USB ケーブルを挿し直してください。接続に成功したらゲームを再起動してください。

## モバイル

モバイル版にはデスクトップ版のようなシリアル / HID 設定はなく、外付けのボタンリングを 1 つだけ使用します。

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

コントローラーが次の入力方式を使用する場合は、値を変更してください。

- キーボード入力の場合は `"None"` を `"Keyboard"` に変更します
- ゲームパッド入力の場合は `"None"` を `"Gamepad"` に変更します
