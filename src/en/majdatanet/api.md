# API

The MajdataNet server provides a REST API used by the MajdataPlay game client and the website frontend.

## Root address

All paths below are relative to the server API root. The client sets the root in `Network.Online.ApiEndpoints[].Url` in `system-settings.json`; the default is `https://majdata.net/api3/api/`.

The official deployment sits behind a reverse proxy that prepends the `/api3` prefix. When self-hosting, use the root that matches your deployment.

## Conventions

### Addresses and encoding

- `Query` means URL query parameters; `Form` means form fields, usually `application/x-www-form-urlencoded`; files use `multipart/form-data`; `JSON` means an `application/json` request body.
- JSON properties use camelCase. Do not copy the casing of C# properties: the exported names include `dx`, `dxScore`, `uploaderID`, `remoteIP`, and `totalAccDX`.
- `Guid` is a UUID string; `ObjectId` is a 24-character hexadecimal string. Chart IDs are Guids; user, session, playlist, and comment IDs are ObjectIds.
- Date and time values use ISO 8601. Prefer sending request times with `Z` or an explicit offset.
- Enumerations are sent as integers. `visibility`: `0` private, `1` public; `comboState`: `0` None, `1` FC, `2` FCPlus, `3` AP, `4` APPlus. Exceptions: the event `type` and user group names are sent as camelCase strings.
- Array query parameters repeat the field name, for example `?tag=original&tag=expert`. Hashes are Base64 strings, so `+`, `/`, and `=` must be encoded when they appear in a URL or form field.
- The chart business `hash` is the **MD5 Base64** of `maidata.txt`; the `hash` response header on file downloads is the **SHA-256 Base64** of the file. The two serve different purposes.
- Scores are stored per difficulty level hash. A level hash is a 64-character lowercase hex digest of that difficulty's inote text, available from `levelHashes` in `GET /api/maichart/{chartId}/info`.

### Sign-in and permissions

The service reads sessions from cookies; Bearer token authentication is not implemented.

| Cookie | Purpose |
| --- | --- |
| `token` | User session; set after a successful sign-in or QR approval |
| `machine-token` | Machine session |
| `machine-id` | Machine identifier returned by registration |

Cookies set by normal sign-in use `Secure`, `HttpOnly`, `SameSite=None`, and `Path=/`. Clients should store and send back cookies; cross-origin browser requests must enable credentials. Sessions are refreshed by valid requests.

Below, "anonymous" means no sign-in is required, and "signed in" means a valid user session is required. When permissions are named, the caller must be signed in and hold all of them. A normal account sign-in grants `FULL_USER_ACCESS`; QR approval grants `GAME_FEATURE_ACCESS`.

| Permission | Value | Use |
| --- | ---: | --- |
| `R_USER_PROFILE` | 1 | Read your own private profile |
| `W_USER_PROFILE` | 2 | Modify your profile |
| `AUTHORIZE` | 16 | Approve machine authorization |
| `COMMIT_CHART_INTERACTION` | 32 | Vote and comment |
| `MANAGE_CHART_LIST` | 64 | Upload and delete your own charts |
| `MANAGE_LOGIN_SESSIONS` | 128 | List and revoke specific sessions |
| `R_USER_MAI_SCORES` | 1024 | Read your own scores |
| `W_USER_MAI_SCORES` | 2048 | Submit scores |
| `R_USER_CHART_COLLECTIONS` | 4096 | Read favorites, and see your own private playlists in lists |
| `W_USER_CHART_COLLECTIONS` | 8192 | Modify playlists and favorites |

#### User groups

Event write and admin endpoints ignore permission bits and instead require the account to be in a specific user group. Groups are stored on the account document and read from the database on every request, so adding or removing a group takes effect on the next request with no need to sign in again; banned or pending accounts never pass. The `administrator` group satisfies every group requirement. Anonymous requests get `401`; requests that do not satisfy the requirement get `403`; neither has a response body.

| User group | Value | Use |
| --- | ---: | --- |
| `administrator` | 1 | Manage the groups of every account, and satisfy every group requirement |
| `eventManager` | 2 | Create, replace, and delete events |

Groups are passed by name in endpoint paths, case-insensitively.

### Responses and errors

There is no uniform success envelope: endpoints may return an object, an array, a string, a file, or an empty response. `200 empty` below means success with no response body, which is not the same as `204`.

The business status object is written `Status` and has the shape `{"code":114514,"message":"ok"}`. **Judge the HTTP status and the business code separately.**

Business codes are defined as follows: `4XXXX` are request errors (the leading three digits mirror the closest HTTP status code), and `6XXXX` are account errors.

| Business code | Meaning |
| ---: | --- |
| 114514 | Success |
| -114514 | Generic error |
| 40000 | Invalid parameter or credential format |
| 40001 | Missing request data |
| 40002 | Too many elements (for example, more than 32 tags) |
| 40400 | No such object |
| 40900 | Object already exists |
| 41000 | Object deleted |
| 41300 | Payload too large |
| 42900 | Too many requests |
| 60000 | Not signed in |
| 60001 | Already signed in |
| 60002 | Permission denied |
| 60003 | Invalid credentials |
| 60004 | Account pending activation |
| 60005 | Account banned |
| 60102 | Invalid email address |
| 60103 | Username already exists |
| 60104 | Email already exists |

General HTTP semantics: `400` invalid parameters, `401` unauthenticated, `403` insufficient permission, `404` no such object, `409` conflict, `413` request too large, `429` too many requests (with `Retry-After`). `401/403` produced by authorization attributes usually has no business object; manual checks may return `Status`. Model binding and validation errors may be ASP.NET Core ProblemDetails, and a few endpoints return a bare number, plain text, or an empty body. Clients must not assume every error carries `code/message`.

## Account and sessions

### POST /api/account/register

Registers an account. Anonymous; a signed-in caller gets `403`.

| Form field | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | string | Yes | 1–24 characters, ASCII letters, digits, `-`, and `_` only |
| `password` | string | Yes | Non-empty credential string; submit the same value when signing in |
| `email` | string | Yes | Must match the email of the verification challenge |
| `nickname` | string | Yes | Nickname |
| `challengeKey` | string | Yes | Key returned by the email challenge endpoint |
| `challengeCode` | int | Yes | 8-digit code from the email |
| `cf-turnstile-response` | string | Yes | Turnstile token |

**Response**: `200` —— [response models](#userprofile) —— the account is created active and is **not signed in automatically**. Failure: `400`, including verification failure (60003), empty password, invalid username (40000), and duplicate username or email (60103/60104)

The server compares the submitted password string directly; this endpoint does not declare a hash algorithm that clients must use.

_Example_:

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

Anonymous.

| Form field | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | string | Yes | Username or email |
| `password` | string | Yes | The credential string used at registration |
| `rememberMe` | bool | No | Defaults to `false`; `true` uses the persistent session lifetime |
| `challengeKey` | string | Pending accounts only | Key returned by the email challenge endpoint |
| `challengeCode` | int | Pending accounts only | Code sent to the account's original email |

**Response**: `200` —— [response models](#status) —— returns `200 Status` with `token` set through `Set-Cookie`; the body does not contain the token. Failure: `401` invalid credentials; `403` already signed in, pending activation without complete email verification, or banned; `400` invalid verification code

_Example_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### POST /api/account/logout

Auth: signed in. Query: `sessionId?: ObjectId`.

- Omitted or empty: revokes the current session, deletes the `token` cookie, and also revokes that machine's authorization when a machine session exists.
- With `sessionId`: revokes the caller's own session with that ID; also requires `MANAGE_LOGIN_SESSIONS`.

**Response**: `200` —— [response models](#status) —— `400` invalid ID, `404` no such session, `403` someone else's session or insufficient permission

_Example_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### GET /api/account/profile

Query: `username?: string`.

With a username the endpoint is anonymous; without one it reads the current user and returns `401` when signed out. Success: `200 UserProfile` (see [response models](#userprofile)); no such user: `404 Status`. The email is returned only to the owner holding `R_USER_PROFILE`; other callers get `email: null`.

**Response**: `200` —— [response models](#userprofile)

_Example_:

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

Auth: `W_USER_PROFILE`. Uses Form; use multipart when sending a file.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `nickname` | string | No | Updated when non-empty |
| `introduction` | string | No | Kept when omitted; pass an empty string to clear it |
| `avatar` | file | No | An image the decoder can read |

Total request size is capped at 6 MiB and the multipart body at 5 MiB. Static avatars are cropped to 512×512 JPEG; animated images are scaled to a 512 longest side and converted to WebP.

**Response**: `200` —— [response models](#userprofile) —— `404` no such user; an explicitly empty nickname returns `400`

_Example_:

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

Auth: signed in. No parameters. Success: `200 SessionInfo`, see [response models](#sessioninfo).

**Response**: `200` —— [response models](#sessioninfo)

_Example_:

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

Auth: `MANAGE_LOGIN_SESSIONS`. Success: `200 SessionInfo[]` with every session of the current user.

**Response**: `200` —— [response models](#sessioninfo)

_Example_:

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

Anonymous. Query: `email: string`, required.

An invalid email format returns `400 Status` (60102). An unregistered email still returns `200` with a random string but sends no mail, so the endpoint does not leak whether an account exists. A registered email gets an 8-digit code valid for 5 minutes, and the response body is the `challengeKey` string.

**Response**: `200` —— (`challengeKey`)

### POST /api/account/password-reset/confirm

Anonymous. Form: `email`, `newPassword`, `challengeCode`, `challengeKey`, all required.

The code must belong to the same email and still be valid; a successful check consumes it once. A wrong, expired, already used, or mismatched code returns `400 Status` (40000). When the account exists, the new password is written, all of the user's sessions and every machine authorization they granted are deleted, and the endpoint returns `200 empty`. There is no additional password complexity check.

**Response**: `200` —— 空响应体

### GET /api/account/recent

Anonymous. Query: `username?: string`, default empty string.

**Response**: `200` —— [response models](#playerscoresummary) —— with the **last 30 days** of plays in reverse chronological order; records of deleted charts are skipped; no pagination. No such user: `404 Status`

_Example_:

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

Auth: `R_USER_MAI_SCORES`.

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `chartId` | Guid[] | No filter | Repeat the parameter name |
| `uploader` | string[] | No filter | Uploader username |
| `tag` | string[] | No filter | Chart tags |
| `publicTag` | string[] | No filter | Public tags |
| `hash` | string[] | No filter | Chart MD5 Base64 |
| `matchMode` | string | `or` | Relation between filter fields; only `and` or `or` |
| `fieldMatchMode` | string | `or` | Relation within one field; only `and` or `or` |

**Response**: `200` —— [response models](#onlinemaiscore) —— `200` with every filter omitted it returns all of the caller's scores that still resolve to a chart. An invalid mode or Guid returns `400 Status`

Scores relate through `levelHash → chart metadata → chart`, and each score appears once. When one level hash belongs to several charts, a representative difficulty is chosen: the earliest uploaded chart, then chart ID, then difficulty index. Scores that resolve to no chart are omitted.

::: info Implementation limit
With `fieldMatchMode=and`, the `uploader`, `hash`, and `chartId` groups must each have **exactly one** value, otherwise the endpoint immediately returns an empty array.
:::

_Example_:

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

Anonymous. Lists a user's live comments, flattened without `replies`, each carrying `chartId`, `chartHash`, and `chartTitle`.

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | string | Yes | Username, case-sensitive |
| `sort` | string | No | Only `new` (default) or `top` |
| `page` | int | No | 1-based, 1–10000, default 1, 20 per page |

**Response**: `200` —— [response models](#commentpages) —— `400 Status` (40000); `404 Status` (40400) no such user

_Example_:

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

Anonymous. Form: `email: string`, required; the address must contain `@` and its domain must have an MX record.

**Response**: `200` —— (`challengeKey`) —— with the `challengeKey` string; an 8-digit code is sent to the address and stays valid for 5 minutes. Invalid email: `400 Status` (60102)

::: info Rate limiting is not active
The endpoint declares a limit of 10 requests per IP per minute, but the current pipeline does not enable the rate limiting middleware, so **do not treat that limit as enforced**.
:::

### GET /api/account/icon

Anonymous. Query: `username: string`, required.

**Response**: `302` —— 无响应体, `Location` 为头像地址 —— with a `Location` pointing at the user's avatar (the default avatar when none was uploaded). An empty username or unknown user returns `404`. The response declares a 1-hour client cache

Published MajdataPlay builds (2.0.5 and earlier) load avatars through this endpoint. Newer clients can request `GET /api/avatar/{avatarId}` with the `avatarId` from a response instead.

### GET /api/avatar/{avatarId}

Anonymous. Path: `avatarId: string`.

**Response**: `302` —— 无响应体, `Location` 为头像地址 —— with a `Location` pointing at the avatar. An unknown ID redirects to the default avatar; use `default` to fetch it directly

## Game settings

### GET /api/account/gamesetting

Auth: signed in. No parameters.

**Response**: `200` —— `text/plain` —— returns the decoded JSON **text string**; `{}` when there is no setting or decoding fails. Under default content negotiation this is usually `text/plain`, not a wrapped object

_Example_:

```json
{
  "volume": 0.8,
  "noteSpeed": 7.5
}
```

### POST /api/account/gamesetting

Auth: signed in. The body is raw UTF-8 JSON, at most 1 MiB. Any valid JSON value is accepted.

**Response**: `200` —— [response models](#anonymousobjects) —— `userSettingJson` is the Base64 of the submitted JSON text. Failure: `400` invalid JSON (40000) or too large (41300)

## Charts and files

Every `{chartId}` below is a Guid.

_Example_:

```json
{
  "username": "player",
  "userSettingJson": "eyJ2b2x1bWUiOjAuOH0="
}
```

### GET /api/maichart/list

Anonymous.

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `sort` | string | No | `hotp` by interaction heat, descending; `topp` by score (upvotes minus downvotes), descending (`likep` is an alias); `commp` by live comment count, descending; `playp` play count; `timep` upload time; `scorep` see below; default and any other value sort by last activity, descending |
| `search` | string | No | Prefix search or case-insensitive regular expression |
| `page` | int | No | 0-based, 30 per page; omitted means no pagination |
| `isRanking` | bool | No | When true and there is no search, restrict to charts uploaded in the last 7 days and return at most 10 |

Search prefixes: `id:` (Guid), `hash:`, `uploader:`, `tag:`, `level:`. Anything else is treated as a regular expression matched against title, artist, designer, uploader, levels, and tags; an invalid `id:` returns an empty array.

**Response**: `200` —— [response models](#onlinemaichart) —— usually `200 OnlineMaiChart[]`. `sort=scorep` is special: it returns at most 10 charts with the most plays in the last 7 days, returns early, and ignores `search/page/isRanking`

_Example_:

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

Auth: signed in. Query: `hash: string`, required.

**Response**: `200` —— [response models](#anonymousobjects) —— blank hash returns `400 Status`

- `exists`: the chart exists.
- `hasHistoricalScores`: the chart exists and at least one of its level hashes has scores.
- `hasHistoricalInteract`: the chart exists and has an interaction record by chart ID (currently the same as whether the chart exists).

_Example_:

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

Anonymous. Lists charts added, changed, or deleted in a time window, so clients can update a cached chart list incrementally.

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | datetime | Yes | Inclusive start, usually the previous response's `to` |
| `to` | datetime | No | Exclusive end; defaults to now, also used when later than now |

**Response**: `200` —— [response models](#chartchanges)

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

- `to`: the window end actually used; pass it as `from` next time.
- `isComplete`: when `false`, **no changes are returned** and the client should fall back to a full refresh with `GET /api/maichart/list`.
- `changes`: ascending by `changedAt`. `kind`: `0` added, `1` changed, `2` deleted.

Added entries give only the chart ID; fetch metadata and resources in bulk with `POST /api/maichart/info`. Change records are kept for 30 days by default, and windows starting before the earliest record cannot be guaranteed complete.

Failure: missing `from`, or `from` later than the window end: `400 Status` (40000); invalid time format: `400`.

### GET /api/maichart/{chartId}/summary

Anonymous. Success: `200 MaiChart`; no such chart: `404`.

**Response**: `200` —— [response models](#maichart)

_Example_:

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

Anonymous. Returns chart metadata plus information about each resource file. No such chart: `404`.

- `metadata`: `MaiChart`, identical to `summary`.
- `resources`: `maidata`, `track`, `video`, `coverArt`, `thumbnail`. Files that are not stored are `null`.
- Every resource carries `url`, `md5`, `sha256` (both lowercase hex), and `length`.
- `levelHashes`: always 7 entries indexed by 0-based difficulty, holding that difficulty's level hash; difficulties without inote text are `null`.

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
  "levelHashes": [null, null, null, "<64-char lowercase hex>", "<64-char lowercase hex>", null, null]
}
```

**Response**: `200` —— [response models](#onlinechartinfo)

### POST /api/maichart/info

Anonymous. Looks up `info` for several charts at once. The body is a JSON array of chart IDs.

**Response**: `200` —— [response models](#onlinechartinfo) —— returns `200` with an array of objects shaped like `GET /api/maichart/{chartId}/info`, ordered by each ID's first appearance in the request; charts that do not exist are omitted. An empty array returns `[]`. An invalid ID returns `400`. Duplicate IDs count once, and there is no length limit

_Example_:

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

Anonymous. Query: `intent?: string`, optional; pass `download` for an explicit user download, which is attributed as a recommendation conversion when signed in. Preview and in-game loading omit it.

**Response**: `302` —— 无响应体, `Location` 指向 `maidata.txt` —— redirecting to `maidata.txt`, with a SHA-256 Base64 `hash` header. The play count is incremented before the redirect. A missing file returns `404` with `no-store`

### GET /api/maichart/{chartId}/track

Anonymous. Success: `302` redirecting to `track.mp3` with `hash`; Range requests are handled by the storage service. Missing: `404`.

**Response**: `302` —— 无响应体, `Location` 指向 `track.mp3`

### GET /api/maichart/{chartId}/image

Anonymous. Query: `fullImage?: bool = false`.

**Response**: `302` —— 无响应体, `Location` 指向封面文件 —— redirecting to the first available cover, with `hash`. By default the order is `bg-compress.jpg`, `bg.png`, `bg.jpg`; with `fullImage=true` the original image is tried first. None present returns `404`

### GET /api/maichart/{chartId}/video

Anonymous. Success: `302` redirecting to `bg.mp4` with `hash`. Missing: `404`.

**Response**: `302` —— 无响应体, `Location` 指向 `bg.mp4`

### GET /api/maichart/{chartId}/radar

Anonymous. Query: `chartLevel: int`, required, range **0–6**, matching the score endpoints and the game's difficulty numbering (`0` is `inote_1`, `4` is Master, `6` is `inote_7`).

**Response**: `200` —— [response models](#onlinechartradar) —— `feature` is read in `featureOrder`. The first six entries are radar values on a 0–250 scale; `fitted_constant` is the fitted constant on its own scale

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

When the cache is missing or stale, the request waits for the analysis and then returns the JSON directly; there is no `202` and no polling.

Failure: `400` missing or invalid parameters; `404 Status` (40400) no such chart, file, or difficulty; `409 Status` (40000) the file content does not match the stored hash; `422 Status` (40000) the difficulty cannot be analyzed completely.

### POST /api/maichart/upload

Auth: `MANAGE_CHART_LIST`. The request is multipart and **every** file uses the field name **`formfiles`**; the server identifies the purpose from the file name.

| File name | Required | Description |
| --- | --- | --- |
| `maidata.txt` | Yes | Simai chart; must have a valid title, artist, designer, and at least one difficulty |
| `bg.jpg` or `bg.png` | Yes | Cover; a 256×256 compressed copy is also generated |
| `track.mp3` | Yes | Audio |
| `bg.mp4` or `pv.mp4` | No | Video; capped at 50 MiB |

**Response**: `200` —— `text/plain` —— with the text `上传成功！`, which **does not include the chartId**; query the chart list to find it. Failure: `400` missing files, incomplete metadata, or an identical MD5 chart already exists; `409 Status` means an upload with the same SHA-256 is in progress; `413 Status` means the video is too large

After the files and chart record are saved, an "added" change is recorded and radar analysis is triggered in the background for every difficulty; the upload response does not wait for it.

### POST /api/maichart/delete

Auth: `MANAGE_CHART_LIST`, and only for charts you uploaded. Query: `chartId: Guid`, required.

**Response**: `200` —— 空响应体 —— Removes the chart record, its files, and its radar cache, while keeping historical scores and interactions, which are keyed by level hash. No such chart: `404 Status`; not the uploader: `403`

### PUT /api/maichart/{chartId}/tags

Auth: signed in, and you must be the uploader. The JSON body is a `string[]` that replaces all tags; an empty array clears them.

Tags are normalized first: surrounding whitespace is trimmed, empty strings and `null` are dropped, and duplicates are removed keeping the first occurrence (case-sensitive). If the normalized list equals the current tags, nothing is written, so retries are safe.

Limit: at most **32** tags. Exceeding it returns `400 Status` (40002).

**Response**: `200` —— with the resulting tags; over the limit: `400 Status` (40002); no such chart: `404`; not the uploader: `403`

_Example_:

```json
["original", "expert"]
```

### PATCH /api/maichart/{chartId}/tags

Auth as for `PUT`. The JSON body is `{ "add"?: string[], "remove"?: string[] }`.

- `add` and `remove` are normalized under the PUT rules; omitted or `null` counts as an empty array.
- A tag in both lists: `400 Status` (40000).
- Surviving tags keep their order and added tags are appended in request order.
- The same 32-tag limit applies; charts already above it can still remove tags.
- Persistent concurrent conflicts return `409 Status` after 3 attempts; the client may retry directly.

**Response**: `200` —— the resulting `tags`

_Example_:

```json
["original", "expert"]
```

### PUT /api/maichart/{chartId}/publictags

Auth: only signed in, **the uploader is not required** (unlike tags, which only the uploader may change). The body, normalization, idempotence, and limit rules match `PUT /api/maichart/{chartId}/tags`, replacing all public tags.

**Response**: `200` —— over the limit: `400 Status` (40002); no such chart: `404`; not signed in: `401`

_Example_:

```json
["爆发", "新人谱师"]
```

### PATCH /api/maichart/{chartId}/publictags

Auth as for `PUT /api/maichart/{chartId}/publictags`; the body and rules match `PATCH /api/maichart/{chartId}/tags`. Several users adding and removing different tags at the same time do not overwrite each other, so prefer it over a wholesale replace when editing shared public tags.

**Response**: `200` —— the same tag added and removed: `400 Status`; over the limit: `400 Status` (40002)

## Chart interactions

Voting and comments use a Reddit-style model: one vote per user per target (upvote `+1`, downvote `-1`, no vote `0`), and comments are threaded, votable, and sortable.

`{chartId}` is a Guid and `{commentId}` is an ObjectId. The website uses the JSON endpoints in this section; the three Form endpoints under `interact` are **game client compatibility endpoints and should not be used by the website**.

### Data model

- **Votes**: at most one vote per user per chart, `value ∈ {1, -1}`. Voting the other way replaces the previous vote, voting the same way again does not change counts, and `value=0` removes the vote.
- **Interaction record**: one per chart ID, holding upvotes, downvotes, score, live comment count, hot-ranking value, play count, and last activity.
- **Comments**: one record per comment or reply, holding the parent, the owning top-level comment, depth, vote counts, direct reply count, and edit/delete/removal times.
- Authors automatically upvote their own post.
- **Deletion**: a comment with replies becomes a placeholder (body cleared); one without replies is deleted physically along with any placeholder ancestors kept only for it. Administrators can remove any comment, with the same behavior but a different marker.
- **Body**: after normalizing newlines and trimming, it must be 1–10000 characters and contain no control characters other than newline and tab.
- **Reply depth** is capped at 999.
- **Rate limit**: at most 8 comments per user per minute; exceeding it returns `429` with `Retry-After: 60`.
- **`sort`** (case-sensitive): `best` (default), `top`, `new`, `old`, `controversial`.

_Example_:

```json
["爆发", "新人谱师"]
```

### PUT /api/maichart/{chartId}/vote

Auth: `COMMIT_CHART_INTERACTION`. JSON body `{ "value": 1 | 0 | -1 }`.

**Response**: `200` —— [response models](#onlinevoteresult) —— returns `200 OnlineVoteResult`, which is `{ score, upvotes, downvotes, myVote }`. Removing a vote that does not exist also returns `200`

Failure: `400` invalid value or unparsable body; `403` the uploader disabled interactions on the chart; `404` no such chart.

_Example_:

```json
{
  "score": 12,
  "upvotes": 15,
  "downvotes": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/comments

Anonymous; when signed in, `myVote` on every comment reflects the current user's vote.

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `sort` | string | No | `best` (default), `top`, `new`, `old`, `controversial` |
| `page` | int | No | 1-based, 1–10000, default 1 |

Each page holds 20 top-level comments plus at most 1500 replies beneath them, embedded in each parent's `replies`. Every comment's `authorProfile` holds the author's public profile, so the website can show nickname and avatar directly.

**Response**: `200` —— [response models](#commentpages) —— returns `200 OnlineCommentPage`, which is `{ items, total, commentCount, page, pageSize: 20, sort }`; `total` is the number of top-level comments, placeholders included

::: warning Deprecated field
`commentCount` is the number of live comments and is **deprecated**: no client reads it and Swagger marks it deprecated. Use `comments` from `GET /api/maichart/{chartId}/interactsum` instead, which carries the same count.
:::

_Example_:

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

Auth: `COMMIT_CHART_INTERACTION`. JSON body `{ "body": string, "parentId"?: ObjectId }`; an omitted or null `parentId` creates a top-level comment, otherwise it must be a live comment on the **same chart**.

**Response**: `201` —— [response models](#onlinecomment) —— (without `replies`), with `Location` pointing at `GET /api/comment/{id}`. Mail and group notifications are sent asynchronously after publishing; failures are only logged

Failure: `400` invalid body, reply too deep, or unparsable body; `403` the uploader disabled interactions; `404` no such chart or parent comment; `409` the parent comment is deleted; `429` rate limited.

_Example_:

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

Anonymous; the permalink view of a comment. Query: `sort`, as above, default `best`.

Returns the comment (even a placeholder) and every reply beneath it. Success: `200 OnlineCommentThread`, that is `{ item, sort }`. An invalid `commentId` or `sort`: `400 Status`; no such comment: `404 Status`.

**Response**: `200` —— [response models](#commentpages)

_Example_:

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

Auth: `COMMIT_CHART_INTERACTION`, and only the author may edit. JSON body `{ "body": string }` with the same body rules as publishing.

**Response**: `200` —— [response models](#onlinecomment) —— returns `200 OnlineComment`; `editedAt` is set when the body changed. Failure: `400` invalid body; `403` not the author; `404` no such comment; `409` the comment is deleted

_Example_:

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

Auth: `COMMIT_CHART_INTERACTION`. Authors delete their own comments; administrators can remove anyone's.

**Response**: `200` —— [response models](#commentpages) —— returns `200 OnlineCommentDeletion`, which is `{ ok: true, purged }`; `purged=true` means the comment had no replies and was deleted physically, `false` means it became a placeholder. Failure: `400` invalid ID; `403` not the author; `404` no such comment

_Example_:

```json
{
  "ok": true,
  "purged": false
}
```

### PUT /api/comment/{commentId}/vote

Auth: `COMMIT_CHART_INTERACTION`. JSON body `{ "value": 1 | 0 | -1 }`.

**Response**: `200` —— [response models](#onlinevoteresult) —— a comment returns only `{ score, myVote }`. Failure: `400` invalid value; `404` no such comment; `409` placeholders cannot be voted on

_Example_:

```json
{
  "score": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/interactsum

Anonymous. Success: `200 ChartInteractSummary`, that is `{ chartId, plays, score, upvotes, downvotes, comments, myVote }`; every field is 0 when there is no interaction record; no such chart: `404` with no body. The response must not be cached.

**Response**: `200` —— [response models](#chartinteractsummary)

_Example_:

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

Anonymous. The JSON body is a `Guid[]`. Success: `200 ChartInteractSummary[]` in request order, duplicate IDs answered once, missing charts omitted. The response must not be cached.

**Response**: `200` —— [response models](#chartinteractsummary)

### Game client compatibility endpoints

::: warning Do not use from the website
The three endpoints below keep the request and response shapes that published MajdataPlay builds depend on. `like` means an upvote, `dislike` means a downvote, and comments go through the same create and delete logic.
:::

#### GET /api/maichart/{chartId}/interact

Anonymous; includes the caller's own vote when signed in. Success: `200 ChartInteractFull`: `isLiked`/`isDisLiked` say whether the caller upvoted or downvoted, `likes` is the array of upvoters' usernames (the client counts them itself), `disLikeCount` is the downvote count, and `comments` is the live comment tree in publish order (placeholders and everything under them are omitted).

#### POST /api/maichart/{chartId}/interact

Auth: `COMMIT_CHART_INTERACTION`. The body is **Form**.

| Form field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | `like`, `dislike`, or `comment`, case-sensitive |
| `content` | string | Conditional | Required when `type=comment`; the body rules match publishing a comment |
| `replyTo` | ObjectId | No | Comment being replied to; must be live on this chart |

`like`/`dislike` go through the same voting logic as `PUT /api/maichart/{chartId}/vote` and return `200 empty`. `comment` goes through the same comment creation and returns `200 empty` without the comment object.

::: info Differences from the newer endpoints
When the uploader disabled interactions this endpoint returns `401`, where the newer endpoints return `403`; an unknown `type` returns `400` with no body.
:::

#### DELETE /api/maichart/{chartId}/interact

Auth: `COMMIT_CHART_INTERACTION`. The body is still **Form**.

| Form field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | `like`, `dislike`, or `comment` |
| `comment-id` | ObjectId | Conditional | Required when deleting a comment; only your own comments |

`like`/`dislike` removes only the caller's vote **in that direction**: a vote in the other direction stays, and with no vote nothing changes. `comment` deletes your own comment under the same rules as `DELETE /api/comment/{commentId}`. Both return `200 empty`.

## Scores

Scores are stored per difficulty level hash: one best score per player per level hash, and difficulties with identical inote text share that score. If the Master of chart A and the Re:Master of chart B are identical, they share one leaderboard.

New clients submit through `POST /api/maiscore/level/{levelHash}`, naming the chart they played in the body; published clients still submit through `POST /api/maichart/{chartId}/score` using the chart hash. Both validate and store scores the same way.

Validation shared by both endpoints: `chartLevel` is 0–6; achievement rates are percentages such as `100.5`. DX is 0–101, Classic is 0–104, and `dxScore` is non-negative; DX=101 or Classic=104 requires APPlus; APPlus requires DX of 100 or 101 and Classic≥100; AP requires both≥100. A violation returns `400 Status` (`Invalid Score`).

Storage shared by both endpoints (both return `200 empty` on success):

- The best score is keyed by player and level hash: DX, Classic, DXScore, and ComboState each keep the larger of the old value and this submission, and the timestamp is this submission's time.
- A play history record is added for this run.
- The chart's play count is incremented and attributed asynchronously as a recommendation conversion.
- Scores with DX≥100.5 are pushed to community channels.

_Example_:

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

Auth: `W_USER_MAI_SCORES`. `{levelHash}` in the path is the level hash of the difficulty played (64-character lowercase hex). The body's `chartId` is the chart played and only decides which chart this run is recorded on:

```json
{
  "chartId": "11111111-1111-1111-1111-111111111111",
  "acc": { "dx": 100.5, "classic": 102.1 },
  "dxScore": 1234,
  "comboState": 1
}
```

| Field | Type | Required/default | Description |
| --- | --- | --- | --- |
| `chartId` | Guid | **Required** | ID of the chart played; one of its difficulties must have a level hash equal to `{levelHash}` |
| `acc` | object | Zero value | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 0 | Non-negative |
| `comboState` | int | 0 | ComboState value |

Failure: `400` missing `chartId`, invalid level hash, or invalid score; `404` no such chart (`No such song on server`), the chart has no difficulty with this level hash (`No such level on server`, so the client should refresh the chart), or no such user.

**Response**: `200` —— 空响应体

### POST /api/maichart/{chartId}/score

Auth: `W_USER_MAI_SCORES`. The legacy endpoint used by published clients; the body is unchanged, and other fields the client may still send (`id`, `playerId`, `timestamp`) are ignored.

| Field | Type | Required/default | Description |
| --- | --- | --- | --- |
| `chartLevel` | int | Required | 0–6 |
| `hash` | string | Required | Must match the chart's current MD5 Base64 |
| `acc` | object | Zero value | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 0 | Non-negative |
| `comboState` | int | 0 | ComboState value |

Failure: `400` invalid score; `404` no such chart, `hash` does not match the current chart (so the client should refresh it), the difficulty has no level hash, or no such user.

::: info Recommendation
This endpoint remains for published clients. New clients should use `POST /api/maiscore/level/{levelHash}` and no longer depend on the chart hash.
:::

**Response**: `200` —— 空响应体

## Playlists

Every `{collectionId}` below is a playlist ObjectId. An invalid format returns `400 Status`. A private playlist is treated as nonexistent for anyone but its owner (`404`).

A playlist's `items` holds chart IDs in insertion order; a chart ID stays in the playlist after the chart is deleted, until the owner removes it. The write endpoints and songlist exchange chart IDs, and clients fetch metadata in bulk with `POST /api/maichart/info`; hashlist and the favorite list still return chart hashes for the game.

### GET /api/collection/list

Anonymous can read public playlists; when signed in with `R_USER_CHART_COLLECTIONS` the caller's private playlists are included as well.

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `keyword` | string | None | Case-insensitive regular expression on name and description |
| `createdBy` | string | None | Owner username; unknown names return an empty array |
| `page` | int | 0 | 0-based |
| `pageSize` | int | 30 | Page size |

**Response**: `200` —— [response models](#playlistlistitem) —— `200` with an array of playlist list items (see below), ordered by last activity, descending. Negative `page` or `pageSize` returns `400`

_Example_:

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

Auth: `W_USER_CHART_COLLECTIONS`. JSON:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Name |
| `description` | string | No | Description |
| `visibility` | int | Yes | 0 private, 1 public |

**Response**: `200` —— [response models](#onlinesongcollection) —— empty items and count 0

_Example_:

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

Public playlists are anonymous; private ones need the signed-in owner. Success: `200 OnlineDanInfo`, where `songHashs` (spelling preserved) holds the hashes of charts that still exist, in playlist order. Missing or invisible: `404`.

**Response**: `200` —— [response models](#onlinedaninfo)

_Example_:

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

Same permissions as hashlist. Success: `200 OnlineSongCollection`, where `items` holds the IDs (`Guid[]`) of charts that still exist, in playlist order.

`items` does not embed chart details; submit it as-is to `POST /api/maichart/info` to fetch metadata in one call. An empty playlist needs no request.

**Response**: `200` —— [response models](#onlinesongcollection)

_Example_:

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

Auth: `W_USER_CHART_COLLECTIONS`, and you must own the playlist. No body.

**Response**: `200` —— 空响应体 —— `200 empty`; missing or invisible: `404`; a public playlist you do not own: `403 Status`

### PUT /api/collection/{collectionId}/modify

Auth: both `R_USER_CHART_COLLECTIONS` and `W_USER_CHART_COLLECTIONS`, and you must own the playlist.

| JSON field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | No | Updated when non-empty |
| `description` | string | No | Kept when omitted or null; an empty string clears it |
| `visibility` | int | No | Updated when not null |
| `items` | Guid[] | No | Chart IDs, replacing the whole list in request order; an empty array clears it; unknown charts are filtered out and duplicates collapse to one |

**Response**: `200` —— [response models](#onlinesongcollection) —— invalid playlist ID or an unparsable body: `400 Status`, with no change made. Missing or invisible: `404`; a public playlist you do not own: `403`

To add or remove a single chart, read `items` from songlist, edit the list locally, and submit the whole list to modify.

::: danger Removed legacy calls
The incremental endpoint `POST /api/collection/{collectionId}/diff` is removed and returns `404`. The former `POST /api/collection/{collectionId}/modify` is now `PUT`, and calling it with `POST` returns `405`.
:::

## Favorite playlists

_Example_:

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

Auth: `R_USER_CHART_COLLECTIONS`. Query: `isExtra?: bool = false`.

**Response**: `200` —— [response models](#onlinedaninfo) —— By default it returns favorited playlists; `isExtra=true` also appends system playlists such as "My Thumbs", "Hot", "Recently liked/discussed/downloaded", and "Today's Challenge"

When the User-Agent starts with `MajdataPlay`, playlists the caller created are merged in as well and extra playlists are enabled.

| List | Source and order |
| --- | --- |
| Favorites, own playlists | Chart IDs in the playlist `items` swapped for hashes, in playlist order |
| My Thumbs | The user's upvotes, most recent vote first |
| Hot | Charts played in the last 7 days, counted per chart, top 20 |
| Recent Most Liked | Charts uploaded in the last 7 days with at least 5 upvotes and a score of at least 0, by score descending |
| Recent Most Commented | Charts uploaded in the last 7 days by comment count, descending, top 10 |
| Recent Most Downloaded | Charts uploaded in the last 7 days by play count, descending, top 10 |
| Today's Challenge | 10 charts picked from a date seed |

_Example_:

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

Auth: `W_USER_CHART_COLLECTIONS`. The JSON body is an array of ObjectId strings.

Adds favorites, handling only public playlists and the caller's own. Success: `200 Status` with message `Ok`; an empty array also succeeds. A non-empty request matching no playlist returns `404`.

**Response**: `200` —— [response models](#status)

_Example_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

### DELETE /api/account/favorite/collection/diff

Same auth and body. Removes favorites. Success: `200 Status` with message `Ok`; an empty array or IDs that were never favorited also succeed.

**Response**: `200` —— [response models](#status)

_Example_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## Machines and QR authorization

The normal call order is: register the machine → start an authorization request → the user reads the request and approves it → the original machine polls check → store the authorizing user's token. Machine cookies and user cookies should be kept separately.

### POST /api/machine/register

No user sign-in required. The `User-Agent` must start with **`MajdataPlay`**. JSON: `name: string` required, `description?: string`.

**Response**: `200` —— [response models](#anonymousobjects) —— `id` is the created machine **session ID**; the actual machine ID lives in the `machine-id` cookie. Sets `machine-token` and `machine-id`

Failure: `403 Status` when the User-Agent is missing or wrong; `400 Status` when the name is missing or the IP cannot be determined.

A machine is temporary and lives as long as its own machine session: once that session expires or is deleted, the machine is treated as nonexistent.

_Example_:

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

Query: `machine-id?: ObjectId`. With an ID it looks up that machine; without one it uses the current machine session. No user sign-in required.

**Response**: `200` —— [response models](#anonymousobjects) —— `404 Status` when the machine or the required session does not exist. Declares a 30-minute cache

_Example_:

```json
{
  "name": "Cabinet",
  "description": "",
  "place": "Shanghai",
  "remoteIP": "203.0.113.7"
}
```

### POST /api/machine/unregister

Requires the current machine session; no parameters.

**Response**: `200` —— 空响应体 —— Deletes the machine, revokes authorization, removes the machine session, and blanks the `machine-token`, `machine-id`, and `token` cookies. No machine session: `401 Status`

### POST /api/machine/auth/request

Auth: a valid machine session; no parameters. Creates an authorization request valid for 5 minutes. A machine may have at most one outstanding request.

**Response**: `201` —— [response models](#anonymousobjects) —— `Location` set to `https://majdata.net/qrauth?auth-id={requestId}`. An outstanding request already exists: `403 Status`; registration info not found: `401 Status`

_Example_:

```json
{
  "requestId": "8f2c1d3e4a5b6c7d8e9f0a1b"
}
```

### GET /api/machine/auth/info

Anonymous. Query: `auth-id: string`, required.

**Response**: `200` —— [response models](#anonymousobjects) —— `404 Status` when the request, machine, or machine session is invalid. Caching must not be stored

_Example_:

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

Auth: `AUTHORIZE`. Query: `auth-id: string`, required.

Approved successfully: `200 empty`, which creates a temporary game-permission session for the user and mails users who have an email; the request exists but could not be authorized again (for example it was already approved): `204`; no such request: `404 Status`.

**Response**: `200` —— 空响应体 (`204` 表示已批准过)

### GET /api/machine/auth/check

Auth: a valid machine session. Query: `auth-id: string`, required. Only the machine that started the request may poll.

| HTTP status | Meaning |
| --- | --- |
| `202` | Not approved yet, no body, keep polling |
| `200` | `{ token: Guid, userInfo: UserProfile }`, and the `token` cookie is set |
| `403` | The request belongs to another machine |
| `404` | No such request, already consumed, or no such machine |

A successful fetch consumes the request, so it cannot be claimed twice. Caching must not be stored.

**Response**: `200` —— [response models](#anonymousobjects) —— `匿名对象`

_Example_:

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

Auth: a valid machine session. Query: `auth-id: string`, required.

**Response**: `200` —— 空响应体 —— `200 empty`; no such request: `404 Status`; not the originating machine: `403 Status`. After check consumes the request, reusing the same ID may return `404`

## Leaderboards and statistics

These endpoints live under `/api/maiscore` and fall into four groups: `leaderboard`, `sum` (score totals), `rating`, and `history`. All are anonymous.

| Purpose | Method and path |
| --- | --- |
| Chart leaderboard | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` |
| Difficulty leaderboard | `GET /api/maiscore/leaderboard/chart/by-level/{levelHash}` |
| Period leaderboard | `POST /api/maiscore/leaderboard/period` |
| Site-wide score totals | `GET /api/maiscore/sum/all` |
| Uploader score totals | `GET /api/maiscore/sum/chart/by-uploader/{uploader}` |
| Chart score totals | `GET /api/maiscore/sum/chart/by-id/{chartId}`, `GET /api/maiscore/sum/chart/by-hash/{hash}` |
| Player score totals | `GET /api/maiscore/sum/user/by-id/{userId}`, `GET /api/maiscore/sum/user/by-username/{username}` |
| Rating radar | `GET /api/maiscore/rating/by-username/{username}` |
| Play heatmap | `GET /api/maiscore/history/heatmap` |

Responses that list players carry their public profile, so the website can show nickname and avatar (`GET /api/avatar/{avatarId}`) without extra calls to `GET /api/account/profile`.

::: info Legacy routes
These endpoints replaced the old `GET /api/maichart/{chartId}/score`, `/api/stats/score-sums`, and `/api/playhistory/*` routes; see "Deprecated but still available" below. New code should call only the endpoints in the table.
:::

### GET /api/maiscore/leaderboard/chart/by-id/{chartId}

Anonymous. Success: `200 ChartScoreSummary { hash, levelHashes, scores }`. `levelHashes` always has 7 entries, with `null` for difficulties without inote text; `scores` has **8** entries, where `scores[level]` (level 0–6) is that difficulty's leaderboard and the last entry is always an empty array.

Each difficulty's leaderboard takes scores whose `levelHash` equals that difficulty's level hash, at most 10 by DX achievement rate descending, one per player. Difficulties with no level hash get an empty array.

Failure: no such chart `404 Status`; `chartId` is not a valid Guid `400`.

::: info Player profiles
`scores[][].player` here is a full `UserProfile` (kept for published MajdataPlay builds), where `id` is the real user ObjectId, `avatarId` is populated, and the email is null.
:::

**Response**: `200` —— [response models](#leaderboards)

_Example_:

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

Anonymous. The path `levelHash` is 64-character lowercase hex.

**Response**: `200` —— [response models](#leaderboards) —— follows the same rules as a single difficulty of by-id. It reads only scores, not charts, so the level hash may belong to a deleted chart or to no chart at all. With no scores, `scores` is an empty array

A `levelHash` that is not 64-character lowercase hex (uppercase included) returns `400 Status`.

_Example_:

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

Anonymous. JSON:

| Field | Type | Required/default | Description |
| --- | --- | --- | --- |
| `songIds` | Guid[] | Required, non-empty | Chart IDs |
| `startTime` | datetime | Should be provided | Inclusive start |
| `endTime` | datetime | Should be provided | Inclusive end; must be later than the start |
| `sortBy` | string | `Acc.DX` | `DXScore`, `Acc.DX`, `Acc.Classic` |
| `scoreType` | string | `total` | `total` accumulates every play; `best` first takes each player's best per level hash and then accumulates |

Plays belong to level hashes just like scores: the endpoint takes the level hashes of every requested chart's difficulties and matches plays on them, no matter which chart a play was recorded on; a difficulty shared by several requested charts counts once under `best`.

`sortBy`/`scoreType` ignore surrounding whitespace and case, and null or an empty string means the default. Success: `200 PlayHistoryRankingEntry[]`, ordered by the chosen metric, descending, without pagination.

Failure: empty `songIds` is `400` (40001), a bad time or mode is `400` (40000); omitting `songIds` entirely or including an invalid Guid produces ProblemDetails from the framework. The legacy `songhashes` field is no longer accepted.

**Response**: `200` —— [response models](#statisticsandrating)

_Example_:

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

Anonymous. The site-wide total leaderboard: it aggregates each player's stored best scores (one per player per level hash, with DX and Classic achievement rates each taken at their historical maximum). It does not join charts, so scores whose level hash belongs only to deleted charts still count.

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | int | 0 | 0-based, must be ≥0 |
| `pageSize` | int | 30 | Must be ≥1 |

**Response**: `200` —— [response models](#statisticsandrating) —— ordered by each player's cumulative DX achievement rate, descending. The server caches the full leaderboard for 10 minutes and `geneTime` is when the snapshot was generated. Omitting `page` or passing `page=0` both return the first page. A negative page or a `pageSize` below 1 returns `400`

_Example_:

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

Anonymous. The path `uploader` is an uploader username. It aggregates only scores on that uploader's charts, counting each score once, and does not compute missing level hashes. Query, ordering, and caching match `sum/all`.

An unknown uploader or a chart nobody played returns an empty `players` rather than `404`.

**Response**: `200` —— [response models](#statisticsandrating)

_Example_:

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

Anonymous. The path `chartId` is a Guid. It aggregates only scores on that chart's difficulties. A deleted chart still aggregates by its stored level hashes; a completely unknown chart returns `200` with empty `players`.

**Response**: `200` —— [response models](#statisticsandrating)

_Example_:

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

Anonymous. The path `hash` is the chart MD5 Base64. It finds the chart by hash and then aggregates by the same rules as by-id. When no chart uses the hash, it returns `200` with empty `players`.

::: warning Hash encoding
The `/` in a hash **must** be encoded as `%2F`, otherwise the route does not match and returns `404`; `+` and `=` may be sent as-is or encoded as `%2B` and `%3D`. Encoding the whole hash is recommended.
:::

**Response**: `200` —— [response models](#statisticsandrating)

_Example_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": []
}
```

### GET /api/maiscore/sum/user/by-id/{userId}

Anonymous. The path `userId` is an ObjectId.

**Response**: `200` —— [response models](#statisticsandrating) —— cumulative achievement rate over all of the player's best scores, with `player` holding the player's public profile; a player with no scores gets zero values. No such user returns `404 Status`; an invalid ObjectId returns `400` ProblemDetails

_Example_:

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

Anonymous. The path `username` is a string. Response and errors match by-id.

**Response**: `200` —— [response models](#statisticsandrating)

_Example_:

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

Anonymous. The path `username` is a string. Returns the player's rating radar in two steps: first `constant × achievement rate / 101` is computed for every score (achievement rate being `Acc.DX`), the best 50 are taken with distinct level hashes, then those 50 difficulties' radar features are each multiplied by that score's achievement rate over 101 and averaged per feature.

A score participates only when: the chart has more than 5 upvotes; the difficulty index is not 6 (deluxe charts); the difficulty text is purely numeric or numeric with a plus, such as `13` or `14+`; and its DX achievement rate is at least 97.

**Response**: `200` —— [response models](#statisticsandrating) —— is always `note`, `peak`, `sweep`, `slide_tricky`, `slide_sequence`, `jack`, and `fitted_constant`; `feature` holds the per-feature averages; `charts` lists the chart IDs that actually contributed; and `best` holds the same set of chart-and-difficulty entries sorted by achievement rate descending, so the frontend can render a Best 50 directly. With no usable scores, `feature` is `{}` and `charts` is `[]`. No such user returns `404 Status`

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

Anonymous. Query: `userId: ObjectId` (the target user), `days?: int = 365` in the range 1–3650.

**Response**: `200` —— [response models](#playheatmap) —— `total` counts the user's **entire history** and is not limited by `days`; `daily` includes only dates with records inside the window, ascending, with no zero-filled gaps

The window starts at the server's **local time** minus `days`, while `daily` groups plays by **UTC date**, so on a server outside UTC the window boundary and date grouping can differ by hours and the first date's count may be incomplete.

A `days` value out of range or not an integer, or a `userId` that is not a 24-character hexadecimal ObjectId, returns `400` ProblemDetails.

## Recommendations

Recommendations run along two paths, single-chart similarity and a personal feed, and record impressions and conversions under the Reddit-style model.

_Example_:

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

Anonymous. Query: `hash: string` required, the source chart's hash (case-sensitive); `limit: int` defaults to 20, range 1–50.

When signed in, charts the user has played, upvoted, or downvoted are excluded; anonymous callers get no personal filtering. The response sets `Cache-Control: no-store`.

**Response**: `200` —— [response models](#onlinemaichart) —— ordered by similarity score descending, ties broken by chart ID ascending. No such source chart returns `404 Status`; a missing or blank hash or an out-of-range limit returns `400`. The legacy `chartId` parameter is no longer supported; callers must send `hash`. An existing source chart with no usable neighbors returns `200 []`

_Example_:

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

Auth: signed in. Query: `userId?: ObjectId string`, defaulting to the current user; `page: int` defaults to 0 in the range 0–100; `pageSize: int` defaults to 30 in the range 1–100; `source?: "feed" | "play-feed"`, defaulting to `feed` for the website, while the MajdataPlay song select screen sends `play-feed`.

`source` only decides where this delivery is recorded; the website and Play read the same snapshot and get the same order. Requesting another user returns `403 Status`; invalid parameters return `400`; signing out returns `401`.

Pagination follows the chart list: pages are 0-based, no total is returned, and a page shorter than `pageSize` is the last one.

**Snapshots**: every page, including `page=0`, reuses the current valid snapshot and does not re-sort, so new plays, votes, or model updates during its lifetime cannot move entries between pages. A missing or expired snapshot is rebuilt silently. A snapshot lives for 1 hour and holds at most 150 charts.

**Feed construction**: the similar-chart stream seeds from the user's upvotes and recent plays and sorts neighbors by similarity; the exploration stream mixes new and popular charts **3:1**. The two streams interleave **6:4**, and every pool excludes charts the user has played, upvoted, or downvoted. With no seeds or no model neighbors, the exploration stream still provides a cold start.

**Response**: `200` —— [response models](#onlinemaichart) —— each element is a complete external chart object, with no recommendation score or extra wrapper fields. An empty result is `[]`

_Example_:

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

Auth: signed in. Body (JSON): `{ "source": "feed" | "play-feed" | "related", "chartHashes": string[] }`. `source` must match the delivering endpoint: `feed` and `play-feed` correspond to the same-named `source` of `/api/recommend/feed`, and `related` corresponds to `/api/recommend/song`. `chartHashes` holds 1–100 chart hashes.

The website reports in bulk once a chart card enters the viewport; MajdataPlay reports when a chart rests in the center of the song list or starts playing. The two use different visibility rules, which is why sources are recorded separately and must not be mixed when analyzing.

An invalid `source`, or an empty `chartHashes` or one with more than 100 entries, returns `400 Status`; signing out returns `401`. Empty hashes and hashes longer than 128 characters are silently ignored. Impression times come from the server, and valid requests always return `204`.

**Response**: `204` —— 空响应体 (`204`)

## Events

Events are the contests, projects, and seasons shown on the website's home and event pages. Reads are anonymous; creating, replacing, and deleting require the `eventManager` group.

`{eventId}` is an event ID and is case-sensitive.

### GET /api/event

Anonymous.

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | None | Only that type: `outerLink`, `eventTag`, `space`, `season` |
| `category` | int | None | Only that category |
| `status` | string[] | None | Only events in any listed status, repeatable: `upcoming`, `ongoing`, `ended` |

`type` and `status` are case-insensitive. Success: `200 OnlineEvent[]`, by start time descending and then by ID ascending. Invalid values: `400 Status`.

**Response**: `200` —— [response models](#onlineevent)

_Example_:

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

Anonymous. Success: `200 OnlineEvent`; missing: `404 Status`.

**Response**: `200` —— [response models](#onlineevent)

_Example_:

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

Auth: the `eventManager` group. JSON:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | On create | 1–64 ASCII letters, digits, `.`, `_`, and `-`, starting with a letter or digit; used in the event link and immutable after creation |
| `type` | string | Yes | `outerLink`, `eventTag`, `space`, `season` |
| `asset` | string | Yes | Target: a full URL for `outerLink`; a playlist ObjectId for `season`; a raw ID or tag otherwise |
| `src` | string | Yes | Banner image address |
| `alt` | string | Yes | Image alternative text |
| `title` | string | Yes | Title |
| `category` | int | Yes | `1` college, `2` major contest, `3` personal project, `4` personal contest, `5` season |
| `createDate` | string | Yes | Start time in ISO 8601 with seconds and an offset |
| `endDate` | string | Yes | End time in the same format, later than `createDate` |
| `description` | string | Yes | Description |

Every string except `id` must be non-empty and not all whitespace. Times are converted to UTC on storage and returned with a `Z` suffix. A bare date such as `2026-10-24` is rejected; supply a full time and offset.

**Response**: `201` —— [response models](#onlineevent) —— `Location` pointing at the event. Invalid fields: `400 Status`; an unparsable body: `400 Status`; no body: `400 Status` (40001); duplicate ID: `409 Status` (40900)

_Example_:

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

Auth: the `eventManager` group. The JSON matches POST and replaces every field except the ID; `id` may be omitted but must match the route when present.

**Response**: `200` —— [response models](#onlineevent) —— `400 Status`; missing: `404 Status`

_Example_:

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

Auth: the `eventManager` group. No body. Success: `200 Status`; missing: `404 Status`.

**Response**: `200` —— [response models](#status)

_Example_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## Administration and user groups

These endpoints require the `administrator` group. `{group}` is a group name (`administrator`, `eventManager`, case-insensitive), and an unknown name returns `400 Status`; `{username}` is an account username, and an unknown user returns `404 Status`.

### GET /api/admin/groups

**Response**: `200` —— every group name sorted by value: `["administrator","eventManager"]`

_Example_:

```json
["administrator", "eventManager"]
```

### GET /api/admin/groups/{group}/members

**Response**: `200` —— [response models](#onlineusergroups) —— `200` with the accounts directly in that group, sorted by username. Administrators who are not members are not listed even though they satisfy the group's requirements

_Example_:

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

**Response**: `200` —— [response models](#onlineusergroups) —— accounts created before groups existed have an empty `groups` array

_Example_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

### PUT /api/admin/users/{username}/groups/{group}

Adds the account to the group; no body; a no-op when already a member. Success: `200 OnlineUserGroups`.

**Response**: `200` —— [response models](#onlineusergroups)

_Example_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator", "eventManager"]
}
```

### DELETE /api/admin/users/{username}/groups/{group}

Removes the account from the group; no body; a no-op when not a member. Success: `200 OnlineUserGroups`. Administrators cannot remove themselves from `administrator`, which returns `409 Status`.

**Response**: `200` —— [response models](#onlineusergroups)

_Example_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

## Connectivity

### GET /api/Ping

Anonymous. No parameters. Success: `200 {"code":114514,"message":"Pong"}`. Caching must not be stored.

**Response**: `200` —— [response models](#status)

_Example_:

```json
{
  "code": 114514,
  "message": "Pong"
}
```

### GET /api/info

Anonymous. No parameters. Success: `200 {"id":"...","name":"..."}`, the server instance's identifier and display name, empty strings when unconfigured.

**Response**: `200` —— [response models](#serverinfo)

_Example_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

## Deprecated but still available

::: warning Do not use in new code
These routes have been replaced, and are kept only for clients that have not migrated yet; **new code must not call them**, and they will be removed once clients migrate. Deprecated on 2026-10-21.

Every response from these routes (redirects and the errors served in place alike) carries `Deprecation: @1792540800` (RFC 9745, i.e. 2026-10-21T00:00:00Z) and `Link: <relative address of the replacement>; rel="successor-version"`. Swagger marks these operations deprecated.
:::

| Deprecated route | Replacement | Compatibility |
| --- | --- | --- |
| ~~`GET /api/account/info`~~ | `GET /api/account/profile` | `301` redirect, query discarded |
| ~~`GET /api/maichart/{chartId}/score`~~ | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` | `301` redirect |
| ~~`GET /api/stats/score-sums`~~ | No `uploader` or empty: `GET /api/maiscore/sum/all`; with `uploader`: `GET /api/maiscore/sum/chart/by-uploader/{uploader}` | `301` redirect; `uploader` moves into the path and is escaped, other query parameters are preserved |
| ~~`GET /api/playhistory/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` redirect, query preserved |
| ~~`GET /api/maiscore/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` redirect, query preserved |
| ~~`POST /api/playhistory/ranking`~~ | `POST /api/maiscore/leaderboard/period` | Served in place: still accepts `songhashes`, which the server maps to chart IDs before running the replacement; an empty `songhashes` still returns `400` (40001) |
| ~~`GET /api/utils/ping`~~ | `GET /api/Ping` | Served in place: returns `200 {"code":114514,"message":"Pong"}` and must not be cached |

Migration notes:

- **Redirects do not validate parameters**: the GET legacy routes only rewrite the address, so `page`, `pageSize`, `userId`, and similar parameters are validated by the replacement, making a bad parameter show up as `301` followed by `400`. The exception is `GET /api/maichart/{chartId}/score`, which still returns `400` directly when `chartId` is not a valid Guid.
- **Differences of `/api/account/info`**: the legacy route takes no parameters and discards the whole query on redirect, so a `username` cannot be forwarded to expose someone else's profile. Where the legacy route returned `403` without `R_USER_PROFILE`, the replacement returns `200` with `email: null`.
- **`Location` is relative**: for example `GET /api/stats/score-sums?page=1` returns `Location: ../../api/maiscore/sum/all?page=1`, which resolves against the request address and still points at the new address behind a reverse proxy that strips a path prefix. Browsers and .NET `HttpClient` follow it automatically; curl needs `-L`.
- **POST does not redirect**: most clients turn a followed `301`/`302` POST into a GET and drop the body, so `POST /api/playhistory/ranking` is handled in place.
- **`301` may be cached permanently** by clients, so migrate as early as possible.

## Fully removed

::: danger Calls can only fail
These routes have been removed from the service and are listed only to help diagnose calls left over from old clients. Calling them yields `404` or `405` with no redirect and no deprecation headers.
:::

| Removed route | Replacement or note |
| --- | --- |
| ~~`GET /api/maichart/get`~~ | `GET /api/maichart/list` |
| ~~`GET /api/account/verify`~~ | Pending accounts now use the email code flow of `POST /api/account/Login` |
| ~~`GET /api/account/intro`~~ | `GET /api/account/profile` |
| ~~`POST /api/account/intro`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/Icon`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/forget`~~ | `POST /api/account/password-reset/request` |
| ~~`PUT /api/account/forget`~~ | `POST /api/account/password-reset/confirm` |
| ~~`GET /api/persist/app/{appId}/{category}`~~ | Legacy persistence route with no replacement; use `GET /api/account/gamesetting` |
| ~~`GET /api/persist/app/1096/{category}`~~ | Legacy MajdataPlay settings read route; use `GET /api/account/gamesetting` |
| ~~`POST /api/persist/app/1096/settings`~~ | Legacy MajdataPlay settings write route; use `POST /api/account/gamesetting` |
| ~~`POST /api/maichart/{chartId}/tags`~~ | `PUT` or `PATCH /api/maichart/{chartId}/tags` |
| ~~`POST /api/maichart/{chartId}/publictags`~~ | `PUT` or `PATCH /api/maichart/{chartId}/publictags` |
| ~~`POST /api/collection/{collectionId}/diff`~~ | Read `GET /api/collection/{collectionId}/songlist`, then submit the full `items` to `PUT /api/collection/{collectionId}/modify` |
| ~~`POST /api/collection/{collectionId}/modify`~~ | `PUT /api/collection/{collectionId}/modify` |

## Response models

This section lists the JSON objects returned by the endpoints. Field names are the JSON property names (camelCase). In the type column:

- A `?` suffix means the field can be `null`; a field marked "omitted" is left out of the response entirely when its value is `null`.
- Arrays may be empty but are never `null` unless stated otherwise.
- `ObjectId`, `Guid`, and `datetime` are all strings: 24-character hex, UUID, and ISO 8601 respectively.
- The profile models returned by different endpoints are not identical; each model is described separately below.

::: tip Finding a model
If you are unsure what an endpoint returns, read the "Success" line of that endpoint, then look the model up here by name. Models marked <i>anonymous object</i> have no C# type; the controller builds them inline.
:::

### Users and sessions

#### UserProfile

Returned by `GET/POST /api/account/profile`, the registration response, the QR check's `userInfo`, and each `player` in a chart leaderboard.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | User ID |
| `username` | string | Username |
| `nickname` | string | Nickname |
| `introduction` | string? | Introduction |
| `email` | string? | Email; `null` when hidden by the endpoint or permission |
| `avatarId` | string | Avatar identifier; empty string or `default` when no avatar was uploaded, depending on the caller |
| `joinDate` | datetime | Registration time |

::: warning Known differences
`NetUser.GetProfile()` does not populate `id` or `avatarId`, so in the **registration response** and the QR check's **`userInfo`** the `id` is an all-zero ObjectId and `avatarId` is an empty string; they must not be used as a real user identifier. The `player` of a chart leaderboard is populated separately with `id` and `avatarId`, but its email is always `null`.
:::

#### OnlineUserBrief

A compact public profile used when several users are listed at once (leaderboards, comment authors). It holds only what is needed to show a nickname and avatar.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | User ID |
| `username` | string | Username; used for profile links and API queries |
| `nickname` | string | Nickname; empty string when unset |
| `avatarId` | string | Avatar identifier usable directly with `GET /api/avatar/{avatarId}`; `default` when no avatar was uploaded |

Used by `OnlinePlayerScoreSum.player`, `PlayHistoryRankingEntry.player`, and `OnlineComment.authorProfile`.

#### SessionInfo

<i>Anonymous object</i>: `GET /api/account/session` and `GET /api/account/sessions` return objects the controller builds inline, with no corresponding C# model.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Session ID, **not** the token |
| `permissions` | uint64 | Permission bitmask |
| `geneTime` | datetime | Creation time |
| `expiredTime` | datetime | Expiry time |
| `lastActiveTime` | datetime | Last activity time |
| `remoteIP` | string | Currently recorded IP |
| `remoteIPHistory` | array | Returned by **DEBUG builds only**; the field does not exist in release builds |

#### OnlineUserGroups

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | User ID |
| `username` | string | Username |
| `groups` | string[] | Names of the groups the account directly belongs to, ordered by value (`administrator`, `eventManager`) |

::: info
An account in no group returns an empty array. The `administrator` group satisfies every group requirement, but membership is still decided by this array; administrators who were not explicitly added do not appear in `GET /api/admin/groups/{group}/members`.
:::

### Charts

#### OnlineMaiChart

The external chart object used by chart lists, recommendations, and favorites.

| Field | Type | Description |
| --- | --- | --- |
| `id` | Guid | Chart ID |
| `title` | string | Title |
| `artist` | string | Artist |
| `designer` | string | Designer |
| `description` | string | Description |
| `levels` | string[] | Difficulty strings; 7 entries on upload, with missing difficulties possibly empty strings |
| `uploader` | string | Uploader username |
| `timestamp` | datetime | Upload time |
| `hash` | string | MD5 Base64 of `maidata.txt` |
| `tags` | string[] | Tags |
| `publicTags` | string[] | Public tags |

#### MaiChart

The complete chart record in the database. It differs from `OnlineMaiChart` by **one extra `uploaderID`** field and nothing else.

Returned by `GET /api/maichart/{chartId}/summary`, the `metadata` of `GET /api/maichart/{chartId}/info`, and the `sort=scorep` list.

| Field | Type | Description |
| --- | --- | --- |
| All fields above | | Same as `OnlineMaiChart` |
| `uploaderID` | ObjectId | Uploader user ID |

#### OnlineChartInfo

The response of `GET /api/maichart/{chartId}/info` and `POST /api/maichart/info`.

| Field | Type | Description |
| --- | --- | --- |
| `metadata` | MaiChart | Chart metadata, identical to `summary` |
| `resources` | OnlineChartResources | Information about each resource file; `null` when not stored |
| `levelHashes` | (string?)[] | Always 7 entries indexed by difficulty; `null` for a difficulty without inote text |

#### OnlineChartResources

| Field | Type | Description |
| --- | --- | --- |
| `maidata` | OnlineChartResource? | `maidata.txt` |
| `track` | OnlineChartResource? | `track.mp3` |
| `video` | OnlineChartResource? | `bg.mp4` |
| `coverArt` | OnlineChartResource? | Original cover (`bg.jpg` first, then `bg.png`) |
| `thumbnail` | OnlineChartResource? | 256×256 compressed copy `bg-compress.jpg` |

#### OnlineChartResource

| Field | Type | Description |
| --- | --- | --- |
| `url` | string | Direct link in the public bucket |
| `md5` | string | File MD5, lowercase hex |
| `sha256` | string | File SHA-256, lowercase hex |
| `length` | int64 | File size in bytes |

::: warning Do not mix the three hash formats
`md5`/`sha256` here are **lowercase hex**; the `hash` response header on file downloads is **SHA-256 in Base64**; the chart object's `hash` field is **MD5 in Base64**. The three differ in both format and purpose.
:::

#### OnlineChartRadar

The response of `GET /api/maichart/{chartId}/radar`.

| Field | Type | Description |
| --- | --- | --- |
| `featureOrder` | string[] | Feature names in order, always 7 entries |
| `feature` | object | Map from feature name to value; the first six are on a 0–250 scale, `fitted_constant` is on the constant scale |

#### ChartChanges

The response of `GET /api/maichart/changes` and each entry in it.

| Model | Fields |
| --- | --- |
| `OnlineMaiChartChanges` | `to: datetime` (window end actually used), `isComplete: bool`, `changes: OnlineMaiChartChange[]` |
| `OnlineMaiChartChange` | `chartId: Guid`, `kind: int` (0 added / 1 modified / 2 deleted), `changedAt: datetime`, `resources: object?` (keys match `OnlineChartResources`, values are the new resource or `null`), `metadata: OnlineMaiChartMetadataChange?` |
| `OnlineMaiChartMetadataChange` | `tags?: string[]`, `publicTags?: string[]`; both are omitted when unchanged |

### Interactions

#### ChartInteractSummary

The response of `GET /api/maichart/{chartId}/interactsum` and `POST /api/maichart/interactsum`.

| Field | Type | Description |
| --- | --- | --- |
| `chartId` | Guid | Chart ID |
| `plays` | int | Download/play count |
| `score` | int | Upvotes minus downvotes |
| `upvotes` | int | Upvote count |
| `downvotes` | int | Downvote count |
| `comments` | int | Live comment count, replies included |
| `myVote` | int | The caller's vote on this chart: `1` or `-1`; `0` when not voted or signed out |

Every field is 0 when there is no interaction record.

#### OnlineVoteResult

Shared by `PUT /api/maichart/{chartId}/vote` and `PUT /api/comment/{commentId}/vote`.

| Field | Type | Description |
| --- | --- | --- |
| `score` | int | Upvotes minus downvotes after voting |
| `upvotes` | int? | Returned for **chart votes only**; absent for comment votes |
| `downvotes` | int? | Returned for **chart votes only**; absent for comment votes |
| `myVote` | int | The vote stored by this request: `1`, `-1`, or `0` |

::: info
`upvotes`/`downvotes` use the `WhenWritingNull` omission strategy, so in a comment vote response those keys are absent rather than `null`. Treat them as optional when deserializing.
:::

#### OnlineComment

A single comment or reply.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Comment ID |
| `chartId` | Guid? | Chart it belongs to; `null` only for legacy comments whose chart was already deleted before the migration |
| `chartHash` | string | The chart's **current** hash; empty string after the chart is deleted |
| `chartTitle` | string? | Returned by cross-chart lists only (`GET /api/comment/{commentId}`, `GET /api/account/comments`); **omitted** elsewhere and when the chart is deleted |
| `parentId` | ObjectId? | Parent comment; `null` for top-level comments |
| `depth` | int | Levels below the top-level comment; `0` at the top level |
| `authorId` | ObjectId? | Author; `null` for placeholders |
| `author` | string | Author username; empty for placeholders or deleted accounts |
| `authorProfile` | OnlineUserBrief? | Author's public profile; `null` for placeholders or deleted accounts |
| `body` | string | Body; empty for placeholders |
| `createdAt` | datetime | Publish time |
| `editedAt` | datetime? | Last body edit time; `null` when never edited |
| `deleted` | bool | Deleted by the author |
| `removed` | bool | Removed by an administrator |
| `score` | int | Upvotes minus downvotes |
| `myVote` | int | The caller's vote: `1` or `-1`; `0` when not voted or signed out |
| `replyCount` | int | Direct reply count, placeholders included |
| `replies` | OnlineComment[] | Loaded replies in the requested order; empty in flattened lists and write responses |

#### CommentPages

| Model | Fields |
| --- | --- |
| `OnlineCommentPage` | `items: OnlineComment[]` (top-level comments, replies nested in `replies`), `total: int` (top-level count, placeholders included), `commentCount: int` (**deprecated**), `page: int`, `pageSize: int` (always 20), `sort: string` |
| `OnlineCommentThread` | `item: OnlineComment` (with every descendant reply), `sort: string` |
| `OnlineCommentList` | `items: OnlineComment[]` (flattened, no `replies`), `total: int`, `page: int`, `pageSize: int` (always 20) |
| `OnlineCommentDeletion` | `ok: bool` (always `true`), `purged: bool` (`true` for a physical delete, `false` for a placeholder or an existing one) |

::: warning Deprecated field
`OnlineCommentPage.commentCount` is marked `[Obsolete]`, is deprecated in Swagger, and is always the default value `0` in responses. Use `comments` from `GET /api/maichart/{chartId}/interactsum` instead.
:::

#### GameClientInteraction

`ChartInteractFull` and `ChartCommentSummary` are used **only** by `GET /api/maichart/{chartId}/interact`; their field names are bound to the published client's `MajNetSongInteract` and **cannot change**.

| ChartInteractFull field | Type | Description |
| --- | --- | --- |
| `isLiked` | bool | Whether the caller upvoted |
| `isDisLiked` | bool | Whether the caller downvoted |
| `plays` | int | Download/play count |
| `likes` | string[] | Usernames of upvoters |
| `disLikeCount` | int | Downvote count |
| `comments` | ChartCommentSummary[] | Live comment tree in publish order |

| ChartCommentSummary field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Comment ID |
| `sender` | string | Author username; empty when the account no longer exists |
| `content` | string | Body |
| `timestamp` | datetime | Publish time |
| `replies` | ChartCommentSummary[] | Nested replies |

::: info
This model carries **no vote counts**, and placeholders and their replies are omitted. Use `interactsum` when you need vote counts.
:::

### Scores and statistics

#### OnlineMaiScore

A score object that embeds its chart, used by `GET /api/account/scores` and the rating's `best`.

| Field | Type | Description |
| --- | --- | --- |
| `acc` | OnlineAccurate | `{ dx, classic }` as percentages |
| `dxScore` | int64 | DX score |
| `comboState` | int | `0` None / `1` FC / `2` FCPlus / `3` AP / `4` APPlus |
| `chartLevel` | int | Difficulty index 0–6 |
| `hash` | string | MD5 Base64 of the selected chart |
| `levelHash` | string | The score's own level hash |
| `chartInfo` | OnlineMaiChart | The selected chart |
| `timestamp` | datetime | Last submission time |

::: info
`hash` and `chartLevel` describe the **chart and difficulty selected for this score**, not fields of the score itself; a score stores only `levelHash`. The selection rules are in `GET /api/account/scores`.
:::

#### OnlineAccurate

| Field | Type | Description |
| --- | --- | --- |
| `dx` | number | DX achievement rate |
| `classic` | number | Classic achievement rate |

#### Leaderboards

| Model | Fields |
| --- | --- |
| `ChartScoreSummary` | `hash: string`, `levelHashes: (string?)[]` (always 7 entries), `scores: ScoreSummary[][]` (always **8** entries; `scores[level]` is the leaderboard of difficulty 0–6 and the last entry is always an empty array) |
| `LevelScoreSummary` | `levelHash: string`, `scores: ScoreSummary[]` |
| `ScoreSummary` | `player: UserProfile` (`id` and `avatarId` populated, `email` always `null`), `acc: number` (DX achievement rate, float), `comboState: int`, `timestamp: datetime` |

#### PlayerScoreSummary

The elements of `GET /api/account/recent`.

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Chart title |
| `artist` | string | Artist |
| `designer` | string | Designer |
| `uploader` | string | Uploader username |
| `chartId` | string | Chart ID |
| `difficulty` | string | Difficulty string |
| `level` | int | Difficulty index |
| `acc` | number | DX achievement rate |
| `comboState` | int | ComboState |
| `timestamp` | datetime | Play time |

#### StatisticsAndRating

| Model | Fields |
| --- | --- |
| `PlayHistoryRankingEntry` | `playerId: string`, `username: string`, `totalDXScore: int64`, `totalAccDX: number`, `totalAccClassic: number`, `player: OnlineUserBrief?` (`null` when the account no longer exists) |
| `OnlineScoreSum` | `geneTime: datetime`, `players: OnlinePlayerScoreSum[]` |
| `OnlinePlayerScoreSum` | `userId: ObjectId`, `username: string`, `acc: OnlineAccurate`, `player: OnlineUserBrief?` |
| `OnlinePlayerRating` | `featureOrder: string[]`, `feature: object`, `charts: Guid[]`, `best: OnlineMaiScore[]`, `scoreCount: int`, `chartCount: int` |

::: warning The type of `best`
`OnlinePlayerRating.best` is **`OnlineMaiScore[]`**, shaped like the other score endpoints (with full fields such as `chartInfo`), not a trimmed `chartId`/`level`/`acc` structure.
:::

Field meanings in `OnlinePlayerRating`:

- `featureOrder`: always `note`, `peak`, `sweep`, `slide_tricky`, `slide_sequence`, `jack`, `fitted_constant`.
- `feature`: the weighted average per feature; `{}` when no score can be used.
- `charts`: chart IDs that actually contributed, where different difficulties of one chart appear several times.
- `best`: the chart-and-difficulty entries that were averaged, sorted by achievement rate descending.
- `scoreCount`: how many of the best 50 chart-and-difficulty entries were selected.
- `chartCount`: how many charts actually contributed; it can be smaller than `scoreCount`.

#### PlayHeatmap

The response of `GET /api/maiscore/history/heatmap`.

| Model | Fields |
| --- | --- |
| `PlayHistoryHeatmapResponse` | `total: int64` (count over the whole history), `daily: DailyCount[]` |
| `DailyCount` | `date: string` (`YYYY-MM-DD`), `count: int` |

### Playlists and favorites

#### OnlineSongCollection

The `collection` of `GET /api/collection/{collectionId}/songlist`, `POST /api/collection/create`, and `PUT /api/collection/{collectionId}/modify`.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Playlist ID |
| `createdBy` | string | Owner username; `undefined` when the account no longer exists |
| `name` | string | Name |
| `description` | string | Description |
| `visibility` | int | `0` private, `1` public |
| `items` | Guid[] | Chart IDs in playlist order; deleted charts are left out |
| `count` | int | Length of `items` |

#### OnlineDanInfo

The playlist view used by the game client.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Playlist ID |
| `name` | string | Name |
| `createdBy` | string | Owner username; `undefined` when the account no longer exists |
| `description` | string | Description |
| `songHashs` | string[] | Chart hashes (**original spelling preserved**) |
| `isPlayList` | bool | Whether it acts as a play list |
| `isForceGameover` | bool | Whether it forces a game over |

::: warning `songHashs` is unordered
The field's type is `HashSet<string>`, so **order is not guaranteed** and it must not be assumed to match the playlist's `items`. Use the `items` of `songlist` when order matters.
:::

#### PlaylistListItem

<i>Anonymous object</i>: the elements of `GET /api/collection/list`, with no corresponding C# model.

| Field | Type | Description |
| --- | --- | --- |
| `id` | ObjectId | Playlist ID |
| `name` | string | Name |
| `createdBy` | string | Owner username; `undefined` when the account no longer exists |
| `description` | string | Description |
| `count` | int | Number of stored chart IDs, deleted charts included |

::: info Two kinds of count
The list item's `count` is the **number of stored IDs**; `OnlineSongCollection.count` is the **number of charts that still exist**. They can differ after charts are deleted.
:::

### Events

#### OnlineEvent

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Event ID, case-sensitive |
| `type` | string | `outerLink`, `eventTag`, `space`, `season` |
| `asset` | string | Target |
| `src` | string | Banner image address |
| `alt` | string | Image alternative text |
| `title` | string | Title |
| `category` | int | `1` college / `2` major contest / `3` personal project / `4` personal contest / `5` season |
| `createDate` | datetime | Start time (UTC, `Z` suffix) |
| `endDate` | datetime | End time (UTC, `Z` suffix) |
| `description` | string | Description |

#### ServerInfo

<i>Anonymous object</i>: the response of `GET /api/info`.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Server instance identifier; empty string when unconfigured |
| `name` | string | Display name; empty string when unconfigured |

#### Status

| Field | Type | Description |
| --- | --- | --- |
| `code` | int | Business status code |
| `message` | string | Description |

_Example_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

#### AnonymousObjects

The responses below are built inline by the controller and have **no corresponding C# model**; their fields are described in each endpoint's section:

| Endpoint | Response shape |
| --- | --- |
| `POST \`/api/account/gamesetting\`` | `{ username, userSettingJson }`; `userSettingJson` is the Base64 of the JSON text |
| `GET \`/api/maichart/hash-status\`` | `{ hash, exists, hasHistoricalScores, hasHistoricalInteract, chart }` |
| `POST \`/api/machine/register\`` | `{ id, name, description, place, remoteIP }`; `id` is the machine session ID |
| `GET \`/api/machine/info\`` | `{ name, description, place, remoteIP }` |
| `POST \`/api/machine/auth/request\`` | `{ requestId }` |
| `GET \`/api/machine/auth/info\`` | `{ grantee, granteeInfo: { name, description, place, remoteIP } }` |
| `GET \`/api/machine/auth/check\`` | `{ token, userInfo: UserProfile }` |
| `GET \`/api/account/session`,`GET \`/api/account/sessions\`` | see [SessionInfo](#sessioninfo) |
| `PUT \`/api/collection/{collectionId}/modify\`` | `{ code, message, collection: OnlineSongCollection }` |
| `GET \`/api/collection/list\`` | see [PlaylistListItem](#playlistlistitem) |
| `GET \`/api/info\`` | see [ServerInfo](#serverinfo) |
