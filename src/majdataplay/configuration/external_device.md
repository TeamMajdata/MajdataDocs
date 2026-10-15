# 外置设备

:::tip
由于软件版本仍在不停更新中，相关选项或描述存在过时的可能，若本页无法满足您的需求，欢迎加入QQ交流群`667644338`询问/探讨
:::

## Windows/Mac/Linux端

对于Windows/Mac/Linux端，我们提供了多种多样的接入方式，并加入了自动检测的功能

一般情况下，您无需修改配置文件，游戏会自动识别您的输入方式，当然您也可以自行在`settings.json`中更改相关设置

[打开`settings.json`](/majdataplay/configuration/), 滑动到最下方, IO 设置默认如下:

``` json
"IO": {
    "Manufacturer": null,
```
我们支持的值如下：
- `General`	通用
- `Yuan` 源台
- `Dao`	Dao台
- `Nov`	Nov台
- `null` 自动识别
- `Pipe` [外部IO管理器](/majdataplay/development/external-io-manager)


## 移动端

[打开`settings.json`](/majdataplay/configuration/), 滑动到最下方, IO 设置默认如下:

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

如你的手台使用:

- 键盘输入, 请将`"None"`更改为`"Keyboard"`
- 手柄输入, 请将`"None"`更改为`"Gamepad"`
