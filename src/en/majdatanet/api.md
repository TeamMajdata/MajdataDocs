# API reference

::: warning
This page was migrated from the old Wiki, and the endpoints may change as the MajdataNet server is updated. Always treat the server as the source of truth for the paths, parameters, and response structures actually deployed.
:::

The paths below are relative to the server API root. The client sets the root in `Network.Online.ApiEndpoints[].Url` in `system-settings.json`; the default is `https://majdata.net/api3/api/`.

## Account

| Method | Path | Content-Type | Parameters |
| --- | --- | --- | --- |
| `POST` | `/api/account/Register` | `multipart/form-data` | `username`, `password`, `email`, `cf-turnstile-response` |
| `POST` | `/api/account/Login` | `multipart/form-data` | `username`, `password`, `rememberMe` (default `false`) |
| `POST` | `/api/account/logout` | - | Query parameter `sessionId` |
| `GET` | `/api/account/info` | - | Current signed-in user info |
| `GET` | `/api/account/session` | - | Current session |
| `GET` | `/api/account/sessions` | - | All sessions |
| `GET` | `/api/account/intro` | - | `username` (default empty) |
| `POST` | `/api/account/intro` | `multipart/form-data` | `content` |
| `GET` | `/api/account/icon` | - | `username` |
| `GET` | `/api/account/Recent` | - | `username` |
| `GET` | `/api/account/verify` | - | `otp` |
| `POST` | `/api/account/forget` | `multipart/form-data` | `username`, `email` |
| `PUT` | `/api/account/forget` | `multipart/form-data` | `otp`, `newpassword` |

## Collection

| Method | Path | Parameters |
| --- | --- | --- |
| `GET` | `/api/collection/list` | `page` (default `0`), `pageSize` (default `30`) |
| `POST` | `/api/collection/create` | JSON: `name`, `description`, `visibility` |
| `GET` | `/api/collection/{idStr}/hashlist` | - |
| `GET` | `/api/collection/{idStr}/songlist` | - |
| `POST` | `/api/collection/{idStr}/destroy` | - |
| `POST` | `/api/collection/{idStr}/modify` | JSON: `name`, `description`, `visibility`, `items` |

`visibility`: `0` private, `1` public.

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

| Method | Path | Parameters |
| --- | --- | --- |
| `GET` | `/api/maichart/list` | `sort`, `search`, `page`, `isRanking` |
| `GET` | `/api/maichart/{chartId}/summary` | - |
| `GET` | `/api/maichart/{chartId}/chart` | Returns `maidata.txt` |
| `GET` | `/api/maichart/{chartId}/track` | Returns the audio, usually MP3 |
| `GET` | `/api/maichart/{chartId}/image` | `fullImage` (default `false`) |
| `GET` | `/api/maichart/{chartId}/video` | Returns `404` when there is no video |

`chartId` is a string. The chart hash is the MD5 Base64 value of `maidata.txt`.

## Score

| Method | Path | Parameters |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/score` | Get the chart score |
| `POST` | `/api/maichart/{chartId}/score` | Submit a score |

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

| Method | Path | Parameters |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/interact` | - |
| `POST` | `/api/maichart/{chartId}/interact` | `type`, `content`, `replyTo` |
| `DELETE` | `/api/maichart/{chartId}/interact` | `type`, `commentId` |

`POST` uses `multipart/form-data`.

## Machine

| Method | Path | Parameters |
| --- | --- | --- |
| `POST` | `/api/machine/register` | JSON: `name`, `description` |
| `GET` | `/api/machine/Info` | `machine-id` |

```json
{
  "name": "string",
  "description": "string"
}
```

## Persist

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/persist/app/{appId}/{category}` | Get app data |
| `POST` | `/api/persist/app/1096/settings` | Update app settings |

## Upload

| Method | Path | Parameters |
| --- | --- | --- |
| `POST` | `/api/maichart/upload` | `multipart/form-data`, file field `formfiles` |
| `POST` | `/api/maichart/delete` | `chartId` |

## Statistics

| Method | Path | Parameters |
| --- | --- | --- |
| `GET` | `/api/stats/score-sums` | `uploader`, `page`, `pageSize` |

## Utility

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/utils/Ping` | Check whether the API service is online |

## Server implementation notes

After the game starts, it first fetches the entire chart list:

```http
GET /api/maichart/list
```

Example response:

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

- `id` is a string, used for later chart requests.
- `hash` is the MD5 Base64 value of `maidata.txt`, used to store scores and to match against the local chart library.
- The game verifies the hash of the downloaded chart and quits when it does not match.

Example of computing the hash:

```csharp
var chartHash = MD5.Create().ComputeHash(File.ReadAllBytes(maidatapath + "maidata.txt"));
songDetail.Hash = Convert.ToBase64String(chartHash);
```

`chart`, `track`, `image`, and `video` should return the actual file contents. For cover images, prefer returning a thumbnail first and the full image only when `fullImage=true`; `video` returns `404` when there is no video.
