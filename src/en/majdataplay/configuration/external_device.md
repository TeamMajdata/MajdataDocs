# External devices

:::tip
Since the software is still being updated continuously, the related options or descriptions may be outdated. If this page cannot meet your needs, you are welcome to join the QQ group `667644338` to ask questions / discuss.
:::

MajdataPlay supports common maimai controllers, including keyboard emulation, HID button rings, serial touch panels and serial / HID LEDs. In most cases the game detects the device automatically; if it cannot, specify the device manually in the `IO` section of `system-settings.json`.

## Windows / macOS / Linux

The configuration is located in `system-settings.json`:

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

`null` means auto-detect. Supported `Manufacturer` values:

| Value | Description |
| --- | --- |
| `General` | General / IO4-type devices |
| `Yuan` | Yuan controller (ADX) |
| `Dao` | Dao controller |
| `Nov` | Nov controller |
| `NPro` | NPro controller |
| `Pipe` | [External IO manager](/en/majdataplay/development/external-io-manager) |
| `null` | Auto-detect |

`IO.InputDevice.ButtonRing.Type` accepts `"Keyboard"`, `"HID"` or `"Pipe"`; when it is `null`, the button ring is treated as a keyboard by default. Common combinations:

| Controller | `Manufacturer` | `ButtonRing.Type` |
| --- | --- | --- |
| Keyboard | `General` | `Keyboard` |
| ADX / Yuan HID | `Yuan` | `HID` |
| IO4 / generic HID | `General` | `HID` |
| Dao HID (experimental) | `Dao` | `HID` |
| External IO manager | `Pipe` | `Pipe` |

## Serial ports

By default, the 1P touch panel uses `COM3` and the LED uses `COM21`; 2P uses `COM4` and `COM22` respectively. The default baud rate is `9600` for the touch panel and `115200` for the LED.

If your device is not on the default port, change:

- `IO.InputDevice.TouchPanel.SerialPortOptions.Port` / `BaudRate`
- `IO.OutputDevice.Led.SerialPortOptions.Port` / `BaudRate`

On Windows the port is written as an integer, for example `3` means `COM3`; on other platforms it is written as a string, for example `"/dev/ttyACM0"`.

## HID button ring

When you use `"HID"`, you usually also need to fill in the PID and VID. The following are the default values of some common controllers, all entered into `HidOptions` in **decimal**:

| Controller | `ProductId` (PID) | `VendorId` (VID) |
| --- | --- | --- |
| ADX / Yuan HID | `22352` | `11836` |
| IO4 / generic HID | `33` | `3235` |
| Dao HID | `4644` | `3727` |

If you do not know the PID / VID of your device, find the corresponding HID device in Windows Device Manager, open **Properties > Details** and select **Device instance path**. The `VID_xxxx` and `PID_xxxx` values in it are **hexadecimal**. Convert them to decimal first, then enter them in `system-settings.json`.

## Debounce and polling

- If a key triggers twice or "jitters", increase `IO.InputDevice.ButtonRing.DebounceThresholdMs`.
- If input feels laggy or frames drop, increase `IO.InputDevice.ButtonRing.PollingRateMs` moderately (for example to `2`); however, a value that is too large may make judgment worse.
- The touch panel and the LED also have a corresponding `PollingRateMs` / `DebounceThresholdMs` with the same structure.

## Linux permissions

If the keys and the touch panel do not respond after you connect the controller, add the current user to the `dialout` group (most distributions) or the `uucp` group (Arch Linux-based distributions), then log in again or reboot:

```bash
sudo usermod -a -G dialout,uucp $USER
```

Then add a udev rule:

```bash
sudo nano /etc/udev/rules.d/99-maicontrollers-hid.rules
```

Rule contents:

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

If the device does not match the three kinds above, change the corresponding `idVendor` (VID) and `idProduct` (PID); the values in udev rules are **hexadecimal**.

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Then unplug and replug the USB cable. Restart the game after the device is connected.

## Mobile devices

Mobile devices have no serial / HID settings like the desktop version; only one external button ring is used:

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

If your controller uses:

- keyboard input, change `"None"` to `"Keyboard"`
- gamepad input, change `"None"` to `"Gamepad"`
