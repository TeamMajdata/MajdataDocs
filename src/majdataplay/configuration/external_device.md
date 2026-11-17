# 外置设备

:::tip
由于软件版本仍在不停更新中，相关选项或描述存在过时的可能，若本页无法满足您的需求，欢迎加入QQ交流群`667644338`询问/探讨
:::

MajdataPlay 支持常见的 maimai 手台, 包括键盘模拟、HID 按键圈、串口触摸屏和串口 / HID LED. 大多数情况下游戏会自动识别设备; 无法识别时, 请在 `system-settings.json` 的 `IO` 节中手动指定.

## Windows / macOS / Linux

配置位于 `system-settings.json`:

```json
"IO": {
  "Manufacturer": "General",
  "Player": 1,
  "InputDevice": {
    "ButtonRing": {
      "Type": "HID",
      "Debounce": true,
      "PollingRateMs": 2,
      "DebounceThresholdMs": 5,
      "HidOptions": {
        "ProductId": 33,
        "VendorId": 3235
      }
    },
    "TouchPanel": {
      "SerialPortOptions": {
        "Port": 3,
        "BaudRate": 9600
      }
    }
  },
  "OutputDevice": {
    "Led": {
      "SerialPortOptions": {
        "Port": 21,
        "BaudRate": 115200
      }
    }
  }
}
```

`null` 表示自动识别. 支持的 `Manufacturer` 值:

| 值 | 说明 |
| --- | --- |
| `General` | 通用 / IO4 类设备 |
| `Yuan` | 源台 (ADX) |
| `Dao` | Dao 台 |
| `Nov` | Nov 台 |
| `NPro` | NPro 台 |
| `Pipe` | [外部 IO 管理器](/majdataplay/development/external-io-manager) |
| `null` | 自动识别 |

`IO.InputDevice.ButtonRing.Type` 可选 `"Keyboard"`、`"HID"` 或 `"Pipe"`; `null` 时按键圈默认按键盘处理. 常见组合:

| 手台 | `Manufacturer` | `ButtonRing.Type` |
| --- | --- | --- |
| 键盘 | `General` | `Keyboard` |
| ADX / 源台 HID | `Yuan` | `HID` |
| IO4 / 通用 HID | `General` | `HID` |
| Dao HID (实验性) | `Dao` | `HID` |
| 外部 IO 管理器 | `Pipe` | `Pipe` |

## 串口

默认情况下, 1P 的触摸屏使用 `COM3`, LED 使用 `COM21`; 2P 分别使用 `COM4` 和 `COM22`. 触摸屏默认波特率为 `9600`, LED 默认波特率为 `115200`.

如果设备不在默认端口, 请修改:

- `IO.InputDevice.TouchPanel.SerialPortOptions.Port` / `BaudRate`
- `IO.OutputDevice.Led.SerialPortOptions.Port` / `BaudRate`

Windows 下端口写作整数, 例如 `3` 表示 `COM3`; 其他平台写作字符串, 例如 `"/dev/ttyACM0"`.

## HID 按键圈

使用 `"HID"` 时通常还需要填写 PID 和 VID. 以下是一些常见手台的默认值, 均以**十进制**填入 `HidOptions`:

| 手台 | `ProductId` (PID) | `VendorId` (VID) |
| --- | --- | --- |
| ADX / 源台 HID | `22352` | `11836` |
| IO4 / 通用 HID | `33` | `3235` |
| Dao HID | `4644` | `3727` |

如果你不知道设备的 PID / VID, 可以在 Windows 设备管理器中找到对应 HID 设备, 打开 **属性 > 详细信息**, 选择 **设备实例路径**, 其中的 `VID_xxxx` 和 `PID_xxxx` 是**十六进制**. 请先把它们换算成十进制, 再填入 `system-settings.json`.

## 去抖与轮询

- 如果感觉按键触发两次或“震键”, 增大 `IO.InputDevice.ButtonRing.DebounceThresholdMs`.
- 如果感觉输入卡顿或掉帧, 适当增大 `IO.InputDevice.ButtonRing.PollingRateMs` (例如 `2`); 但过大的值可能让判定变差.
- 触摸屏和 LED 也有对应的 `PollingRateMs` / `DebounceThresholdMs`, 结构相同.

## Linux 权限

如果连接手台后按键和触摸屏没有反应, 请把当前用户加入 `dialout` 组 (大多数发行版) 或 `uucp` 组 (Arch Linux 系), 然后重新登录或重启:

```bash
sudo usermod -a -G dialout,uucp $USER
```

再添加 udev 规则:

```bash
sudo nano /etc/udev/rules.d/99-maicontrollers-hid.rules
```

规则内容:

```
KERNEL=="ttyACM[0-9]*", MODE="0666", GROUP="dialout"
KERNEL=="ttyUSB[0-9]*", MODE="0666", GROUP="dialout"
# General IO4 Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0ca3", ATTRS{idProduct}=="0021", GROUP="plugdev", MODE="0660"
# ADX Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="2e3c", ATTRS{idProduct}=="5750", GROUP="plugdev", MODE="0660"
# Dao Controller
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0e8f", ATTRS{idProduct}=="1224", GROUP="plugdev", MODE="0660"
```

如果设备与上面三类不一致, 请修改对应的 `idVendor` (VID) 和 `idProduct` (PID); udev 规则中的值是**十六进制**.

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

然后重新插拔 USB 数据线. 连接成功后请重启游戏.

## 移动端

移动端没有桌面端的串口 / HID 设置, 只会使用一个外接按键圈:

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

如你的手台使用:

- 键盘输入, 请将 `"None"` 更改为 `"Keyboard"`
- 手柄输入, 请将 `"None"` 更改为 `"Gamepad"`
