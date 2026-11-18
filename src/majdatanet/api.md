# API

MajdataNet 服务器提供 REST API, 供 MajdataPlay 游戏客户端与网站前端使用.

## 根地址

以下路径均相对于服务端 API 根地址. 客户端在 `system-settings.json` 的 `Network.Online.ApiEndpoints[].Url` 中配置根地址, 默认值为 `https://majdata.net/api3/api/`.

官方部署经过反向代理, 会在原路径前追加 `/api3` 前缀. 自行部署时按实际配置填写.

## 约定

### 地址与编码

- `Query` 表示 URL 查询参数; `Form` 表示表单字段, 通常用 `application/x-www-form-urlencoded`; 文件使用 `multipart/form-data`; `JSON` 表示 `application/json` 请求体.
- JSON 属性默认使用 camelCase. 缩写的实际字段例如 `dx`、`dxScore`、`uploaderID`、`remoteIP`、`totalAccDX`; 不要直接照搬 C# 属性的大小写.
- `Guid` 是 UUID 字符串; `ObjectId` 是 24 位十六进制字符串. 谱面 ID 使用 Guid, 用户、会话、谱单、评论 ID 使用 ObjectId.
- 日期时间按 ISO 8601 传递; 建议请求时间带 `Z` 或明确时区.
- 枚举用整数传输. `visibility`: `0` 私有、`1` 公开; `comboState`: `0` None、`1` FC、`2` FCPlus、`3` AP、`4` APPlus. 例外: 活动的 `type` 与用户组名称用 camelCase 字符串传输.
- 数组查询参数重复同名字段, 例如 `?tag=original&tag=expert`. Hash 是 Base64 字符串, 放入 URL 或表单时必须编码 `+`、`/`、`=` 等字符.
- 谱面业务 `hash` 是 `maidata.txt` 的 **MD5 Base64**; 文件下载响应头 `hash` 是文件的 **SHA-256 Base64**, 两者用途不同.
- 成绩按难度的 level hash 保存. level hash 是该难度 inote 文本的 64 位小写十六进制摘要, 从 `GET /api/maichart/{chartId}/info` 的 `levelHashes` 取得.

### 登录与权限

服务从 Cookie 获取会话, 未实现 Bearer Token 认证:

| Cookie | 用途 |
| --- | --- |
| `token` | 用户会话; 登录或扫码授权成功后设置 |
| `machine-token` | 机台会话 |
| `machine-id` | 注册返回的机台标识 |

常规登录设置的 Cookie 使用 `Secure`、`HttpOnly`、`SameSite=None`、`Path=/`. 客户端应保存并回传 Cookie; 浏览器跨域请求需启用 credentials. 会话会随有效请求刷新.

下文"匿名"表示无需登录, "登录"表示需要有效用户会话. 列出权限名称时, 同时要求登录并具备全部所列权限. 普通账号登录获得 `FULL_USER_ACCESS`; 扫码授权获得 `GAME_FEATURE_ACCESS`.

| 权限 | 数值 | 用途 |
| --- | ---: | --- |
| `R_USER_PROFILE` | 1 | 查看自己的私有资料 |
| `W_USER_PROFILE` | 2 | 修改资料 |
| `AUTHORIZE` | 16 | 批准机台授权 |
| `COMMIT_CHART_INTERACTION` | 32 | 投票、评论 |
| `MANAGE_CHART_LIST` | 64 | 上传、删除自己的谱面 |
| `MANAGE_LOGIN_SESSIONS` | 128 | 查看和注销指定会话 |
| `R_USER_MAI_SCORES` | 1024 | 获取自己的成绩 |
| `W_USER_MAI_SCORES` | 2048 | 提交成绩 |
| `R_USER_CHART_COLLECTIONS` | 4096 | 读取收藏及在列表中查看自己的私有谱单 |
| `W_USER_CHART_COLLECTIONS` | 8192 | 修改谱单及收藏 |

#### 用户组

活动写入与管理接口不看会话权限位, 而要求账号属于指定用户组. 用户组记录在账号文档中, 每次请求都从数据库读取, 因此加入或移出用户组在下一次请求立即生效, 无需重新登录; 封禁或待激活的账号一律不通过. `administrator` 组通过所有用户组要求. 匿名请求返回 `401`, 不满足要求返回 `403`, 均无响应体.

| 用户组 | 数值 | 用途 |
| --- | ---: | --- |
| `administrator` | 1 | 管理所有账号的用户组, 并通过所有用户组要求 |
| `eventManager` | 2 | 创建、替换、删除活动 |

接口中用户组以名称传递, 大小写不敏感.

### 返回与错误

没有统一的成功数据包装: 接口可能直接返回对象、数组、字符串、文件或空响应. 下文 `200 空` 表示成功且无响应体, 不等同于 `204`.

业务状态对象记为 `Status`, 结构为 `{"code":114514,"message":"ok"}`. **HTTP 状态与业务 code 必须分开判断**.

业务 code 定义如下: `4XXXX` 为请求错误 (前三位对应最接近的 HTTP 状态码), `6XXXX` 为账号相关错误.

| 业务 code | 含义 |
| ---: | --- |
| 114514 | 成功 |
| -114514 | 通用错误 |
| 40000 | 参数或凭据格式无效 |
| 40001 | 缺少请求数据 |
| 40002 | 元素过多 (例如标签超过 32 个) |
| 40400 | 对象不存在 |
| 40900 | 对象已存在 |
| 41000 | 对象已删除 |
| 41300 | 数据过大 |
| 42900 | 请求过于频繁 |
| 60000 | 未登录 |
| 60001 | 已登录 |
| 60002 | 权限不足 |
| 60003 | 凭据错误 |
| 60004 | 账号待激活 |
| 60005 | 账号被封禁 |
| 60102 | 邮箱无效 |
| 60103 | 用户名已存在 |
| 60104 | 邮箱已存在 |

通用 HTTP 语义: `400` 参数错误, `401` 未认证, `403` 权限不足, `404` 对象不存在, `409` 冲突, `413` 请求过大, `429` 请求过于频繁 (带 `Retry-After`). 权限特性产生的 `401/403` 通常没有业务对象; 手动校验可能返回 `Status`. 模型绑定与验证错误可能是 ASP.NET Core ProblemDetails, 个别接口返回纯数字、纯文本或空体. 客户端不可假定所有错误都有 `code/message`.

## 账号与会话

### POST /api/account/register

注册账号. 匿名调用; 已经登录返回 `403`.

| Form 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 1–24 字符, 仅 ASCII 字母、数字、`-`、`_` |
| `password` | string | 是 | 非空凭据字符串; 登录时提交相同值 |
| `email` | string | 是 | 必须匹配邮箱验证码的邮箱 |
| `nickname` | string | 是 | 昵称 |
| `challengeKey` | string | 是 | 邮箱验证接口返回的 key |
| `challengeCode` | int | 是 | 邮件中的 8 位验证码 |
| `cf-turnstile-response` | string | 是 | Turnstile token |

**响应**: `200` —— [响应模型](#userprofile) —— 账号直接创建为正常状态, **不会自动登录**. 失败: `400`, 包括验证失败 (60003)、空密码、用户名无效 (40000)、用户名或邮箱重复 (60103/60104)

服务端直接比较提交的密码字符串, 本接口没有声明客户端必须使用的哈希算法.

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "nickname": "Player",
  "introduction": null,
  "email": "player@example.com",
  "avatarId": "",
  "joinDate": "2026-11-01T12:00:00Z"
}
```

### POST /api/account/Login

匿名调用.

| Form 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 用户名或邮箱 |
| `password` | string | 是 | 注册时的凭据字符串 |
| `rememberMe` | bool | 否 | 默认 `false`; 为 `true` 使用持久会话有效期 |
| `challengeKey` | string | 待激活账号需提供 | 邮箱验证接口返回的 key |
| `challengeCode` | int | 待激活账号需提供 | 发送至账号原邮箱的验证码 |

**响应**: `200` —— [响应模型](#status) —— 通过 `Set-Cookie` 设置 `token`, 响应体不返回 token. 失败: `401` 凭据错误; `403` 已登录、待激活且未提供完整邮箱验证信息、被封禁; `400` 验证码无效

_示例_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### POST /api/account/logout

鉴权: 登录. Query: `sessionId?: ObjectId`.

- 不传或传空值: 注销当前会话并删除 `token` Cookie; 存在机台会话时还会撤销该机台授权.
- 指定 `sessionId`: 注销本人指定会话, 还需 `MANAGE_LOGIN_SESSIONS`.

**响应**: `200` —— [响应模型](#status) —— 失败: `400` ID 无效, `404` 会话不存在, `403` 非本人会话或权限不足

_示例_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### GET /api/account/profile

Query: `username?: string`.

指定用户名时可匿名获取; 不指定时读取当前用户, 未登录返回 `401`. 成功: `200 UserProfile` (见[响应模型](#userprofile)); 不存在: `404 Status`. 只有本人且拥有 `R_USER_PROFILE` 才返回邮箱, 其他调用的 `email` 为 `null`.

**响应**: `200` —— [响应模型](#userprofile)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "nickname": "Player",
  "introduction": "Hello",
  "email": null,
  "avatarId": "default",
  "joinDate": "2026-11-01T12:00:00Z"
}
```

### POST /api/account/profile

鉴权: `W_USER_PROFILE`. 使用 Form; 带文件时用 multipart.

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `nickname` | string | 否 | 非空时更新 |
| `introduction` | string | 否 | 不传则保留; 传空字符串可清空 |
| `avatar` | file | 否 | 可被图片解码器识别的图片 |

请求总大小上限 6 MiB; multipart body 上限 5 MiB. 静态头像裁剪为 512×512 JPEG; 多帧图片按最大边 512 缩放并转成 WebP.

**响应**: `200` —— [响应模型](#userprofile) —— 用户不存在; 显式空昵称为 `400`

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "nickname": "New nickname",
  "introduction": "Hello",
  "email": null,
  "avatarId": "a1b2c3d4",
  "joinDate": "2026-11-01T12:00:00Z"
}
```

### GET /api/account/session

鉴权: 登录. 无参数. 成功: `200 SessionInfo`, 见[响应模型](#sessioninfo).

**响应**: `200` —— [响应模型](#sessioninfo)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "permissions": 18446744073709551615,
  "geneTime": "2026-11-01T12:00:00Z",
  "expiredTime": "2026-11-02T12:00:00Z",
  "lastActiveTime": "2026-11-01T12:30:00Z",
  "remoteIP": "203.0.113.7"
}
```

### GET /api/account/sessions

鉴权: `MANAGE_LOGIN_SESSIONS`. 成功: `200 SessionInfo[]`, 包含当前用户所有会话.

**响应**: `200` —— [响应模型](#sessioninfo)

_示例_:

```json
[
  {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "permissions": 18446744073709551615,
    "geneTime": "2026-11-01T12:00:00Z",
    "expiredTime": "2026-11-02T12:00:00Z",
    "lastActiveTime": "2026-11-01T12:30:00Z",
    "remoteIP": "203.0.113.7"
  }
]
```

### POST /api/account/password-reset/request

匿名. Query: `email: string`, 必填.

邮箱格式无效返回 `400 Status` (60102). 邮箱未注册时仍返回 `200` 和一个随机字符串, 但不会发送邮件, 避免泄露账号是否存在. 邮箱已注册时创建 5 分钟有效的 8 位验证码并发送邮件, 成功返回 `200` 字符串 `challengeKey`.

**响应**: `200` —— (`challengeKey`)

### POST /api/account/password-reset/confirm

匿名. Form: `email`、`newPassword`、`challengeCode`、`challengeKey`, 均必填.

验证码必须属于同一邮箱且在有效期内, 验证成功即一次性消费. 错误、过期、已使用或不属于该邮箱时返回 `400 Status` (40000). 账号存在时写入新密码, 删除该用户的全部登录会话以及由该用户授予的机台授权, 返回 `200 空`. 本接口没有额外的密码复杂度校验.

**响应**: `200` —— 空响应体

### GET /api/account/recent

匿名. Query: `username?: string`, 默认空字符串.

**响应**: `200` —— [响应模型](#playerscoresummary) —— 最近 **30 天**游玩记录, 时间倒序; 已删除谱面的记录跳过, 无分页. 用户不存在返回 `404 Status`

_示例_:

```json
[
  {
    "title": "Example",
    "artist": "Artist",
    "designer": "Designer",
    "uploader": "uploader",
    "chartId": "33333333-3333-3333-3333-333333333333",
    "difficulty": "14+",
    "level": 4,
    "acc": 100.5123,
    "comboState": 3,
    "timestamp": "2026-11-10T09:00:00Z"
  }
]
```

### GET /api/account/scores

鉴权: `R_USER_MAI_SCORES`.

| Query | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `chartId` | Guid[] | 不筛选 | 重复同名参数 |
| `uploader` | string[] | 不筛选 | 上传者用户名 |
| `tag` | string[] | 不筛选 | 谱面标签 |
| `publicTag` | string[] | 不筛选 | 公共标签 |
| `hash` | string[] | 不筛选 | 谱面 MD5 Base64 |
| `matchMode` | string | `or` | 不同筛选字段间关系, 仅 `and` / `or` |
| `fieldMatchMode` | string | `or` | 同字段内匹配关系, 仅 `and` / `or` |

**响应**: `200` —— [响应模型](#onlinemaiscore) —— 全部筛选字段省略时返回本人所有仍可关联到谱面的成绩. 非法模式或 Guid 返回 `400 Status`

成绩按 `levelHash → 谱面元信息 → 谱面` 关联, 每条成绩只出现一次. 同一 level hash 属于多张谱面时, 按代表难度规则选择: 最早上传的谱面, 同时上传按谱面 ID, 再按难度序号. 关联不到任何谱面的成绩不返回.

::: info 实现限制
`fieldMatchMode=and` 时, `uploader`、`hash`、`chartId` 三组参数必须**各恰好一个**, 否则立即返回空数组.
:::

_示例_:

```json
[
  {
    "acc": { "dx": 100.5123, "classic": 101.2345 },
    "dxScore": 2600,
    "comboState": 3,
    "chartLevel": 4,
    "hash": "naksqJTTV0fMM//FRcdO0g==",
    "levelHash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0",
    "chartInfo": {
      "id": "33333333-3333-3333-3333-333333333333",
      "title": "Example",
      "artist": "Artist",
      "designer": "Designer",
      "description": "",
      "levels": ["", "", "", "", "14+", "", ""],
      "uploader": "uploader",
      "timestamp": "2026-10-06T00:00:00Z",
      "hash": "naksqJTTV0fMM//FRcdO0g==",
      "tags": [],
      "publicTags": []
    },
    "timestamp": "2026-11-10T09:00:00Z"
  }
]
```

### GET /api/account/comments

匿名. 列出某用户发表的存活评论, 平铺不带 `replies`, 每条带 `chartId`、`chartHash`、`chartTitle`.

| Query | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 用户名, 区分大小写 |
| `sort` | string | 否 | 仅 `new` (默认) 或 `top` |
| `page` | int | 否 | 从 1 开始, 范围 1–10000, 默认 1, 每页 20 条 |

**响应**: `200` —— [响应模型](#commentpages) —— 失败: `400 Status` (40000); `404 Status` (40400) 用户不存在

_示例_:

```json
{
  "items": [
    {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "chartId": "33333333-3333-3333-3333-333333333333",
      "chartHash": "naksqJTTV0fMM//FRcdO0g==",
      "chartTitle": "Example",
      "parentId": null,
      "depth": 0,
      "authorId": "66f1a2b3c4d5e6f7a8b9c0d2",
      "author": "player",
      "authorProfile": {
        "id": "66f1a2b3c4d5e6f7a8b9c0d2",
        "username": "player",
        "nickname": "Player",
        "avatarId": "default"
      },
      "body": "Nice chart!",
      "createdAt": "2026-11-10T09:00:00Z",
      "editedAt": null,
      "deleted": false,
      "removed": false,
      "score": 1,
      "myVote": 0,
      "replyCount": 0,
      "replies": []
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### POST /api/challenge/email

匿名. Form: `email: string`, 必填, 校验邮箱包含 `@` 且域名存在 MX 记录.

**响应**: `200` —— 字符串 `challengeKey`; 8 位验证码发送到邮箱, 5 分钟有效. 邮箱无效返回 `400 Status` (60102)

::: info 限流未生效
接口声明了每 IP 每分钟 10 次的限流策略, 但当前应用管线未启用限流中间件, **不能把此限制视为已生效**.
:::

### GET /api/account/icon

匿名. Query: `username: string`, 必填.

**响应**: `302` —— 为该用户头像的绝对地址 (未上传时跳转默认头像). 用户名为空或用户不存在时返回 `404`. 客户端缓存声明为 1 小时

已发布的 MajdataPlay (2.0.5 及更早) 通过此接口加载头像. 新客户端可以直接用响应里的 `avatarId` 请求 `GET /api/avatar/{avatarId}`.

### GET /api/avatar/{avatarId}

匿名. Path: `avatarId: string`.

**响应**: `302` —— 为头像的绝对地址. 没有该 ID 时跳转默认头像; 可使用 `default` 获取默认头像

## 游戏设置

### GET /api/account/gamesetting

鉴权: 登录. 无参数.

**响应**: `200` —— 返回解码后的 JSON **文本字符串**; 无设置或解码失败时为 `{}`. 默认内容协商下通常是 `text/plain`, 不是统一对象包装

_示例_:

```json
{
  "volume": 0.8,
  "noteSpeed": 7.5
}
```

### POST /api/account/gamesetting

鉴权: 登录. 请求体为原始 UTF-8 JSON, 最大 1 MiB. 接收任何合法 JSON 值.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `{ username: string, userSettingJson: string }`; `userSettingJson` 是本次 JSON 文本的 Base64. 失败: `400` 非法 JSON (40000) 或过大 (41300)

## 谱面与文件

以下 `{chartId}` 均为 Guid.

_示例_:

```json
{
  "username": "player",
  "userSettingJson": "eyJ2b2x1bWUiOjAuOH0="
}
```

### GET /api/maichart/list

匿名.

| Query | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sort` | string | 否 | `hotp` 热门, 按互动热度倒序; `topp` 按赞减踩倒序 (`likep` 是它的别名); `commp` 按存活评论数倒序; `playp` 游玩计数; `timep` 上传时间; `scorep` 见下文; 默认或其他值按最后互动时间倒序 |
| `search` | string | 否 | 支持前缀搜索或不区分大小写的正则搜索 |
| `page` | int | 否 | 从 0 开始, 每页 30 条; 省略时不分页 |
| `isRanking` | bool | 否 | 为 true 且未搜索时, 限制最近 7 天上传谱面并最多取 10 条 |

搜索前缀: `id:` (Guid)、`hash:`、`uploader:`、`tag:`、`level:`. 其他内容作为正则匹配标题、艺术家、谱师、上传者、难度和标签; 无效 `id:` 返回空数组.

**响应**: `200` —— [响应模型](#onlinemaichart) —— 通常 `200 OnlineMaiChart[]`. `sort=scorep` 特别处理: 返回最近 7 天游玩最多的至多 10 个谱面, 提前返回并忽略 `search/page/isRanking`

_示例_:

```json
[
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "title": "Example",
    "artist": "Artist",
    "designer": "Designer",
    "description": "",
    "levels": ["", "", "", "", "14+", "", ""],
    "uploader": "uploader",
    "timestamp": "2026-10-06T00:00:00Z",
    "hash": "naksqJTTV0fMM//FRcdO0g==",
    "tags": [],
    "publicTags": []
  }
]
```

### GET /api/maichart/hash-status

鉴权: 登录. Query: `hash: string`, 必填.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `{ hash, exists, hasHistoricalScores, hasHistoricalInteract, chart }`. 空白 Hash 返回 `400 Status`

- `exists`: 谱面存在.
- `hasHistoricalScores`: 谱面存在且其任一 level hash 下有成绩.
- `hasHistoricalInteract`: 谱面存在且按谱面 ID 有互动记录 (当前实现等于谱面是否存在).

_示例_:

```json
{
  "hash": "naksqJTTV0fMM//FRcdO0g==",
  "exists": true,
  "hasHistoricalScores": true,
  "hasHistoricalInteract": true,
  "chart": {
    "id": "33333333-3333-3333-3333-333333333333",
    "title": "Example",
    "artist": "Artist",
    "designer": "Designer",
    "description": "",
    "levels": ["", "", "", "", "14+", "", ""],
    "uploader": "uploader",
    "uploaderID": "66f1a2b3c4d5e6f7a8b9c0d1",
    "timestamp": "2026-10-06T00:00:00Z",
    "hash": "naksqJTTV0fMM//FRcdO0g==",
    "tags": [],
    "publicTags": []
  }
}
```

### GET /api/maichart/changes

匿名. 查询给定时间范围内新增、变更、删除的谱面, 供客户端增量更新本地谱面列表.

| Query | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from` | datetime | 是 | 范围起点 (含), 通常传上一次响应的 `to` |
| `to` | datetime | 否 | 范围终点 (不含); 省略或晚于当前时间时取当前时间 |

**响应**: `200` —— [响应模型](#chartchanges)

```json
{
  "to": "2026-11-02T08:00:00.123Z",
  "isComplete": true,
  "changes": [
    { "chartId": "…", "kind": 0, "changedAt": "…", "resources": null, "metadata": null },
    { "chartId": "…", "kind": 1, "changedAt": "…", "resources": null, "metadata": { "publicTags": ["爆发"] } },
    { "chartId": "…", "kind": 2, "changedAt": "…", "resources": null, "metadata": null }
  ]
}
```

- `to`: 本次实际使用的范围终点, 下次请求以它作为 `from`.
- `isComplete`: 为 `false` 时**不返回任何变更**, 客户端应改用 `GET /api/maichart/list` 全量刷新.
- `changes`: 按 `changedAt` 升序. `kind`: `0` 新增、`1` 修改、`2` 删除.

新增只给出谱面 ID, 元信息和资源用 `POST /api/maichart/info` 批量获取. 变更记录默认保留 30 天, 早于最早记录的查询无法保证完整.

失败: 缺少 `from`, 或 `from` 晚于范围终点: `400 Status` (40000); 时间格式无效: `400`.

### GET /api/maichart/{chartId}/summary

匿名. 成功: `200 MaiChart`; 不存在: `404`.

**响应**: `200` —— [响应模型](#maichart)

_示例_:

```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "title": "Example",
  "artist": "Artist",
  "designer": "Designer",
  "description": "",
  "levels": ["", "", "", "", "14+", "", ""],
  "uploader": "uploader",
  "uploaderID": "66f1a2b3c4d5e6f7a8b9c0d1",
  "timestamp": "2026-10-06T00:00:00Z",
  "hash": "naksqJTTV0fMM//FRcdO0g==",
  "tags": [],
  "publicTags": []
}
```

### GET /api/maichart/{chartId}/info

匿名. 返回谱面元信息及各资源文件的信息. 不存在: `404`.

- `metadata`: `MaiChart`, 与 `summary` 相同.
- `resources`: `maidata`、`track`、`video`、`coverArt`、`thumbnail`. 未存储的文件为 `null`.
- 每个资源包含 `url`、`md5`、`sha256` (均为小写十六进制) 和 `length`.
- `levelHashes`: 固定 7 项, 下标为从 0 开始的难度序号, 值为该难度的 level hash; 没有 inote 文本的难度为 `null`.

```json
{
  "metadata": { "id": "…", "title": "…", "hash": "…" },
  "resources": {
    "maidata": { "url": "https://…", "md5": "…", "sha256": "…", "length": 1024 },
    "track": { "url": "…", "md5": "…", "sha256": "…", "length": 4194304 },
    "video": null,
    "coverArt": { "url": "…", "md5": "…", "sha256": "…", "length": 204800 },
    "thumbnail": { "url": "…", "md5": "…", "sha256": "…", "length": 20480 }
  },
  "levelHashes": [null, null, null, "<64 位小写 hex>", "<64 位小写 hex>", null, null]
}
```

**响应**: `200` —— [响应模型](#onlinechartinfo)

### POST /api/maichart/info

匿名. 批量查询多个谱面的 `info`. 请求体为谱面 ID 的 JSON 数组.

**响应**: `200` —— [响应模型](#onlinechartinfo) —— 返回与 `GET /api/maichart/{chartId}/info` 结构相同的对象数组, 按各 ID 在请求中首次出现的顺序排列; 不存在的谱面直接省略. 空数组返回 `[]`. ID 格式无效: `400`. 重复 ID 只计一次, 数量不限

_示例_:

```json
[
  {
    "metadata": {
      "id": "33333333-3333-3333-3333-333333333333",
      "title": "Example",
      "artist": "Artist",
      "designer": "Designer",
      "description": "",
      "levels": ["", "", "", "", "14+", "", ""],
      "uploader": "uploader",
      "uploaderID": "66f1a2b3c4d5e6f7a8b9c0d1",
      "timestamp": "2026-10-06T00:00:00Z",
      "hash": "naksqJTTV0fMM//FRcdO0g==",
      "tags": [],
      "publicTags": []
    },
    "resources": {
      "maidata": {
        "url": "https://example.r2.dev/MaiCharts/33333333-3333-3333-3333-333333333333/maidata.txt",
        "md5": "9a0364b9e99bb480dd25e1f0284c8555",
        "sha256": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        "length": 1024
      },
      "track": null,
      "video": null,
      "coverArt": null,
      "thumbnail": null
    },
    "levelHashes": [null, null, null, null, "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0", null, null]
  }
]
```

### GET /api/maichart/{chartId}/chart

匿名. Query: `intent?: string`, 可选; 用户主动下载时传 `download`, 登录状态下会记为推荐下载转化; 预览和游戏内加载不传.

**响应**: `302` —— 跳转到 `maidata.txt`, 附带文件 SHA-256 Base64 响应头 `hash`. 跳转前按谱面 ID 增加播放计数. 文件不存在: `404` (带 `no-store`)

### GET /api/maichart/{chartId}/track

匿名. 成功: `302` 跳转到 `track.mp3`, 带 `hash`; Range 请求由存储服务处理. 不存在: `404`.

**响应**: `302` —— 无响应体, `Location` 指向 `track.mp3`

### GET /api/maichart/{chartId}/image

匿名. Query: `fullImage?: bool = false`.

**响应**: `302` —— 跳转到第一个存在的封面, 带 `hash`. 默认依次尝试 `bg-compress.jpg`、`bg.png`、`bg.jpg`; `fullImage=true` 时依次尝试原图. 均不存在返回 `404`

### GET /api/maichart/{chartId}/video

匿名. 成功: `302` 跳转到 `bg.mp4`, 带 `hash`. 不存在: `404`.

**响应**: `302` —— 无响应体, `Location` 指向 `bg.mp4`

### GET /api/maichart/{chartId}/radar

匿名. Query: `chartLevel: int`, 必填, 范围 **0–6**, 与成绩接口和游戏的难度编号一致 (`0` 对应 `inote_1`, `4` 为 Master, `6` 对应 `inote_7`).

**响应**: `200` —— [响应模型](#onlinechartradar) —— 按 `featureOrder` 读取 `feature` 字典. 前六项为雷达值 (0–250 刻度), `fitted_constant` 为拟合定数, 使用自身量纲

```json
{
  "featureOrder": ["note", "peak", "sweep", "slide_tricky", "slide_sequence", "jack", "fitted_constant"],
  "feature": {
    "note": 120.0,
    "peak": 135.0,
    "sweep": 80.0,
    "slide_tricky": 160.0,
    "slide_sequence": 110.0,
    "jack": 75.0,
    "fitted_constant": 14.2
  }
}
```

首次访问缺失或过期的缓存时, 请求会等待分析完成后直接返回 JSON, 不使用 `202` 或轮询.

失败: `400` 缺少或非法参数; `404 Status` (40400) 谱面、文件或该难度不存在; `409 Status` (40000) 文件内容与数据库 Hash 不一致; `422 Status` (40000) 该难度无法完整分析.

### POST /api/maichart/upload

鉴权: `MANAGE_CHART_LIST`. 请求为 multipart; 所有文件均使用字段名 **`formfiles`**, 服务端按上传文件名识别用途.

| 文件名 | 必填 | 说明 |
| --- | --- | --- |
| `maidata.txt` | 是 | Simai 谱面; 必须有有效标题、艺术家、谱师和至少一个难度 |
| `bg.jpg` 或 `bg.png` | 是 | 封面, 另外生成 256×256 压缩图 |
| `track.mp3` | 是 | 音频 |
| `bg.mp4` 或 `pv.mp4` | 否 | 视频; 上限 50 MiB |

**响应**: `200` —— 文本 `上传成功！`, **不返回 chartId**; 可通过谱面列表查询. 失败: `400` 缺文件、元信息不完整、相同 MD5 谱面已存在; `409 Status` 表示相同 SHA-256 上传正在处理; `413 Status` 表示视频过大

文件和谱面记录保存成功后记录一条新增变更, 并在后台触发全部难度的雷达分析; 上传响应不等待分析完成.

### POST /api/maichart/delete

鉴权: `MANAGE_CHART_LIST`, 且只能删除本人上传的谱面. Query: `chartId: Guid`, 必填.

**响应**: `200` —— 空响应体 —— 删除谱面记录、文件与该谱面的雷达缓存, 保留按 level hash 关联的历史成绩和互动. 不存在: `404 Status`; 非上传者: `403`

### PUT /api/maichart/{chartId}/tags

鉴权: 登录, 且必须是上传者. JSON 请求体为 `string[]`, 全量替换标签; 空数组清空标签.

标签先规范化: 去掉首尾空白, 丢弃空字符串和 `null`, 按第一次出现的位置去重 (区分大小写). 规范化后与当前标签相同时不写库, 因此可以安全重试.

数量上限: 每种标签最多 **32** 个. 超过时返回 `400 Status` (40002).

**响应**: `200` —— (请求后的 tags); 超过上限: `400 Status` (40002); 不存在: `404`; 非上传者: `403`

_示例_:

```json
["original", "expert"]
```

### PATCH /api/maichart/{chartId}/tags

鉴权同 `PUT`. JSON 请求体为 `{ "add"?: string[], "remove"?: string[] }`.

- `add`、`remove` 按 PUT 的规则规范化; 省略或 `null` 视为空数组.
- 同一标签同时出现在两个列表中: `400 Status` (40000).
- 未删除的标签保持原有顺序, 新增标签按请求顺序追加到末尾.
- 数量上限同上; 上限生效前已超过 32 个的谱面仍可删除标签.
- 并发冲突持续 3 次时返回 `409 Status`, 客户端可直接重试.

**响应**: `200` —— 请求后的 `tags`

_示例_:

```json
["original", "expert"]
```

### PUT /api/maichart/{chartId}/publictags

鉴权: 登录即可, **不要求是上传者** (与只允许上传者修改的 tags 不同). 请求体、规范化、幂等与数量上限规则同 `PUT /api/maichart/{chartId}/tags`, 全量替换公共标签.

**响应**: `200` —— 超过上限: `400 Status` (40002); 不存在: `404`; 未登录: `401`

_示例_:

```json
["爆发", "新人谱师"]
```

### PATCH /api/maichart/{chartId}/publictags

鉴权同 `PUT /api/maichart/{chartId}/publictags`; 请求体与规则同 `PATCH /api/maichart/{chartId}/tags`. 多个用户同时增删不同标签不会互相覆盖, 因此多人编辑公共标签时推荐用它代替整体替换.

**响应**: `200` —— 同一标签既增又删: `400 Status`; 超过上限: `400 Status` (40002)

## 谱面互动

投票与评论采用 Reddit 式模型: 每人每个目标一票 (赞 `+1`、踩 `-1`、撤票 `0`), 评论成线程、可投票、可排序.

`{chartId}` 为 Guid, `{commentId}` 为 ObjectId. 网页通过本节的 JSON 接口读写; `interact` 下的三个 Form 接口是**游戏客户端兼容接口, 网页不要再使用**.

### 数据模型

- **投票**: 每个用户对每张谱面至多一票, `value ∈ {1, -1}`. 改投另一方向会替换原票, 重复投同一方向不改变计数, `value=0` 撤票.
- **互动记录**: 按谱面 ID 一条, 包含赞数、踩数、赞减踩、存活评论数、热门排序值、播放计数和最后活跃时间.
- **评论**: 每条评论或回复一条记录, 含父评论、所属顶层评论、深度、票数、直接回复数、编辑/删除/移除时间.
- 作者发帖时自动给自己投一票赞.
- **删除**: 有回复的评论变为占位符 (正文清空), 无回复的物理删除并连带清理只为它保留的占位祖先. 管理员可移除任何评论, 行为相同但标记为移除.
- **正文**: 统一换行并去首尾空白后, 须为 1–10000 个字符, 且不含换行与制表符以外的控制字符.
- **回复深度**上限 999.
- **限流**: 每用户每分钟最多发 8 条评论, 超出返回 `429` 并带 `Retry-After: 60`.
- **排序 `sort`** (区分大小写): `best` (默认)、`top`、`new`、`old`、`controversial`.

_示例_:

```json
["爆发", "新人谱师"]
```

### PUT /api/maichart/{chartId}/vote

鉴权: `COMMIT_CHART_INTERACTION`. JSON 请求体 `{ "value": 1 | 0 | -1 }`.

**响应**: `200` —— [响应模型](#onlinevoteresult) —— 即 `{ score, upvotes, downvotes, myVote }`. 撤销不存在的票也返回 `200`

失败: `400` 值非法或请求体不可解析; `403` 上传者禁用了该谱面的互动; `404` 谱面不存在.

_示例_:

```json
{
  "score": 12,
  "upvotes": 15,
  "downvotes": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/comments

匿名; 登录后每条评论的 `myVote` 为当前用户的票.

| Query | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sort` | string | 否 | `best` (默认)、`top`、`new`、`old`、`controversial` |
| `page` | int | 否 | 从 1 开始, 范围 1–10000, 默认 1 |

每页 20 条顶层评论, 并带上这些顶层评论之下最多 1500 条回复; 回复嵌入各自父评论的 `replies`. 每条评论的 `authorProfile` 为作者的公开资料, 网页可直接显示昵称和头像.

**响应**: `200` —— [响应模型](#commentpages) —— 即 `{ items, total, commentCount, page, pageSize: 20, sort }`; `total` 为该谱面的顶层评论数 (含占位符)

::: warning 已废弃字段
`commentCount` 为存活评论数, **已废弃**: 没有客户端读取, Swagger 中标记为 deprecated. 请改用 `GET /api/maichart/{chartId}/interactsum` 的 `comments` (同一个计数).
:::

_示例_:

```json
{
  "items": [
    {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "chartId": "33333333-3333-3333-3333-333333333333",
      "chartHash": "naksqJTTV0fMM//FRcdO0g==",
      "parentId": null,
      "depth": 0,
      "authorId": "66f1a2b3c4d5e6f7a8b9c0d2",
      "author": "player",
      "authorProfile": {
        "id": "66f1a2b3c4d5e6f7a8b9c0d2",
        "username": "player",
        "nickname": "Player",
        "avatarId": "default"
      },
      "body": "Nice chart!",
      "createdAt": "2026-11-10T09:00:00Z",
      "editedAt": null,
      "deleted": false,
      "removed": false,
      "score": 1,
      "myVote": 0,
      "replyCount": 1,
      "replies": [
        {
          "id": "66f1a2b3c4d5e6f7a8b9c0d3",
          "chartId": "33333333-3333-3333-3333-333333333333",
          "chartHash": "naksqJTTV0fMM//FRcdO0g==",
          "parentId": "66f1a2b3c4d5e6f7a8b9c0d1",
          "depth": 1,
          "authorId": "66f1a2b3c4d5e6f7a8b9c0d4",
          "author": "other",
          "authorProfile": null,
          "body": "Agreed",
          "createdAt": "2026-11-10T09:05:00Z",
          "editedAt": null,
          "deleted": false,
          "removed": false,
          "score": 0,
          "myVote": 0,
          "replyCount": 0,
          "replies": []
        }
      ]
    }
  ],
  "total": 1,
  "commentCount": 2,
  "page": 1,
  "pageSize": 20,
  "sort": "best"
}
```

### POST /api/maichart/{chartId}/comments

鉴权: `COMMIT_CHART_INTERACTION`. JSON 请求体 `{ "body": string, "parentId"?: ObjectId }`; `parentId` 省略或 null 为顶层评论, 否则必须是**同一谱面**上的存活评论.

**响应**: `201` —— [响应模型](#onlinecomment) —— (不含 `replies`), `Location` 指向 `GET /api/comment/{id}`. 发表后会异步发送邮件与群通知, 失败只记日志

失败: `400` 正文不合规、回复过深或请求体不可解析; `403` 上传者禁用互动; `404` 谱面或父评论不存在; `409` 父评论已删除; `429` 超出限流.

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "chartId": "33333333-3333-3333-3333-333333333333",
  "chartHash": "naksqJTTV0fMM//FRcdO0g==",
  "parentId": null,
  "depth": 0,
  "authorId": "66f1a2b3c4d5e6f7a8b9c0d2",
  "author": "player",
  "authorProfile": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d2",
    "username": "player",
    "nickname": "Player",
    "avatarId": "default"
  },
  "body": "Nice chart!",
  "createdAt": "2026-11-10T09:00:00Z",
  "editedAt": null,
  "deleted": false,
  "removed": false,
  "score": 1,
  "myVote": 1,
  "replyCount": 0,
  "replies": []
}
```

### GET /api/comment/{commentId}

匿名; 评论的永久链接视图. Query: `sort`, 取值同上, 默认 `best`.

返回该评论 (即使它是占位符) 及其之下的全部回复. 成功: `200 OnlineCommentThread`, 即 `{ item, sort }`. `commentId` 非法或 `sort` 无效: `400 Status`; 不存在: `404 Status`.

**响应**: `200` —— [响应模型](#commentpages)

_示例_:

```json
{
  "item": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "chartId": "33333333-3333-3333-3333-333333333333",
    "chartHash": "naksqJTTV0fMM//FRcdO0g==",
    "chartTitle": "Example",
    "parentId": null,
    "depth": 0,
    "authorId": "66f1a2b3c4d5e6f7a8b9c0d2",
    "author": "player",
    "authorProfile": null,
    "body": "Nice chart!",
    "createdAt": "2026-11-10T09:00:00Z",
    "editedAt": null,
    "deleted": false,
    "removed": false,
    "score": 1,
    "myVote": 0,
    "replyCount": 0,
    "replies": []
  },
  "sort": "best"
}
```

### PATCH /api/comment/{commentId}

鉴权: `COMMIT_CHART_INTERACTION`, 只有作者本人可以编辑. JSON 请求体 `{ "body": string }`, 正文规则同发表.

**响应**: `200` —— [响应模型](#onlinecomment) —— 正文有变化时设置 `editedAt`. 失败: `400` 正文不合规; `403` 非本人评论; `404` 不存在; `409` 评论已删除

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "chartId": "33333333-3333-3333-3333-333333333333",
  "chartHash": "naksqJTTV0fMM//FRcdO0g==",
  "parentId": null,
  "depth": 0,
  "authorId": "66f1a2b3c4d5e6f7a8b9c0d2",
  "author": "player",
  "authorProfile": null,
  "body": "Edited body",
  "createdAt": "2026-11-10T09:00:00Z",
  "editedAt": "2026-11-10T10:00:00Z",
  "deleted": false,
  "removed": false,
  "score": 1,
  "myVote": 0,
  "replyCount": 0,
  "replies": []
}
```

### DELETE /api/comment/{commentId}

鉴权: `COMMIT_CHART_INTERACTION`. 作者删除自己的评论; 管理员可移除任何人的评论.

**响应**: `200` —— [响应模型](#commentpages) —— 即 `{ ok: true, purged }`; `purged=true` 表示评论没有回复、已物理删除, `false` 表示变为占位符. 失败: `400` ID 非法; `403` 非本人评论; `404` 不存在

_示例_:

```json
{
  "ok": true,
  "purged": false
}
```

### PUT /api/comment/{commentId}/vote

鉴权: `COMMIT_CHART_INTERACTION`. JSON 请求体 `{ "value": 1 | 0 | -1 }`.

**响应**: `200` —— [响应模型](#onlinevoteresult) —— 评论只返回 `{ score, myVote }`. 失败: `400` 值非法; `404` 不存在; `409` 占位符不能投票

_示例_:

```json
{
  "score": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/interactsum

匿名. 成功: `200 ChartInteractSummary`, 即 `{ chartId, plays, score, upvotes, downvotes, comments, myVote }`; 没有互动记录时各项为 0; 谱面不存在: `404` (无响应体). 响应禁止缓存.

**响应**: `200` —— [响应模型](#chartinteractsummary)

_示例_:

```json
{
  "chartId": "33333333-3333-3333-3333-333333333333",
  "plays": 120,
  "score": 12,
  "upvotes": 15,
  "downvotes": 3,
  "comments": 8,
  "myVote": 1
}
```

### POST /api/maichart/interactsum

匿名. JSON 请求体为 `Guid[]`. 成功: `200 ChartInteractSummary[]`, 按请求顺序返回, 重复 ID 只回答一次, 不存在的谱面省略. 响应禁止缓存.

**响应**: `200` —— [响应模型](#chartinteractsummary)

### 游戏客户端兼容接口

::: warning 网页不要使用
以下三个接口保留已发布 MajdataPlay 版本依赖的请求与响应形状. `like` 等同于投赞, `dislike` 等同于投踩, 评论走同一套创建与删除逻辑.
:::

#### GET /api/maichart/{chartId}/interact

匿名; 登录后附带当前用户的票. 成功: `200 ChartInteractFull`: `isLiked`/`isDisLiked` 为当前用户是否投了赞/踩, `likes` 为投赞用户的用户名数组 (客户端自行计数), `disLikeCount` 为踩数, `comments` 为存活评论树 (按发表顺序, 占位符及其下的回复都不返回).

#### POST /api/maichart/{chartId}/interact

鉴权: `COMMIT_CHART_INTERACTION`. 请求体为 **Form**.

| Form 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | `like`、`dislike`、`comment`, 区分大小写 |
| `content` | string | 条件必填 | `type=comment` 时必填, 正文规则同发表评论 |
| `replyTo` | ObjectId | 否 | 回复的评论 ID, 须为该谱面上的存活评论 |

`like`/`dislike` 走与 `PUT /api/maichart/{chartId}/vote` 相同的投票逻辑, 成功 `200 空`. `comment` 走同一套评论创建, 成功 `200 空`, 不返回评论对象.

::: info 与新版接口的差异
上传者禁用互动时本接口返回 `401` (新接口为 `403`); 未知 `type` 返回 `400` 且无响应体.
:::

#### DELETE /api/maichart/{chartId}/interact

鉴权: `COMMIT_CHART_INTERACTION`. 请求体仍为 **Form**.

| Form 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | `like`、`dislike`、`comment` |
| `comment-id` | ObjectId | 条件必填 | 删除评论时必填, 只能删除自己的评论 |

`like`/`dislike` 只撤回当前用户**该方向**的票: 另一方向的票保留不动, 没有票时不做任何改动. `comment` 删除自己的评论, 规则同 `DELETE /api/comment/{commentId}`. 均返回 `200 空`.

## 成绩

成绩按难度的 level hash 保存: 每位玩家每个 level hash 一条最佳成绩, inote 文本相同的难度共享成绩. 谱面 A 的 Master 与谱面 B 的 Re:Master 完全一致时, 二者共用一个排行榜.

新客户端用 `POST /api/maiscore/level/{levelHash}` 按 level hash 提交并在请求体中注明所玩谱面的 ID; 已发布的客户端仍用 `POST /api/maichart/{chartId}/score` 按谱面 Hash 提交, 两者的成绩校验和保存方式相同.

两个接口共用的成绩校验: `chartLevel` 为 0–6; 达成率使用百分数数值, 如 `100.5`. DX 在 0–101, Classic 在 0–104, `dxScore` 非负; DX=101 或 Classic=104 要求 APPlus; APPlus 要求 DX 为 100 或 101 且 Classic≥100; AP 要求两者≥100. 不满足时返回 `400 Status` (`Invalid Score`).

两个接口共用的保存方式 (成功均为 `200 空`):

- 最佳成绩按"玩家 + level hash"保存: DX、Classic、DXScore、ComboState **各自**保留旧值与本次中较大的一个, 时间记录为本次提交的时间.
- 新增一条本次真实成绩的游玩历史.
- 谱面播放计数加一, 并作为推荐的游玩转化异步上报.
- DX≥100.5 时向社区渠道推送高分.

_示例_:

```json
[
  {
    "chartId": "33333333-3333-3333-3333-333333333333",
    "plays": 120,
    "score": 12,
    "upvotes": 15,
    "downvotes": 3,
    "comments": 8,
    "myVote": 0
  }
]
```

### POST /api/maiscore/level/{levelHash}

鉴权: `W_USER_MAI_SCORES`. 路径中的 `{levelHash}` 是所玩难度的 level hash (64 位小写十六进制). 请求体的 `chartId` 是所玩谱面, 只决定这次游玩记在哪张谱面上:

```json
{
  "chartId": "11111111-1111-1111-1111-111111111111",
  "acc": { "dx": 100.5, "classic": 102.1 },
  "dxScore": 1234,
  "comboState": 1
}
```

| 字段 | 类型 | 必填/默认 | 说明 |
| --- | --- | --- | --- |
| `chartId` | Guid | **必填** | 所玩谱面的 ID, 该谱面须有一个难度的 level hash 等于 `{levelHash}` |
| `acc` | object | 默认零值 | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 默认 0 | 非负 |
| `comboState` | int | 默认 0 | ComboState 数值 |

失败: `400` 缺少 `chartId`、level hash 非法或成绩不合法; `404` 谱面不存在 (`No such song on server`)、该谱面没有这个 level hash 的难度 (`No such level on server`, 客户端应刷新谱面) 或用户不存在.

**响应**: `200` —— 空响应体

### POST /api/maichart/{chartId}/score

鉴权: `W_USER_MAI_SCORES`. 已发布客户端使用的旧接口, 请求体不变; 其他字段 (如客户端仍可能带上的 `id`、`playerId`、`timestamp`) 一律忽略.

| 字段 | 类型 | 必填/默认 | 说明 |
| --- | --- | --- | --- |
| `chartLevel` | int | 必填 | 0–6 |
| `hash` | string | 必填 | 必须与路径谱面当前的 MD5 Base64 一致 |
| `acc` | object | 默认零值 | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 默认 0 | 非负 |
| `comboState` | int | 默认 0 | ComboState 数值 |

失败: `400` 成绩不合法; `404` 谱面不存在、`hash` 与当前谱面不一致 (客户端应刷新谱面)、该难度没有 level hash 或用户不存在.

::: info 推荐
本接口保留供已发布客户端使用. 新客户端请改用 `POST /api/maiscore/level/{levelHash}`, 不再依赖谱面 Hash.
:::

**响应**: `200` —— 空响应体

## 谱单

以下 `{collectionId}` 为谱单 ObjectId. 格式无效返回 `400 Status`. 私有谱单对非所有者按不存在处理 (`404`).

谱单的 `items` 存谱面 ID, 按加入顺序排列; 谱面删除后其 ID 仍留在谱单里, 直到所有者移除. 写接口与 songlist 收发谱面 ID, 谱面元信息由客户端用 `POST /api/maichart/info` 批量获取; 供游戏游玩的 hashlist 和收藏谱单列表仍返回谱面 Hash.

### GET /api/collection/list

匿名可读公开谱单; 登录且拥有 `R_USER_CHART_COLLECTIONS` 时同时包含自己的私有谱单.

| Query | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keyword` | string | 无 | 名称/描述的不区分大小写正则 |
| `createdBy` | string | 无 | 所有者用户名; 不存在返回空数组 |
| `page` | int | 0 | 从 0 开始 |
| `pageSize` | int | 30 | 每页数量 |

**响应**: `200` —— [响应模型](#playlistlistitem) —— 谱单列表项数组, 按最后活跃时间倒序. 负 page/pageSize 返回 `400`

_示例_:

```json
[
  {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "My playlist",
    "createdBy": "player",
    "description": "",
    "count": 3
  }
]
```

### POST /api/collection/create

鉴权: `W_USER_CHART_COLLECTIONS`. JSON:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | string | 是 | 名称 |
| `description` | string | 否 | 描述 |
| `visibility` | int | 是 | 0 私有、1 公开 |

**响应**: `200` —— [响应模型](#onlinesongcollection) —— 初始 items 为空、count 为 0

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "createdBy": "player",
  "name": "My playlist",
  "description": "",
  "visibility": 1,
  "items": [],
  "count": 0
}
```

### GET /api/collection/{collectionId}/hashlist

公开谱单匿名可读; 私有谱单仅登录所有者可读. 成功: `200 OnlineDanInfo` (见[响应模型](#onlinedaninfo)), `songHashs` (保留原拼写) 为谱单中仍存在的谱面的 Hash. **该字段是无序集合**, 需要顺序请用 songlist. 不存在或不可见: `404`.

**响应**: `200` —— [响应模型](#onlinedaninfo)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "My playlist",
  "createdBy": "player",
  "description": "",
  "songHashs": ["naksqJTTV0fMM//FRcdO0g=="],
  "isPlayList": true,
  "isForceGameover": false
}
```

### GET /api/collection/{collectionId}/songlist

权限与 hashlist 相同. 成功: `200 OnlineSongCollection`, `items` 为仍存在的谱面的 ID (`Guid[]`), 按谱单顺序.

`items` 不内嵌谱面信息; 客户端把它原样提交给 `POST /api/maichart/info` 一次取回元信息. 空谱单无需请求.

**响应**: `200` —— [响应模型](#onlinesongcollection)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "createdBy": "player",
  "name": "My playlist",
  "description": "",
  "visibility": 1,
  "items": ["33333333-3333-3333-3333-333333333333"],
  "count": 1
}
```

### POST /api/collection/{collectionId}/destroy

鉴权: `W_USER_CHART_COLLECTIONS`, 且为谱单所有者. 无请求体.

**响应**: `200` —— 空响应体 —— 不存在或不可见: `404`; 访问到公开但非本人谱单: `403 Status`

### PUT /api/collection/{collectionId}/modify

鉴权: 同时具备 `R_USER_CHART_COLLECTIONS`、`W_USER_CHART_COLLECTIONS`, 且为所有者.

| JSON 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | string | 否 | 非空才更新 |
| `description` | string | 否 | 不传或 null 则保留; 传空字符串可清空 |
| `visibility` | int | 否 | 非 null 时更新 |
| `items` | Guid[] | 否 | 谱面 ID 数组, 全量替换并按请求顺序保存; 空数组清空; 不存在的谱面被过滤, 重复 ID 只保留一个 |

**响应**: `200` —— [响应模型](#onlinesongcollection) —— `{ code: 114514, message: "Ok", collection: OnlineSongCollection }`. 谱单 ID 无效或请求体无法解析: `400 Status`, 不做任何修改. 不存在或不可见: `404`; 非本人公开谱单: `403`

增删单个谱面时, 客户端先读 songlist 的 `items`, 在本地增删后把完整列表交给 modify.

::: danger 已移除的旧调用
原来的增量接口 `POST /api/collection/{collectionId}/diff` 已移除, 调用得到 `404`. 原 `POST /api/collection/{collectionId}/modify` 已改为 `PUT`, 用 `POST` 调用得到 `405`.
:::

## 收藏谱单

_示例_:

```json
{
  "code": 114514,
  "message": "Ok",
  "collection": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "createdBy": "player",
    "name": "My playlist",
    "description": "",
    "visibility": 1,
    "items": ["33333333-3333-3333-3333-333333333333"],
    "count": 1
  }
}
```

### GET /api/account/favorite/collection/list

鉴权: `R_USER_CHART_COLLECTIONS`. Query: `isExtra?: bool = false`.

**响应**: `200` —— [响应模型](#onlinedaninfo) —— 默认返回已收藏谱单; `isExtra=true` 附加"我赞过的""大家都在玩""最近受欢迎/被讨论/被下载""今日课题"等系统谱单

当 User-Agent 以 `MajdataPlay` 开头时, 还合并自己创建的谱单并启用附加谱单.

| 列表 | 来源与顺序 |
| --- | --- |
| 收藏谱单、自己的谱单 | 谱单 `items` 中的谱面 ID 换成 Hash, 按谱单顺序 |
| 我赞过的 | 该用户的赞, 最近投票在前 |
| 大家都在玩 | 近 7 天更新过的成绩按谱面计数, 取前 20 个 |
| 大家都喜欢 | 近 7 天上传且赞数 ≥5、赞减踩 ≥0 的谱面, 按赞减踩倒序 |
| 大家在讨论 | 近 7 天上传的谱面按评论数倒序, 前 10 个 |
| 大家在下载 | 近 7 天上传的谱面按播放数倒序, 前 10 个 |
| 今日课题 | 按日期种子选出的 10 张谱面 |

_示例_:

```json
[
  {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "My playlist",
    "createdBy": "player",
    "description": "",
    "songHashs": ["naksqJTTV0fMM//FRcdO0g=="],
    "isPlayList": true,
    "isForceGameover": false
  }
]
```

### POST /api/account/favorite/collection/diff

鉴权: `W_USER_CHART_COLLECTIONS`. JSON 请求体为 ObjectId 字符串数组.

添加收藏, 只处理公开谱单或本人拥有的谱单. 成功: `200 Status`, message `Ok`; 空数组也成功. 非空请求中没有任何符合条件的谱单: `404`.

**响应**: `200` —— [响应模型](#status)

_示例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

### DELETE /api/account/favorite/collection/diff

鉴权同上, JSON 请求体同上. 移除收藏. 成功: `200 Status`, message `Ok`; 空数组或未收藏 ID 也可成功.

**响应**: `200` —— [响应模型](#status)

_示例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## 机台与扫码授权

正常调用顺序: 机台注册 → 发起授权请求 → 用户读取请求信息并批准 → 原机台轮询 check → 保存授权用户的 token. 机台 Cookie 和用户 Cookie 应分别保留.

### POST /api/machine/register

无需用户登录. 必须提供以 **`MajdataPlay`** 开头的 `User-Agent`. JSON: `name: string` 必填、`description?: string`.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `{ id, name, description, place, remoteIP }`; 其中 `id` 是创建的机台**会话 ID**; 真正机台 ID 在 `machine-id` Cookie. 设置 `machine-token` 和 `machine-id`

失败: `403 Status` User-Agent 缺失或不符合要求; `400 Status` 名称缺失或无法获得 IP.

机台是临时的, 生命周期与它自己的机台会话绑定: 机台会话过期或被删除后, 机台视为不存在.

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Cabinet",
  "description": "",
  "place": "Shanghai",
  "remoteIP": "203.0.113.7"
}
```

### GET /api/machine/info

Query: `machine-id?: ObjectId`. 指定 ID 时查询对应机台; 省略时查询当前机台会话. 无需用户登录.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `{ name, description, place, remoteIP }`; 机台或所需会话不存在: `404 Status`. 声明缓存 30 分钟

_示例_:

```json
{
  "name": "Cabinet",
  "description": "",
  "place": "Shanghai",
  "remoteIP": "203.0.113.7"
}
```

### POST /api/machine/unregister

要求当前机台会话, 无参数.

**响应**: `200` —— 空响应体 —— 删除机台、撤销授权、移除机台会话, 并把 `machine-token`、`machine-id`、`token` Cookie 设置为空. 无机台会话: `401 Status`

### POST /api/machine/auth/request

鉴权: 有效机台会话, 无参数. 创建有效期 5 分钟的授权请求. 每台机台同时最多一条请求.

**响应**: `201` —— [响应模型](#anonymousobjects) —— `{ requestId: string }`; `Location` 为 `https://majdata.net/qrauth?auth-id={requestId}`. 已有有效请求: `403 Status`; 注册信息找不到: `401 Status`

_示例_:

```json
{
  "requestId": "8f2c1d3e4a5b6c7d8e9f0a1b"
}
```

### GET /api/machine/auth/info

匿名. Query: `auth-id: string`, 必填.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `{ grantee: "machine", granteeInfo: { name, description, place, remoteIP } }`. 请求、机台或对应会话无效: `404 Status`. 禁止存储缓存

_示例_:

```json
{
  "grantee": "machine",
  "granteeInfo": {
    "name": "Cabinet",
    "description": "",
    "place": "Shanghai",
    "remoteIP": "203.0.113.7"
  }
}
```

### POST /api/machine/auth/permit

鉴权: `AUTHORIZE`. Query: `auth-id: string`, 必填.

成功批准: `200 空`, 为当前用户创建游戏权限临时会话, 并向有邮箱的用户发送通知; 请求存在但未再次成功授权 (例如已批准): `204`; 请求不存在: `404 Status`.

**响应**: `200` —— 空响应体 (`204` 表示已批准过)

### GET /api/machine/auth/check

鉴权: 有效机台会话. Query: `auth-id: string`, 必填. 仅发起该请求的机台可轮询.

| HTTP 状态 | 含义 |
| --- | --- |
| `202` | 尚未批准, 无响应体, 可继续轮询 |
| `200` | `{ token: Guid, userInfo: UserProfile }`, 同时设置 `token` Cookie |
| `403` | 请求不属于当前机台 |
| `404` | 请求不存在、已消费或机台不存在 |

成功获取会消费请求, 不能重复领取. 禁止存储缓存.

**响应**: `200` —— [响应模型](#anonymousobjects) —— `匿名对象`

_示例_:

```json
{
  "token": "7b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
  "userInfo": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "username": "player",
    "nickname": "Player",
    "introduction": null,
    "email": null,
    "avatarId": "",
    "joinDate": "2026-11-01T12:00:00Z"
  }
}
```

### POST /api/machine/auth/revoke

鉴权: 有效机台会话. Query: `auth-id: string`, 必填.

**响应**: `200` —— 空响应体 —— 请求不存在: `404 Status`; 非发起机台: `403 Status`. check 消费请求后再使用相同请求 ID 可能返回 `404`

## 成绩排行与统计

本节接口统一位于 `/api/maiscore` 下, 按用途分为 `leaderboard` (排行榜)、`sum` (成绩总和统计)、`rating` (rating 雷达) 和 `history` (游玩历史) 四组, 全部匿名可用.

| 用途 | 方法与路径 |
| --- | --- |
| 单谱面排行榜 | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` |
| 单难度排行榜 | `GET /api/maiscore/leaderboard/chart/by-level/{levelHash}` |
| 时间段排行榜 | `POST /api/maiscore/leaderboard/period` |
| 全站成绩总和榜 | `GET /api/maiscore/sum/all` |
| 上传者谱面成绩总和榜 | `GET /api/maiscore/sum/chart/by-uploader/{uploader}` |
| 单谱面成绩总和榜 | `GET /api/maiscore/sum/chart/by-id/{chartId}`、`GET /api/maiscore/sum/chart/by-hash/{hash}` |
| 单个玩家成绩总和 | `GET /api/maiscore/sum/user/by-id/{userId}`、`GET /api/maiscore/sum/user/by-username/{username}` |
| rating 雷达 | `GET /api/maiscore/rating/by-username/{username}` |
| 游玩热力图 | `GET /api/maiscore/history/heatmap` |

列出玩家的响应带有玩家资料, 网页可以直接显示昵称和头像 (`GET /api/avatar/{avatarId}`), 无需逐个请求 `GET /api/account/profile`.

::: info 旧路由
本节接口均已取代旧的 `/api/maichart/{chartId}/score` (GET)、`/api/stats/score-sums`、`/api/playhistory/*` 等路由, 详见下文〈已废弃但仍可用〉. 新代码只应调用上表中的接口.
:::

### GET /api/maiscore/leaderboard/chart/by-id/{chartId}

匿名. 成功: `200 ChartScoreSummary { hash, levelHashes, scores }`. `levelHashes` 固定 7 项, 没有 inote 的难度为 `null`; `scores` 长度为 **8**, `scores[level]` (level 0–6) 为该难度的榜单, 最后一项始终为空数组.

每个难度的榜单取 `levelHash` 等于该难度 level hash 的成绩, 按 DX 达成率倒序最多 10 条, 每位玩家一条. 没有 level hash 的难度榜单为空数组.

失败: 谱面不存在 `404 Status`; `chartId` 不是合法 Guid `400`.

::: info 玩家资料
本接口的 `scores[][].player` 为完整的 `UserProfile` (为已发布的 MajdataPlay 保留), 其中 `id` 为真实用户 ObjectId, `avatarId` 已填充, 邮箱为 null.
:::

**响应**: `200` —— [响应模型](#leaderboards)

_示例_:

```json
{
  "hash": "naksqJTTV0fMM//FRcdO0g==",
  "levelHashes": [null, null, null, null, "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0", null, null],
  "scores": [
    [],
    [],
    [],
    [],
    [
      {
        "player": {
          "id": "66f1a2b3c4d5e6f7a8b9c0d1",
          "username": "player",
          "nickname": "Player",
          "introduction": null,
          "email": null,
          "avatarId": "default",
          "joinDate": "2026-11-01T12:00:00Z"
        },
        "acc": 100.5123,
        "comboState": 3,
        "timestamp": "2026-11-10T09:00:00Z"
      }
    ],
    [],
    []
  ]
}
```

### GET /api/maiscore/leaderboard/chart/by-level/{levelHash}

匿名. Path: `levelHash` 为 64 位小写十六进制.

**响应**: `200` —— [响应模型](#leaderboards) —— `{ levelHash, scores: ScoreSummary[] }`; 规则与 by-id 的单个难度相同. 只查成绩, 不查谱面, 因此 level hash 可以属于已删除的谱面, 或不属于任何谱面. 没有成绩时 `scores` 为空数组

`levelHash` 不是 64 位小写十六进制 (含大写) 时返回 `400 Status`.

_示例_:

```json
{
  "levelHash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0",
  "scores": [
    {
      "player": {
        "id": "66f1a2b3c4d5e6f7a8b9c0d1",
        "username": "player",
        "nickname": "Player",
        "introduction": null,
        "email": null,
        "avatarId": "default",
        "joinDate": "2026-11-01T12:00:00Z"
      },
      "acc": 100.5123,
      "comboState": 3,
      "timestamp": "2026-11-10T09:00:00Z"
    }
  ]
}
```

### POST /api/maiscore/leaderboard/period

匿名. JSON:

| 字段 | 类型 | 必填/默认值 | 说明 |
| --- | --- | --- | --- |
| `songIds` | Guid[] | 必填、非空 | 谱面 ID |
| `startTime` | datetime | 应提供 | 开始时间 (包含) |
| `endTime` | datetime | 应提供 | 结束时间 (包含), 必须晚于开始 |
| `sortBy` | string | `Acc.DX` | `DXScore`、`Acc.DX`、`Acc.Classic` |
| `scoreType` | string | `total` | `total` 累加每次游玩; `best` 先按玩家 + level hash 分别取各指标最高值再累加 |

游玩和成绩一样按 level hash 归属: 取所请求谱面各难度的 level hash, 匹配这些难度上的游玩, 不论这次游玩记在哪张谱面上; 多张请求谱面共用的难度在 `best` 时只计一次.

`sortBy`/`scoreType` 忽略首尾空白及大小写, null/空字符串使用默认值. 成功: `200 PlayHistoryRankingEntry[]`, 按所选指标倒序, 无分页.

失败: 空 `songIds` 为 `400` (40001), 时间或模式错误为 `400` (40000); 完全省略 `songIds` 或其中有非法 Guid 时由框架返回 ProblemDetails. 旧字段 `songhashes` 不再接受.

**响应**: `200` —— [响应模型](#statisticsandrating)

_示例_:

```json
[
  {
    "playerId": "66f1a2b3c4d5e6f7a8b9c0d1",
    "username": "player",
    "totalDXScore": 12750,
    "totalAccDX": 503.2,
    "totalAccClassic": 508.4,
    "player": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "username": "player",
      "nickname": "Player",
      "avatarId": "default"
    }
  }
]
```

### GET /api/maiscore/sum/all

匿名. 全站成绩总和榜: 汇总每位玩家保存的最佳成绩 (每位玩家每个 level hash 一条, DX/Classic 达成率分别取历史最高). 不按谱面关联, level hash 只属于已删除谱面的成绩也计入.

| Query | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 0 | 从 0 开始, 要求 ≥0 |
| `pageSize` | int | 30 | 验证要求 ≥1 |

**响应**: `200` —— [响应模型](#statisticsandrating) —— 按每位玩家累计 DX 达成率倒序. 服务端缓存完整榜单 10 分钟, `geneTime` 为快照生成时间. 省略 `page` 或显式传 `page=0` 均返回第一页. 负页码或小于 1 的 `pageSize` 返回 `400`

_示例_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": [
    {
      "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
      "username": "player",
      "acc": { "dx": 15320.5, "classic": 15480.2 },
      "player": {
        "id": "66f1a2b3c4d5e6f7a8b9c0d1",
        "username": "player",
        "nickname": "Player",
        "avatarId": "default"
      }
    }
  ]
}
```

### GET /api/maiscore/sum/chart/by-uploader/{uploader}

匿名. Path: `uploader` 为上传者用户名. 只汇总该上传者全部谱面上的成绩, 每条成绩只计一次. 此接口不会计算缺失的 level hash. Query、排序、缓存同 `sum/all`.

不存在的上传者或无人游玩时返回空 `players`, 不返回 `404`.

**响应**: `200` —— [响应模型](#statisticsandrating)

_示例_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": [
    {
      "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
      "username": "player",
      "acc": { "dx": 1024.5, "classic": 1030.2 },
      "player": null
    }
  ]
}
```

### GET /api/maiscore/sum/chart/by-id/{chartId}

匿名. Path: `chartId: Guid`. 只汇总该谱面 (全部难度) 上的成绩. 谱面已删除时仍按其已存储的 level hash 汇总; 完全未知的谱面返回 `200` 空 `players`.

**响应**: `200` —— [响应模型](#statisticsandrating)

_示例_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": [
    {
      "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
      "username": "player",
      "acc": { "dx": 1024.5, "classic": 1030.2 },
      "player": null
    }
  ]
}
```

### GET /api/maiscore/sum/chart/by-hash/{hash}

匿名. Path: `hash` 为谱面 MD5 Base64. 先按 Hash 找谱面, 再按与 by-id 相同的规则汇总. 没有谱面使用该 Hash 时返回 `200` 空 `players`.

::: warning Hash 编码
Hash 中的 `/` **必须**编码为 `%2F`, 否则路由不匹配并返回 `404`; `+`、`=` 可原样传递, 也可编码为 `%2B`、`%3D`. 建议对整个 Hash 做 URL 编码.
:::

**响应**: `200` —— [响应模型](#statisticsandrating)

_示例_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": []
}
```

### GET /api/maiscore/sum/user/by-id/{userId}

匿名. Path: `userId: ObjectId`.

**响应**: `200` —— [响应模型](#statisticsandrating) —— 为该玩家全部最佳成绩的累计达成率, `player` 为该玩家的公开资料; 没有成绩的玩家返回零值. 用户不存在返回 `404 Status`; `userId` 不是合法 ObjectId 返回 `400` ProblemDetails

_示例_:

```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "acc": { "dx": 15320.5, "classic": 15480.2 },
  "player": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "username": "player",
    "nickname": "Player",
    "avatarId": "default"
  }
}
```

### GET /api/maiscore/sum/user/by-username/{username}

匿名. Path: `username: string`. 返回与错误同 by-id.

**响应**: `200` —— [响应模型](#statisticsandrating)

_示例_:

```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "acc": { "dx": 0, "classic": 0 },
  "player": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "username": "player",
    "nickname": "Player",
    "avatarId": "default"
  }
}
```

### GET /api/maiscore/rating/by-username/{username}

匿名. Path: `username: string`. 返回该玩家的 rating 雷达. 分两步计算: 先对每条成绩算出 `定数 × 达成率 / 101`, 按这个评分取最高的 50 条, 且 50 条的 level hash 互不重复; 再把这 50 个难度的雷达特征各自乘以该成绩的达成率除以 101, 逐项取平均.

参与计算的条件: 谱面的赞数必须大于 5; 难度序号不能是 6 (宴谱); 难度文本必须是纯数字或数字加号 (如 `13`、`14+`); 成绩的 DX 达成率不能低于 97.

**响应**: `200` —— [响应模型](#statisticsandrating) —— `featureOrder` 固定为 `note`、`peak`、`sweep`、`slide_tricky`、`slide_sequence`、`jack`、`fitted_constant`; `feature` 为各特征的平均值; `charts` 为实际参与平均的谱面 ID 列表; `best` 为同一批"谱面 + 难度"的明细 (按达成率降序), 供前端直接渲染 Best 50. 没有可用成绩时 `feature` 为 `{}`、`charts` 为 `[]`. 用户不存在返回 `404 Status`

```json
{
  "featureOrder": ["note", "peak", "sweep", "slide_tricky", "slide_sequence", "jack", "fitted_constant"],
  "feature": { "note": 117.2, "peak": 95.7, "sweep": 83.4, "slide_tricky": 149.8, "slide_sequence": 101.9, "jack": 60.9, "fitted_constant": 13.66 },
  "charts": ["6f1c0a4e-1f0e-4c11-9c55-8a3f0d0f2a11"],
  "best": [{ "chartId": "6f1c0a4e-1f0e-4c11-9c55-8a3f0d0f2a11", "level": 4, "acc": 100.5123 }],
  "scoreCount": 50,
  "chartCount": 47
}
```

### GET /api/maiscore/history/heatmap

匿名. Query: `userId: ObjectId` (目标用户 ID)、`days?: int = 365`, days 范围 1–3650.

**响应**: `200` —— [响应模型](#playheatmap) —— `{ total: int64, daily: [{ date: "YYYY-MM-DD", count: int }] }`. `total` 是该用户**全部历史**计数, 不受 days 限制; daily 仅包含时间窗口内有记录的日期, 按日期升序, 不自动补零

时间窗口起点为服务器**本地时间**当前时刻减去 days 天, daily 则按游玩时间的 **UTC 日期**分组, 服务器不在 UTC 时区时首个日期的计数可能不完整.

days 超出范围或不是整数、userId 不是 24 位十六进制 ObjectId 时返回 `400` ProblemDetails.

## 推荐

推荐接口分为单曲相似推荐与个人 feed 两条路径, 并按 Reddit 式模型记录曝光与转化.

_示例_:

```json
{
  "total": 128,
  "daily": [
    { "date": "2026-11-17", "count": 5 },
    { "date": "2026-11-18", "count": 2 }
  ]
}
```

### GET /api/recommend/song

匿名可调用. Query: `hash: string` 必填, 为源谱面的 Hash (区分大小写); `limit: int` 默认 20, 范围 1–50.

登录时额外排除当前用户全部游玩、点赞和点踩过的谱面; 匿名时不做个人过滤. 响应设置 `Cache-Control: no-store`.

**响应**: `200` —— [响应模型](#onlinemaichart) —— 按相似度分数降序; 同分按谱面 ID 升序. 源谱面不存在返回 `404 Status`; Hash 缺失、空白或 limit 越界返回 `400`. 旧 `chartId` 参数不再支持, 调用方需改传 `hash`. 源谱面存在但没有可用近邻时返回 `200 []`

_示例_:

```json
[
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "title": "Example",
    "artist": "Artist",
    "designer": "Designer",
    "description": "",
    "levels": ["", "", "", "", "14+", "", ""],
    "uploader": "uploader",
    "timestamp": "2026-10-06T00:00:00Z",
    "hash": "naksqJTTV0fMM//FRcdO0g==",
    "tags": [],
    "publicTags": []
  }
]
```

### GET /api/recommend/feed

鉴权: 登录. Query: `userId?: ObjectId 字符串`, 省略时使用当前用户; `page: int` 默认 0, 范围 0–100; `pageSize: int` 默认 30, 范围 1–100; `source?: "feed" | "play-feed"`, 默认 `feed` (网页), MajdataPlay 选曲界面传 `play-feed`.

`source` 只决定本次下发记录的来源, 网页和 Play 读同一份快照、得到相同的顺序. 指定其他用户返回 `403 Status`; 非法参数返回 `400`; 未登录返回 `401`.

分页约定与谱面列表一致: 页码从 0 开始, 不返回总数, 返回条数少于 `pageSize` 即为最后一页.

**快照**: 所有页 (包括 `page=0`) 都复用当前有效快照, 不重新排序, 因此有效期内新的游玩、投票或模型更新不会让条目在页之间移动. 快照不存在或已过期时静默重建. 快照有效期 1 小时, 至多保存 150 个谱面.

**feed 构造**: 相似谱面流以用户的点赞与最近游玩为种子, 读取近邻后按相似度排序; 随机探索流按 **3:1** 混合新谱与热门. 两路按 **6:4** 交错混合, 所有池均排除用户全部游玩、点赞及点踩记录. 没有种子或没有模型近邻时仍可通过探索冷启动.

**响应**: `200` —— [响应模型](#onlinemaichart) —— 每个元素是完整的对外谱面对象, 响应不包含推荐分数或额外的包装字段. 空结果为 `[]`

_示例_:

```json
[
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "title": "Example",
    "artist": "Artist",
    "designer": "Designer",
    "description": "",
    "levels": ["", "", "", "", "14+", "", ""],
    "uploader": "uploader",
    "timestamp": "2026-10-06T00:00:00Z",
    "hash": "naksqJTTV0fMM//FRcdO0g==",
    "tags": [],
    "publicTags": []
  }
]
```

### POST /api/recommend/impressions

鉴权: 登录. Body (JSON): `{ "source": "feed" | "play-feed" | "related", "chartHashes": string[] }`. `source` 必须与下发接口对应: `feed`、`play-feed` 对应 `/api/recommend/feed` 的同名 `source`, `related` 对应 `/api/recommend/song`. `chartHashes` 为 1–100 个谱面 Hash.

网页在谱面卡片进入视口后批量上报; MajdataPlay 在谱面停在选曲列表中央或被开始游玩后上报. 两边的曝光判定不同, 因此分开记录来源, 统计时不要混算.

非法 `source`、`chartHashes` 为空或超过 100 个返回 `400 Status`; 未登录返回 `401`. 空字符串或长度超过 128 的 Hash 静默忽略. 曝光时间取服务端时间, 合法请求一律返回 `204`.

**响应**: `204` —— 空响应体 (`204`)

## 活动

活动是网站首页与活动页展示的比赛、企划和赛季. 读取匿名可用; 创建、替换、删除要求用户组 `eventManager`.

`{eventId}` 为活动 ID, 区分大小写.

### GET /api/event

匿名.

| Query | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 无 | 只返回该类型: `outerLink`、`eventTag`、`space`、`season` |
| `category` | int | 无 | 只返回该类别 |
| `status` | string[] | 无 | 只返回处于任一所列状态的活动, 可重复: `upcoming`、`ongoing`、`ended` |

`type`、`status` 不区分大小写. 成功: `200 OnlineEvent[]`, 按开始时间倒序, 开始时间相同时按 ID 升序. 参数取值无效: `400 Status`.

**响应**: `200` —— [响应模型](#onlineevent)

_示例_:

```json
[
  {
    "id": "mmfc14",
    "type": "outerLink",
    "asset": "https://example.com/mmfc14",
    "src": "/events/mmfc14.jpg",
    "alt": "MMFC14",
    "title": "MMFC14",
    "category": 2,
    "createDate": "2026-09-13T16:00:00Z",
    "endDate": "2027-01-15T15:59:59Z",
    "description": "Major contest"
  }
]
```

### GET /api/event/{eventId}

匿名. 成功: `200 OnlineEvent`; 不存在: `404 Status`.

**响应**: `200` —— [响应模型](#onlineevent)

_示例_:

```json
{
  "id": "mmfc14",
  "type": "outerLink",
  "asset": "https://example.com/mmfc14",
  "src": "/events/mmfc14.jpg",
  "alt": "MMFC14",
  "title": "MMFC14",
  "category": 2,
  "createDate": "2026-09-13T16:00:00Z",
  "endDate": "2027-01-15T15:59:59Z",
  "description": "Major contest"
}
```

### POST /api/event

鉴权: 用户组 `eventManager`. JSON:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 创建时是 | 1–64 个 ASCII 字母、数字、`.`、`_`、`-`, 以字母或数字开头; 用作活动链接, 创建后不能修改 |
| `type` | string | 是 | `outerLink`、`eventTag`、`space`、`season` |
| `asset` | string | 是 | 跳转目标: `outerLink` 为完整 URL; `season` 为谱单 ObjectId; 其他类型为原始 ID 或标签 |
| `src` | string | 是 | 横幅图片地址 |
| `alt` | string | 是 | 图片替代文本 |
| `title` | string | 是 | 标题 |
| `category` | int | 是 | `1` 高校、`2` 大型赛事、`3` 个人企划、`4` 个人比赛、`5` 赛季 |
| `createDate` | string | 是 | 开始时间, ISO 8601, 必须带秒和时区 |
| `endDate` | string | 是 | 结束时间, 格式同上, 必须晚于 `createDate` |
| `description` | string | 是 | 描述 |

除 `id` 外的字符串不能为空或全为空白. 时间按所带时区换算为 UTC 存储, 响应中以 `Z` 结尾返回. 纯日期 (如 `2026-10-24`) 会被拒绝, 需补全时间和时区.

**响应**: `201` —— [响应模型](#onlineevent) —— `Location` 为该活动的地址. 字段无效: `400 Status`; 请求体不是合法 JSON: `400 Status`; 无请求体: `400 Status` (40001); ID 已存在: `409 Status` (40900)

_示例_:

```json
{
  "id": "mmfc14",
  "type": "outerLink",
  "asset": "https://example.com/mmfc14",
  "src": "/events/mmfc14.jpg",
  "alt": "MMFC14",
  "title": "MMFC14",
  "category": 2,
  "createDate": "2026-09-13T16:00:00Z",
  "endDate": "2027-01-15T15:59:59Z",
  "description": "Major contest"
}
```

### PUT /api/event/{eventId}

鉴权: 用户组 `eventManager`. JSON 与 POST 相同, 替换除 ID 外的全部字段; `id` 可省略, 提供时必须与路由一致.

**响应**: `200` —— [响应模型](#onlineevent) —— 无效: `400 Status`; 不存在: `404 Status`

_示例_:

```json
{
  "id": "mmfc14",
  "type": "outerLink",
  "asset": "https://example.com/mmfc14",
  "src": "/events/mmfc14.jpg",
  "alt": "MMFC14",
  "title": "MMFC14 (updated)",
  "category": 2,
  "createDate": "2026-09-13T16:00:00Z",
  "endDate": "2027-01-15T15:59:59Z",
  "description": "Major contest"
}
```

### DELETE /api/event/{eventId}

鉴权: 用户组 `eventManager`. 无请求体. 成功: `200 Status`; 不存在: `404 Status`.

**响应**: `200` —— [响应模型](#status)

_示例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## 管理与用户组

以下接口要求用户组 `administrator`. `{group}` 为用户组名称 (`administrator`、`eventManager`, 大小写不敏感), 未知名称返回 `400 Status`; `{username}` 为账号用户名, 不存在返回 `404 Status`.

### GET /api/admin/groups

**响应**: `200` —— 所有用户组名称, 按数值排序: `["administrator","eventManager"]`

_示例_:

```json
["administrator", "eventManager"]
```

### GET /api/admin/groups/{group}/members

**响应**: `200` —— [响应模型](#onlineusergroups) —— 直接属于该组的账号, 按用户名排序. 未加入该组的管理员不会列出, 尽管他们能通过该组的要求

_示例_:

```json
[
  {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "username": "player",
    "groups": ["eventManager"]
  }
]
```

### GET /api/admin/users/{username}/groups

**响应**: `200` —— [响应模型](#onlineusergroups) —— 用户组功能上线前创建的账号 `groups` 为空数组

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

### PUT /api/admin/users/{username}/groups/{group}

把账号加入用户组, 无请求体; 已在组内时不变. 成功: `200 OnlineUserGroups`.

**响应**: `200` —— [响应模型](#onlineusergroups)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator", "eventManager"]
}
```

### DELETE /api/admin/users/{username}/groups/{group}

把账号移出用户组, 无请求体; 不在组内时不变. 成功: `200 OnlineUserGroups`. 管理员不能把自己移出 `administrator` 组, 否则返回 `409 Status`.

**响应**: `200` —— [响应模型](#onlineusergroups)

_示例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

## 连通性

### GET /api/Ping

匿名. 无参数. 成功: `200 {"code":114514,"message":"Pong"}`. 禁止存储缓存.

**响应**: `200` —— [响应模型](#status)

_示例_:

```json
{
  "code": 114514,
  "message": "Pong"
}
```

### GET /api/info

匿名. 无参数. 成功: `200 {"id":"...","name":"..."}`, 返回本服务器实例的标识与显示名称; 未配置时为空字符串.

**响应**: `200` —— [响应模型](#serverinfo)

_示例_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

## 已废弃但仍可用

::: warning 不要再用于新代码
以下路由已被新接口取代, 仅为尚未迁移的客户端保留, **新代码不要再调用**, 客户端迁移完成后将删除. 弃用日期: 2026-10-21.

这些路由的每个响应 (包括跳转与原地兼容的错误响应) 都带 `Deprecation: @1792540800` (RFC 9745, 即 2026-10-21T00:00:00Z) 和 `Link: <替代接口的相对地址>; rel="successor-version"`. Swagger 中这些操作标记为 deprecated.
:::

| 已废弃路由 | 替代接口 | 兼容方式 |
| --- | --- | --- |
| ~~`GET /api/account/info`~~ | `GET /api/account/profile` | `301` 跳转, 丢弃 Query |
| ~~`GET /api/maichart/{chartId}/score`~~ | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` | `301` 跳转 |
| ~~`GET /api/stats/score-sums`~~ | 无 `uploader` 或为空: `GET /api/maiscore/sum/all`; 有 `uploader`: `GET /api/maiscore/sum/chart/by-uploader/{uploader}` | `301` 跳转; `uploader` 移入路径并转义, 其余 Query 原样保留 |
| ~~`GET /api/playhistory/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` 跳转, Query 原样保留 |
| ~~`GET /api/maiscore/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` 跳转, Query 原样保留 |
| ~~`POST /api/playhistory/ranking`~~ | `POST /api/maiscore/leaderboard/period` | 原地兼容: 仍接收 `songhashes`, 服务端换成谱面 ID 后执行替代接口; 空 `songhashes` 仍为 `400` (40001) |
| ~~`GET /api/utils/ping`~~ | `GET /api/Ping` | 原地兼容: 返回 `200 {"code":114514,"message":"Pong"}`, 禁止存储缓存 |

迁移要点:

- **跳转不校验参数**: GET 旧路由只改写地址, `page`、`pageSize`、`userId` 等参数由替代接口校验, 因此参数错误表现为先 `301` 再 `400`. 例外: `GET /api/maichart/{chartId}/score` 的 `chartId` 不是合法 Guid 时仍直接返回 `400`.
- **`/api/account/info` 的差异**: 旧接口不接收参数, 跳转时丢弃全部 Query, 避免 `username` 被转发后返回他人资料. 替代接口在会话缺少 `R_USER_PROFILE` 时返回 `200`, `email` 为 `null`; 旧接口返回 `403`.
- **Location 是相对引用**: 例如 `GET /api/stats/score-sums?page=1` 返回 `Location: ../../api/maiscore/sum/all?page=1`, 按请求地址解析, 经过会剥离路径前缀的反向代理后仍指向新地址. 浏览器与 .NET `HttpClient` 默认自动跟随, curl 需加 `-L`.
- **POST 不跳转**: 多数客户端跟随 `301`/`302` 时会把 POST 改为 GET 并丢弃请求体, 所以 `POST /api/playhistory/ranking` 由服务端原地处理.
- **`301` 可能被客户端永久缓存**, 建议尽早完成迁移.

## 已完全移除

::: danger 调用只会失败
以下路由已从服务移除, 仅为排查旧客户端残留调用保留说明. 继续调用只会得到 `404` 或 `405`, 不会重定向, 也不会带弃用响应头.
:::

| 已移除路由 | 替代接口或说明 |
| --- | --- |
| ~~`GET /api/maichart/get`~~ | `GET /api/maichart/list` |
| ~~`GET /api/account/verify`~~ | 待激活账号改用 `POST /api/account/Login` 的邮箱验证码流程 |
| ~~`GET /api/account/intro`~~ | `GET /api/account/profile` |
| ~~`POST /api/account/intro`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/Icon`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/forget`~~ | `POST /api/account/password-reset/request` |
| ~~`PUT /api/account/forget`~~ | `POST /api/account/password-reset/confirm` |
| ~~`GET /api/persist/app/{appId}/{category}`~~ | 旧持久化路由, 无兼容替代; 游戏设置使用 `GET /api/account/gamesetting` |
| ~~`GET /api/persist/app/1096/{category}`~~ | 旧 MajdataPlay 设置读取路由, 改用 `GET /api/account/gamesetting` |
| ~~`POST /api/persist/app/1096/settings`~~ | 旧 MajdataPlay 设置写入路由, 改用 `POST /api/account/gamesetting` |
| ~~`POST /api/maichart/{chartId}/tags`~~ | `PUT` 或 `PATCH /api/maichart/{chartId}/tags` |
| ~~`POST /api/maichart/{chartId}/publictags`~~ | `PUT` 或 `PATCH /api/maichart/{chartId}/publictags` |
| ~~`POST /api/collection/{collectionId}/diff`~~ | 先读 `GET /api/collection/{collectionId}/songlist`, 再用 `PUT /api/collection/{collectionId}/modify` 提交完整 `items` |
| ~~`POST /api/collection/{collectionId}/modify`~~ | `PUT /api/collection/{collectionId}/modify` |

## 响应模型

本节列出接口返回的 JSON 对象. 字段名即 JSON 属性名 (camelCase). 类型列中:

- `?` 后缀表示该字段可能为 `null`; 标记为"省略"的字段在该值为 `null` 时不会出现在响应里.
- 数组可能为空数组, 不会是 `null` (除非另有说明).
- `ObjectId` / `Guid` / `datetime` 均为字符串形式, 分别是 24 位十六进制、UUID、ISO 8601.
- 不同接口返回的资料模型并不完全相同, 下表按模型逐一说明.

::: tip 按用途查找
不确定某个接口返回什么模型时, 先看该接口小节里的"成功"一行; 再回到本节按模型名查阅字段. 标为<i>匿名对象</i>的模型没有对应的 C# 类型, 是控制器内联构造的.
:::

### 用户与会话

#### UserProfile

`GET/POST /api/account/profile`、注册响应、扫码 check 的 `userInfo`, 以及谱面排行榜的 `player` 都是这个模型.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 用户 ID |
| `username` | string | 用户名 |
| `nickname` | string | 昵称 |
| `introduction` | string? | 简介 |
| `email` | string? | 邮箱; 按接口与权限隐藏时为 `null` |
| `avatarId` | string | 头像标识; 未上传头像时为空字符串或 `default`, 视调用方而定 |
| `joinDate` | datetime | 注册时间 |

::: warning 已知差异
`NetUser.GetProfile()` 不填充 `id` 与 `avatarId`, 因此**注册响应**与**扫码 check 的 `userInfo`** 中 `id` 为全零 ObjectId、`avatarId` 为空字符串, 不能用作真实用户标识. 谱面排行榜的 `player` 由服务端另行填充了 `id` 与 `avatarId`, 但邮箱恒为 `null`.
:::

#### OnlineUserBrief

精简公开资料, 用于一次列出多个用户 (排行榜、评论作者). 只含显示昵称和头像所需的最小字段.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 用户 ID |
| `username` | string | 用户名; 个人页链接与 API 查询使用 |
| `nickname` | string | 昵称; 未设置时为空字符串 |
| `avatarId` | string | 头像标识, 可直接用于 `GET /api/avatar/{avatarId}`; 未上传头像时为 `default` |

用于 `OnlinePlayerScoreSum.player`、`PlayHistoryRankingEntry.player` 与 `OnlineComment.authorProfile`.

#### SessionInfo

<i>匿名对象</i>: `GET /api/account/session` 与 `GET /api/account/sessions` 直接返回控制器内联构造的对象, 没有对应的 C# 模型.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 会话 ID, **不是** token |
| `permissions` | uint64 | 权限位掩码 |
| `geneTime` | datetime | 创建时间 |
| `expiredTime` | datetime | 到期时间 |
| `lastActiveTime` | datetime | 最近活动时间 |
| `remoteIP` | string | 当前记录的 IP |
| `remoteIPHistory` | array | **仅 DEBUG 构建**返回; 发布构建中该字段不存在 |

#### OnlineUserGroups

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 用户 ID |
| `username` | string | 用户名 |
| `groups` | string[] | 直接所属的用户组名称, 按数值排序 (`administrator`、`eventManager`) |

::: info
未加入任何组的账号返回空数组. `administrator` 组通过所有用户组要求, 但"属于某组"仍以该数组为准; 未显式加入的管理员不会出现在 `GET /api/admin/groups/{group}/members` 中.
:::

### 谱面

#### OnlineMaiChart

对外的谱面对象, 用于谱面列表、推荐、收藏等接口.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Guid | 谱面 ID |
| `title` | string | 标题 |
| `artist` | string | 艺术家 |
| `designer` | string | 谱师 |
| `description` | string | 描述 |
| `levels` | string[] | 难度文本数组; 上传时为 7 项, 缺少的难度可能为空字符串 |
| `uploader` | string | 上传者用户名 |
| `timestamp` | datetime | 上传时间 |
| `hash` | string | `maidata.txt` 的 MD5 Base64 |
| `tags` | string[] | 标签 |
| `publicTags` | string[] | 公共标签 |

#### MaiChart

数据库中的完整谱面记录. 与 `OnlineMaiChart` 的区别是**多一个 `uploaderID`**, 没有其他字段差异.

用于 `GET /api/maichart/{chartId}/summary`、`GET /api/maichart/{chartId}/info` 的 `metadata`, 以及 `sort=scorep` 的列表结果.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| 上表全部字段 | | 同 `OnlineMaiChart` |
| `uploaderID` | ObjectId | 上传者用户 ID |

#### OnlineChartInfo

`GET /api/maichart/{chartId}/info` 与 `POST /api/maichart/info` 的响应.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `metadata` | MaiChart | 谱面元信息, 与 `summary` 相同 |
| `resources` | OnlineChartResources | 各资源文件信息; 未存储的为 `null` |
| `levelHashes` | (string?)[] | 固定 7 项, 下标为难度序号; 该难度没有 inote 文本时为 `null` |

#### OnlineChartResources

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `maidata` | OnlineChartResource? | `maidata.txt` |
| `track` | OnlineChartResource? | `track.mp3` |
| `video` | OnlineChartResource? | `bg.mp4` |
| `coverArt` | OnlineChartResource? | 封面原图 (优先 `bg.jpg`, 其次 `bg.png`) |
| `thumbnail` | OnlineChartResource? | 256×256 压缩图 `bg-compress.jpg` |

#### OnlineChartResource

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `url` | string | 公共桶直链 |
| `md5` | string | 文件 MD5, 小写十六进制 |
| `sha256` | string | 文件 SHA-256, 小写十六进制 |
| `length` | int64 | 文件字节数 |

::: warning 三种哈希格式不要混用
这里的 `md5`/`sha256` 是**小写十六进制**; 文件下载响应头 `hash` 是 **SHA-256 的 Base64**; 谱面对象的 `hash` 字段是 **MD5 的 Base64**. 三者格式与用途都不同.
:::

#### OnlineChartRadar

`GET /api/maichart/{chartId}/radar` 的响应.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `featureOrder` | string[] | 特征名顺序, 固定 7 项 |
| `feature` | object | 特征名到数值的映射; 前六项为 0–250 刻度, `fitted_constant` 为定数量纲 |

#### ChartChanges

`GET /api/maichart/changes` 的响应与其中每一项.

| 模型 | 字段 |
| --- | --- |
| `OnlineMaiChartChanges` | `to: datetime` (本次实际使用的范围终点)、`isComplete: bool`、`changes: OnlineMaiChartChange[]` |
| `OnlineMaiChartChange` | `chartId: Guid`、`kind: int` (0 新增 / 1 修改 / 2 删除)、`changedAt: datetime`、`resources: object?` (键名同 `OnlineChartResources`, 值为变更后的资源或 `null`)、`metadata: OnlineMaiChartMetadataChange?` |
| `OnlineMaiChartMetadataChange` | `tags?: string[]`、`publicTags?: string[]`; 二者都是省略语义, 未变更的字段不出现 |

### 互动

#### ChartInteractSummary

`GET /api/maichart/{chartId}/interactsum` 与 `POST /api/maichart/interactsum` 的响应.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `chartId` | Guid | 谱面 ID |
| `plays` | int | 下载/游玩计数 |
| `score` | int | 赞减踩 |
| `upvotes` | int | 赞数 |
| `downvotes` | int | 踩数 |
| `comments` | int | 存活评论数, 含回复 |
| `myVote` | int | 当前用户对该谱面的票: `1`、`-1`; 未投或未登录为 `0` |

没有互动记录时各项为 0.

#### OnlineVoteResult

`PUT /api/maichart/{chartId}/vote` 与 `PUT /api/comment/{commentId}/vote` 共用.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `score` | int | 投票后的赞减踩 |
| `upvotes` | int? | **仅谱面投票返回**; 评论投票时该字段不存在 |
| `downvotes` | int? | **仅谱面投票返回**; 评论投票时该字段不存在 |
| `myVote` | int | 本次存入的票: `1`、`-1` 或 `0` |

::: info
`upvotes`/`downvotes` 用的是 `WhenWritingNull` 省略策略, 所以评论投票的响应里根本没有这两个键, 而不是值为 `null`. 反序列化时请按可选字段处理.
:::

#### OnlineComment

单条评论或回复.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 评论 ID |
| `chartId` | Guid? | 所在谱面; 迁移前谱面就已删除的旧评论为 `null` |
| `chartHash` | string | 所在谱面**当前**的 Hash; 谱面已删除时为空字符串 |
| `chartTitle` | string? | 仅跨谱面列表返回 (`GET /api/comment/{commentId}`、`GET /api/account/comments`); 其他接口与谱面已删除时**省略** |
| `parentId` | ObjectId? | 父评论; 顶层评论为 `null` |
| `depth` | int | 到顶层评论的层数; 顶层为 `0` |
| `authorId` | ObjectId? | 作者; 占位符为 `null` |
| `author` | string | 作者用户名; 占位符或账号已不存在时为空字符串 |
| `authorProfile` | OnlineUserBrief? | 作者公开资料; 占位符或账号已不存在时为 `null` |
| `body` | string | 正文; 占位符为空字符串 |
| `createdAt` | datetime | 发表时间 |
| `editedAt` | datetime? | 最近一次编辑正文的时间; 未编辑为 `null` |
| `deleted` | bool | 作者已删除 |
| `removed` | bool | 管理员已移除 |
| `score` | int | 赞减踩 |
| `myVote` | int | 当前用户的票: `1`、`-1`; 未投或未登录为 `0` |
| `replyCount` | int | 直接回复数, 含占位符 |
| `replies` | OnlineComment[] | 已加载的回复, 按请求的排序; 平铺列表与写接口的响应中为空数组 |

#### CommentPages

| 模型 | 字段 |
| --- | --- |
| `OnlineCommentPage` | `items: OnlineComment[]` (顶层评论, 回复嵌套在 `replies`)、`total: int` (顶层评论数, 含占位符)、`commentCount: int` (**已废弃**)、`page: int`、`pageSize: int` (恒为 20)、`sort: string` |
| `OnlineCommentThread` | `item: OnlineComment` (带全部下级回复)、`sort: string` |
| `OnlineCommentList` | `items: OnlineComment[]` (平铺, 不带 `replies`)、`total: int`、`page: int`、`pageSize: int` (恒为 20) |
| `OnlineCommentDeletion` | `ok: bool` (恒为 `true`)、`purged: bool` (`true` 为物理删除, `false` 为变为占位符或原本就是占位符) |

::: warning 已废弃字段
`OnlineCommentPage.commentCount` 标记为 `[Obsolete]`, Swagger 中为 deprecated, 且在响应中始终为默认值 `0`. 请改用 `GET /api/maichart/{chartId}/interactsum` 的 `comments`.
:::

#### GameClientInteraction

`ChartInteractFull` 与 `ChartCommentSummary` **仅供** `GET /api/maichart/{chartId}/interact` 使用, 字段名与已发布客户端的 `MajNetSongInteract` 绑定, **不能更改**.

| ChartInteractFull 字段 | 类型 | 说明 |
| --- | --- | --- |
| `isLiked` | bool | 当前用户是否投了赞 |
| `isDisLiked` | bool | 当前用户是否投了踩 |
| `plays` | int | 下载/游玩计数 |
| `likes` | string[] | 投赞用户的用户名 |
| `disLikeCount` | int | 踩数 |
| `comments` | ChartCommentSummary[] | 存活评论树, 按发表顺序 |

| ChartCommentSummary 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 评论 ID |
| `sender` | string | 作者用户名; 账号已不存在时为空字符串 |
| `content` | string | 正文 |
| `timestamp` | datetime | 发表时间 |
| `replies` | ChartCommentSummary[] | 子回复 |

::: info
本模型**不含票数**, 占位符及其下的回复都不出现. 需要票数请用 `interactsum`.
:::

### 成绩与统计

#### OnlineMaiScore

自带谱面信息的成绩对象, 用于 `GET /api/account/scores` 与 Rating 的 `best`.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `acc` | OnlineAccurate | `{ dx, classic }`, 百分数数值 |
| `dxScore` | int64 | DX 分数 |
| `comboState` | int | `0` None / `1` FC / `2` FCPlus / `3` AP / `4` APPlus |
| `chartLevel` | int | 难度序号 0–6 |
| `hash` | string | 所选谱面的 MD5 Base64 |
| `levelHash` | string | 成绩本身的 level hash |
| `chartInfo` | OnlineMaiChart | 所选谱面 |
| `timestamp` | datetime | 最近一次提交时间 |

::: info
`hash` 与 `chartLevel` 描述的是**为该成绩选中的谱面与难度**, 不是成绩自身的字段; 成绩只记 `levelHash`. 关联规则见 `GET /api/account/scores`.
:::

#### OnlineAccurate

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dx` | number | DX 达成率 |
| `classic` | number | Classic 达成率 |

#### Leaderboards

| 模型 | 字段 |
| --- | --- |
| `ChartScoreSummary` | `hash: string`、`levelHashes: (string?)[]` (固定 7 项)、`scores: ScoreSummary[][]` (固定 **8** 项, `scores[level]` 为 0–6 难度的榜单, 末项恒为空数组) |
| `LevelScoreSummary` | `levelHash: string`、`scores: ScoreSummary[]` |
| `ScoreSummary` | `player: UserProfile` (`id` 与 `avatarId` 已填充, `email` 恒为 `null`)、`acc: number` (DX 达成率, float)、`comboState: int`、`timestamp: datetime` |

#### PlayerScoreSummary

`GET /api/account/recent` 的元素.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 谱面标题 |
| `artist` | string | 艺术家 |
| `designer` | string | 谱师 |
| `uploader` | string | 上传者用户名 |
| `chartId` | string | 谱面 ID |
| `difficulty` | string | 难度文本 |
| `level` | int | 难度序号 |
| `acc` | number | DX 达成率 |
| `comboState` | int | ComboState |
| `timestamp` | datetime | 游玩时间 |

#### StatisticsAndRating

| 模型 | 字段 |
| --- | --- |
| `PlayHistoryRankingEntry` | `playerId: string`、`username: string`、`totalDXScore: int64`、`totalAccDX: number`、`totalAccClassic: number`、`player: OnlineUserBrief?` (账号已不存在时为 `null`) |
| `OnlineScoreSum` | `geneTime: datetime`、`players: OnlinePlayerScoreSum[]` |
| `OnlinePlayerScoreSum` | `userId: ObjectId`、`username: string`、`acc: OnlineAccurate`、`player: OnlineUserBrief?` |
| `OnlinePlayerRating` | `featureOrder: string[]`、`feature: object`、`charts: Guid[]`、`best: OnlineMaiScore[]`、`scoreCount: int`、`chartCount: int` |

::: warning `best` 的类型
`OnlinePlayerRating.best` 是 **`OnlineMaiScore[]`**, 与其他成绩接口同构 (带 `chartInfo` 等完整字段), 不是单独的"chartId + level + acc"精简结构.
:::

`OnlinePlayerRating` 各字段含义:

- `featureOrder`: 固定 `note`、`peak`、`sweep`、`slide_tricky`、`slide_sequence`、`jack`、`fitted_constant`.
- `feature`: 各特征加权平均; 无可用成绩时为 `{}`.
- `charts`: 实际参与平均的谱面 ID, 同一谱面的不同难度会出现多次.
- `best`: 参与平均的"谱面 + 难度"明细, 按达成率降序.
- `scoreCount`: 参与的前 50 个"谱面 + 难度"数.
- `chartCount`: 实际参与平均的谱面数; 可小于 `scoreCount`.

#### PlayHeatmap

`GET /api/maiscore/history/heatmap` 的响应.

| 模型 | 字段 |
| --- | --- |
| `PlayHistoryHeatmapResponse` | `total: int64` (全部历史计数)、`daily: DailyCount[]` |
| `DailyCount` | `date: string` (`YYYY-MM-DD`)、`count: int` |

### 谱单与收藏

#### OnlineSongCollection

`GET /api/collection/{collectionId}/songlist`、`POST /api/collection/create` 与 `PUT /api/collection/{collectionId}/modify` 的 `collection`.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 谱单 ID |
| `createdBy` | string | 所有者用户名; 账号已不存在时为 `undefined` |
| `name` | string | 名称 |
| `description` | string | 描述 |
| `visibility` | int | `0` 私有, `1` 公开 |
| `items` | Guid[] | 谱面 ID, 按谱单顺序; 略过已删除的谱面 |
| `count` | int | `items` 的长度 |

#### OnlineDanInfo

供游戏客户端使用的谱单视图.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 谱单 ID |
| `name` | string | 名称 |
| `createdBy` | string | 所有者用户名; 账号已不存在时为 `undefined` |
| `description` | string | 描述 |
| `songHashs` | string[] | 谱面 Hash (**保留原拼写**) |
| `isPlayList` | bool | 是否作为播放列表 |
| `isForceGameover` | bool | 是否强制结算 |

::: warning `songHashs` 无序
该字段类型是 `HashSet<string>`, **不保证顺序**, 也不要假定它等于谱单的 `items` 顺序. 需要顺序请用 `songlist` 的 `items`.
:::

#### PlaylistListItem

<i>匿名对象</i>: `GET /api/collection/list` 的元素, 没有对应的 C# 模型.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | ObjectId | 谱单 ID |
| `name` | string | 名称 |
| `createdBy` | string | 所有者用户名; 账号已不存在时为 `undefined` |
| `description` | string | 描述 |
| `count` | int | 保存的谱面 ID 数量 (含已删除谱面) |

::: info 两种 count
列表项的 `count` 是**保存的 ID 数量**; `OnlineSongCollection.count` 是**当前仍存在的谱面数量**. 删除谱面后两者可能不同.
:::

### 活动

#### OnlineEvent

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 活动 ID, 区分大小写 |
| `type` | string | `outerLink`、`eventTag`、`space`、`season` |
| `asset` | string | 跳转目标 |
| `src` | string | 横幅图片地址 |
| `alt` | string | 图片替代文本 |
| `title` | string | 标题 |
| `category` | int | `1` 高校 / `2` 大型赛事 / `3` 个人企划 / `4` 个人比赛 / `5` 赛季 |
| `createDate` | datetime | 开始时间 (UTC, 以 `Z` 结尾) |
| `endDate` | datetime | 结束时间 (UTC, 以 `Z` 结尾) |
| `description` | string | 描述 |

#### ServerInfo

<i>匿名对象</i>: `GET /api/info` 的响应.

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 服务器实例标识; 未配置时为空字符串 |
| `name` | string | 显示名称; 未配置时为空字符串 |

#### Status

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | int | 业务状态码 |
| `message` | string | 描述 |

_示例_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

#### AnonymousObjects

以下响应由控制器内联构造，**没有对应的 C# 模型**，字段直接写在各接口小节里：

| 接口 | 响应形状 |
| --- | --- |
| `POST \`/api/account/gamesetting\`` | `{ username, userSettingJson }`；`userSettingJson` 是 JSON 文本的 Base64 |
| `GET \`/api/maichart/hash-status\`` | `{ hash, exists, hasHistoricalScores, hasHistoricalInteract, chart }` |
| `POST \`/api/machine/register\`` | `{ id, name, description, place, remoteIP }`；`id` 是机台会话 ID |
| `GET \`/api/machine/info\`` | `{ name, description, place, remoteIP }` |
| `POST \`/api/machine/auth/request\`` | `{ requestId }` |
| `GET \`/api/machine/auth/info\`` | `{ grantee, granteeInfo: { name, description, place, remoteIP } }` |
| `GET \`/api/machine/auth/check\`` | `{ token, userInfo: UserProfile }` |
| `GET \`/api/account/session`、`GET \`/api/account/sessions\`` | 见 [SessionInfo](#sessioninfo) |
| `PUT \`/api/collection/{collectionId}/modify\`` | `{ code, message, collection: OnlineSongCollection }` |
| `GET \`/api/collection/list\`` | 见 [PlaylistListItem](#playlistlistitem) |
| `GET \`/api/info\`` | 见 [ServerInfo](#serverinfo) |
