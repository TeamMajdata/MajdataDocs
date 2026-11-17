# Connect to online services

::: tip
Use online services to submit scores, join leaderboards, save records, and play online charts directly in the game.
:::

## Windows

Open `system-settings.json` from the [configuration files](/en/majdataplay/configuration/#windows). [Visual Studio Code](https://code.visualstudio.com/) is recommended because it highlights syntax errors.

Scroll down, or press `Ctrl` + `F` and search for `"Online"`, until you reach `Network.Online`. The default structure looks like this (your values may differ):

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

- Change `Network.Online.Enable` from `false` to `true`.
- If you are in mainland China and do not use a proxy, you may need to change the `Url` of the first `ApiEndpoints` entry to one of these mirrors:
  - `"https://maj.moyingmoe.top/api3/api/"`
  - `"https://maj-2.moyingmoe.top/api3/api/"`
  - `"https://maj-3.moyingmoe.top/api3/api/"`

  A mirror may occasionally be unavailable. If that happens, try another one.

You have now completed the basic online configuration.

- To use a proxy, and if you **know exactly how this option is filled in**, set `"Enable"` to `true` under `Network.Proxy` and enter the proxy URL as a string after `"Url"`.
- To prefill credentials or sign in automatically, edit the first `ApiEndpoints` entry:
  - Enter your username after `"Username"`.
  - Enter your password after `"Password"`.
  - To sign in automatically, set `"AutoLogin"` to `true`.

::: tip
Older versions stored the online settings under the `Online` category of `settings.json` and used the `UseProxy` / `Proxy` keys. The new version migrates them to `Network.Online` and `Network.Proxy` in `system-settings.json` automatically.
:::

## iOS

- [Open the MajdataPlay settings](/en/majdataplay/configuration/#ios).
- Turn on **Online** in the **Network** section.
- If you use MajdataNet, open **Majnet** to configure it:
  - Turn on **Enabled**.
  - Select **API**. Choose **CF** if you are outside mainland China or use an international network. Otherwise, choose one of the other three options. Try another option if the selected API is unavailable.
  - Return to the **Majnet** page. To prefill your credentials or sign in automatically:
    - Enter your MajdataNet username and password in **Username** and **Password**.
    - Turn on **AutoLogin** to sign in automatically.
- If you understand custom APIs and want to use one, select **Custom** and enter an API URL such as `https://majdata.net/api3/api/`.

## Android

- Open `system-settings.json` from the [configuration files](/en/majdataplay/configuration/#android).
- Follow the [Windows instructions](/en/majdataplay/configuration/online#windows).
