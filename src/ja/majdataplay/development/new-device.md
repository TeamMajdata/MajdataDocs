# 新しいデバイスの対応

このページは、新しいハードウェア（ボタンリングコントローラー、タッチパネル、LED コントローラーなど）向けのデバイスバックエンドを MajdataPlay に実装したい開発者向けのものです。

> 本ドキュメントは `Assets/Scripts/IO` 配下の現在の実装（`IODevice`、`HidDevice`、`SerialDevice`、`UsbDevice`、`InputStateBuffer`、`LedOutputState`、`GameDeviceManager`、および各ベンダー実装（Rosen、Pipe、Dao、Nov））に基づいています。コメントと実際のコードが一致しない場合は、コードを優先してください。

## 1. アーキテクチャの概要

MajdataPlay.IO のデバイス層は 3 つの部分で構成されています。

| コンポーネント | 責務 |
| --- | --- |
| `IODevice` | 接続、再接続ループ、バックグラウンド I/O スレッドのライフタイムを担う抽象基底クラス |
| トランスポート基底クラス（`HidDevice` / `SerialDevice` / `UsbDevice` / `IODevice` 自身） | 1 つの物理トランスポートのオープン、読み書き、クローズを担う |
| ケイパビリティインターフェース（`IButtonRingDevice` / `ITouchPanelDevice` / `ILedDevice`） | デバイスが公開する入力/出力能力を宣言する |

データフローは次のとおりです。

```text
Hardware → I/O background thread (Connect/Update/Parse) → InputStateBuffer.Publish
        → main-thread OnPreUpdate snapshot → InputManager.ButtonRing / InputManager.TouchPanel

Main thread OutputManager.LedDevice.WriteLeds → LedOutputState
        → I/O background thread Update reads → writes to hardware
```

主要なポイントは次のとおりです。

- ハードウェアへのアクセスはすべて**専用のバックグラウンドスレッド**（daemon thread）で行われます。メインスレッドはスナップショットを消費するだけで、ハードウェアに直接触れることはありません。
- 1 つの物理デバイスが複数のケイパビリティインターフェースを実装してもかまいません（たとえば Dao の複合デバイスはボタンリング、タッチ、LED を同時に実装しています）が、各デバイスインスタンスが `OnPreUpdate()` でスナップショットを取るのは 1 フレームに 1 回だけです。
- プレイヤーは `Manufacturer` と `MajEnv.Settings.IO` のデバイスごとのスイッチでバックエンドを選択し、`GameDeviceManager.Init()` がそれに応じてデバイスをインスタンス化して起動します。

## 2. ケイパビリティインターフェースの選択

デバイスが提供する機能に応じて、以下のインターフェースを 1 つ以上実装してください。

| インターフェース | メンバー | データサイズ |
| --- | --- | --- |
| `IButtonRingDevice` | `ReadButtons(states, hadOn, hadOff)`、`IsButtonCurrentlyOn(int)` | 12 ボタン |
| `ITouchPanelDevice` | `ReadTouchPanel(states, hadOn, hadOff)`、`IsSensorCurrentlyOn(int)` | 35 センサースロット |
| `ILedDevice` | `WriteLeds(ReadOnlySpan<Color> colors, byte cabinetBrightness)` | 8 リングゾーン + キャビネット輝度 |

これらのインターフェースは `internal` です。実装クラスは `Assets/Scripts/IO/Devices/<vendor>/` 配下に置き、`internal sealed class` として宣言してください。

### 2.1 ボタンインデックス（`ButtonZone`）

12 個のボタンは `ButtonZone` 列挙型の順序に従ってインデックス 0–11 に対応します。

| インデックス | ボタン |
| ---: | --- |
| 0–7 | A1–A8（外周リング） |
| 8 | Test |
| 9 | Select P1 |
| 10 | Service |
| 11 | Select P2 |

### 2.2 センサースロット（35 スロット）

タッチバッファは常に 35 スロットを使用します。`SensorArea` 列挙型には `C` メンバーが 1 つしかありませんが、物理的には C1 と C2 は別々の 2 つのセンサーであるため、スロットと列挙値は 1 対 1 には対応しないことに注意してください。

| スロット | センサー |
| ---: | --- |
| 0–7 | A1–A8 |
| 8–15 | B1–B8 |
| 16–17 | C1、C2 |
| 18–25 | D1–D8 |
| 26–33 | E1–E8 |
| 34 | 現在の実装では予約済みです。`false` のままにしてください |

`InputManager.TouchPanel` はクエリ時に C ゾーンをマージします（C1/C2 のいずれかが押されていれば C は押下、両方が離されていれば C は解放）。デバイス実装はスロット 16 と 17 を正しく報告するだけで十分です。

## 3. 状態バッファ

デバイスクラス内で状態配列を自前で実装せず、既存のスレッドセーフなバッファを使用してください。

- `InputStateBuffer`: 入力状態バッファです。コンストラクターにスロット数を渡します（ボタンは `new(12)`、タッチは `new(35)`）。
- `LedOutputState`: LED 出力バッファです。8 つのリング色とキャビネット輝度を保持し、メインスレッドと I/O スレッドの間で出力スナップショットを転送します。

`InputStateBuffer` の契約は次のとおりです。

| メソッド | 呼び出し元 | 説明 |
| --- | --- | --- |
| `Publish(ReadOnlySpan<bool>)` | I/O バックグラウンドスレッド | ハードウェアから完全な状態報告が届くたびに 1 回呼び出します。フレーム間の短いパルスは内部で `hadOn` / `hadOff` にマージされます |
| `OnPreUpdate()` | メインスレッド（1 フレームに 1 回） | ライブ状態をそのフレームのスナップショットとして固定します |
| `CopyTo(states, hadOn, hadOff)` | メインスレッド | フレームスナップショットを読み取ります。`ReadButtons` / `ReadTouchPanel` ケイパビリティメソッドの基盤です |
| `IsCurrentlyOn(int)` | メインスレッド | フレームスナップショットを経由しないライブクエリです。`IsButtonCurrentlyOn` / `IsSensorCurrentlyOn` の基盤です |
| `Clear()` | 切断時 | ライブ状態をクリアし、すべてのスロットを解放済みとしてマークして、ボタンの張り付きを防ぎます |

標準的なパターン（`RosenButtonRingDevice` からの抜粋）は次のとおりです。

```csharp
internal sealed class MyButtonRingDevice : HidDevice, IButtonRingDevice
{
    readonly InputStateBuffer _buttons = new(12);

    public override void OnPreUpdate() => _buttons.OnPreUpdate();
    public void ReadButtons(Span<bool> states, Span<bool> hadOn, Span<bool> hadOff) =>
        _buttons.CopyTo(states, hadOn, hadOff);
    public bool IsButtonCurrentlyOn(int index) => _buttons.IsCurrentlyOn(index);

    protected override void OnDisconnected() => _buttons.Clear();
}
```

::: warning
1 つのデバイスが複数のケイパビリティインターフェースを実装する場合（複合デバイス）、ケイパビリティごとに 1 つの `InputStateBuffer` を使用し、`OnPreUpdate()` ですべてまとめてスナップショットを取ってください。レポートの解析にロックが必要な場合は、同じロック内でスナップショットを取ってください。`DaoCompositeDevice` を参照してください。
:::

## 4. トランスポート基底クラスの選択

| 基底クラス | トランスポート | プラットフォーム | 実装するメンバー |
| --- | --- | --- | --- |
| `SerialDevice` | シリアルポート | デスクトップ | `Parse`、任意で `OnConnected` |
| `HidDevice` | HID | デスクトップ | `Parse`、任意で `OnConnected` |
| `UsbDevice` | WinUSB（排他的な RAW USB） | Windows のみ | `Parse`、任意で列挙・エンドポイント・初期化のオーバーライド |
| `IODevice` | その他（名前付きパイプ、ゲームパッド、スクリーンタッチなど） | 任意 | `Connect`、`Update`、`Parse` |

3 つのトランスポート基底クラスは接続パラメーターをすでに処理しています。

- `SerialDevice`: 8N1、DTR/RTS 有効、読み取りタイムアウト 250 ms、書き込みタイムアウト 2000 ms。ボーレートは `IODetector` の接続情報から取得します。
- `HidDevice`: VID/PID/デバイス名でフィルタリングしてオープンし、`GetMaxInputReportLength()` で読み取りバッファーを割り当て、**Report ID をスキップ済み**の形式でレポートを `Parse` に渡します。
- `UsbDevice`: WinUSB インターフェースを列挙し、割り込み IN エンドポイント（既定値 `0x81`）をオープンし、自動サスペンドを無効化し、シリアル番号または識別子文字列でデバイスを照合します。

独自の `Connect` / `Update` を実装する場合（例: `IODevice` から直接派生する場合）の規約は次のとおりです。

- `Connect`: ハードウェアをオープンし、成功したら `true` を返します。失敗した場合はクリーンアップしてから `false` を返してください。例外をスローしないでください（再接続ループは失敗した試行として扱います）。
- `Update`: 1 回分のポーリング処理です。読み取りタイムアウトは通常のアイドル時間なので、そのまま return してください。読み取りバイト数が 0 の場合やストリームがクローズされた場合は `EndOfStreamException` をスローし、基底クラスに再接続をトリガーさせてください。
- `Parse`: 入力レポートを解析して `Publish` します。パイプ/USB はバイトストリームなので、結合されたパケット、分割されたパケット、不正なフレーム後の再同期を自分で処理する必要があります。
- `Disconnect`: ハンドルを解放します。キャンセル時にも呼ばれるため、**冪等**であること、およびブロック中の I/O を解除できることが必要です。

## 5. スレッドモデルとライフタイム

`IODevice.Start()` は `IO/<ClassName> Thread` という名前のバックグラウンドスレッドを生成し、以下をループします。

1. `Connect` を呼び出します。失敗した場合は `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC` 待って再試行し、最大 `MajEnv.IO_DEVICE_RECONNECT_MAX_RETRIES` 回まで繰り返します。
2. 接続できたら、呼び出し間隔を少なくとも `PollingInterval` 空けて `Update` をループで呼び出します。
3. 例外が発生するとデバイスを切断済みとしてマークし、`Disconnect` と `OnDisconnected` を呼び出してから手順 1 に戻ります。

通常オーバーライドする 2 つのプロパティは次のとおりです。

```csharp
protected override string DaemonThreadName => "IO/MyDevice Thread";
// Input devices usually follow the polling rate from settings; LED devices follow the refresh rate;
// return TimeSpan.Zero for devices that should drain data as fast as possible
protected override TimeSpan PollingInterval =>
    TimeSpan.FromMilliseconds(MajEnv.Settings.IO.InputDevice.ButtonRing.PollingRateMs);
```

注意事項は次のとおりです。

- `IsConnected` は基底クラスが管理します。ケイパビリティインターフェースの利用側（`InputManager` など）は、これに依存してデバイスがオンラインかどうかを判断します。
- `OnDisconnected` で状態バッファをクリアし、切断後にボタンやタッチセンサーが張り付かないようにしてください。
- `Dispose()` は再入不可でデーモンスレッドをキャンセルして join します。通常はオーバーライドする必要はありません。

## 6. 入力デバイスの例: HID ボタンリング

最小構成の HID ボタンリングデバイスは次のとおりです。

```csharp
#if UNITY_STANDALONE
using System;

namespace MajdataPlay.IO
{
    internal sealed class MyButtonRingDevice : HidDevice, IButtonRingDevice
    {
        readonly InputStateBuffer _buttons = new(12);

        public MyButtonRingDevice() : base(IODetector.ButtonRingHidConnInfo) { }

        protected override string DaemonThreadName => "IO/ButtonRing Thread";
        protected override TimeSpan PollingInterval =>
            TimeSpan.FromMilliseconds(MajEnv.Settings.IO.InputDevice.ButtonRing.PollingRateMs);

        public override void OnPreUpdate() => _buttons.OnPreUpdate();
        public void ReadButtons(Span<bool> states, Span<bool> hadOn, Span<bool> hadOff) =>
            _buttons.CopyTo(states, hadOn, hadOff);
        public bool IsButtonCurrentlyOn(int index) => _buttons.IsCurrentlyOn(index);
        protected override void OnDisconnected() => _buttons.Clear();

        protected override void Parse(ReadOnlySpan<byte> reportData)
        {
            if (reportData.Length < 9)
                return;

            Span<bool> states = stackalloc bool[12];
            states.Clear();
            var data = reportData.Slice(1); // skip Report ID
            for (var i = 0; i < 8; i++)
                states[i] = (data[1] & (1 << i)) != 0;
            states[8] = (data[2] & 0b0000_0001) != 0;  // Test
            states[9] = (data[2] & 0b0000_0010) != 0;  // Select P1
            states[10] = (data[2] & 0b0000_0100) != 0; // Service
            states[11] = (data[2] & 0b0000_1000) != 0; // Select P2

            KeyboardHelper.ReadFunctionButtons(states); // OR in keyboard function buttons
            _buttons.Publish(states);
        }
    }
}
#endif
```

主要なポイントは次のとおりです。

- クラス全体を `#if UNITY_STANDALONE` で囲んでください。モバイルビルドにはこれらのトランスポート基底クラスがありません。
- `KeyboardHelper.ReadFunctionButtons(states)` は慣例です。デバイスが報告しないファンクションボタンを、キーボードの Test/Service キーで補完できます。
- 完全なレポートが届くたびに 1 回 `Publish` してください。1 フレーム内に現れて消える短いパルスは `InputStateBuffer` によって `hadOn`/`hadOff` に保持されるため、判定が失われることはありません。

## 7. 出力デバイスの例: シリアル LED

LED デバイスはデータの向きが逆です。メインスレッドが `WriteLeds` を呼び出して `LedOutputState` を書き込み、I/O スレッドが `Update` でバッファーを読み取ってハードウェアに送信します。

```csharp
#if UNITY_STANDALONE
using System;
using UnityEngine;

namespace MajdataPlay.IO
{
    internal sealed class MyLedDevice : SerialDevice, ILedDevice
    {
        readonly LedOutputState _output = new();
        readonly Color[] _lastColors = new Color[8];
        readonly bool _throttler;
        readonly float _brightness;
        readonly TimeSpan _pollingInterval;
        bool _forceUpdate = true;

        protected override string DaemonThreadName => "IO/Led Thread";
        protected override TimeSpan PollingInterval => _pollingInterval;

        public MyLedDevice() : base(IODetector.LedDeviceSerialConnInfo)
        {
            var options = MajEnv.Settings.IO.OutputDevice.Led;
            _brightness = Mathf.Clamp01(options.Brightness);
            _throttler = options.Throttler;
            _pollingInterval = TimeSpan.FromMilliseconds(Math.Max(0, options.RefreshRateMs));
        }

        public void WriteLeds(ReadOnlySpan<Color> colors, byte cabinetBrightness) =>
            _output.WriteLeds(colors, cabinetBrightness);

        protected override void OnConnected(CancellationToken token)
        {
            base.OnConnected(token);
            _forceUpdate = true; // force a full resend after (re)connecting
        }

        protected override void Update(CancellationToken token)
        {
            var stream = Stream ?? throw new IOException("LED serial device is disconnected.");
            Span<Color> colors = stackalloc Color[8];
            _output.ReadLeds(colors, out _);

            var needUpdate = false;
            for (var i = 0; i < colors.Length; i++)
            {
                if (!_forceUpdate && _throttler && _lastColors[i] == colors[i])
                    continue;
                stream.Write(BuildSetColorPacket(stackalloc byte[10], i, colors[i], _brightness));
                needUpdate = true;
            }
            if (needUpdate)
                colors.CopyTo(_lastColors);
            _forceUpdate = false;
        }

        protected override void Parse(ReadOnlySpan<byte> data) { } // output-only device; no input reports

        static ReadOnlySpan<byte> BuildSetColorPacket(Span<byte> p, int index, Color color, float brightness)
        {
            p[0] = 0xE0;                       // frame header; define it per your hardware protocol
            p[1] = 0x11;
            p[2] = 0x01;
            p[3] = 0x05;
            p[4] = 0x31;
            p[5] = (byte)index;                // ring zone 0–7
            p[6] = (byte)(color.r * 255 * brightness);
            p[7] = (byte)(color.g * 255 * brightness);
            p[8] = (byte)(color.b * 255 * brightness);
            byte checksum = 0;
            for (var i = 1; i < 9; i++)
                checksum += p[i];
            p[9] = checksum;
            return p.Slice(0, 10);
        }
    }
}
#endif
```

主要なポイントは次のとおりです。

- `Throttler` が `true` のとき、変化していないゾーンはスキップされます。`Brightness` はシリアル化時に色成分へ乗算されます。どちらの設定も `OutputDevice.Led` に由来します。
- 接続（または再接続）後は 1 回全量更新を送信する必要があります。そうしないと、ハードウェアは切断前の色を保持したままになります。
- 純粋な出力デバイスでも空の `Parse` を実装します。基底クラスが要求しており、シリアルポートから読み取ったバイトは安全に無視する必要があります。

## 8. デバイスの登録

### 8.1 接続情報（`IODetector`）

トランスポート基底クラスは `IODetector` の静的接続情報からデバイスパラメーターを取得します。新しいデバイスの既定の VID/PID やシリアルポートなどが既存ベンダーと異なる場合は、`IODetector.Init()` に定数と `ConnInfo` の代入分岐を追加し、ユーザー指定と自動検出の両方のパスをカバーしてください。参考までに既存の定数を示します。

```csharp
const int GENERAL_HID_1P_VID = 3235;
const int GENERAL_HID_1P_PID = 33;
const int NOV_USB_VID = 0x3356;
const int NOV_USB_PID = 0x3003;
```

### 8.2 ベンダーオプションと `GameDeviceManager`

`DeviceManufacturerOption`（`Assets/Scripts/Misc/Settings/Enums/` 配下）に新しいベンダーを追加し、`GameDeviceManager.Init()` の対応する `switch` 分岐でデバイスをインスタンス化します。

```csharp
case DeviceManufacturerOption.MyVendor:
    if (input.ButtonRing.Enable)
        ButtonRing = new MyButtonRingDevice();
    if (input.TouchPanel.Enable)
        TouchPanel = new RosenTouchPanelDevice(); // touch may reuse another implementation
    if (output.Led.Enable)
        LedDevice = new MyLedDevice();
    break;
```

`Init()` 以降の処理は自動です。`Register` がすべてのデバイスを重複排除して登録し、すべての `IODevice` に対して `Start()` が呼び出されてバックグラウンドスレッドが起動します。メインスレッドは 1 フレームに 1 回 `GameDeviceManager.OnPreUpdate()` を呼び出し、すべてのデバイスのスナップショットを取ります。

`GameDeviceManager` にすでに存在する汎用デバイス（登録不要）は次のとおりです。

- `ScreenTouchPanelDevice`: タッチスクリーン入力
- `MouseTouchPanelDevice`: マウスによるタッチエミュレーション

### 8.3 設定（`GameSetting.cs`）

新しいデバイスに追加の設定（感度、ポーリングレート、エンドポイント番号など）が必要な場合は、`Assets/Scripts/Misc/Settings/GameSetting.cs` の `IOOptions` 階層にある対応する Options クラスを拡張し、`[Description]`、`[Range]` などの属性を付与して、設定 UI が項目を自動生成するようにしてください。

## 9. 参考となる既存実装

| ディレクトリ | デバイス | トランスポート | ケイパビリティ |
| --- | --- | --- | --- |
| `Devices/General/` | キーボード / ゲームパッド / スクリーン / マウス | Unity InputSystem、`IODevice` | ボタン、タッチ |
| `Devices/Rosen/` | Rosen 汎用シリアルボタンリング | HID + シリアル | ボタン、タッチ、LED |
| `Devices/Yuan/` | Yuan ボタンリング | HID | ボタン |
| `Devices/Dao/` | Maimoller 複合デバイス | HID | ボタン + タッチ + LED（単一接続） |
| `Devices/Nov/` | Nov 排他タッチ（FL バリアントを含む） | WinUSB | タッチ |
| `Devices/Pipe/` | 外部 IO マネージャー | 名前付きパイプ | ボタン、タッチ、LED |

プロトコルの詳細は [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager) を参照してください。

::: tip デバイスのクイックテスト
新しいデバイスが動作するかだけを確認したい場合は、まず MajdataPlay にバックエンドを登録する必要はありません。デバイスのデータを名前付きパイプ経由で MajdataPlay の `Pipe` デバイスバックエンドに転送する外部 IO マネージャーを書けば、ゲームコードを変更したり再コンパイルしたりすることなく、ボタン、タッチ、LED のパイプライン全体をテストできます。ハードウェアの動作が確認できたら、1〜9 節の手順に従って組み込みバックエンドとして登録してください。プロトコルの詳細と参考実装は [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager) を参照してください。
:::

## 10. 付録: IO フレームワークリファクタリング前のデバイス対応

::: info バージョンの範囲
コミット `fbfe11d7f refactor(io): New IO framework (#338)` より前の MajdataPlay は、この節で説明する旧フレームワークを使用していました。古いブランチやリリース向けにデバイスを対応させる場合はこちらを読んでください。現在のバージョンでは、上記の 1〜9 節に従ってください。
:::

### 10.1 アーキテクチャの違い

旧フレームワークには `IODevice` 基底クラス、ケイパビリティインターフェース、`GameDeviceManager` は存在せず、すべてのロジックが 3 つの**静的クラス**にあります。

| 静的クラス | 責務 | 状態配列 |
| --- | --- | --- |
| `InputManager.ButtonRing` | ボタン: ベンダー × トランスポートごとにポーリングループを選択し、レポートを解析 | `_buttonStates`（フレームスナップショット）、`_buttonRealTimeStates`（ライブ）、`_isBtnHadOn(Internal)`、`_isBtnHadOff(Internal)` |
| `InputManager.TouchPanel` | タッチ: 上記と同じ | `_sensorStates`、`_sensorRealTimeStates`、`_isSensorHadOn(Internal)`、`_isSensorHadOff(Internal)` |
| `OutputManager.LedDevice` | LED: ベンダー × トランスポートごとにリフレッシュループを選択し、レポートをシリアル化 | `OutputManager._ledRingColors`（8 色）、`_cabinetLightBrightness` |

各クラスは `Init()` 内で `IODetector.DeviceManufacturer` に対する `switch` に基づき、`Task.Factory.StartNew(XxxUpdateLoop, TaskCreationOptions.LongRunning)` を使って**専用の長時間実行スレッドを 1 本**起動します。

- `InputManager.ButtonRing`: `KeyboardUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`
- `InputManager.TouchPanel`: `SerialPortUpdateLoop` / `PdxUpdateLoop`（Windows のみ） / `SlaveThreadUpdateLoop`（Dao） / `PipeUpdateLoop`
- `OutputManager.LedDevice`: `SerialPortUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`

つまり、**トランスポートとベンダープロトコルの組み合わせごとに手書きのループ関数が必要**であり、再利用可能なトランスポート基底クラスはありません。

### 10.2 対応手順

新しい HID ボタンリングを例に説明します。

1. **ベンダー列挙型**: `DeviceManufacturerOption` に新しいベンダーを追加します（旧バージョンには `General`、`Yuan`、`Dao`、`Nov`、`Pipe` しかありません）。
2. **接続情報**: `IODetector` に VID/PID 定数（例: `const int MY_HID_VID = ...`）を追加し、`Init()` のユーザー指定パスと自動検出パスの両方で `ButtonRingHidConnInfo` などに代入します。
3. **パーサー**: `InputManager.ButtonRing` 内にネストした静的パーサークラスを追加します。シグネチャーは `Parse(ReadOnlySpan<byte> reportData, Span<bool> buffer)` に統一し、12 個のボタン状態を `buffer` に書き込みます。`GeneralHIDDevice`（IO4 のビットレイアウト）、`AdxHIDDevice`（Yuan のバイトレイアウト）、`DaoHIDDevice` を参照してください。
4. **ポーリングループ**: `MyDeviceUpdateLoop()` を書き、`Init()` の `switch` に起動分岐を追加します。ループ内では、デバイスのオープン → ポーリング読み取り → パーサーの呼び出し → 状態の公開 → 例外による切断後の再接続を自前で行う必要があります。
5. **タッチ/LED**: デバイスに他の能力がある場合は、`InputManager.TouchPanel` / `OutputManager.LedDevice` で手順 3〜4 を繰り返します（35 センサースロット、8 リングゾーン）。
6. **設定**: 設定のレイアウトは現在と同じです（`GameSetting.cs` の `IOOptions` 階層）。

### 10.3 状態の公開とスレッドの規約

旧フレームワークには `InputStateBuffer` がなく、公開ロジックは各ループ内に直接書かれており、以下のルールに従う必要があります。

- 状態の書き込みは `SpinLock _syncLock`（および `LockDisposable` ヘルパー）で保護します。
  ```csharp
  var isLocked = false;
  try
  {
      _syncLock.Enter(ref isLocked);
      for (var i = 0; i < 12; i++)
      {
          _buttonRealTimeStates[i] = state[i];
          _isBtnHadOnInternal[i] |= state[i];   // short pulses accumulate via |=
          _isBtnHadOffInternal[i] |= !state[i];
      }
  }
  finally
  {
      if (isLocked) _syncLock.Exit();
  }
  ```
  `*Internal` と `*RealTime` の配列だけを書き込んでください。パブリック配列（`_buttonStates`、`_isBtnHadOn` など）は、メインスレッドが `OnPreUpdate()` 内でロックを保持したままコピーし、`Internal` 配列をクリアします。デバイスコードはこれらの配列に**決して触れてはいけません**。
- スレッド名、バックグラウンドフラグ、優先度は次の規約に従います。
  ```csharp
  currentThread.Name = "IO/ButtonRing Thread"; // DAEMON_THREAD_NAME
  currentThread.IsBackground = true;
  currentThread.Priority = MajEnv.THREAD_PRIORITY_IO;
  _buttonRingUpdateLoop.RegisterAsWorker("ButtonRing I/O Worker");
  ```
- ファンクションボタン: `UpdateKeyboardFn(fnButtons, fnBuffer)` はキーボードの Test/Service キーをライブ状態に OR で合成します。旧フレームワークにおける `KeyboardHelper.ReadFunctionButtons` に相当します。
- 切断時のクリーンアップ: ループ終了時にライブ状態をクリアし、`_isBtnHadOffInternal` 配列全体を `Fill(true)` してボタンの張り付きを防ぎます。

### 10.4 再接続とフォールバックの動作

旧フレームワークの各ループは独自に再接続を実装しており、その動作は新フレームワークと異なります。

- 再接続間隔は同様に `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC` ですが、**最大再試行回数の制限はありません**。
- **最初の試行が失敗するとループを終了してフォールバックします**: シリアルタッチはポートが見つからない場合にマウス入力へ、LED はダミーデバイスへフォールバックし、ループは再試行を停止します（`isReconnecting` フラグで初回接続と再接続を区別します）。デバイスを対応させる際には、この戦略を維持するか、常に再試行するかを決める必要があります。
- `IOException` は切断をトリガーします。ストリームをクローズし、`IsConnected = false` に設定して、再接続待ちに戻ります。

### 10.5 複合デバイス（Dao）

旧フレームワークでは、1 つの HID デバイスがボタンとタッチの両方を提供する場合、**2 つのスレッドとシグナルハンドシェイク**を使用します。`HIDUpdateLoop`（ボタンスレッド）がレポートを読み取って `_ioThreadSync.SignalReadReady()` を呼び出し、`DaoHIDDevice.Parse` でボタンを解析してから `WaitReadConsumed()` で待機します。`SlaveThreadUpdateLoop`（タッチスレッド）は読み取り準備完了シグナルを待ち、同じレポートを `DaoHIDTouchPanel.Parse` で解析します。新しい複合デバイスを対応させる場合は、これを単一のループ内で両方の状態配列を埋める形（すべてロック内）に簡略化し、2 つの静的クラスがそれぞれの `OnPreUpdate` で消費するようにできます。

### 10.6 排他タッチ（旧 WinUSB パス）

旧バージョンの排他タッチのコードは `Assets/Scripts/IO/PdxTouch/` にあります。

- `ExclusiveTouchHost`: 静的スロットです。デバイスファクトリーを順番に試し、未接続の間は専用の再試行スレッドでポーリングします。
- `ExclusiveTouchBase`: 抽象基底クラスです。独自のリーダースレッドを持ち、WinUSB 経由でデバイスをオープンし、`GetTouchState()`（**34 ビットマスク**。C ゾーンは 1 ビットのみ）を公開します。
- `InputLatch` による取りこぼし防止（2 回のポーリングの間に完了した押下+解放も検出されます）と、タッチポイントのタイムアウトクリーンアップを内蔵しています。
- `TouchSensorMapper`: タッチポイントの座標を 34 個のセンサーポリゴンに対するビットマスクにマッピングします。`TouchRadius` とゾーン（A–E）ごとの追加半径をサポートします。

新しい排他タッチデバイスを対応させるには、`ExclusiveTouchBase` から派生し、`ResolveEndpoint(WinUsbIo.DevicePath)` と `OnTouchData(byte[])` を実装し、`OnTouchData` 内で `HandlePresses`/`HandleReleases` を呼び出してタッチポイントをコミットし、`PdxUpdateLoop` 内のファクトリーリストに追加します。座標からセンサーへのジオメトリマッピングは `TouchSensorMapper` をそのまま再利用できます。

### 10.7 プロトコルは変わらない

**ワイヤプロトコルは新旧フレームワークで完全に同一**です。2 節のボタン/センサースロットの定義、6〜7 節の例におけるレポートレイアウト、および [外部 IO マネージャー](/ja/majdataplay/development/external-io-manager) の Pipe プロトコルは、旧リビジョンにもそのまま適用されます。異なるのはホスト側のコード構成だけです。

### 10.8 旧フレームワークと新フレームワークの比較

| | 旧フレームワーク（リファクタリング前） | 新フレームワーク（現行） |
| --- | --- | --- |
| デバイスの抽象化 | なし。ロジックは `InputManager` / `OutputManager` 静的クラスにインライン | `IODevice` 基底クラス + ケイパビリティインターフェース + `GameDeviceManager` 登録 |
| スレッド管理 | ベンダー × トランスポートごとに手書きの `XxxUpdateLoop` | `IODevice` の統一デーモンループ。サブクラスは `Connect`/`Update`/`Parse` のみ実装 |
| 再接続 | ループごとに実装。上限なし。初回の失敗でフォールバック | 基底クラスで一括実装。再試行回数に上限あり。失敗し続ける限り再試行 |
| 状態バッファ | 手書き配列 + `SpinLock`。`*Internal` 配列でパルスを累積 | `InputStateBuffer` / `LedOutputState` |
| 複合デバイス | 2 スレッド + `_ioThreadSync` シグナルハンドシェイク | 1 つのデバイスインスタンスが複数のケイパビリティインターフェースを実装。単一ループ |
| 新しいデバイスに必要な変更 | ベンダー列挙型 + `IODetector` + 3 つの静的クラスへの `Init`/ループ/パーサー | ベンダー列挙型 + `IODetector` + デバイスクラス 1 つ + `GameDeviceManager` 登録 |

::: warning
旧フレームワークのガイドは歴史的なリビジョンの保守のためだけに存在し、新しい機能で更新されることはありません。新しいデバイスは新フレームワーク（1〜9 節）を対象に開発してください。
:::

## 11. チェックリスト

- [ ] デバイスクラスが `internal sealed` で、`Assets/Scripts/IO/Devices/<vendor>/` 配下にあり、`#if UNITY_STANDALONE`（または対応するプラットフォーム定義）で囲まれている。
- [ ] ボタン状態が 12 スロットのバッファに、タッチ状態が 35 スロットのバッファに公開されている（スロットマッピングは 2 節）。
- [ ] `OnPreUpdate()` でスナップショットを取り、`OnDisconnected()` でバッファをクリアしている。
- [ ] 入力は I/O スレッドで `Publish` されており、メインスレッドのコードがハードウェアを直接読み書きしていない。
- [ ] バイトストリームのトランスポート（シリアル、USB、パイプ）の `Parse` が、結合されたパケット、分割されたパケット、不正なフレームを処理できる。
- [ ] `Disconnect` が冪等で、キャンセル時にブロック中の I/O を解除できる。
- [ ] 再接続後にバッファがクリアされ、LED の色が全量再送されている。
- [ ] `IODetector` に既定の接続情報（1P/2P の区別を含む）が追加されている。
- [ ] `GameDeviceManager.Init()` でベンダーごとに登録され、対応するケイパビリティのスイッチが有効な場合にのみインスタンス化される。
- [ ] 実機で検証済み: 高速な連打で `hadOn` が失われない、切断後にボタンが張り付かない、再接続が自動的に回復する。
