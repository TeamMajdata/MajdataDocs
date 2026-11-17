# 串流游玩

::: warning
串流需要稳定的 Wi-Fi 或有线网络. 体验无法与原生移动端音游相比, **不能替代真正的手台**.
:::

可以把 MajdataPlay 运行在 PC 上, 通过串流软件把画面和触摸事件转发到手机或平板. 推荐使用 `Sunshine` + `Moonlight` 组合, 它们支持低延迟、高帧率和原生触摸事件透传.

## 在 PC 上安装 Sunshine

1. 从 [Sunshine Releases](https://github.com/LizardByte/Sunshine/releases) 下载并安装 Sunshine.
2. 打开 Sunshine, 按向导完成局域网串流服务配置.
3. 有线网络会更稳定; Android 也可以使用 USB 网络共享.

> 也可以使用 `Apollo`, 它是 Sunshine 的一个分支, 修改了一些功能.

## 在移动设备上安装 Moonlight

1. Android 从 [Google Play](https://play.google.com/store/apps/details?id=com.limelight) 安装 Moonlight; iOS 从 [App Store](https://apps.apple.com/app/moonlight-game-streaming/id1000551566) 安装.
2. 在 Moonlight 中与 Sunshine 配对.
3. 把触摸模式设置为 **原生触摸** 或 **仅原生触摸**.

## 优化触摸体验

### 移动设备

- 关闭多指手势. iOS 可以开启 **引导式访问**, 防止上滑退出应用.
- 在 Moonlight 中调整分辨率、码率和帧率, 找到设备能稳定串流的参数.

### Windows PC

以下注册表修改需要重启后生效. 修改前请先备份注册表.

关闭触摸手势动画:

```text
HKEY_CURRENT_USER\Control Panel\Cursors
GestureVisualization = 0
ContactVisualization = 0
```

Windows 启动时可能重写 `GestureVisualization`. 如需保留, 可以在注册表编辑器中打开该键的 **权限 > 高级**, 取消继承, 把所有者改为管理员, 并只保留管理员的只读权限.

关闭右键长按:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
TouchMode_hold = 0
TouchModeN_HoldTime_Animation = 0
TouchModeN_HoldTime_BeforeAnimation = 0
```

关闭边缘滑动:

```text
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Wisp\Touch
Thumb_Flick_Enabled = 0
Right_Edgy_Enabled = 0
Left_Edgy_Enabled = 0
```

关闭触摸预测延迟:

```text
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\TouchPrediction
Latency = 1
SampleTime = 1
```

::: warning
不要修改 `TouchGate`; 它会完全关闭 Windows 触摸功能.
:::

## 游戏内设置

在 `settings.json` 中适当增大触摸半径, 让串流过来的触摸更容易命中:

```json
"Touch": {
  "TouchSimulationRadius": 0.65
}
```

可以在 `0.6` 到 `0.7` 之间调整. 如果画面比例不对, 可以在 `system-settings.json` 的 `Rendering` 中调整 `MainScreenTransform`、`MainScreenScale` 和 `MainScreenOffset`.

::: tip
串流时建议关闭 OBS 等会抢占 GPU 或网络的程序, 并把 `Rendering.FPSLimit` 设置为设备能稳定接收的帧率.
:::
