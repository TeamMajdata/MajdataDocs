# 外部 IO マネージャー

::: info

`Pipe` IO モードは MajdataPlay `2.0.4-20260930-b939e80` で利用できます。
:::

本ドキュメントでは、Windows の名前付きパイプを介して MajdataPlay の `Pipe` デバイスバックエンドと通信する、独立した外部 IO マネージャーを開発する方法を説明します。外部マネージャーは次のデバイスを提供できます。

- ボタンリング入力
- タッチパネル入力
- 8 ゾーン LED 出力

> 本ドキュメントは、現在の実装である `PipePacket`、`InputManager.ButtonRing`、`InputManager.TouchPanel`、`OutputManager.LedDevice` を根拠としています。ソースコードのコメントと実際のシリアライズ処理が異なる場合は、コードが使用するバイト順を優先します。

## 1. アーキテクチャ

設定されたデバイスメーカーが `Pipe` の場合、MajdataPlay は**名前付きパイプのクライアント**として動作します。そのため、外部 IO マネージャーは有効なデバイスごとに**名前付きパイプのサーバー**を作成する必要があります。

| デバイス | データ方向 | MajdataPlay の動作 | 外部マネージャーの責務 |
| --- | --- | --- | --- |
| ボタンリング | 外部マネージャー → MajdataPlay | 状態パケットを読み取る | 完全なボタンビットマップを送信する |
| タッチパネル | 外部マネージャー → MajdataPlay | 状態パケットを読み取る | 完全なタッチビットマップを送信する |
| LED | MajdataPlay → 外部マネージャー | 色パケットまたはハートビートパケットを送信する | パケットを読み取り、実際の LED を更新する |

パイプは双方向の `InOut` アクセスで開かれますが、現在の入力実装はパイプからの読み取りのみを行い、LED 実装はパイプへの書き込みのみを行います。

## 2. パイプ名

パイプ名にはプレイヤーインデックスが含まれます。`{PlayerIndex}` は通常 `1` または `2` です。

| デバイス | パイプ名 |
| --- | --- |
| ボタンリング | `MajdataPlay.IO.ButtonRing.{PlayerIndex}P` |
| タッチパネル | `MajdataPlay.IO.TouchPanel.{PlayerIndex}P` |
| LED | `MajdataPlay.IO.Led.{PlayerIndex}P` |

プレイヤー 1 の場合、Windows の完全なパスは次のとおりです。

```text
\\.\pipe\MajdataPlay.IO.ButtonRing.1P
\\.\pipe\MajdataPlay.IO.TouchPanel.1P
\\.\pipe\MajdataPlay.IO.Led.1P
```

.NET を使用する場合は、`\\.\pipe\` プレフィックスを除いた名前を `NamedPipeServerStream` に渡します。

## 3. 共通パケットフォーマット

すべてのデバイスは同じ `PipePacket` フレームフォーマットを使用します。マルチバイト整数は**リトルエンディアン**でエンコードされます。

| オフセット | サイズ | フィールド | 説明 |
| ---: | ---: | --- | --- |
| `0` | 2 bytes | Identity | 固定値 `0x0448`。実際に送信されるバイトは `48 04` |
| `2` | 1 byte | Type | `0x00` ハートビート、`0x01` レポート |
| `3` | 2 bytes | Version | プロトコルバージョン。現在の送信側は既定で `0` |
| `5` | 2 bytes | Length | Payload の長さ（リトルエンディアン） |
| `7` | Length bytes | Payload | デバイス固有のデータ |

固定ヘッダーの長さは **7 バイト**です。

### 3.1 パケット種別

| 値 | 名前 | 用途 |
| ---: | --- | --- |
| `0x00` | HeartBeat | 接続を維持する。通常、Payload は空 |
| `0x01` | Report | ボタン、タッチ、LED のデータを運ぶ |

入力ハンドラーはハートビートパケットを無視します。現在のパーサーは未知の種別値を拒否しませんが、連携側は定義済みの種別のみを送信してください。

### 3.2 フレーミングとストリームの扱い

名前付きパイプはバイトストリームであるため、1 回の読み取りで必ず 1 パケットだけが返るとは限りません。実装は次のケースを処理する必要があります。

- 1 つのパケットが複数回の読み取りに分割される
- 1 回の読み取りで複数のパケットが返る
- `48 04` を検索して同期する
- 不正な長さの後に再同期する
- 末尾の不完全なデータを保持し、次の読み取りに引き継ぐ

MajdataPlay の入力パーサーは Payload の最大長を 1024 バイトに制限しています。有効なボタンリングおよびタッチパネルのレポート Payload は、正確に 8 バイトでなければなりません。

## 4. ボタンリング入力

### 4.1 Payload

ボタンリングのレポートは、1 つの **8 バイトのリトルエンディアン符号なし整数**を含みます。各ビットが 1 つのボタンに対応します。

- `1`: 押下
- `0`: 解放

レポートパケット全体は `7 + 8 = 15` バイトです。

### 4.2 ビットマッピング

| ビット | ボタン |
| ---: | --- |
| 0 | BA1 |
| 1 | BA2 |
| 2 | BA3 |
| 3 | BA4 |
| 4 | BA5 |
| 5 | BA6 |
| 6 | BA7 |
| 7 | BA8 |
| 8 | Test |
| 9 | Select P1 |
| 10 | Service |
| 11 | Select P2 |
| 12–63 | 予約。`0` を書き込む |

たとえば、BA1、BA3、Test が押されている場合を考えます。

```text
mask = (1 << 0) | (1 << 2) | (1 << 8) = 0x0000000000000105
payload = 05 01 00 00 00 00 00 00
```

パケット全体は次のとおりです。

```text
48 04 01 00 00 08 00 05 01 00 00 00 00 00 00
```

### 4.3 送信の推奨事項

- 接続の確立後、直ちに完全な状態を 1 回送信してください。
- 状態が変化したら直ちに送信してください。変化したボタンだけを送信しないでください。
- 状態が変化しない場合でも、100–500 ms ごとに完全な状態またはハートビートを送信してください。
- 切断されると、MajdataPlay はすべてのボタン状態をクリアし、解放の遷移を記録します。

## 5. タッチパネル入力

### 5.1 Payload

タッチパネルのレポートも、1 つの **8 バイトのリトルエンディアン符号なし整数**を含みます。現在の実装はビット 0–34 を読み取り、35 個の物理センサー状態を表します。

- `1`: タッチ中
- `0`: 未タッチ

### 5.2 ビットマッピング

| ビット範囲 | エリア |
| --- | --- |
| 0–7 | A1–A8 |
| 8–15 | B1–B8 |
| 16–17 | C1–C2 |
| 18–25 | D1–D8 |
| 26–33 | E1–E8 |
| 34 | 現在の実装が保持する内部予約ビット。公開エリアのマッピングでは使用しないため、`0` を書き込む |
| 35–63 | 予約。`0` を書き込む |

> ゲームロジックの `SensorArea.C` は C1 と C2 を統合します。いずれかのセンサーがオンの場合はオン、両方がオフの場合のみオフとみなされます。外部マネージャーはビット 16 とビット 17 を個別に送信する必要があります。

たとえば、A1、B1、C1、D1、E1 がタッチされている場合を考えます。

```text
mask = (1 << 0) | (1 << 8) | (1 << 16) | (1 << 18) | (1 << 26)
     = 0x0000000004050101
payload = 01 01 05 04 00 00 00 00
```

### 5.3 送信の推奨事項

- 各レポートには 34 個の公開センサーすべての完全なスナップショットを含め、内部予約ビット 34 には `0` を書き込んでください。
- タッチ入力は遅延に敏感です。新しいハードウェアデータが得られたら直ちに送信してください。
- 低頻度のハートビートだけに依存しないでください。アイドル中は全ビットが 0 の状態またはハートビートを送信してください。
- 切断されると、MajdataPlay はすべてのタッチ状態をクリアし、解放状態を記録します。

## 6. LED 出力

### 6.1 データの方向

MajdataPlay が LED パイプに書き込み、外部マネージャーがそれを読み取ります。接続後、MajdataPlay は 8 つすべての LED ゾーンを含む完全な更新を 1 回強制送信します。それ以降のパケットは、`Throttler` が有効な場合に変更されたゾーンのみを含むことがあります。

### 6.2 レポートの Payload

Payload は、0 個以上の連続する 4 バイトのレコードで構成されます。

| レコードオフセット | サイズ | フィールド | 説明 |
| ---: | ---: | --- | --- |
| `0` | 1 byte | LED Index | ゾーンインデックス `0–7` |
| `1` | 1 byte | Red | 赤成分 `0–255` |
| `2` | 1 byte | Green | 緑成分 `0–255` |
| `3` | 1 byte | Blue | 青成分 `0–255` |

したがって、次のようになります。

- Payload の長さは 4 の倍数である必要があります。
- 1 つのパケットには最大 8 レコード、つまり 32 バイトの Payload を含めることができます。
- パケットに含まれないゾーンは、以前の色を保持します。
- 範囲外のインデックスは、無効なメモリアクセスを避けるために無視するかログに記録してください。

たとえば、LED 0 を赤、LED 3 を青に設定する場合は次のとおりです。

```text
payload = 00 FF 00 00 03 00 00 FF
packet  = 48 04 01 00 00 08 00 00 FF 00 00 03 00 00 FF
```

### 6.3 ハートビートとリフレッシュレート

更新が必要な色がない場合、MajdataPlay は 7 バイトのハートビートパケットを送信します。

```text
48 04 00 00 00 00 00
```

Pipe モードの LED 送信は、設定された LED の `RefreshRateMs` を使用し、最大 500 ms に制限されます。外部マネージャーは、色の変化が予想される場合だけでなく、常にパイプを読み取り続ける必要があります。

### 6.4 明るさの扱い

現在の Pipe の LED 実装は、Unity の色成分をそのまま 255 倍して送信します。Pipe のシリアライズ時にグローバルな `_brightness` 値を適用しません。受信した RGB 値は最終的な 8 ビットの色値として扱ってください。追加の明るさ制御が必要な場合は、ハードウェアアダプター内で明示的に実装してください。

## 7. 接続、再接続、ライフサイクル

MajdataPlay の Pipe クライアントは次のように動作します。

1. グローバルな IO 再接続間隔を待ちます。
2. 対応するパイプへの接続を、約 2000 ms のタイムアウトで試みます。
3. 接続後、継続的に読み取りまたは書き込みを行います。
4. EOF、`IOException`、その他の通信障害の後に接続を閉じます。
5. 外側のループに戻り、再度接続を試みます。

外部マネージャーに推奨される動作は次のとおりです。

- デバイスとプレイヤーごとに独立したサーバーループを実行してください。
- クライアントが切断したら、現在の `NamedPipeServerStream` を破棄し、新しいものを作成して再接続を待ってください。
- 1 つのデバイスが切断しただけで IO マネージャー全体を終了しないでください。
- 正常なシャットダウンのためにキャンセルトークンを使用してください。
- 最新の物理入力状態を保持し、MajdataPlay の再接続直後に再送してください。
- LED の切断時のポリシーを明示的に決めてください。たとえば、最後の色を保持するか、すべての LED を消灯します。

## 8. C# リファレンス実装

次のコードは、プロトコルのエンコードとデコードの中核ロジックを示しています。実運用のコードでは、ログ、タイムアウト、キャンセル、例外の分離、ハードウェアドライバーとの統合も実装してください。

```csharp
using System.Buffers.Binary;

public enum PipePacketType : byte
{
    HeartBeat = 0,
    Report = 1
}

public readonly record struct PipeFrame(
    PipePacketType Type,
    ushort Version,
    byte[] Payload);

public static class MajdataPipeProtocol
{
    public const int HeaderLength = 7;

    public static byte[] Encode(
        PipePacketType type,
        ReadOnlySpan<byte> payload,
        ushort version = 0)
    {
        if (payload.Length > ushort.MaxValue)
            throw new ArgumentOutOfRangeException(nameof(payload));

        var packet = new byte[HeaderLength + payload.Length];
        packet[0] = 0x48;
        packet[1] = 0x04;
        packet[2] = (byte)type;
        BinaryPrimitives.WriteUInt16LittleEndian(packet.AsSpan(3, 2), version);
        BinaryPrimitives.WriteUInt16LittleEndian(
            packet.AsSpan(5, 2), (ushort)payload.Length);
        payload.CopyTo(packet.AsSpan(HeaderLength));
        return packet;
    }

    public static byte[] EncodeState(ulong state)
    {
        Span<byte> payload = stackalloc byte[8];
        BinaryPrimitives.WriteUInt64LittleEndian(payload, state);
        return Encode(PipePacketType.Report, payload);
    }

    public static bool TryReadFrame(
        ref List<byte> buffer,
        out PipeFrame frame,
        int maxPayloadLength = 1024)
    {
        frame = default;

        while (true)
        {
            var sync = -1;
            for (var i = 0; i + 1 < buffer.Count; i++)
            {
                if (buffer[i] == 0x48 && buffer[i + 1] == 0x04)
                {
                    sync = i;
                    break;
                }
            }

            if (sync < 0)
            {
                var keep48 = buffer.Count > 0 && buffer[^1] == 0x48;
                buffer = keep48 ? new List<byte> { 0x48 } : new List<byte>();
                return false;
            }

            if (sync > 0)
                buffer.RemoveRange(0, sync);

            if (buffer.Count < HeaderLength)
                return false;

            var length = buffer[5] | (buffer[6] << 8);
            if (length > maxPayloadLength)
            {
                buffer.RemoveRange(0, 2);
                continue;
            }

            var packetLength = HeaderLength + length;
            if (buffer.Count < packetLength)
                return false;

            var payload = buffer.GetRange(HeaderLength, length).ToArray();
            var version = (ushort)(buffer[3] | (buffer[4] << 8));
            frame = new PipeFrame((PipePacketType)buffer[2], version, payload);
            buffer.RemoveRange(0, packetLength);
            return true;
        }
    }
}
```

### 8.1 入力サーバーの例

```csharp
using System.IO.Pipes;

static async Task RunButtonRingServerAsync(
    int playerIndex,
    Func<ulong> readButtonMask,
    CancellationToken cancellationToken)
{
    var pipeName = $"MajdataPlay.IO.ButtonRing.{playerIndex}P";

    while (!cancellationToken.IsCancellationRequested)
    {
        await using var pipe = new NamedPipeServerStream(
            pipeName,
            PipeDirection.InOut,
            1,
            PipeTransmissionMode.Byte,
            PipeOptions.Asynchronous);

        await pipe.WaitForConnectionAsync(cancellationToken);

        while (pipe.IsConnected && !cancellationToken.IsCancellationRequested)
        {
            var packet = MajdataPipeProtocol.EncodeState(readButtonMask());
            await pipe.WriteAsync(packet, cancellationToken);
            await pipe.FlushAsync(cancellationToken);
            await Task.Delay(5, cancellationToken);
        }
    }
}
```

タッチパネルサーバーは `MajdataPlay.IO.TouchPanel.{playerIndex}P` を使用し、ビット 0–33 のタッチビットマップを返します。ビット 34 は 0 に設定します。

### 8.2 LED レポート処理の例

```csharp
static void ApplyLedReport(ReadOnlySpan<byte> payload, Span<Rgb24> leds)
{
    if (payload.Length % 4 != 0)
        return;

    for (var offset = 0; offset < payload.Length; offset += 4)
    {
        var index = payload[offset];
        if (index >= leds.Length)
            continue;

        leds[index] = new Rgb24(
            payload[offset + 1],
            payload[offset + 2],
            payload[offset + 3]);
    }
}

public readonly record struct Rgb24(byte R, byte G, byte B);
```

## 9. 設定要件

MajdataPlay の IO 設定では、次の項目を設定します。

1. デバイスメーカーを `Pipe` に設定します。
2. 必要なボタンリング、タッチパネル、LED デバイスを有効にします。
3. プレイヤーインデックスが、外部マネージャーが作成したパイプ名と一致していることを確認します。
4. 接続するハードウェアに合わせて、入力のポーリングと LED のリフレッシュレートを設定します。
5. MajdataPlay の起動前、または起動後できるだけ早くパイプサーバーを作成します。クライアントは自動的に再試行するため、起動順序は厳密ではありません。

## 10. 互換性とセキュリティの推奨事項

- 現在の実装は Windows の名前付きパイプを対象としています。他のプラットフォームでは別のトランスポート層が必要です。
- 双方が別のバージョンを明示的にサポートしない限り、`Version` には `0` を書き込んでください。
- Payload の長さ、LED インデックス、予約ビットを検証してください。
- 1 回の `Read` で完全なパケットが 1 つ返ることを前提にしないでください。
- 蓄積バッファーのサイズを制限し、無制限のメモリ使用を防いでください。
- パイプへのアクセスを信頼できるローカルプロセスに制限し、デプロイ環境に適した Pipe ACL を設定してください。
- ハードウェア操作をプロトコルループから分離し、低速な USB やシリアルへの書き込みがパイプの読み取りをブロックしないようにしてください。

## 11. 統合チェックリスト

- [ ] すべてのパイプ名が正しいプレイヤーインデックスを使用している。
- [ ] ヘッダーの識別バイトが `48 04` である。
- [ ] Version と Length がリトルエンディアンである。
- [ ] ボタンとタッチのレポート Payload が正確に 8 バイトである。
- [ ] ボタン状態がビット 0–11 を使用している。
- [ ] タッチ状態がビット 0–33 を使用し、ビット 34 が 0 に設定されている。
- [ ] LED レコードが `[Index, R, G, B]` のグループを使用している。
- [ ] パーサーがパケットの結合、分割、無効な同期バイトを処理できる。
- [ ] MajdataPlay の再起動や切断後に、マネージャーが自動的に復旧する。
- [ ] LED サーバーがアイドル中もハートビートパケットを受信し続ける。
- [ ] シャットダウン時に保留中の待機をキャンセルし、すべてのパイプとハードウェアリソースを解放する。
