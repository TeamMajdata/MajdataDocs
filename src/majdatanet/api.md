# API 参考

::: warning
本页由旧 Wiki 迁移而来, 接口可能随 MajdataNet 服务端更新而变化. 实际部署的路径、参数和返回结构请以服务端为准.
:::

以下路径相对于服务端 API 根地址. 客户端在 `system-settings.json` 的 `Network.Online.ApiEndpoints[].Url` 中配置根地址, 默认值为 `https://majdata.net/api3/api/`.

## Account

| 方法 | 路径 | Content-Type | 参数 |
| --- | --- | --- | --- |
| `POST` | `/api/account/Register` | `multipart/form-data` | `username`, `password`, `email`, `cf-turnstile-response` |
| `POST` | `/api/account/Login` | `multipart/form-data` | `username`, `password`, `rememberMe` (默认 `false`) |
| `POST` | `/api/account/logout` | - | 查询参数 `sessionId` |
| `GET` | `/api/account/info` | - | 当前登录用户信息 |
| `GET` | `/api/account/session` | - | 当前会话 |
| `GET` | `/api/account/sessions` | - | 所有会话 |
| `GET` | `/api/account/intro` | - | `username` (默认空) |
| `POST` | `/api/account/intro` | `multipart/form-data` | `content` |
| `GET` | `/api/account/icon` | - | `username` |
| `GET` | `/api/account/Recent` | - | `username` |
| `GET` | `/api/account/verify` | - | `otp` |
| `POST` | `/api/account/forget` | `multipart/form-data` | `username`, `email` |
| `PUT` | `/api/account/forget` | `multipart/form-data` | `otp`, `newpassword` |

## Collection

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `GET` | `/api/collection/list` | `page` (默认 `0`), `pageSize` (默认 `30`) |
| `POST` | `/api/collection/create` | JSON: `name`, `description`, `visibility` |
| `GET` | `/api/collection/{idStr}/hashlist` | - |
| `GET` | `/api/collection/{idStr}/songlist` | - |
| `POST` | `/api/collection/{idStr}/destroy` | - |
| `POST` | `/api/collection/{idStr}/modify` | JSON: `name`, `description`, `visibility`, `items` |

`visibility`: `0` 私有, `1` 公开.

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

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `GET` | `/api/maichart/list` | `sort`, `search`, `page`, `isRanking` |
| `GET` | `/api/maichart/{chartId}/summary` | - |
| `GET` | `/api/maichart/{chartId}/chart` | 返回 `maidata.txt` |
| `GET` | `/api/maichart/{chartId}/track` | 返回音频, 通常为 MP3 |
| `GET` | `/api/maichart/{chartId}/image` | `fullImage` (默认 `false`) |
| `GET` | `/api/maichart/{chartId}/video` | 没有视频时返回 `404` |

`chartId` 为字符串. 谱面哈希是 `maidata.txt` 的 MD5 Base64 值.

## Score

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/score` | 获取谱面成绩 |
| `POST` | `/api/maichart/{chartId}/score` | 提交成绩 |

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

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `GET` | `/api/maichart/{chartId}/interact` | - |
| `POST` | `/api/maichart/{chartId}/interact` | `type`, `content`, `replyTo` |
| `DELETE` | `/api/maichart/{chartId}/interact` | `type`, `commentId` |

`POST` 使用 `multipart/form-data`.

## Machine

| 方法 | 路径 | 参数 |
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

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/persist/app/{appId}/{category}` | 获取应用数据 |
| `POST` | `/api/persist/app/1096/settings` | 更新应用设置 |

## Upload

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `POST` | `/api/maichart/upload` | `multipart/form-data`, 文件字段 `formfiles` |
| `POST` | `/api/maichart/delete` | `chartId` |

## Statistics

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| `GET` | `/api/stats/score-sums` | `uploader`, `page`, `pageSize` |

## Utility

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/utils/Ping` | 检查 API 服务是否在线 |

## 服务端实现要点

游戏启动后会先拉取整个曲目列表:

```http
GET /api/maichart/list
```

返回示例:

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

- `id` 为字符串, 用于后续请求谱面.
- `hash` 是 `maidata.txt` 的 MD5 Base64 值, 用于成绩保存和本地曲库匹配.
- 游戏会校验下载后的谱面哈希; 不匹配时会退出.

哈希计算示例:

```csharp
var chartHash = MD5.Create().ComputeHash(File.ReadAllBytes(maidatapath + "maidata.txt"));
songDetail.Hash = Convert.ToBase64String(chartHash);
```

`chart`、`track`、`image`、`video` 应返回实际文件内容. 封面最好先返回缩略图, 只有 `fullImage=true` 时再返回完整图片; 没有视频时 `video` 返回 `404`.
