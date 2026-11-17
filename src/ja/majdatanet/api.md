# API リファレンス

::: warning
本ページは旧 Wiki から移行したもので、インターフェースは MajdataNet サーバーの更新に伴って変更される可能性があります。実際にデプロイされているパス、パラメーター、レスポンス構造はサーバー側の実装を基準にしてください。
:::

以下のパスは、サーバーの API ルートアドレスからの相対パスです。クライアントは `system-settings.json` の `Network.Online.ApiEndpoints[].Url` でルートアドレスを設定します。デフォルト値は `https://majdata.net/api3/api/` です。

## Account

| メソッド | パス | Content-Type | パラメーター |
| --- | --- | --- | --- |
| `POST` | `/api/account/Register` | `multipart/form-data` | `username`、`password`、`email`、`cf-turnstile-response` |
| `POST` | `/api/account/Login` | `multipart/form-data` | `username`、`password`、`rememberMe` (デフォルトは `false`) |
| `POST` | `/api/account/logout` | - | クエリパラメーター `sessionId` |
| `GET` | `/api/account/info` | - | 現在サインインしているユーザーの情報 |
| `GET` | `/api/account/session` | - | 現在のセッション |
| `GET` | `/api/account/sessions` | - | すべてのセッション |
| `GET` | `/api/account/intro` | - | `username` (デフォルトは空) |
| `POST` | `/api/account/intro` | `multipart/form-data` | `content` |
| `GET` | `/api/account/icon` | - | `username` |
| `GET` | `/api/account/Recent` | - | `username` |
| `GET` | `/api/account/verify` | - | `otp` |
| `POST` | `/api/account/forget` | `multipart/form-data` | `username`、`email` |
| `PUT` | `/api/account/forget` | `multipart/form-data` | `otp`、`newpassword` |

## Collection

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `GET` | `/api/collection/list` | `page` (デフォルトは `0`)、`pageSize` (デフォルトは `30`) |
| `POST` | `/api/collection/create` | JSON: `name`、`description`、`visibility` |
| `GET` | `/api/collection/{idStr}/hashlist` | - |
| `GET` | `/api/collection/{idStr}/songlist` | - |
| `POST` | `/api/collection/{idStr}/destroy` | - |
| `POST` | `/api/collection/{idStr}/modify` | JSON: `name`、`description`、`visibility`、`items` |

`visibility`: `0` は非公開、`1` は公開です。

```json
{
  "name": "string",
  "description": "string",
  "visibility": 0,
  "items": [
    "hash1",
    "hash2"
  ]
}
```

## MaiChart

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `GET` | `/api/maichart/list` | `sort`、`search`、`page`、`isRanking` |
| `GET` | `/api/maichart/{chartId}/summary` | - |
| `GET` | `/api/maichart/{chartId}/chart` | `maidata.txt` を返します |
| `GET` | `/api/maichart/{chartId}/track` | 音声を返します。通常は MP3 です |
| `GET` | `/api/maichart/{chartId}/image` | `fullImage` (デフォルトは `false`) |
| `GET` | `/api/maichart/{chartId}/video` | 動画がない場合は `404` を返します |

`chartId` は文字列です。譜面ハッシュは `maidata.txt` の MD5 Base64 値です。

## Score

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/score` | 譜面のスコアを取得します |
| `POST` | `/api/maichart/{chartId}/score` | スコアを送信します |

```json
{
  "chartLevel": 0,
  "hash": "string",
  "dxScore": 0,
  "comboState": 0,
  "acc": {
    "dx": 0,
    "classic": 0
  }
}
```

## Interaction

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/interact` | - |
| `POST` | `/api/maichart/{chartId}/interact` | `type`、`content`、`replyTo` |
| `DELETE` | `/api/maichart/{chartId}/interact` | `type`、`commentId` |

`POST` では `multipart/form-data` を使用します。

## Machine

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `POST` | `/api/machine/register` | JSON: `name`、`description` |
| `GET` | `/api/machine/Info` | `machine-id` |

```json
{
  "name": "string",
  "description": "string"
}
```

## Persist

| メソッド | パス | 説明 |
| --- | --- | --- |
| `GET` | `/api/persist/app/{appId}/{category}` | アプリケーションデータを取得します |
| `POST` | `/api/persist/app/1096/settings` | アプリケーション設定を更新します |

## Upload

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `POST` | `/api/maichart/upload` | `multipart/form-data`、ファイルフィールドは `formfiles` |
| `POST` | `/api/maichart/delete` | `chartId` |

## Statistics

| メソッド | パス | パラメーター |
| --- | --- | --- |
| `GET` | `/api/stats/score-sums` | `uploader`、`page`、`pageSize` |

## Utility

| メソッド | パス | 説明 |
| --- | --- | --- |
| `GET` | `/api/utils/Ping` | API サービスがオンラインかどうかを確認します |

## サーバー実装のポイント

ゲームは起動後にまず曲の一覧全体を取得します。

```http
GET /api/maichart/list
```

レスポンスの例:

```json
[
  {
    "id": "1",
    "title": "花の塔",
    "artist": "さユり",
    "designer": "FTOWER",
    "description": "MMFC10场外",
    "levels": [null, null, null, null, "13+", null, null],
    "timestamp": "2025-03-05T14:45:24.4705018+08:00",
    "hash": "naksqJTTV0fMM//FRcdO0g=="
  }
]
```

- `id` は文字列で、以降の譜面リクエストに使用します。
- `hash` は `maidata.txt` の MD5 Base64 値で、スコアの保存やローカル楽曲ライブラリとの照合に使用します。
- ゲームはダウンロードした譜面のハッシュを検証し、一致しない場合は終了します。

ハッシュ計算の例:

```csharp
var chartHash = MD5.Create().ComputeHash(File.ReadAllBytes(maidatapath + "maidata.txt"));
songDetail.Hash = Convert.ToBase64String(chartHash);
```

`chart`、`track`、`image`、`video` は実際のファイル内容を返してください。カバー画像はまずサムネイルを返し、`fullImage=true` の場合にのみフルサイズの画像を返すのが望ましいです。動画がない場合、`video` は `404` を返します。
