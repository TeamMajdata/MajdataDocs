# 外置设备

## 移动端

::: tip
在版本`0.1.52 Build 3013`更新中, 我们优化了移动端外接手台的输入, 使用了新的设置项. 阅读本篇时, 请确保你已更新到此版本后启动过一次游戏.
:::

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
