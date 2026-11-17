# Play over streaming

::: warning
Streaming needs a stable Wi-Fi or wired network. The experience cannot match a native mobile rhythm game, and **it is no substitute for a real controller**.
:::

You can run MajdataPlay on a PC and forward the picture and touch events to a phone or tablet with streaming software. The `Sunshine` + `Moonlight` combination is recommended; they support low latency, high frame rates, and native touch event passthrough.

## Install Sunshine on the PC

1. Download and install Sunshine from [Sunshine Releases](https://github.com/LizardByte/Sunshine/releases).
2. Open Sunshine and follow the wizard to configure the LAN streaming service.
3. A wired network is more stable; on Android you can also use USB tethering.

> You can also use `Apollo`, a fork of Sunshine with some features changed.

## Install Moonlight on the mobile device

1. On Android, install Moonlight from [Google Play](https://play.google.com/store/apps/details?id=com.limelight); on iOS, install it from the [App Store](https://apps.apple.com/app/moonlight-game-streaming/id1000551566).
2. Pair with Sunshine in Moonlight.
3. Set the touch mode to **Native touch** or **Native touch only**.

## Optimize the touch experience

### Mobile devices

- Turn off multi-finger gestures. On iOS, enable **Guided Access** to prevent swiping up from leaving the app.
- In Moonlight, adjust the resolution, bitrate, and frame rate until you find settings the device can stream stably.

### Windows PC

The registry changes below take effect after a restart. Back up the registry before you change anything.

Disable touch gesture animations:

```text
HKEY_CURRENT_USER\Control Panel\Cursors
GestureVisualization = 0
ContactVisualization = 0
```

Windows may rewrite `GestureVisualization` at startup. To keep it, open **Permissions > Advanced** for that key in Registry Editor, disable inheritance, change the owner to Administrator, and keep only read-only permissions for Administrator.

Disable right-click on long press:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
TouchMode_hold = 0
TouchModeN_HoldTime_Animation = 0
TouchModeN_HoldTime_BeforeAnimation = 0
```

Disable edge swipes:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
Thumb_Flick_Enabled = 0
Right_Edgy_Enabled = 0
Left_Edgy_Enabled = 0
```

Disable touch prediction latency:

```text
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\TouchPrediction
Latency = 1
SampleTime = 1
```

::: warning
Do not change `TouchGate`; it turns Windows touch input off completely.
:::

## In-game settings

Increase the touch radius in `settings.json` a little so that streamed touches land more easily:

```json
"Touch": {
  "TouchSimulationRadius": 0.65
}
```

Values between `0.6` and `0.7` work well. If the picture proportions look wrong, adjust `MainScreenTransform`, `MainScreenScale`, and `MainScreenOffset` under `Rendering` in `system-settings.json`.

::: tip
When streaming, close programs such as OBS that compete for the GPU or network, and set `Rendering.FPSLimit` to a frame rate the device can receive stably.
:::
