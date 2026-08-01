# Connect to online services

::: tip
Use online services to submit scores, join leaderboards, save records, and play online charts directly in the game.
:::

## Windows

Open the [configuration file](/en/majdataplay/configuration/#windows). [Visual Studio Code](https://code.visualstudio.com/) is recommended because it highlights syntax errors.

Scroll down, or press `Ctrl` + `F` and search for `Online`, until you reach the section shown below. Your values may look different.

![The Online section in settings.json](/majdataplay/configuration/online/initial_configuration.png)

- Change `"Enable": false,` to `"Enable": true,`.
- If you are in mainland China and do not use a proxy, you may need to set `"Url"` to one of these mirrors:
  - `"https://maj.moyingmoe.top/api3/api/"`
  - `"https://maj-2.moyingmoe.top/api3/api/"`
  - `"https://maj-3.moyingmoe.top/api3/api/"`

  A mirror may occasionally be unavailable. If that happens, try another one.

You have now completed the basic online configuration.

- To use a proxy, change `"UseProxy": false,` to `"UseProxy": true,` and enter the proxy URL as a string after `"Proxy"`. Only change this option if you know the correct value for your proxy.
- To prefill credentials or sign in automatically:
  - Enter your username after `"Username"`.
  - Enter your password after `"Password"`.
  - To sign in automatically, set `"AutoLogin"` to `true`.

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

- Open the [configuration file](/en/majdataplay/configuration/#android).
- Follow the [Windows instructions](/en/majdataplay/configuration/online#windows).
