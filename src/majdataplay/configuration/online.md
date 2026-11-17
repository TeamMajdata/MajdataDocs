# 联网

::: tip
想传分打榜/记录? 想直接在游戏内游玩在线谱面? 看我吧!
:::

## Windows

打开[配置文件](/majdataplay/configuration/#windows)中的 `system-settings.json` (推荐使用[VSCode](https://code.visualstudio.com/), 改错了会有划线提示)

往下滑, 或者按`Ctrl + F`搜索`"Online"`, 来到 `Network.Online`. 默认结构如下 (可能和我有不一样的地方, 但不用管):

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

- 你需要把 `Network.Online.Enable` 的 `false` 改为 `true`
- 如果人在大陆, 并且不会使用代理, 你也许需要把 `ApiEndpoints` 中第一项的 `Url` 改为以下镜像站中之一:
  - `"https://maj.moyingmoe.top/api3/api/"`
  - `"https://maj-2.moyingmoe.top/api3/api/"`
  - `"https://maj-3.moyingmoe.top/api3/api/"`

  (受各种因素影响, 某个镜像站可能无法使用, 此时你需要再更换一个)

到此为止, 你已经完成了联网项的基础配置

- 如果你想使用代理, 并且你**很清楚这一项是怎么填写的**, 请在 `Network.Proxy` 中把 `"Enable"` 设为 `true`, 并在 `"Url"` 后用字符串写上你的代理链接
- 如果你想使用预填写账密或自动登录, 你需要修改 `ApiEndpoints` 中第一项:
  - 在 `"Username"` 后填上自己的用户名
  - 在 `"Password"` 后填上自己的密码
  - 如果想要自动登录, 请把 `"AutoLogin"` 改为 `true`

::: tip
旧版把联网设置放在 `settings.json` 的 `Online` 分类, 并分别使用 `UseProxy` / `Proxy` 键. 新版会自动迁移到 `system-settings.json` 的 `Network.Online` 与 `Network.Proxy`.
:::

## iOS

- [进入`MajdataPlay`设置](/majdataplay/configuration/#ios)
- 打开`Network`部分的`Online`选项
- 如你使用`MajdataNet`配套服务, 请点击`Majnet`进入详细配置页面
  - 在`Majnet`详细配置页面, 打开`Enabled`选项
  - 点击`API`, 如你在海外或使用海外上网环境, 选择`CF`; 否则, 请你在其他三个中任选一个, 如无法使用, 请继续更换
  - 返回`Majnet`详细配置页面, 如你想使用预填写账密或自动登录, 你需要:
    - 在`Username`和`Password`分别填写你的`MajdataNet`账号密码
    - 如果想要自动登录, 请打开`AutoLogin`选项
- 如你知道什么是自定义 API 并想使用自定义 API, 请点击`Custom`进行设置, API 如`https://majdata.net/api3/api/`

## Android

- 打开[配置文件](/majdataplay/configuration/#android)中的 `system-settings.json`
- 参照 [Windows 部分](/majdataplay/configuration/online#windows)
