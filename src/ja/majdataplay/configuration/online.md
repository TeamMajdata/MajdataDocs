# オンラインサービスへの接続

::: tip
オンラインサービスを利用すると、スコアの送信、ランキングへの参加、記録の保存、オンライン譜面のゲーム内での直接プレイが可能になります。
:::

## Windows

[設定ファイル](/ja/majdataplay/configuration/#windows)から `system-settings.json` を開いてください。構文エラーを強調表示してくれる [Visual Studio Code](https://code.visualstudio.com/) の使用をおすすめします。

下にスクロールするか、`Ctrl` + `F` を押して `"Online"` を検索し、`Network.Online` まで移動してください。デフォルトの構造は次のとおりです (値は環境によって異なる場合があります)。

```json
"Network": {
  "Online": {
    "Enable": false,
    "ApiEndpoints": [
      {
        "Name": "MajdataNET",
        "Url": "https://majdata.net/api3/api/",
        "Username": "YourUsername",
        "Password": "YourPassword",
        "AutoLogin": false
      }
    ],
    "Machine": {
      "Name": "MajdataPlay Client",
      "Description": "MajdataPlay Client QR Code Authentication"
    }
  },
  "Proxy": {
    "Enable": true,
    "Url": ""
  }
}
```

- `Network.Online.Enable` を `false` から `true` に変更します。
- 中国本土にお住まいでプロキシを使用しない場合は、最初の `ApiEndpoints` エントリの `Url` を次のミラーのいずれかに変更する必要があるかもしれません。
  - `"https://maj.moyingmoe.top/api3/api/"`
  - `"https://maj-2.moyingmoe.top/api3/api/"`
  - `"https://maj-3.moyingmoe.top/api3/api/"`

  ミラーは一時的に利用できなくなることがあります。その場合は別のミラーを試してください。

これでオンラインの基本設定は完了です。

- プロキシを使用する場合で、**このオプションの記入方法を正確に把握している**場合は、`Network.Proxy` の `"Enable"` を `true` に設定し、`"Url"` の後にプロキシ URL を文字列として入力してください。
- 認証情報を事前入力する、または自動サインインする場合は、最初の `ApiEndpoints` エントリを編集します。
  - `"Username"` の後にユーザー名を入力します。
  - `"Password"` の後にパスワードを入力します。
  - 自動サインインする場合は、`"AutoLogin"` を `true` に設定します。

::: tip
旧バージョンでは、オンライン設定を `settings.json` の `Online` カテゴリに保存し、`UseProxy` / `Proxy` キーを使用していました。新バージョンでは、これらを `system-settings.json` の `Network.Online` と `Network.Proxy` に自動で移行します。
:::

## iOS

- [MajdataPlay の設定を開く](/ja/majdataplay/configuration/#ios)
- **ネットワーク**セクションの **オンライン** をオンにします。
- MajdataNet を使用する場合は、**Majnet** を開いて設定します。
  - **有効** をオンにします。
  - **API** を選択します。中国本土以外にいる場合や国際的なネットワークを使用している場合は **CF** を選択してください。それ以外の場合は、ほかの 3 つのいずれかを選択してください。選択した API が利用できない場合は、別のオプションを試してください。
  - **Majnet** ページに戻ります。認証情報を事前入力する、または自動サインインするには、次のようにします。
    - **ユーザー名**と**パスワード**に、MajdataNet のユーザー名とパスワードをそれぞれ入力します。
    - **AutoLogin** をオンにすると自動でサインインします。
- カスタム API を理解していて使用したい場合は、**カスタム** を選択し、`https://majdata.net/api3/api/` のような API URL を入力してください。

## Android

- [設定ファイル](/ja/majdataplay/configuration/#android)から `system-settings.json` を開きます。
- [Windows の手順](/ja/majdataplay/configuration/online#windows)に従います。
