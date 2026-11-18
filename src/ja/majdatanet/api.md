# API

MajdataNet サーバーは、MajdataPlay ゲームクライアントと Web サイトのフロントエンドが利用する REST API を提供します。

## ルートアドレス

以下のパスはすべて、サーバーの API ルートアドレスからの相対パスです。クライアントは `system-settings.json` の `Network.Online.ApiEndpoints[].Url` でルートアドレスを設定します。デフォルト値は `https://majdata.net/api3/api/` です。

公式のデプロイではリバースプロキシが `/api3` プレフィックスを付加します。自前でデプロイする場合は実際の構成に合わせてください。

## 規約

### アドレスとエンコード

- `Query` は URL クエリパラメーター、`Form` はフォームフィールド (通常は `application/x-www-form-urlencoded`)、ファイルは `multipart/form-data`、`JSON` は `application/json` のリクエストボディを表します。
- JSON のプロパティはキャメルケースです。C# プロパティの大文字小文字をそのまま使わないでください。実際に出力される名前には `dx`、`dxScore`、`uploaderID`、`remoteIP`、`totalAccDX` などがあります。
- `Guid` は UUID 文字列、`ObjectId` は 24 桁の 16 進文字列です。譜面 ID は Guid、ユーザー・セッション・プレイリスト・コメント ID は ObjectId です。
- 日時は ISO 8601 で送信します。リクエスト時刻には `Z` または明示的なタイムゾーンを付けることを推奨します。
- 列挙値は整数で送信します。`visibility`: `0` 非公開、`1` 公開。`comboState`: `0` None、`1` FC、`2` FCPlus、`3` AP、`4` APPlus。例外として、イベントの `type` とユーザーグループ名はキャメルケースの文字列で送信します。
- 配列のクエリパラメーターは同名フィールドを繰り返します (例: `?tag=original&tag=expert`)。ハッシュは Base64 文字列なので、URL やフォームに入れる際は `+`、`/`、`=` をエンコードする必要があります。
- 譜面の業務上の `hash` は `maidata.txt` の **MD5 Base64** です。ファイルダウンロードのレスポンスヘッダー `hash` はファイルの **SHA-256 Base64** で、用途が異なります。
- スコアは難易度の level hash 単位で保存されます。level hash はその難易度の inote テキストの 64 桁小文字 16 進ダイジェストで、`GET /api/maichart/{chartId}/info` の `levelHashes` から取得できます。

### サインインと権限

サービスは Cookie からセッションを読み取ります。Bearer トークン認証は実装されていません。

| Cookie | 用途 |
| --- | --- |
| `token` | ユーザーセッション。サインインまたは QR 承認の成功後に設定されます |
| `machine-token` | 筐体セッション |
| `machine-id` | 登録時に返される筐体識別子 |

通常のサインインで設定される Cookie は `Secure`、`HttpOnly`、`SameSite=None`、`Path=/` を使用します。クライアントは Cookie を保存して送り返す必要があり、ブラウザーのクロスオリジンリクエストでは credentials を有効にします。セッションは有効なリクエストで更新されます。

以下で「匿名」はサインイン不要、「サインイン済み」は有効なユーザーセッションが必要であることを表します。権限名を挙げる場合、サインイン済みでかつ列挙した権限をすべて持つことが必要です。通常アカウントのサインインでは `FULL_USER_ACCESS`、QR 承認では `GAME_FEATURE_ACCESS` が付与されます。

| 権限 | 値 | 用途 |
| --- | ---: | --- |
| `R_USER_PROFILE` | 1 | 自分の非公開プロフィールの閲覧 |
| `W_USER_PROFILE` | 2 | プロフィールの変更 |
| `AUTHORIZE` | 16 | 筐体認可の承認 |
| `COMMIT_CHART_INTERACTION` | 32 | 投票とコメント |
| `MANAGE_CHART_LIST` | 64 | 自分の譜面のアップロードと削除 |
| `MANAGE_LOGIN_SESSIONS` | 128 | 特定セッションの一覧取得と失効 |
| `R_USER_MAI_SCORES` | 1024 | 自分のスコアの取得 |
| `W_USER_MAI_SCORES` | 2048 | スコアの送信 |
| `R_USER_CHART_COLLECTIONS` | 4096 | お気に入りの読み取りと、一覧での自分の非公開プレイリストの表示 |
| `W_USER_CHART_COLLECTIONS` | 8192 | プレイリストとお気に入りの変更 |

#### ユーザーグループ

イベントの書き込みと管理のエンドポイントは権限ビットを見ず、アカウントが特定のユーザーグループに属することを要求します。グループはアカウントのドキュメントに保存され、リクエストのたびにデータベースから読み取られるため、追加や削除は次のリクエストで即座に反映され、再サインインは不要です。BAN 中または有効化待ちのアカウントは一切通りません。`administrator` グループはすべてのグループ要件を満たします。匿名リクエストは `401`、要件を満たさない場合は `403` を返し、いずれもレスポンスボディはありません。

| ユーザーグループ | 値 | 用途 |
| --- | ---: | --- |
| `administrator` | 1 | すべてのアカウントのグループ管理、およびすべてのグループ要件の通過 |
| `eventManager` | 2 | イベントの作成・置換・削除 |

グループはエンドポイントのパスで名前として渡し、大文字小文字は区別しません。

### レスポンスとエラー

成功時の共通ラッパーはありません。オブジェクト、配列、文字列、ファイル、または空のレスポンスを直接返します。以下の `200 空` は成功かつレスポンスボディなしを意味し、`204` とは異なります。

業務ステータスオブジェクトを `Status` と表記し、形は `{"code":114514,"message":"ok"}` です。**HTTP ステータスと業務コードは別々に判定してください。**

業務コードの定義は次のとおりです。`4XXXX` はリクエストエラー (先頭 3 桁は最も近い HTTP ステータスコード)、`6XXXX` はアカウント関連のエラーです。

| 業務コード | 意味 |
| ---: | --- |
| 114514 | 成功 |
| -114514 | 一般的なエラー |
| 40000 | パラメーターまたは資格情報の形式が不正 |
| 40001 | リクエストデータの不足 |
| 40002 | 要素が多すぎる (例: タグが 32 個を超える) |
| 40400 | 対象が存在しない |
| 40900 | 対象が既に存在する |
| 41000 | 対象が削除済み |
| 41300 | データが大きすぎる |
| 42900 | リクエストが多すぎる |
| 60000 | 未サインイン |
| 60001 | サインイン済み |
| 60002 | 権限不足 |
| 60003 | 資格情報が不正 |
| 60004 | アカウントが有効化待ち |
| 60005 | アカウントが BAN 中 |
| 60102 | メールアドレスが不正 |
| 60103 | ユーザー名が既に存在する |
| 60104 | メールアドレスが既に存在する |

一般的な HTTP の意味: `400` パラメーターエラー、`401` 未認証、`403` 権限不足、`404` 対象が存在しない、`409` 競合、`413` リクエストが大きすぎる、`429` リクエストが多すぎる (`Retry-After` 付き)。権限属性による `401/403` は通常業務オブジェクトを持たず、手動検証では `Status` を返すことがあります。モデルバインドや検証のエラーは ASP.NET Core の ProblemDetails になることがあり、数値のみ、テキストのみ、空ボディを返すエンドポイントもあります。すべてのエラーが `code/message` を持つと仮定してはいけません。

## アカウントとセッション

### POST /api/account/register

アカウントを登録します。匿名で呼び出し、サインイン済みの場合は `403` を返します。

| Form フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `username` | string | はい | 1〜24 文字、ASCII 英字・数字・`-`・`_` のみ |
| `password` | string | はい | 空でない資格情報文字列。サインイン時も同じ値を送信します |
| `email` | string | はい | メール認証コードのメールアドレスと一致する必要があります |
| `nickname` | string | はい | ニックネーム |
| `challengeKey` | string | はい | メール認証エンドポイントが返す key |
| `challengeCode` | int | はい | メールに記載の 8 桁のコード |
| `cf-turnstile-response` | string | はい | Turnstile トークン |

**レスポンス**: `200` —— [レスポンスモデル](#userprofile) —— アカウントは有効な状態で作成され、**自動サインインはされません**。失敗: `400`。認証失敗 (60003)、空パスワード、ユーザー名が不正 (40000)、ユーザー名またはメールの重複 (60103/60104) を含みます。

サーバーは送信されたパスワード文字列をそのまま比較します。本エンドポイントはクライアントが使うべきハッシュアルゴリズムを規定していません。

_例_:

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

匿名。

| Form フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `username` | string | はい | ユーザー名またはメールアドレス |
| `password` | string | はい | 登録時の資格情報文字列 |
| `rememberMe` | bool | いいえ | デフォルトは `false`。`true` で永続セッションの有効期間を使用します |
| `challengeKey` | string | 有効化待ちアカウントのみ | メール認証エンドポイントが返す key |
| `challengeCode` | int | 有効化待ちアカウントのみ | アカウントの元メールアドレスに送信されたコード |

**レスポンス**: `200` —— [レスポンスモデル](#status) —— `Set-Cookie` で `token` を設定し、ボディにはトークンを含めません。失敗: `401` 資格情報が不正、`403` サインイン済み・有効化待ちでメール認証情報が不足・BAN 中、`400` 認証コードが不正。

_例_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### POST /api/account/logout

認証: サインイン済み。Query: `sessionId?: ObjectId`。

- 省略または空: 現在のセッションを失効して `token` Cookie を削除し、筐体セッションがあればその筐体の認可も取り消します。
- `sessionId` を指定: 自分自身の指定セッションを失効します。`MANAGE_LOGIN_SESSIONS` も必要です。

**レスポンス**: `200` —— [レスポンスモデル](#status) —— 失敗: `400` ID が不正、`404` セッションが存在しない、`403` 他人のセッションまたは権限不足。

_例_:

```json
{
  "code": 114514,
  "message": "ok"
}
```

### GET /api/account/profile

Query: `username?: string`。

ユーザー名を指定した場合は匿名で取得できます。指定しない場合は現在のユーザーを読み取り、未サインインなら `401` を返します。成功: `200 UserProfile`（[レスポンスモデル](#userprofile)を参照）。存在しない場合: `404 Status`。メールアドレスは本人が `R_USER_PROFILE` を持つ場合にのみ返され、それ以外の呼び出しでは `email` は `null` です。

**レスポンス**: `200` —— [レスポンスモデル](#userprofile)

_例_:

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

認証: `W_USER_PROFILE`。Form を使用し、ファイルを送る場合は multipart にします。

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `nickname` | string | いいえ | 空でない場合に更新します |
| `introduction` | string | いいえ | 省略時は保持し、空文字列で消去します |
| `avatar` | file | いいえ | デコーダーが読み取れる画像 |

リクエスト全体の上限は 6 MiB、multipart ボディの上限は 5 MiB です。静止画像のアバターは 512×512 の JPEG に切り抜き、アニメーション画像は長辺 512 に縮小して WebP に変換します。

**レスポンス**: `200` —— [レスポンスモデル](#userprofile) —— `404` ユーザーが存在しない。明示的に空のニックネームは `400` を返します。

_例_:

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

認証: サインイン済み。パラメーターなし。成功: `200 SessionInfo`。[レスポンスモデル](#sessioninfo)を参照してください。

**レスポンス**: `200` —— [レスポンスモデル](#sessioninfo)

_例_:

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

認証: `MANAGE_LOGIN_SESSIONS`。成功: `200 SessionInfo[]`。現在のユーザーのすべてのセッションを含みます。

**レスポンス**: `200` —— [レスポンスモデル](#sessioninfo)

_例_:

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

匿名。Query: `email: string`、必須。

メールアドレスの形式が不正な場合は `400 Status` (60102) を返します。未登録のメールアドレスでも `200` とランダムな文字列を返しますが、メールは送信しません。アカウントの存在を漏らさないためです。登録済みの場合は 5 分間有効な 8 桁のコードを作成してメールを送信し、レスポンスボディとして `challengeKey` 文字列を返します。

**レスポンス**: `200` —— (`challengeKey`)

### POST /api/account/password-reset/confirm

匿名。Form: `email`、`newPassword`、`challengeCode`、`challengeKey`、すべて必須。

コードは同じメールアドレスのもので有効期限内である必要があり、検証に成功すると一度だけ消費されます。不正・期限切れ・使用済み・メールアドレス不一致の場合は `400 Status` (40000) を返します。アカウントが存在する場合は新しいパスワードを書き込み、そのユーザーのすべてのセッションと、そのユーザーが許可したすべての筐体認可を削除して `200 空` を返します。追加のパスワード強度チェックはありません。

**レスポンス**: `200` —— 空响应体

### GET /api/account/recent

匿名。Query: `username?: string`、デフォルトは空文字列。

**レスポンス**: `200` —— [レスポンスモデル](#playerscoresummary) —— 直近 **30 日間**のプレー記録を新しい順で返します。削除された譜面の記録はスキップし、ページングはありません。ユーザーが存在しない場合は `404 Status`。

_例_:

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

認証: `R_USER_MAI_SCORES`。

| Query | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `chartId` | Guid[] | 絞り込みなし | 同名パラメーターを繰り返します |
| `uploader` | string[] | 絞り込みなし | アップロード者のユーザー名 |
| `tag` | string[] | 絞り込みなし | 譜面のタグ |
| `publicTag` | string[] | 絞り込みなし | 公開タグ |
| `hash` | string[] | 絞り込みなし | 譜面の MD5 Base64 |
| `matchMode` | string | `or` | 絞り込み項目間の関係。`and` または `or` のみ |
| `fieldMatchMode` | string | `or` | 同一項目内の関係。`and` または `or` のみ |

**レスポンス**: `200` —— [レスポンスモデル](#onlinemaiscore) —— すべての絞り込みを省略した場合は、譜面に紐付けられる自分のスコアをすべて返します。不正なモードや Guid は `400 Status` を返します。

スコアは `levelHash → 譜面メタデータ → 譜面` の順で関連付けられ、各スコアは一度だけ現れます。1 つの level hash が複数の譜面に属する場合は代表難易度の規則 (最も早くアップロードされた譜面、同時なら譜面 ID、次に難易度番号) で選びます。どの譜面にも紐付かないスコアは返しません。

::: info 実装上の制限
`fieldMatchMode=and` の場合、`uploader`、`hash`、`chartId` の各グループは**それぞれちょうど 1 つ**でなければならず、それ以外は即座に空配列を返します。
:::

_例_:

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

匿名。あるユーザーの有効なコメントを、`replies` を含めないフラットな形で列挙します。各要素は `chartId`、`chartHash`、`chartTitle` を持ちます。

| Query | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `username` | string | はい | ユーザー名。大文字小文字を区別します |
| `sort` | string | いいえ | `new` (デフォルト) または `top` のみ |
| `page` | int | いいえ | 1 始まり、1〜10000、デフォルト 1、1 ページ 20 件 |

**レスポンス**: `200` —— [レスポンスモデル](#commentpages) —— 失敗: `400 Status` (40000)、`404 Status` (40400) ユーザーが存在しない。

_例_:

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

匿名。Form: `email: string`、必須。アドレスは `@` を含み、ドメインに MX レコードが必要です。

**レスポンス**: `200` —— (`challengeKey`) —— `200` と `challengeKey` 文字列を返します。8 桁のコードがメールに送信され、5 分間有効です。不正なメールアドレスは `400 Status` (60102)。

::: info レート制限は無効
本エンドポイントは IP あたり毎分 10 回の制限を宣言していますが、現在のパイプラインはレート制限ミドルウェアを有効にしていないため、**この制限が適用されていると見なさないでください**。
:::

### GET /api/account/icon

匿名。Query: `username: string`、必須。

**レスポンス**: `302` —— 无响应体, `Location` 为头像地址 —— `302` で `Location` はそのユーザーのアバターの絶対アドレスです (未アップロードの場合はデフォルトのアバター)。ユーザー名が空または存在しない場合は `404`。クライアントキャッシュは 1 時間と宣言されています。

公開済みの MajdataPlay (2.0.5 以前) はこのエンドポイントでアバターを読み込みます。新しいクライアントはレスポンスの `avatarId` で `GET /api/avatar/{avatarId}` を直接呼び出せます。

### GET /api/avatar/{avatarId}

匿名。Path: `avatarId: string`。

**レスポンス**: `302` —— 无响应体, `Location` 为头像地址 —— `302` で `Location` はアバターの絶対アドレスです。該当 ID がない場合はデフォルトのアバターにリダイレクトします。`default` を指定するとデフォルトのアバターを取得できます。

## ゲーム設定

### GET /api/account/gamesetting

認証: サインイン済み。パラメーターなし。

**レスポンス**: `200` —— `text/plain` —— デコード済みの JSON **テキスト文字列**を返します。設定がない場合やデコードに失敗した場合は `{}`。既定のコンテンツネゴシエーションでは通常 `text/plain` で、共通オブジェクトのラッパーではありません。

_例_:

```json
{
  "volume": 0.8,
  "noteSpeed": 7.5
}
```

### POST /api/account/gamesetting

認証: サインイン済み。ボディは生の UTF-8 JSON で最大 1 MiB。任意の有効な JSON 値を受け付けます。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— `userSettingJson` は送信した JSON テキストの Base64 です。失敗: `400` JSON が不正 (40000) または大きすぎる (41300)。

## 譜面とファイル

以下の `{chartId}` はすべて Guid です。

_例_:

```json
{
  "username": "player",
  "userSettingJson": "eyJ2b2x1bWUiOjAuOH0="
}
```

### GET /api/maichart/list

匿名。

| Query | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `sort` | string | いいえ | `hotp` は盛り上がり度の降順、`topp` はスコア (賛成票から反対票を引いた値) の降順 (`likep` はその別名)、`commp` は有効なコメント数の降順、`playp` はプレー回数、`timep` はアップロード日時、`scorep` は後述、それ以外と既定値は最終アクティブ日時の降順です |
| `search` | string | いいえ | プレフィックス検索または大文字小文字を区別しない正規表現 |
| `page` | int | いいえ | 0 始まり、1 ページ 30 件。省略時はページングしません |
| `isRanking` | bool | いいえ | true かつ検索なしの場合、直近 7 日にアップロードされた譜面に限定し最大 10 件を返します |

検索プレフィックス: `id:` (Guid)、`hash:`、`uploader:`、`tag:`、`level:`。それ以外はタイトル・アーティスト・譜面制作者・アップロード者・難易度・タグに対する正規表現として扱います。不正な `id:` は空配列を返します。

**レスポンス**: `200` —— [レスポンスモデル](#onlinemaichart) —— 通常は `200 OnlineMaiChart`。`sort=scorep` は特別で、直近 7 日で最もプレーされた最大 10 件の譜面を返し、早期に返して `search/page/isRanking` を無視します。

_例_:

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

認証: サインイン済み。Query: `hash: string`、必須。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— 空のハッシュは `400 Status` を返します。

- `exists`: 譜面が存在します。
- `hasHistoricalScores`: 譜面が存在し、いずれかの level hash にスコアがあります。
- `hasHistoricalInteract`: 譜面が存在し、譜面 ID によるインタラクション記録があります (現在の実装では譜面の存在と同値)。

_例_:

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

匿名。指定した期間に追加・変更・削除された譜面を返し、クライアントがローカルの譜面一覧を差分更新できるようにします。

| Query | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `from` | datetime | はい | 期間の開始 (含む)。通常は前回レスポンスの `to` を渡します |
| `to` | datetime | いいえ | 期間の終了 (含まない)。省略するか現在時刻より後の場合は現在時刻になります |

**レスポンス**: `200` —— [レスポンスモデル](#chartchanges)

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

- `to`: 実際に使用した期間の終了。次回はこれを `from` にします。
- `isComplete`: `false` の場合は**変更を一切返しません**。クライアントは `GET /api/maichart/list` で全体を再取得してください。
- `changes`: `changedAt` の昇順。`kind`: `0` 追加、`1` 変更、`2` 削除。

追加は譜面 ID のみを返すため、メタデータとリソースは `POST /api/maichart/info` でまとめて取得します。変更記録は既定で 30 日間保持され、最も古い記録より前を起点とする期間は完全性を保証できません。

失敗: `from` の欠落、または `from` が期間の終了より後の場合は `400 Status` (40000)。時刻形式が不正な場合は `400`。

### GET /api/maichart/{chartId}/summary

匿名。成功: `200 MaiChart`。存在しない場合: `404`。

**レスポンス**: `200` —— [レスポンスモデル](#maichart)

_例_:

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

匿名。譜面のメタデータと各リソースファイルの情報を返します。存在しない場合: `404`。

- `metadata`: `MaiChart` で `summary` と同じです。
- `resources`: `maidata`、`track`、`video`、`coverArt`、`thumbnail`。保存されていないファイルは `null` です。
- 各リソースは `url`、`md5`、`sha256` (いずれも小文字 16 進)、`length` を持ちます。
- `levelHashes`: 常に 7 項目で、0 始まりの難易度番号を添字とし、その難易度の level hash を持ちます。inote テキストがない難易度は `null` です。

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
  "levelHashes": [null, null, null, "<64 桁小文字 16 進>", "<64 桁小文字 16 進>", null, null]
}
```

**レスポンス**: `200` —— [レスポンスモデル](#onlinechartinfo)

### POST /api/maichart/info

匿名。複数の譜面の `info` をまとめて取得します。ボディは譜面 ID の JSON 配列です。

**レスポンス**: `200` —— [レスポンスモデル](#onlinechartinfo) —— `GET /api/maichart/{chartId}/info` と同じ構造のオブジェクト配列を、リクエストで最初に現れた順に返します。存在しない譜面は省略します。空配列は `[]`。ID の形式が不正な場合は `400`。重複 ID は 1 回だけ数え、件数の上限はありません。

_例_:

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

匿名。Query: `intent?: string`、任意。ユーザーが明示的にダウンロードする場合は `download` を渡し、サインイン済みならレコメンドのダウンロード転換として記録されます。プレビューやゲーム内の読み込みでは渡しません。

**レスポンス**: `302` —— 无响应体, `Location` 指向 `maidata.txt` —— `302` で `maidata.txt` にリダイレクトし、ファイルの SHA-256 Base64 レスポンスヘッダー `hash` を付けます。リダイレクトの前に譜面 ID のプレー回数を増やします。ファイルがない場合は `404` (`no-store` 付き)。

### GET /api/maichart/{chartId}/track

匿名。成功: `302` で `track.mp3` にリダイレクトし `hash` を付けます。Range リクエストはストレージサービスが処理します。存在しない場合: `404`。

**レスポンス**: `302` —— 无响应体, `Location` 指向 `track.mp3`

### GET /api/maichart/{chartId}/image

匿名。Query: `fullImage?: bool = false`。

**レスポンス**: `302` —— 无响应体, `Location` 指向封面文件 —— `302` で最初に存在するジャケット画像にリダイレクトし `hash` を付けます。既定では `bg-compress.jpg`、`bg.png`、`bg.jpg` の順、`fullImage=true` では原寸を先に試します。いずれも存在しない場合は `404`。

### GET /api/maichart/{chartId}/video

匿名。成功: `302` で `bg.mp4` にリダイレクトし `hash` を付けます。存在しない場合: `404`。

**レスポンス**: `302` —— 无响应体, `Location` 指向 `bg.mp4`

### GET /api/maichart/{chartId}/radar

匿名。Query: `chartLevel: int`、必須、範囲 **0〜6**。スコアのエンドポイントとゲームの難易度番号と同じです (`0` が `inote_1`、`4` が Master、`6` が `inote_7`)。

**レスポンス**: `200` —— [レスポンスモデル](#onlinechartradar) —— `feature` を `featureOrder` の順に `feature` を読み取ります。最初の 6 項目はレーダー値 (0〜250 スケール)、`fitted_constant` は自身のスケールを持つフィッティング定数です。

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

キャッシュがないか期限切れの場合、リクエストは解析の完了を待ってから JSON を直接返します。`202` やポーリングは使いません。

失敗: `400` パラメーターの欠落または不正、`404 Status` (40400) 譜面・ファイル・難易度が存在しない、`409 Status` (40000) ファイルの内容がデータベースのハッシュと一致しない、`422 Status` (40000) その難易度を完全に解析できない。

### POST /api/maichart/upload

認証: `MANAGE_CHART_LIST`。multipart リクエストで、**すべての**ファイルはフィールド名 **`formfiles`** を使います。サーバーはファイル名から用途を判別します。

| ファイル名 | 必須 | 説明 |
| --- | --- | --- |
| `maidata.txt` | はい | Simai 譜面。有効なタイトル、アーティスト、譜面制作者、少なくとも 1 つの難易度が必要です |
| `bg.jpg` または `bg.png` | はい | ジャケット画像。256×256 の圧縮版も生成します |
| `track.mp3` | はい | 音声 |
| `bg.mp4` または `pv.mp4` | いいえ | 動画。上限 50 MiB |

**レスポンス**: `200` —— `text/plain` —— テキスト `上传成功！` を返します。**chartId は返しません**。譜面一覧から確認してください。失敗: `400` ファイルの欠落、メタデータの不足、同じ MD5 の譜面が既に存在する。`409 Status` は同じ SHA-256 のアップロードが処理中であること、`413 Status` は動画が大きすぎることを表します。

ファイルと譜面レコードの保存後、追加の変更記録を書き込み、全難易度のレーダー解析をバックグラウンドで開始します。アップロードのレスポンスは解析の完了を待ちません。

### POST /api/maichart/delete

認証: `MANAGE_CHART_LIST` で、自分がアップロードした譜面のみ削除できます。Query: `chartId: Guid`、必須。

**レスポンス**: `200` —— 空响应体 —— 譜面レコード、ファイル、その譜面のレーダーキャッシュを削除しますが、level hash で紐付く過去のスコアとインタラクションは保持します。存在しない場合: `404 Status`。アップロード者でない場合: `403`。

### PUT /api/maichart/{chartId}/tags

認証: サインイン済みで、アップロード者である必要があります。JSON ボディは `string[]` で、タグをすべて置き換えます。空配列でタグを消去します。

タグはまず正規化されます。前後の空白を除去し、空文字列と `null` を捨て、最初に現れた位置で重複を除きます (大文字小文字を区別)。正規化後の内容が現在のタグと同じ場合は書き込まないため、安全に再試行できます。

上限: タグは最大 **32** 個。超えた場合は `400 Status` (40002)。

**レスポンス**: `200` —— (結果のタグ)。上限超過: `400 Status` (40002)。存在しない場合: `404`。アップロード者でない場合: `403`。

_例_:

```json
["original", "expert"]
```

### PATCH /api/maichart/{chartId}/tags

認証は `PUT` と同じ。JSON ボディは `{ "add"?: string[], "remove"?: string[] }`。

- `add` と `remove` は PUT の規則で正規化され、省略または `null` は空配列と見なします。
- 同じタグが両方のリストにある場合は `400 Status` (40000)。
- 残るタグは元の順序を保ち、追加分はリクエスト順に末尾へ加わります。
- 上限は同じ 32 個です。上限適用前に 32 個を超えていた譜面でもタグを削除できます。
- 同時実行の競合が続くと 3 回で `409 Status` を返します。クライアントはそのまま再試行できます。

**レスポンス**: `200` —— 結果の `tags`

_例_:

```json
["original", "expert"]
```

### PUT /api/maichart/{chartId}/publictags

認証: サインイン済みであればよく、**アップロード者である必要はありません** (アップロード者のみが変更できる tags と異なります)。ボディ、正規化、冪等性、上限の規則は `PUT /api/maichart/{chartId}/tags` と同じで、公開タグをすべて置き換えます。

**レスポンス**: `200` —— 上限超過: `400 Status` (40002)。存在しない場合: `404`。未サインイン: `401`。

_例_:

```json
["爆发", "新人谱师"]
```

### PATCH /api/maichart/{chartId}/publictags

認証は `PUT /api/maichart/{chartId}/publictags` と同じ。ボディと規則は `PATCH /api/maichart/{chartId}/tags` と同じです。複数のユーザーが別々のタグを同時に追加・削除しても上書きし合わないため、共有の公開タグを編集するときは全体置換よりこちらを推奨します。

**レスポンス**: `200` —— 同じタグを追加かつ削除: `400 Status`。上限超過: `400 Status` (40002)。

## 譜面のインタラクション

投票とコメントは Reddit 式のモデルです。1 ユーザーにつき対象ごとに 1 票 (賛成 `+1`、反対 `-1`、票なし `0`) で、コメントはスレッド化され、投票と並べ替えができます。

`{chartId}` は Guid、`{commentId}` は ObjectId です。Web サイトは本節の JSON エンドポイントを使います。`interact` 配下の 3 つの Form エンドポイントは**ゲームクライアント互換用で、Web サイトでは使わないでください**。

### データモデル

- **投票**: ユーザーごと・譜面ごとに最大 1 票で `value ∈ {1, -1}`。逆方向に投票すると前の票を置き換え、同じ方向への再投票は件数を変えず、`value=0` で票を取り消します。
- **インタラクション記録**: 譜面 ID ごとに 1 件で、賛成票、反対票、スコア、有効なコメント数、盛り上がり度、プレー回数、最終アクティブ日時を持ちます。
- **コメント**: コメントまたは返信ごとに 1 件で、親、所属するトップレベルコメント、深さ、票数、直接の返信数、編集・削除・除去の日時を持ちます。
- 投稿者は自分の投稿に自動で賛成票を入れます。
- **削除**: 返信のあるコメントはプレースホルダーになり (本文を消去)、返信のないコメントは物理削除され、そのために残されていたプレースホルダーの祖先も併せて削除されます。管理者は任意のコメントを除去でき、動作は同じですが別の印を付けます。
- **本文**: 改行を正規化して前後の空白を除いた後、1〜10000 文字で、改行とタブ以外の制御文字を含まないこと。
- **返信の深さ**は 999 までです。
- **レート制限**: 1 ユーザーあたり毎分 8 コメントまで。超えると `429` と `Retry-After: 60` を返します。
- **`sort`** (大文字小文字を区別): `best` (デフォルト)、`top`、`new`、`old`、`controversial`。

_例_:

```json
["爆发", "新人谱师"]
```

### PUT /api/maichart/{chartId}/vote

認証: `COMMIT_CHART_INTERACTION`。JSON ボディ `{ "value": 1 | 0 | -1 }`。

**レスポンス**: `200` —— [レスポンスモデル](#onlinevoteresult) —— すなわち `{ score, upvotes, downvotes, myVote }`。存在しない票の取り消しも `200` を返します。

失敗: `400` 値が不正またはボディを解析できない、`403` アップロード者がその譜面のインタラクションを無効にしている、`404` 譜面が存在しない。

_例_:

```json
{
  "score": 12,
  "upvotes": 15,
  "downvotes": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/comments

匿名。サインインしている場合、各コメントの `myVote` は現在のユーザーの票になります。

| Query | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `sort` | string | いいえ | `best` (デフォルト)、`top`、`new`、`old`、`controversial` |
| `page` | int | いいえ | 1 始まり、1〜10000、デフォルト 1 |

1 ページにトップレベルコメント 20 件と、その下の最大 1500 件の返信を含め、各親の `replies` に埋め込みます。各コメントの `authorProfile` は投稿者の公開プロフィールなので、Web サイトはニックネームとアバターをそのまま表示できます。

**レスポンス**: `200` —— [レスポンスモデル](#commentpages) —— すなわち `{ items, total, commentCount, page, pageSize: 20, sort }`。`total` はトップレベルコメント数 (プレースホルダーを含む) です。

::: warning 非推奨フィールド
`commentCount` は有効なコメント数で、**非推奨**です。どのクライアントも読んでおらず、Swagger でも deprecated とされています。同じ件数を持つ `GET /api/maichart/{chartId}/interactsum` の `comments` を使ってください。
:::

_例_:

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

認証: `COMMIT_CHART_INTERACTION`。JSON ボディ `{ "body": string, "parentId"?: ObjectId }`。`parentId` を省略または null にするとトップレベルコメントになり、それ以外は**同じ譜面**上の有効なコメントである必要があります。

**レスポンス**: `201` —— [レスポンスモデル](#onlinecomment) —— (`replies` を含まない)、`Location` は `GET /api/comment/{id}` を指します。公開後、メールとグループへの通知を非同期で送信し、失敗はログに記録するだけです。

失敗: `400` 本文が不正、返信が深すぎる、ボディを解析できない、`403` アップロード者がインタラクションを無効にしている、`404` 譜面または親コメントが存在しない、`409` 親コメントが削除済み、`429` レート制限。

_例_:

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

匿名。コメントのパーマリンクビュー。Query: `sort`、値は上記と同じでデフォルトは `best`。

そのコメント (プレースホルダーでも) と、その下のすべての返信を返します。成功: `200 OnlineCommentThread`、すなわち `{ item, sort }`。`commentId` が不正、または `sort` が不正な場合は `400 Status`。存在しない場合は `404 Status`。

**レスポンス**: `200` —— [レスポンスモデル](#commentpages)

_例_:

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

認証: `COMMIT_CHART_INTERACTION` で、投稿者本人のみ編集できます。JSON ボディ `{ "body": string }` で、本文の規則は投稿時と同じです。

**レスポンス**: `200` —— [レスポンスモデル](#onlinecomment) —— 本文が変わった場合は `editedAt` を設定します。失敗: `400` 本文が不正、`403` 投稿者でない、`404` 存在しない、`409` コメントが削除済み。

_例_:

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

認証: `COMMIT_CHART_INTERACTION`。投稿者は自分のコメントを削除でき、管理者は誰のコメントでも除去できます。

**レスポンス**: `200` —— [レスポンスモデル](#commentpages) —— すなわち `{ ok: true, purged }`。`purged=true` は返信がなく物理削除されたこと、`false` はプレースホルダーになったことを意味します。失敗: `400` ID が不正、`403` 投稿者でない、`404` 存在しない。

_例_:

```json
{
  "ok": true,
  "purged": false
}
```

### PUT /api/comment/{commentId}/vote

認証: `COMMIT_CHART_INTERACTION`。JSON ボディ `{ "value": 1 | 0 | -1 }`。

**レスポンス**: `200` —— [レスポンスモデル](#onlinevoteresult) —— コメントの場合は `{ score, myVote }` のみを返します。失敗: `400` 値が不正、`404` 存在しない、`409` プレースホルダーには投票できない。

_例_:

```json
{
  "score": 3,
  "myVote": 1
}
```

### GET /api/maichart/{chartId}/interactsum

匿名。成功: `200 ChartInteractSummary`、すなわち `{ chartId, plays, score, upvotes, downvotes, comments, myVote }`。インタラクション記録がない場合は各項目が 0、譜面が存在しない場合は `404` (ボディなし)。レスポンスはキャッシュできません。

**レスポンス**: `200` —— [レスポンスモデル](#chartinteractsummary)

_例_:

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

匿名。JSON ボディは `Guid[]`。成功: `200 ChartInteractSummary[]` をリクエスト順に返し、重複 ID は 1 回だけ回答し、存在しない譜面は省略します。レスポンスはキャッシュできません。

**レスポンス**: `200` —— [レスポンスモデル](#chartinteractsummary)

### ゲームクライアント互換エンドポイント

::: warning Web サイトでは使わないでください
以下の 3 つのエンドポイントは、公開済みの MajdataPlay が依存するリクエストとレスポンスの形を保っています。`like` は賛成票、`dislike` は反対票に相当し、コメントは同じ作成・削除ロジックを通ります。
:::

#### GET /api/maichart/{chartId}/interact

匿名。サインインしている場合は呼び出し元の票も含みます。成功: `200 ChartInteractFull`。`isLiked`/`isDisLiked` は呼び出し元が賛成/反対したか、`likes` は賛成したユーザー名の配列 (件数はクライアントが数えます)、`disLikeCount` は反対票数、`comments` は有効なコメントツリー (投稿順、プレースホルダーとその配下は含みません) です。

#### POST /api/maichart/{chartId}/interact

認証: `COMMIT_CHART_INTERACTION`。ボディは **Form** です。

| Form フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `type` | string | はい | `like`、`dislike`、`comment`。大文字小文字を区別します |
| `content` | string | 条件付き必須 | `type=comment` の場合は必須。本文の規則はコメント投稿と同じです |
| `replyTo` | ObjectId | いいえ | 返信先コメント ID。この譜面上の有効なコメントである必要があります |

`like`/`dislike` は `PUT /api/maichart/{chartId}/vote` と同じ投票ロジックを通り、`200 空` を返します。`comment` は同じコメント作成ロジックを通り、コメントオブジェクトを返さず `200 空` を返します。

::: info 新しいエンドポイントとの違い
アップロード者がインタラクションを無効にしている場合、本エンドポイントは `401` を返します (新しいエンドポイントは `403`)。未知の `type` はボディなしで `400` を返します。
:::

#### DELETE /api/maichart/{chartId}/interact

認証: `COMMIT_CHART_INTERACTION`。ボディは引き続き **Form** です。

| Form フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `type` | string | はい | `like`、`dislike`、`comment` |
| `comment-id` | ObjectId | 条件付き必須 | コメント削除時に必須。自分のコメントのみ削除できます |

`like`/`dislike` は呼び出し元の**その方向**の票だけを取り消します。逆方向の票は残り、票がない場合は何も変更しません。`comment` は自分のコメントを `DELETE /api/comment/{commentId}` と同じ規則で削除します。いずれも `200 空` を返します。

## スコア

スコアは難易度の level hash 単位で保存されます。プレイヤーごと・level hash ごとに 1 つのベストスコアで、inote テキストが同一の難易度はスコアを共有します。譜面 A の Master と譜面 B の Re:Master が完全に同じ場合、両者は 1 つのランキングを共有します。

新しいクライアントは `POST /api/maiscore/level/{levelHash}` で level hash ごとに送信し、プレーした譜面をボディに記します。公開済みクライアントは引き続き `POST /api/maichart/{chartId}/score` で譜面ハッシュを送信します。検証と保存の方法は両方で同じです。

両エンドポイント共通の検証: `chartLevel` は 0〜6。達成率は `100.5` のような百分率の数値です。DX は 0〜101、Classic は 0〜104、`dxScore` は非負。DX=101 または Classic=104 は APPlus を要求し、APPlus は DX が 100 または 101 かつ Classic≥100、AP は両方≥100 を要求します。満たさない場合は `400 Status` (`Invalid Score`) を返します。

両エンドポイント共通の保存方法 (成功時はどちらも `200 空`):

- ベストスコアはプレイヤーと level hash をキーに保存し、DX、Classic、DXScore、ComboState はそれぞれ以前の値と今回の値の大きい方を残します。日時は今回の送信時刻です。
- 今回のプレー履歴を 1 件追加します。
- 譜面のプレー回数を 1 増やし、レコメンドのプレー転換として非同期に記録します。
- DX≥100.5 の場合はコミュニティチャンネルに通知します。

_例_:

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

認証: `W_USER_MAI_SCORES`。パスの `{levelHash}` はプレーした難易度の level hash (64 桁小文字 16 進) です。ボディの `chartId` はプレーした譜面で、このプレーをどの譜面に記録するかだけを決めます。

```json
{
  "chartId": "11111111-1111-1111-1111-111111111111",
  "acc": { "dx": 100.5, "classic": 102.1 },
  "dxScore": 1234,
  "comboState": 1
}
```

| フィールド | 型 | 必須/デフォルト | 説明 |
| --- | --- | --- | --- |
| `chartId` | Guid | **必須** | プレーした譜面の ID。いずれかの難易度の level hash が `{levelHash}` と等しい必要があります |
| `acc` | object | ゼロ値 | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 0 | 非負 |
| `comboState` | int | 0 | ComboState の値 |

失敗: `400` `chartId` の欠落、level hash の不正、スコアの不正。`404` 譜面が存在しない (`No such song on server`)、その譜面にこの level hash の難易度がない (`No such level on server`、クライアントは譜面を再取得すべきです)、ユーザーが存在しない。

**レスポンス**: `200` —— 空响应体

### POST /api/maichart/{chartId}/score

認証: `W_USER_MAI_SCORES`。公開済みクライアントが使う旧エンドポイントで、ボディは変わりません。クライアントが依然として送る可能性のある `id`、`playerId`、`timestamp` などは無視します。

| フィールド | 型 | 必須/デフォルト | 説明 |
| --- | --- | --- | --- |
| `chartLevel` | int | 必須 | 0〜6 |
| `hash` | string | 必須 | パスの譜面の現在の MD5 Base64 と一致する必要があります |
| `acc` | object | ゼロ値 | `{ "dx": number, "classic": number }` |
| `dxScore` | int64 | 0 | 非負 |
| `comboState` | int | 0 | ComboState の値 |

失敗: `400` スコアが不正、`404` 譜面が存在しない、`hash` が現在の譜面と一致しない (クライアントは譜面を再取得すべきです)、その難易度に level hash がない、ユーザーが存在しない。

::: info 推奨
本エンドポイントは公開済みクライアントのために残されています。新しいクライアントは `POST /api/maiscore/level/{levelHash}` を使い、譜面ハッシュに依存しないでください。
:::

**レスポンス**: `200` —— 空响应体

## プレイリスト

以下の `{collectionId}` はプレイリストの ObjectId です。形式が不正な場合は `400 Status`。非公開プレイリストは所有者以外には存在しないものとして扱います (`404`)。

プレイリストの `items` は譜面 ID を追加順に保持します。譜面が削除されても、所有者が削除するまで ID は残ります。書き込みエンドポイントと songlist は譜面 ID をやり取りし、メタデータはクライアントが `POST /api/maichart/info` でまとめて取得します。ゲーム用の hashlist とお気に入り一覧は引き続き譜面ハッシュを返します。

### GET /api/collection/list

匿名で公開プレイリストを読めます。`R_USER_CHART_COLLECTIONS` を持つサインイン済みユーザーは自分の非公開プレイリストも含みます。

| Query | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `keyword` | string | なし | 名前と説明に対する大文字小文字を区別しない正規表現 |
| `createdBy` | string | なし | 所有者のユーザー名。存在しない場合は空配列を返します |
| `page` | int | 0 | 0 始まり |
| `pageSize` | int | 30 | 1 ページの件数 |

**レスポンス**: `200` —— [レスポンスモデル](#playlistlistitem) —— プレイリスト一覧の要素の配列（[レスポンスモデル](#playlistlistitem) を参照）を最終アクティブ日時の降順で返します。負の `page` や `pageSize` は `400` を返します。

_例_:

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

認証: `W_USER_CHART_COLLECTIONS`。JSON:

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name` | string | はい | 名前 |
| `description` | string | いいえ | 説明 |
| `visibility` | int | はい | 0 非公開、1 公開 |

**レスポンス**: `200` —— [レスポンスモデル](#onlinesongcollection) —— items は空、count は 0 です。

_例_:

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

公開プレイリストは匿名で読め、非公開はサインインした所有者のみ読めます。成功: `200 OnlineDanInfo`。`songHashs` (綴りは元のまま) はまだ存在する譜面のハッシュをプレイリスト順に並べたものです。存在しないか参照不可の場合は `404`。

**レスポンス**: `200` —— [レスポンスモデル](#onlinedaninfo)

_例_:

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

権限は hashlist と同じです。成功: `200 OnlineSongCollection`。`items` はまだ存在する譜面の ID (`Guid[]`) をプレイリスト順に並べたものです。

`items` は譜面情報を埋め込みません。クライアントはそのまま `POST /api/maichart/info` に渡してメタデータをまとめて取得します。空のプレイリストではリクエスト不要です。

**レスポンス**: `200` —— [レスポンスモデル](#onlinesongcollection)

_例_:

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

認証: `W_USER_CHART_COLLECTIONS` で、プレイリストの所有者である必要があります。ボディはありません。

**レスポンス**: `200` —— 空响应体 —— 存在しないか参照不可: `404`。所有していない公開プレイリスト: `403 Status`。

### PUT /api/collection/{collectionId}/modify

認証: `R_USER_CHART_COLLECTIONS` と `W_USER_CHART_COLLECTIONS` の両方が必要で、所有者である必要があります。

| JSON フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name` | string | いいえ | 空でない場合に更新します |
| `description` | string | いいえ | 省略または null なら保持し、空文字列で消去します |
| `visibility` | int | いいえ | null でない場合に更新します |
| `items` | Guid[] | いいえ | 譜面 ID の配列。リクエスト順ですべて置き換えます。空配列で消去し、存在しない譜面は除外され、重複 ID は 1 つにまとまります |

**レスポンス**: `200` —— [レスポンスモデル](#onlinesongcollection) —— プレイリスト ID が不正、またはボディを解析できない場合は `400 Status` で、何も変更しません。存在しないか参照不可: `404`。所有していない公開プレイリスト: `403`。

1 件だけ追加・削除する場合は、songlist の `items` を読み、ローカルで編集してから完全なリストを modify に送ります。

::: danger 削除された旧呼び出し
増分エンドポイント `POST /api/collection/{collectionId}/diff` は削除され、呼び出すと `404` を返します。以前の `POST /api/collection/{collectionId}/modify` は `PUT` になったため、`POST` で呼び出すと `405` を返します。
:::

## お気に入りプレイリスト

_例_:

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

認証: `R_USER_CHART_COLLECTIONS`。Query: `isExtra?: bool = false`。

**レスポンス**: `200` —— [レスポンスモデル](#onlinedaninfo) —— 既定ではお気に入りのプレイリストを返します。`isExtra=true` の場合は「My Thumbs」「Hot」「最近の人気/議論/ダウンロード」「今日の課題」などのシステムプレイリストも追加します。

User-Agent が `MajdataPlay` で始まる場合は、自分が作成したプレイリストも統合し、追加プレイリストを有効にします。

| リスト | ソースと順序 |
| --- | --- |
| お気に入り、自分のプレイリスト | プレイリストの `items` の譜面 ID をハッシュに変換し、プレイリスト順 |
| My Thumbs | そのユーザーの賛成票を新しい順 |
| Hot | 直近 7 日にプレーされた譜面を譜面ごとに集計し、上位 20 件 |
| Recent Most Liked | 直近 7 日にアップロードされ、賛成票が 5 以上かつスコアが 0 以上の譜面をスコアの降順 |
| Recent Most Commented | 直近 7 日にアップロードされた譜面をコメント数の降順で上位 10 件 |
| Recent Most Downloaded | 直近 7 日にアップロードされた譜面をプレー回数の降順で上位 10 件 |
| 今日の課題 | 日付シードから選ばれる 10 件の譜面 |

_例_:

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

認証: `W_USER_CHART_COLLECTIONS`。JSON ボディは ObjectId 文字列の配列。

お気に入りを追加します。公開プレイリストと自分が所有するものだけを処理します。成功: `200 Status` で message は `Ok`。空配列でも成功します。空でないリクエストで該当するプレイリストがない場合は `404`。

**レスポンス**: `200` —— [レスポンスモデル](#status)

_例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

### DELETE /api/account/favorite/collection/diff

認証とボディは上記と同じ。お気に入りを削除します。成功: `200 Status` で message は `Ok`。空配列や未登録の ID でも成功します。

**レスポンス**: `200` —— [レスポンスモデル](#status)

_例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## 筐体と QR 認可

通常の呼び出し順: 筐体の登録 → 認可リクエストの発行 → ユーザーがリクエストを読んで承認 → 元の筐体が check をポーリング → 認可したユーザーのトークンを保存。筐体 Cookie とユーザー Cookie は別々に保持してください。

### POST /api/machine/register

ユーザーのサインインは不要です。`User-Agent` が **`MajdataPlay`** で始まる必要があります。JSON: `name: string` は必須、`description?: string`。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— `id` は作成された筐体**セッション ID** で、実際の筐体 ID は `machine-id` Cookie にあります。`machine-token` と `machine-id` を設定します。

失敗: `403 Status` User-Agent の欠落または不一致、`400 Status` 名前の欠落または IP の取得に失敗。

筐体は一時的で、自身の筐体セッションと同じ寿命です。セッションが期限切れまたは削除されると、筐体は存在しないものとして扱われます。

_例_:

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

Query: `machine-id?: ObjectId`。ID を指定するとその筐体を、省略すると現在の筐体セッションを参照します。ユーザーのサインインは不要です。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— 筐体または必要なセッションが存在しない場合: `404 Status`。30 分のキャッシュを宣言しています。

_例_:

```json
{
  "name": "Cabinet",
  "description": "",
  "place": "Shanghai",
  "remoteIP": "203.0.113.7"
}
```

### POST /api/machine/unregister

現在の筐体セッションが必要で、パラメーターはありません。

**レスポンス**: `200` —— 空响应体 —— 筐体を削除し、認可を取り消し、筐体セッションを削除して、`machine-token`、`machine-id`、`token` Cookie を空にします。筐体セッションがない場合: `401 Status`。

### POST /api/machine/auth/request

認証: 有効な筐体セッション、パラメーターなし。5 分間有効な認可リクエストを作成します。1 台の筐体につき同時に 1 件だけ保持できます。

**レスポンス**: `201` —— [レスポンスモデル](#anonymousobjects) —— `Location` は `https://majdata.net/qrauth?auth-id={requestId}`。有効なリクエストが既にある場合: `403 Status`。登録情報が見つからない場合: `401 Status`。

_例_:

```json
{
  "requestId": "8f2c1d3e4a5b6c7d8e9f0a1b"
}
```

### GET /api/machine/auth/info

匿名。Query: `auth-id: string`、必須。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— リクエスト、筐体、または対応する筐体セッションが無効な場合: `404 Status`。キャッシュは保存できません。

_例_:

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

認証: `AUTHORIZE`。Query: `auth-id: string`、必須。

承認成功: `200 空`。現在のユーザーにゲーム権限の一時セッションを作成し、メールアドレスを持つユーザーには通知を送ります。リクエストは存在するが再度承認できなかった場合 (既に承認済みなど): `204`。リクエストが存在しない場合: `404 Status`。

**レスポンス**: `200` —— 空响应体 (`204` 表示已批准过)

### GET /api/machine/auth/check

認証: 有効な筐体セッション。Query: `auth-id: string`、必須。リクエストを発行した筐体のみがポーリングできます。

| HTTP ステータス | 意味 |
| --- | --- |
| `202` | 未承認、ボディなし、ポーリングを継続 |
| `200` | `{ token: Guid, userInfo: UserProfile }`、同時に `token` Cookie を設定 |
| `403` | リクエストが現在の筐体のものではない |
| `404` | リクエストが存在しない、消費済み、または筐体が存在しない |

取得成功でリクエストは消費され、二度受け取ることはできません。キャッシュは保存できません。

**レスポンス**: `200` —— [レスポンスモデル](#anonymousobjects) —— `匿名对象`

_例_:

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

認証: 有効な筐体セッション。Query: `auth-id: string`、必須。

**レスポンス**: `200` —— 空响应体 —— リクエストが存在しない場合: `404 Status`。発行した筐体でない場合: `403 Status`。check がリクエストを消費した後に同じ ID を使うと `404` になることがあります。

## ランキングと統計

本節のエンドポイントは `/api/maiscore` 配下にあり、`leaderboard` (ランキング)、`sum` (スコア合計)、`rating` (レーティングレーダー)、`history` (プレー履歴) の 4 グループに分かれます。すべて匿名で利用できます。

| 用途 | メソッドとパス |
| --- | --- |
| 譜面ランキング | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` |
| 難易度ランキング | `GET /api/maiscore/leaderboard/chart/by-level/{levelHash}` |
| 期間ランキング | `POST /api/maiscore/leaderboard/period` |
| 全体スコア合計 | `GET /api/maiscore/sum/all` |
| アップロード者別スコア合計 | `GET /api/maiscore/sum/chart/by-uploader/{uploader}` |
| 譜面別スコア合計 | `GET /api/maiscore/sum/chart/by-id/{chartId}`、`GET /api/maiscore/sum/chart/by-hash/{hash}` |
| プレイヤー別スコア合計 | `GET /api/maiscore/sum/user/by-id/{userId}`、`GET /api/maiscore/sum/user/by-username/{username}` |
| レーティングレーダー | `GET /api/maiscore/rating/by-username/{username}` |
| プレーヒートマップ | `GET /api/maiscore/history/heatmap` |

プレイヤーを列挙するレスポンスは公開プロフィールを含むため、Web サイトは `GET /api/account/profile` を個別に呼ばずにニックネームとアバター (`GET /api/avatar/{avatarId}`) を表示できます。

::: info 旧ルート
本節のエンドポイントは旧 `GET /api/maichart/{chartId}/score`、`/api/stats/score-sums`、`/api/playhistory/*` などを置き換えたものです。詳細は後述の「非推奨だが利用可能」を参照してください。新しいコードは表のエンドポイントのみを呼び出してください。
:::

### GET /api/maiscore/leaderboard/chart/by-id/{chartId}

匿名。成功: `200 ChartScoreSummary { hash, levelHashes, scores }`。`levelHashes` は常に 7 項目で、inote のない難易度は `null`。`scores` は **8** 項目で、`scores[level]` (level 0〜6) がその難易度のランキング、最後の項目は常に空配列です。

各難易度のランキングは `levelHash` がその難易度の level hash と等しいスコアを DX 達成率の降順で最大 10 件、プレイヤーごとに 1 件取ります。level hash のない難易度は空配列になります。

失敗: 譜面が存在しない場合は `404 Status`、`chartId` が有効な Guid でない場合は `400`。

::: info プレイヤープロフィール
ここでの `scores[][].player` は完全な `UserProfile` です (公開済み MajdataPlay のために維持)。`id` は実際のユーザー ObjectId、`avatarId` は設定済み、メールアドレスは null です。
:::

**レスポンス**: `200` —— [レスポンスモデル](#leaderboards)

_例_:

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

匿名。パスの `levelHash` は 64 桁小文字 16 進です。

**レスポンス**: `200` —— [レスポンスモデル](#leaderboards) —— 規則は by-id の単一難易度と同じです。スコアのみを読み、譜面は参照しないため、level hash は削除済みの譜面に属していても、どの譜面にも属していなくてもかまいません。スコアがない場合 `scores` は空配列です。

`levelHash` が 64 桁小文字 16 進でない場合 (大文字を含む場合も) は `400 Status` を返します。

_例_:

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

匿名。JSON:

| フィールド | 型 | 必須/デフォルト | 説明 |
| --- | --- | --- | --- |
| `songIds` | Guid[] | 必須、空でないこと | 譜面 ID |
| `startTime` | datetime | 指定すべき | 開始日時 (含む) |
| `endTime` | datetime | 指定すべき | 終了日時 (含む)。開始より後である必要があります |
| `sortBy` | string | `Acc.DX` | `DXScore`、`Acc.DX`、`Acc.Classic` |
| `scoreType` | string | `total` | `total` はプレーごとに加算、`best` はプレイヤーと level hash ごとに各指標の最大値を取ってから加算します |

プレーはスコアと同じく level hash に帰属します。要求された譜面の各難易度の level hash を取り、その上のプレーを照合します。プレーがどの譜面に記録されたかは問いません。複数の要求譜面が共有する難易度は `best` では 1 回だけ数えます。

`sortBy`/`scoreType` は前後の空白と大文字小文字を無視し、null または空文字列は既定値になります。成功: `200 PlayHistoryRankingEntry[]` を選択した指標の降順で返し、ページングはありません。

失敗: `songIds` が空の場合は `400` (40001)、日時やモードが不正な場合は `400` (40000)。`songIds` を完全に省略した場合や不正な Guid を含む場合は、フレームワークが ProblemDetails を返します。旧フィールド `songhashes` は受け付けません。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating)

_例_:

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

匿名。全体スコア合計ランキングです。各プレイヤーの保存済みベストスコア (プレイヤーごと・level hash ごとに 1 件、DX と Classic の達成率はそれぞれ過去最高) を集計します。譜面とは結合しないため、level hash が削除済みの譜面にしか属さないスコアも含まれます。

| Query | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `page` | int | 0 | 0 始まり、0 以上が必要 |
| `pageSize` | int | 30 | 1 以上が必要 |

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating) —— 各プレイヤーの累計 DX 達成率の降順で返します。サーバーはランキング全体を 10 分間キャッシュし、`geneTime` はスナップショットの生成時刻です。`page` を省略するか `page=0` を渡すと最初のページを返します。負のページや 1 未満の `pageSize` は `400` を返します。

_例_:

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

匿名。パスの `uploader` はアップロード者のユーザー名です。そのアップロード者のすべての譜面上のスコアだけを集計し、各スコアは 1 回だけ数えます。不足している level hash は計算しません。Query、順序、キャッシュは `sum/all` と同じです。

存在しないアップロード者やプレーされていない場合は、`404` ではなく空の `players` を返します。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating)

_例_:

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

匿名。パスの `chartId` は Guid です。その譜面 (すべての難易度) 上のスコアだけを集計します。削除済みの譜面でも保存済みの level hash で集計し、完全に未知の譜面は `200` と空の `players` を返します。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating)

_例_:

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

匿名。パスの `hash` は譜面の MD5 Base64 です。まずハッシュで譜面を探し、by-id と同じ規則で集計します。そのハッシュを使う譜面がない場合は `200` と空の `players` を返します。

::: warning ハッシュのエンコード
ハッシュ内の `/` は**必ず** `%2F` にエンコードしてください。そうしないとルートが一致せず `404` を返します。`+` と `=` はそのまま渡すことも `%2B`、`%3D` にエンコードすることもできます。ハッシュ全体を URL エンコードすることを推奨します。
:::

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating)

_例_:

```json
{
  "geneTime": "2026-11-18T12:00:00Z",
  "players": []
}
```

### GET /api/maiscore/sum/user/by-id/{userId}

匿名。パスの `userId` は ObjectId です。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating) —— そのプレイヤーのすべてのベストスコアの累計達成率で、`player` はそのプレイヤーの公開プロフィールです。スコアのないプレイヤーはゼロ値を返します。ユーザーが存在しない場合は `404 Status`、`userId` が有効な ObjectId でない場合は `400` ProblemDetails。

_例_:

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

匿名。パスの `username` は文字列です。レスポンスとエラーは by-id と同じです。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating)

_例_:

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

匿名。パスの `username` は文字列です。そのプレイヤーのレーティングレーダーを 2 段階で計算します。まず各スコアについて `定数 × 達成率 / 101` を算出し (達成率は `Acc.DX`)、その値の高い 50 件を level hash が重複しないように取ります。次にその 50 難易度のレーダー特徴をそれぞれ達成率 / 101 倍して項目ごとに平均します。

計算に参加する条件: 譜面の賛成票が 5 より多いこと、難易度番号が 6 (宴譜面) でないこと、難易度テキストが `13` や `14+` のような純粋な数値または数値とプラスのみであること、DX 達成率が 97 以上であること。

**レスポンス**: `200` —— [レスポンスモデル](#statisticsandrating) —— `featureOrder` は常に `note`、`peak`、`sweep`、`slide_tricky`、`slide_sequence`、`jack`、`fitted_constant` で、`feature` は各特徴の平均値、`charts` は実際に平均へ参加した譜面 ID の一覧、`best` は同じ「譜面 + 難易度」の明細を達成率の降順で並べたもので、フロントエンドが Best 50 を直接描画できます。利用可能なスコアがない場合、`feature` は `{}`、`charts` は `[]`。ユーザーが存在しない場合は `404 Status`。

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

匿名。Query: `userId: ObjectId` (対象ユーザー)、`days?: int = 365` で範囲は 1〜3650。

**レスポンス**: `200` —— [レスポンスモデル](#playheatmap) —— `total` はそのユーザーの**全履歴**の件数で `days` の制限を受けません。`daily` は期間内に記録のある日付のみを昇順で含み、ゼロ埋めはしません。

期間の起点はサーバーの**ローカル時刻**から `days` 日前で、`daily` はプレー時刻の **UTC 日付**でグループ化します。サーバーが UTC 以外のタイムゾーンにある場合、期間の境界と日付のグループ化が数時間ずれ、最初の日付の件数が不完全になることがあります。

`days` が範囲外または整数でない場合、`userId` が 24 桁 16 進の ObjectId でない場合は `400` ProblemDetails を返します。

## レコメンド

レコメンドは単一譜面の類似推薦と個人フィードの 2 経路で提供され、Reddit 式モデルのもとでインプレッションと転換を記録します。

_例_:

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

匿名で呼び出せます。Query: `hash: string` は必須で、元の譜面のハッシュ (大文字小文字を区別)。`limit: int` はデフォルト 20、範囲 1〜50。

サインインしている場合は、そのユーザーがプレー・賛成・反対したすべての譜面を除外します。匿名の場合は個人フィルタリングを行いません。レスポンスは `Cache-Control: no-store` を設定します。

**レスポンス**: `200` —— [レスポンスモデル](#onlinemaichart) —— 類似度スコアの降順で返し、同点は譜面 ID の昇順です。元の譜面が存在しない場合は `404 Status`。ハッシュの欠落・空白・limit の範囲外は `400`。旧 `chartId` パラメーターはサポートされないため、`hash` に切り替えてください。元の譜面が存在しても利用可能な近傍がない場合は `200 []` を返します。

_例_:

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

認証: サインイン済み。Query: `userId?: ObjectId 文字列` (省略時は現在のユーザー)、`page: int` はデフォルト 0 で範囲 0〜100、`pageSize: int` はデフォルト 30 で範囲 1〜100、`source?: "feed" | "play-feed"` はデフォルト `feed` (Web サイト) で、MajdataPlay の選曲画面は `play-feed` を送ります。

`source` は今回の配信記録の出所だけを決め、Web サイトと Play は同じスナップショットを読み同じ順序を得ます。他のユーザーを指定すると `403 Status`、パラメーターが不正なら `400`、未サインインなら `401`。

ページングは譜面一覧と同じです。ページは 0 始まりで、総数は返さず、`pageSize` より少ない件数が返れば最終ページです。

**スナップショット**: `page=0` を含むすべてのページが現在の有効なスナップショットを再利用し、並べ替えません。そのため有効期間中の新しいプレー、投票、モデル更新で項目がページ間を移動することはありません。スナップショットがないか期限切れの場合は黙って再構築します。有効期間は 1 時間で、最大 150 件の譜面を保持します。

**フィードの構成**: 類似譜面ストリームはユーザーの賛成票と最近のプレーをシードとして近傍を読み、類似度で並べます。探索ストリームは新譜と人気譜面を **3:1** で混合します。2 つのストリームは **6:4** で交互に混ざり、すべてのプールがユーザーのプレー・賛成・反対した譜面を除外します。シードやモデルの近傍がない場合でも探索ストリームでコールドスタートできます。

**レスポンス**: `200` —— [レスポンスモデル](#onlinemaichart) —— 各要素は完全な対外譜面オブジェクトで、推薦スコアや余分なラッパーフィールドは含みません。空の結果は `[]`。

_例_:

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

認証: サインイン済み。Body (JSON): `{ "source": "feed" | "play-feed" | "related", "chartHashes": string[] }`。`source` は配信したエンドポイントと対応する必要があります。`feed` と `play-feed` は `/api/recommend/feed` の同名 `source` に、`related` は `/api/recommend/song` に対応します。`chartHashes` は 1〜100 件の譜面ハッシュです。

Web サイトは譜面カードがビューポートに入った後にまとめて報告し、MajdataPlay は譜面が選曲リストの中央に留まったとき、またはプレー開始後に報告します。両者のインプレッション判定は異なるため出所を分けて記録し、集計時に混ぜないでください。

不正な `source`、空の `chartHashes`、100 件を超える `chartHashes` は `400 Status`、未サインインは `401`。空文字列や 128 文字を超えるハッシュは黙って無視します。インプレッション時刻はサーバー時刻で、有効なリクエストは常に `204` を返します。

**レスポンス**: `204` —— 空响应体 (`204`)

## イベント

イベントは Web サイトのホームとイベントページに表示される大会・企画・シーズンです。読み取りは匿名で可能で、作成・置換・削除には `eventManager` グループが必要です。

`{eventId}` はイベント ID で、大文字小文字を区別します。

### GET /api/event

匿名。

| Query | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `type` | string | なし | その種類のみ: `outerLink`、`eventTag`、`space`、`season` |
| `category` | int | なし | そのカテゴリのみ |
| `status` | string[] | なし | いずれかの状態にあるイベントのみ。繰り返し可能: `upcoming`、`ongoing`、`ended` |

`type` と `status` は大文字小文字を区別しません。成功: `200 OnlineEvent[]` を開始日時の降順、同時刻なら ID の昇順で返します。値が不正な場合は `400 Status`。

**レスポンス**: `200` —— [レスポンスモデル](#onlineevent)

_例_:

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

匿名。成功: `200 OnlineEvent`。存在しない場合: `404 Status`。

**レスポンス**: `200` —— [レスポンスモデル](#onlineevent)

_例_:

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

認証: `eventManager` グループ。JSON:

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | 作成時は必須 | 1〜64 文字の ASCII 英字・数字・`.`・`_`・`-` で、英字または数字で始まります。イベントリンクに使われ、作成後は変更できません |
| `type` | string | はい | `outerLink`、`eventTag`、`space`、`season` |
| `asset` | string | はい | 遷移先。`outerLink` は完全な URL、`season` はプレイリストの ObjectId、それ以外は元の ID またはタグ |
| `src` | string | はい | バナー画像のアドレス |
| `alt` | string | はい | 画像の代替テキスト |
| `title` | string | はい | タイトル |
| `category` | int | はい | `1` 高校、`2` 大規模大会、`3` 個人企画、`4` 個人大会、`5` シーズン |
| `createDate` | string | はい | 開始日時。ISO 8601 で秒とタイムゾーンが必須 |
| `endDate` | string | はい | 終了日時。同じ形式で `createDate` より後であること |
| `description` | string | はい | 説明 |

`id` 以外の文字列は空または空白のみにできません。日時は指定されたタイムゾーンで UTC に変換して保存し、レスポンスでは `Z` 付きで返します。`2026-10-24` のような日付のみは拒否されるため、完全な時刻とタイムゾーンを指定してください。

**レスポンス**: `201` —— [レスポンスモデル](#onlineevent) —— `Location` はそのイベントのアドレスです。フィールドが不正な場合: `400 Status`。ボディが有効な JSON でない場合: `400 Status`。ボディがない場合: `400 Status` (40001)。ID が既に存在する場合: `409 Status` (40900)。

_例_:

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

認証: `eventManager` グループ。JSON は POST と同じで、ID 以外のすべてのフィールドを置き換えます。`id` は省略できますが、指定する場合はルートと一致する必要があります。

**レスポンス**: `200` —— [レスポンスモデル](#onlineevent) —— 不正な場合: `400 Status`。存在しない場合: `404 Status`。

_例_:

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

認証: `eventManager` グループ。ボディなし。成功: `200 Status`。存在しない場合: `404 Status`。

**レスポンス**: `200` —— [レスポンスモデル](#status)

_例_:

```json
{
  "code": 114514,
  "message": "Ok"
}
```

## 管理とユーザーグループ

以下のエンドポイントは `administrator` グループを要求します。`{group}` はユーザーグループ名 (`administrator`、`eventManager`、大文字小文字を区別しない) で、未知の名前は `400 Status`。`{username}` はアカウントのユーザー名で、存在しない場合は `404 Status`。

### GET /api/admin/groups

**レスポンス**: `200` —— すべてのユーザーグループ名を値の順に返します: `["administrator","eventManager"]`。

_例_:

```json
["administrator", "eventManager"]
```

### GET /api/admin/groups/{group}/members

**レスポンス**: `200` —— [レスポンスモデル](#onlineusergroups) —— そのグループに直接属するアカウントをユーザー名順で返します。グループに属していない管理者は、そのグループの要件を満たしていても列挙されません。

_例_:

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

**レスポンス**: `200` —— [レスポンスモデル](#onlineusergroups) —— ユーザーグループ機能の導入前に作成されたアカウントは `groups` が空配列です。

_例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

### PUT /api/admin/users/{username}/groups/{group}

アカウントをグループに追加します。ボディはなく、既に属している場合は変更しません。成功: `200 OnlineUserGroups`。

**レスポンス**: `200` —— [レスポンスモデル](#onlineusergroups)

_例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator", "eventManager"]
}
```

### DELETE /api/admin/users/{username}/groups/{group}

アカウントをグループから削除します。ボディはなく、属していない場合は変更しません。成功: `200 OnlineUserGroups`。管理者は自分自身を `administrator` から削除できず、その場合は `409 Status` を返します。

**レスポンス**: `200` —— [レスポンスモデル](#onlineusergroups)

_例_:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "username": "player",
  "groups": ["administrator"]
}
```

## 接続確認

### GET /api/Ping

匿名。パラメーターなし。成功: `200 {"code":114514,"message":"Pong"}`。キャッシュは保存できません。

**レスポンス**: `200` —— [レスポンスモデル](#status)

_例_:

```json
{
  "code": 114514,
  "message": "Pong"
}
```

### GET /api/info

匿名。パラメーターなし。成功: `200 {"id":"...","name":"..."}`。サーバーインスタンスの識別子と表示名で、未設定の場合は空文字列です。

**レスポンス**: `200` —— [レスポンスモデル](#serverinfo)

_例_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

## 非推奨だが利用可能

::: warning 新しいコードでは使わないでください
以下のルートは置き換え済みで、移行していないクライアントのためにのみ残されています。**新しいコードでは呼び出さないでください**。クライアントの移行が完了すると削除されます。非推奨化日: 2026-10-21。

これらのルートのすべてのレスポンス (リダイレクトとその場で返すエラーを含む) には `Deprecation: @1792540800` (RFC 9745、2026-10-21T00:00:00Z) と `Link: <置き換え先の相対アドレス>; rel="successor-version"` が付きます。Swagger ではこれらの操作が deprecated とされています。
:::

| 非推奨ルート | 置き換え先 | 互換方法 |
| --- | --- | --- |
| ~~`GET /api/account/info`~~ | `GET /api/account/profile` | `301` リダイレクト、クエリは破棄 |
| ~~`GET /api/maichart/{chartId}/score`~~ | `GET /api/maiscore/leaderboard/chart/by-id/{chartId}` | `301` リダイレクト |
| ~~`GET /api/stats/score-sums`~~ | `uploader` なしまたは空: `GET /api/maiscore/sum/all`、`uploader` あり: `GET /api/maiscore/sum/chart/by-uploader/{uploader}` | `301` リダイレクト。`uploader` はパスに移してエスケープし、他のクエリはそのまま保持 |
| ~~`GET /api/playhistory/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` リダイレクト、クエリは保持 |
| ~~`GET /api/maiscore/heatmap`~~ | `GET /api/maiscore/history/heatmap` | `301` リダイレクト、クエリは保持 |
| ~~`POST /api/playhistory/ranking`~~ | `POST /api/maiscore/leaderboard/period` | その場で互換。`songhashes` を受け取り、サーバーが譜面 ID に変換してから置き換え先を実行します。空の `songhashes` は従来どおり `400` (40001) |
| ~~`GET /api/utils/ping`~~ | `GET /api/Ping` | その場で互換。`200 {"code":114514,"message":"Pong"}` を返し、キャッシュは保存できません |

移行の要点:

- **リダイレクトはパラメーターを検証しません**: GET の旧ルートはアドレスを書き換えるだけで、`page`、`pageSize`、`userId` などは置き換え先が検証します。そのため不正なパラメーターは `301` の後に `400` として現れます。例外は `GET /api/maichart/{chartId}/score` で、`chartId` が有効な Guid でない場合は直接 `400` を返します。
- **`/api/account/info` の違い**: 旧ルートはパラメーターを受け取らず、リダイレクト時にクエリをすべて破棄します。`username` が転送されて他人のプロフィールが返ることを防ぐためです。`R_USER_PROFILE` がない場合、旧ルートは `403` を返しましたが、置き換え先は `200` と `email: null` を返します。
- **`Location` は相対参照**: 例えば `GET /api/stats/score-sums?page=1` は `Location: ../../api/maiscore/sum/all?page=1` を返し、リクエストアドレスを基準に解決されるため、パスのプレフィックスを削除するリバースプロキシの背後でも新しいアドレスを指します。ブラウザーと .NET `HttpClient` は自動で追従し、curl は `-L` が必要です。
- **POST はリダイレクトしません**: 多くのクライアントは `301`/`302` を追従する際に POST を GET に変えてボディを捨てるため、`POST /api/playhistory/ranking` はサーバーがその場で処理します。
- **`301` はクライアントに永久キャッシュされる**ことがあるため、早めに移行してください。

## 完全に削除済み

::: danger 呼び出すと必ず失敗します
以下のルートはサービスから削除済みで、旧クライアントの残存呼び出しを調査するための説明としてのみ残しています。呼び出すと `404` または `405` を返し、リダイレクトも非推奨ヘッダーも付きません。
:::

| 削除済みルート | 置き換え先または説明 |
| --- | --- |
| ~~`GET /api/maichart/get`~~ | `GET /api/maichart/list` |
| ~~`GET /api/account/verify`~~ | 有効化待ちアカウントは `POST /api/account/Login` のメール認証コードフローを使います |
| ~~`GET /api/account/intro`~~ | `GET /api/account/profile` |
| ~~`POST /api/account/intro`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/Icon`~~ | `POST /api/account/profile` |
| ~~`POST /api/account/forget`~~ | `POST /api/account/password-reset/request` |
| ~~`PUT /api/account/forget`~~ | `POST /api/account/password-reset/confirm` |
| ~~`GET /api/persist/app/{appId}/{category}`~~ | 旧永続化ルートで互換先なし。ゲーム設定は `GET /api/account/gamesetting` を使います |
| ~~`GET /api/persist/app/1096/{category}`~~ | 旧 MajdataPlay 設定読み取りルート。`GET /api/account/gamesetting` を使います |
| ~~`POST /api/persist/app/1096/settings`~~ | 旧 MajdataPlay 設定書き込みルート。`POST /api/account/gamesetting` を使います |
| ~~`POST /api/maichart/{chartId}/tags`~~ | `PUT` または `PATCH /api/maichart/{chartId}/tags` |
| ~~`POST /api/maichart/{chartId}/publictags`~~ | `PUT` または `PATCH /api/maichart/{chartId}/publictags` |
| ~~`POST /api/collection/{collectionId}/diff`~~ | `GET /api/collection/{collectionId}/songlist` を読んでから、完全な `items` を `PUT /api/collection/{collectionId}/modify` に送ります |
| ~~`POST /api/collection/{collectionId}/modify`~~ | `PUT /api/collection/{collectionId}/modify` |

## レスポンスモデル

本節は各エンドポイントが返す JSON オブジェクトの一覧です。フィールド名は JSON のプロパティ名（キャメルケース）です。型の列について:

- `?` は `null` になり得ることを示し、「省略」と記したフィールドは値が `null` のときレスポンスに現れません。
- 配列は空になり得ますが、特に断りのない限り `null` にはなりません。
- `ObjectId`、`Guid`、`datetime` はいずれも文字列で、それぞれ 24 桁 16 進、UUID、ISO 8601 です。
- エンドポイントによって返されるプロフィールモデルは同一ではないため、以下でモデルごとに説明します。

::: tip モデルの探し方
エンドポイントの戻り値が分からない場合は、そのエンドポイントの「成功」の行を読み、ここでモデル名から引いてください。<i>匿名オブジェクト</i>と記したモデルに対応する C# 型はなく、コントローラーがインラインで構築しています。
:::

### ユーザーとセッション

#### UserProfile

`GET/POST /api/account/profile`、登録のレスポンス、QR check の `userInfo`、および譜面ランキングの `player` がこのモデルです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | ユーザー ID |
| `username` | string | ユーザー名 |
| `nickname` | string | ニックネーム |
| `introduction` | string? | 自己紹介 |
| `email` | string? | メールアドレス。エンドポイントと権限により非表示なら `null` |
| `avatarId` | string | アバター識別子。未アップロードの場合は呼び出し元により空文字列または `default` |
| `joinDate` | datetime | 登録日時 |

::: warning 既知の差異
`NetUser.GetProfile()` は `id` と `avatarId` を設定しないため、**登録のレスポンス**と**QR check の `userInfo`** では `id` が全ゼロの ObjectId、`avatarId` が空文字列になります。実際のユーザー識別子としては使えません。譜面ランキングの `player` は `id` と `avatarId` が別途設定されていますが、メールアドレスは常に `null` です。
:::

#### OnlineUserBrief

複数ユーザーを一度に列挙するとき（ランキング、コメント投稿者）に使う簡潔な公開プロフィールです。ニックネームとアバターの表示に必要な最小限のフィールドだけを持ちます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | ユーザー ID |
| `username` | string | ユーザー名。プロフィールリンクと API クエリに使います |
| `nickname` | string | ニックネーム。未設定なら空文字列 |
| `avatarId` | string | `GET /api/avatar/{avatarId}` にそのまま使えるアバター識別子。未アップロードなら `default` |

`OnlinePlayerScoreSum.player`、`PlayHistoryRankingEntry.player`、`OnlineComment.authorProfile` で使われます。

#### SessionInfo

<i>匿名オブジェクト</i>: `GET /api/account/session` と `GET /api/account/sessions` はコントローラーがインラインで構築したオブジェクトを返し、対応する C# モデルはありません。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | セッション ID。トークンでは**ありません** |
| `permissions` | uint64 | 権限ビットマスク |
| `geneTime` | datetime | 作成日時 |
| `expiredTime` | datetime | 有効期限 |
| `lastActiveTime` | datetime | 最終アクティブ日時 |
| `remoteIP` | string | 現在記録されている IP |
| `remoteIPHistory` | array | **DEBUG ビルドのみ**返します。リリースビルドではこのフィールド自体が存在しません |

#### OnlineUserGroups

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | ユーザー ID |
| `username` | string | ユーザー名 |
| `groups` | string[] | 直接所属するグループ名を値の順に並べたもの（`administrator`、`eventManager`） |

::: info
どのグループにも属さないアカウントは空配列を返します。`administrator` グループはすべてのグループ要件を満たしますが、所属の判定はこの配列によるため、明示的に追加されていない管理者は `GET /api/admin/groups/{group}/members` に現れません。
:::

### 譜面

#### OnlineMaiChart

譜面一覧、レコメンド、お気に入りなどで使う対外譜面オブジェクトです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | Guid | 譜面 ID |
| `title` | string | タイトル |
| `artist` | string | アーティスト |
| `designer` | string | 譜面制作者 |
| `description` | string | 説明 |
| `levels` | string[] | 難易度テキストの配列。アップロード時は 7 項目で、欠けた難易度は空文字列のことがあります |
| `uploader` | string | アップロード者のユーザー名 |
| `timestamp` | datetime | アップロード日時 |
| `hash` | string | `maidata.txt` の MD5 Base64 |
| `tags` | string[] | タグ |
| `publicTags` | string[] | 公開タグ |

#### MaiChart

データベース内の完全な譜面レコードです。`OnlineMaiChart` との違いは **`uploaderID` が 1 つ増えるだけ**で、他に差はありません。

`GET /api/maichart/{chartId}/summary`、`GET /api/maichart/{chartId}/info` の `metadata`、`sort=scorep` の一覧で返されます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| 上表のすべて | | `OnlineMaiChart` と同じ |
| `uploaderID` | ObjectId | アップロード者のユーザー ID |

#### OnlineChartInfo

`GET /api/maichart/{chartId}/info` と `POST /api/maichart/info` のレスポンスです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `metadata` | MaiChart | 譜面メタデータ。`summary` と同じ |
| `resources` | OnlineChartResources | 各リソースファイルの情報。未保存なら `null` |
| `levelHashes` | (string?)[] | 常に 7 項目で難易度番号を添字とします。inote テキストがない難易度は `null` |

#### OnlineChartResources

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `maidata` | OnlineChartResource? | `maidata.txt` |
| `track` | OnlineChartResource? | `track.mp3` |
| `video` | OnlineChartResource? | `bg.mp4` |
| `coverArt` | OnlineChartResource? | ジャケット原寸（`bg.jpg` を優先し、次に `bg.png`） |
| `thumbnail` | OnlineChartResource? | 256×256 の圧縮版 `bg-compress.jpg` |

#### OnlineChartResource

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `url` | string | 公開バケットの直リンク |
| `md5` | string | ファイルの MD5（小文字 16 進） |
| `sha256` | string | ファイルの SHA-256（小文字 16 進） |
| `length` | int64 | ファイルのバイト数 |

::: warning 3 つのハッシュ形式を混同しないでください
ここでの `md5`/`sha256` は**小文字 16 進**、ファイルダウンロードのレスポンスヘッダー `hash` は **SHA-256 の Base64**、譜面オブジェクトの `hash` フィールドは **MD5 の Base64** です。形式も用途も異なります。
:::

#### OnlineChartRadar

`GET /api/maichart/{chartId}/radar` のレスポンスです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `featureOrder` | string[] | 特徴名の順序。常に 7 項目 |
| `feature` | object | 特徴名から値へのマップ。最初の 6 項目は 0〜250 スケール、`fitted_constant` は定数スケール |

#### ChartChanges

`GET /api/maichart/changes` のレスポンスと、その各項目です。

| モデル | フィールド |
| --- | --- |
| `OnlineMaiChartChanges` | `to: datetime`（実際に使用した期間の終了）、`isComplete: bool`、`changes: OnlineMaiChartChange[]` |
| `OnlineMaiChartChange` | `chartId: Guid`、`kind: int`（0 追加 / 1 変更 / 2 削除）、`changedAt: datetime`、`resources: object?`（キーは `OnlineChartResources` と同じ、値は変更後のリソースまたは `null`）、`metadata: OnlineMaiChartMetadataChange?` |
| `OnlineMaiChartMetadataChange` | `tags?: string[]`、`publicTags?: string[]`。いずれも省略可能で、変更のないフィールドは現れません |

### インタラクション

#### ChartInteractSummary

`GET /api/maichart/{chartId}/interactsum` と `POST /api/maichart/interactsum` のレスポンスです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `chartId` | Guid | 譜面 ID |
| `plays` | int | ダウンロード/プレー回数 |
| `score` | int | 賛成票から反対票を引いた値 |
| `upvotes` | int | 賛成票数 |
| `downvotes` | int | 反対票数 |
| `comments` | int | 有効なコメント数（返信を含む） |
| `myVote` | int | 呼び出し元のこの譜面への票。`1` または `-1`、未投票または未サインインなら `0` |

インタラクション記録がない場合は各項目が 0 です。

#### OnlineVoteResult

`PUT /api/maichart/{chartId}/vote` と `PUT /api/comment/{commentId}/vote` が共通で使います。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `score` | int | 投票後の賛成票から反対票を引いた値 |
| `upvotes` | int? | **譜面への投票のみ**返します。コメントへの投票では存在しません |
| `downvotes` | int? | **譜面への投票のみ**返します。コメントへの投票では存在しません |
| `myVote` | int | このリクエストで保存された票。`1`、`-1`、または `0` |

::: info
`upvotes`/`downvotes` は `WhenWritingNull` による省略戦略を使うため、コメントへの投票ではこれらのキー自体が存在せず、`null` になるわけではありません。逆シリアル化では省略可能なフィールドとして扱ってください。
:::

#### OnlineComment

1 件のコメントまたは返信です。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | コメント ID |
| `chartId` | Guid? | 所属する譜面。移行前に譜面が削除された旧コメントのみ `null` |
| `chartHash` | string | 譜面の**現在の**ハッシュ。譜面が削除されると空文字列 |
| `chartTitle` | string? | 譜面をまたぐ一覧（`GET /api/comment/{commentId}`、`GET /api/account/comments`）でのみ返します。それ以外と譜面が削除された場合は**省略** |
| `parentId` | ObjectId? | 親コメント。トップレベルは `null` |
| `depth` | int | トップレベルからの深さ。トップレベルは `0` |
| `authorId` | ObjectId? | 投稿者。プレースホルダーは `null` |
| `author` | string | 投稿者のユーザー名。プレースホルダーや削除済みアカウントでは空文字列 |
| `authorProfile` | OnlineUserBrief? | 投稿者の公開プロフィール。プレースホルダーや削除済みアカウントでは `null` |
| `body` | string | 本文。プレースホルダーは空文字列 |
| `createdAt` | datetime | 投稿日時 |
| `editedAt` | datetime? | 本文の最終編集日時。未編集なら `null` |
| `deleted` | bool | 投稿者が削除済み |
| `removed` | bool | 管理者が除去済み |
| `score` | int | 賛成票から反対票を引いた値 |
| `myVote` | int | 呼び出し元の票。`1` または `-1`、未投票または未サインインなら `0` |
| `replyCount` | int | 直接の返信数（プレースホルダーを含む） |
| `replies` | OnlineComment[] | 読み込まれた返信（要求した順序）。フラットな一覧と書き込みのレスポンスでは空配列 |

#### CommentPages

| モデル | フィールド |
| --- | --- |
| `OnlineCommentPage` | `items: OnlineComment[]`（トップレベルコメント、返信は `replies` に入れ子）、`total: int`（トップレベル数、プレースホルダーを含む）、`commentCount: int`（**非推奨**）、`page: int`、`pageSize: int`（常に 20）、`sort: string` |
| `OnlineCommentThread` | `item: OnlineComment`（すべての子孫の返信を含む）、`sort: string` |
| `OnlineCommentList` | `items: OnlineComment[]`（フラット、`replies` なし）、`total: int`、`page: int`、`pageSize: int`（常に 20） |
| `OnlineCommentDeletion` | `ok: bool`（常に `true`）、`purged: bool`（物理削除なら `true`、プレースホルダー化または既にプレースホルダーなら `false`） |

::: warning 非推奨フィールド
`OnlineCommentPage.commentCount` は `[Obsolete]` 指定で Swagger でも deprecated とされ、レスポンスでは常に既定値 `0` です。`GET /api/maichart/{chartId}/interactsum` の `comments` を使ってください。
:::

#### GameClientInteraction

`ChartInteractFull` と `ChartCommentSummary` は `GET /api/maichart/{chartId}/interact` **専用**で、フィールド名は公開済みクライアントの `MajNetSongInteract` に束縛されており**変更できません**。

| ChartInteractFull フィールド | 型 | 説明 |
| --- | --- | --- |
| `isLiked` | bool | 呼び出し元が賛成したか |
| `isDisLiked` | bool | 呼び出し元が反対したか |
| `plays` | int | ダウンロード/プレー回数 |
| `likes` | string[] | 賛成したユーザーのユーザー名 |
| `disLikeCount` | int | 反対票数 |
| `comments` | ChartCommentSummary[] | 有効なコメントツリー（投稿順） |

| ChartCommentSummary フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | コメント ID |
| `sender` | string | 投稿者のユーザー名。アカウントが存在しない場合は空文字列 |
| `content` | string | 本文 |
| `timestamp` | datetime | 投稿日時 |
| `replies` | ChartCommentSummary[] | 子返信 |

::: info
本モデルは**票数を含みません**。プレースホルダーとその配下の返信は現れません。票数が必要な場合は `interactsum` を使ってください。
:::

### スコアと統計

#### OnlineMaiScore

譜面情報を内包するスコアオブジェクトで、`GET /api/account/scores` と Rating の `best` で使います。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `acc` | OnlineAccurate | `{ dx, classic }`（百分率の数値） |
| `dxScore` | int64 | DX スコア |
| `comboState` | int | `0` None / `1` FC / `2` FCPlus / `3` AP / `4` APPlus |
| `chartLevel` | int | 難易度番号 0〜6 |
| `hash` | string | 選択された譜面の MD5 Base64 |
| `levelHash` | string | スコア自身の level hash |
| `chartInfo` | OnlineMaiChart | 選択された譜面 |
| `timestamp` | datetime | 最後の送信日時 |

::: info
`hash` と `chartLevel` は**このスコアのために選ばれた譜面と難易度**を表すもので、スコア自身のフィールドではありません。スコアは `levelHash` のみを保持します。関連付けの規則は `GET /api/account/scores` を参照してください。
:::

#### OnlineAccurate

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `dx` | number | DX 達成率 |
| `classic` | number | Classic 達成率 |

#### Leaderboards

| モデル | フィールド |
| --- | --- |
| `ChartScoreSummary` | `hash: string`、`levelHashes: (string?)[]`（常に 7 項目）、`scores: ScoreSummary[][]`（常に **8** 項目。`scores[level]` が難易度 0〜6 のランキングで、最後の項目は常に空配列） |
| `LevelScoreSummary` | `levelHash: string`、`scores: ScoreSummary[]` |
| `ScoreSummary` | `player: UserProfile`（`id` と `avatarId` は設定済み、`email` は常に `null`）、`acc: number`（DX 達成率、float）、`comboState: int`、`timestamp: datetime` |

#### PlayerScoreSummary

`GET /api/account/recent` の要素です。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `title` | string | 譜面タイトル |
| `artist` | string | アーティスト |
| `designer` | string | 譜面制作者 |
| `uploader` | string | アップロード者のユーザー名 |
| `chartId` | string | 譜面 ID |
| `difficulty` | string | 難易度テキスト |
| `level` | int | 難易度番号 |
| `acc` | number | DX 達成率 |
| `comboState` | int | ComboState |
| `timestamp` | datetime | プレー日時 |

#### StatisticsAndRating

| モデル | フィールド |
| --- | --- |
| `PlayHistoryRankingEntry` | `playerId: string`、`username: string`、`totalDXScore: int64`、`totalAccDX: number`、`totalAccClassic: number`、`player: OnlineUserBrief?`（アカウントが存在しない場合は `null`） |
| `OnlineScoreSum` | `geneTime: datetime`、`players: OnlinePlayerScoreSum[]` |
| `OnlinePlayerScoreSum` | `userId: ObjectId`、`username: string`、`acc: OnlineAccurate`、`player: OnlineUserBrief?` |
| `OnlinePlayerRating` | `featureOrder: string[]`、`feature: object`、`charts: Guid[]`、`best: OnlineMaiScore[]`、`scoreCount: int`、`chartCount: int` |

::: warning `best` の型
`OnlinePlayerRating.best` は **`OnlineMaiScore[]`** で、他のスコアエンドポイントと同じ形（`chartInfo` などの完全なフィールドを含む）です。`chartId`/`level`/`acc` だけの簡略構造ではありません。
:::

`OnlinePlayerRating` の各フィールドの意味:

- `featureOrder`: 常に `note`、`peak`、`sweep`、`slide_tricky`、`slide_sequence`、`jack`、`fitted_constant`。
- `feature`: 各特徴の重み付き平均。利用できるスコアがない場合は `{}`。
- `charts`: 実際に平均へ参加した譜面 ID。同一譜面の異なる難易度は複数回現れます。
- `best`: 平均に使った「譜面 + 難易度」の明細を達成率の降順で並べたもの。
- `scoreCount`: 上位 50 件のうち実際に選ばれた「譜面 + 難易度」の数。
- `chartCount`: 実際に平均へ参加した譜面数。`scoreCount` より小さくなることがあります。

#### PlayHeatmap

`GET /api/maiscore/history/heatmap` のレスポンスです。

| モデル | フィールド |
| --- | --- |
| `PlayHistoryHeatmapResponse` | `total: int64`（全履歴の件数）、`daily: DailyCount[]` |
| `DailyCount` | `date: string`（`YYYY-MM-DD`）、`count: int` |

### プレイリストとお気に入り

#### OnlineSongCollection

`GET /api/collection/{collectionId}/songlist`、`POST /api/collection/create`、`PUT /api/collection/{collectionId}/modify` の `collection` です。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | プレイリスト ID |
| `createdBy` | string | 所有者のユーザー名。アカウントが存在しない場合は `undefined` |
| `name` | string | 名前 |
| `description` | string | 説明 |
| `visibility` | int | `0` 非公開、`1` 公開 |
| `items` | Guid[] | 譜面 ID（プレイリスト順）。削除済みの譜面は除きます |
| `count` | int | `items` の長さ |

#### OnlineDanInfo

ゲームクライアントが使うプレイリストのビューです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | プレイリスト ID |
| `name` | string | 名前 |
| `createdBy` | string | 所有者のユーザー名。アカウントが存在しない場合は `undefined` |
| `description` | string | 説明 |
| `songHashs` | string[] | 譜面ハッシュ（**綴りは元のまま**） |
| `isPlayList` | bool | プレイリストとして扱うか |
| `isForceGameover` | bool | 強制終了するか |

::: warning `songHashs` は順序を持ちません
このフィールドの型は `HashSet<string>` なので**順序は保証されず**、プレイリストの `items` と同じ順序だと仮定してはいけません。順序が必要な場合は `songlist` の `items` を使ってください。
:::

#### PlaylistListItem

<i>匿名オブジェクト</i>: `GET /api/collection/list` の要素で、対応する C# モデルはありません。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | ObjectId | プレイリスト ID |
| `name` | string | 名前 |
| `createdBy` | string | 所有者のユーザー名。アカウントが存在しない場合は `undefined` |
| `description` | string | 説明 |
| `count` | int | 保存されている譜面 ID の数（削除済みの譜面を含む） |

::: info 2 種類の count
一覧の要素の `count` は**保存されている ID の数**、`OnlineSongCollection.count` は**現在も存在する譜面の数**です。譜面を削除すると両者が異なることがあります。
:::

### イベント

#### OnlineEvent

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | string | イベント ID。大文字小文字を区別します |
| `type` | string | `outerLink`、`eventTag`、`space`、`season` |
| `asset` | string | 遷移先 |
| `src` | string | バナー画像のアドレス |
| `alt` | string | 画像の代替テキスト |
| `title` | string | タイトル |
| `category` | int | `1` 高校 / `2` 大規模大会 / `3` 個人企画 / `4` 個人大会 / `5` シーズン |
| `createDate` | datetime | 開始日時（UTC、`Z` 付き） |
| `endDate` | datetime | 終了日時（UTC、`Z` 付き） |
| `description` | string | 説明 |

#### ServerInfo

<i>匿名オブジェクト</i>: `GET /api/info` のレスポンスです。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | string | サーバーインスタンスの識別子。未設定なら空文字列 |
| `name` | string | 表示名。未設定なら空文字列 |

#### Status

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `code` | int | 業務ステータスコード |
| `message` | string | 説明 |

_例_:

```json
{
  "id": "majnet-main",
  "name": "MajdataNet"
}
```

#### AnonymousObjects

以下のレスポンスはコントローラーがインラインで構築するもので、**対応する C# モデルはありません**。フィールドは各エンドポイントの節に記載しています:

| エンドポイント | レスポンスの形 |
| --- | --- |
| `POST \`/api/account/gamesetting\`` | `{ username, userSettingJson }`。`userSettingJson` は JSON テキストの Base64 |
| `GET \`/api/maichart/hash-status\`` | `{ hash, exists, hasHistoricalScores, hasHistoricalInteract, chart }` |
| `POST \`/api/machine/register\`` | `{ id, name, description, place, remoteIP }`。`id` は筐体セッション ID |
| `GET \`/api/machine/info\`` | `{ name, description, place, remoteIP }` |
| `POST \`/api/machine/auth/request\`` | `{ requestId }` |
| `GET \`/api/machine/auth/info\`` | `{ grantee, granteeInfo: { name, description, place, remoteIP } }` |
| `GET \`/api/machine/auth/check\`` | `{ token, userInfo: UserProfile }` |
| `GET \`/api/account/session`、`GET \`/api/account/sessions\`` | [SessionInfo](#sessioninfo) を参照 |
| `PUT \`/api/collection/{collectionId}/modify\`` | `{ code, message, collection: OnlineSongCollection }` |
| `GET \`/api/collection/list\`` | [PlaylistListItem](#playlistlistitem) を参照 |
| `GET \`/api/info\`` | [ServerInfo](#serverinfo) を参照 |
