# 设备适配

本文说明如何在 MajdataPlay 中为一块新的外设（手台、触摸、LED 控制器等）编写设备后端。

> 本文以 `Assets/Scripts/IO` 下的实现为依据：`IODevice`、`HidDevice`、`SerialDevice`、`UsbDevice`、`InputStateBuffer`、`LedOutputState`、`GameDeviceManager` 与各厂商实现（Rosen、Pipe、Dao、Nov）。若注释与实际代码不一致，应以代码为准。

## 1. 总览

MajdataPlay.IO 的设备层由三部分组成：

| 组件 | 职责 |
| --- | --- |
| `IODevice` | 抽象基类，负责连接、重连、后台 I/O 线程的生命周期 |
| 传输基类（`HidDevice` / `SerialDevice` / `UsbDevice` / `IODevice` 本身） | 负责一种物理传输的打开、读写、断开 |
| 能力接口（`IButtonRingDevice` / `ITouchPanelDevice` / `ILedDevice`） | 声明设备对外提供的输入/输出能力 |

数据流如下：

```text
硬件 → I/O 后台线程(Connect/Update/Parse) → InputStateBuffer.Publish
     → 主线程 OnPreUpdate 快照 → InputManager.ButtonRing / InputManager.TouchPanel

主线程 OutputManager.LedDevice.WriteLeds → LedOutputState
     → I/O 后台线程 Update 读取 → 写入硬件
```

关键点：

- 所有硬件读写都发生在**独立的后台线程**（daemon thread）上，主线程只消费快照，绝不直接触碰硬件。
- 一块物理设备可以实现多个能力接口（如 Dao 的复合设备同时实现外键、触摸、LED），但每个设备实例每帧只会被 `OnPreUpdate()` 快照一次。
- 玩家通过 `MajEnv.Settings.IO` 中的 `Manufacturer` 与各设备开关选择后端，`GameDeviceManager.Init()` 据此实例化并启动设备。

## 2. 选择能力接口

按设备实际提供的能力，实现以下接口中的一个或多个：

| 接口 | 成员 | 数据规模 |
| --- | --- | --- |
| `IButtonRingDevice` | `ReadButtons(states, hadOn, hadOff)`、`IsButtonCurrentlyOn(int)` | 12 个按钮 |
| `ITouchPanelDevice` | `ReadTouchPanel(states, hadOn, hadOff)`、`IsSensorCurrentlyOn(int)` | 35 个传感器槽位 |
| `ILedDevice` | `WriteLeds(ReadOnlySpan<Color> colors, byte cabinetBrightness)` | 8 个灯区 + 柜内灯亮度 |

这些接口都是 `internal` 的，新设备的实现类应放在 `Assets/Scripts/IO/Devices/<厂商名>/` 下，并同样使用 `internal sealed class`。

### 2.1 按钮索引（`ButtonZone`）

12 个按钮按 `ButtonZone` 枚举顺序对应索引 0–11：

| 索引 | 按钮 |
| ---: | --- |
| 0–7 | A1–A8（外八键） |
| 8 | Test |
| 9 | Select P1 |
| 10 | Service |
| 11 | Select P2 |

### 2.2 传感器槽位（35 槽）

触摸缓冲固定使用 35 个槽位。注意 `SensorArea` 枚举中 C 只有一个成员，但物理上 C1、C2 是两个独立传感器，因此槽位与枚举值并不完全一一对应：

| 槽位 | 传感器 |
| ---: | --- |
| 0–7 | A1–A8 |
| 8–15 | B1–B8 |
| 16–17 | C1、C2 |
| 18–25 | D1–D8 |
| 26–33 | E1–E8 |
| 34 | 当前实现保留，置 `false` |

`InputManager.TouchPanel` 在查询时会把 C 区合并（任一按下即为按下，全部释放才视为释放），设备实现只需如实上报 16、17 两个槽位。

## 3. 状态缓冲

不要在设备类里手写状态数组，直接使用现成的线程安全缓冲：

- `InputStateBuffer`：输入状态缓冲，构造时传入槽位数（外键 `new(12)`，触摸 `new(35)`）。
- `LedOutputState`：LED 输出缓冲，保存 8 个灯区颜色与柜内灯亮度，在主线程与 I/O 线程之间传递输出快照。

`InputStateBuffer` 的协作约定：

| 方法 | 调用方 | 说明 |
| --- | --- | --- |
| `Publish(ReadOnlySpan<bool>)` | I/O 后台线程 | 硬件每产生一份完整状态就调用一次；内部会合并两帧之间的短脉冲（`hadOn` / `hadOff`） |
| `OnPreUpdate()` | 主线程（每帧一次） | 把实时状态固化为该帧快照 |
| `CopyTo(states, hadOn, hadOff)` | 主线程 | 读取帧快照，实现能力接口的 `ReadButtons` / `ReadTouchPanel` |
| `IsCurrentlyOn(int)` | 主线程 | 绕过帧快照的实时查询，实现 `IsButtonCurrentlyOn` / `IsSensorCurrentlyOn` |
| `Clear()` | 断开时 | 清空实时状态，并把所有槽位标记为“已释放”，避免卡键 |

标准写法（摘自 `RosenButtonRingDevice`）：

```csharp
internal sealed class MyButtonRingDevice : HidDevice, IButtonRingDevice
{
    readonly InputStateBuffer _buttons = new(12);

    public override void OnPreUpdate() => _buttons.OnPreUpdate();
    public void ReadButtons(Span<bool> states, Span<bool> hadOn, Span<bool> hadOff) =>
        _buttons.CopyTo(states, hadOn, hadOff);
    public bool IsButtonCurrentlyOn(int index) => _buttons.IsCurrentlyOn(index);

    protected override void OnDisconnected() => _buttons.Clear();
}
```

::: warning
如果一块设备同时实现多个能力接口（复合设备），每个能力各用一个 `InputStateBuffer`，并在 `OnPreUpdate()` 中一起快照；若报告解析需要加锁，快照也要在同一把锁内完成。参考 `DaoCompositeDevice`。
:::

## 4. 选择传输基类

| 基类 | 适用传输 | 平台 | 需要实现的成员 |
| --- | --- | --- | --- |
| `SerialDevice` | 串口 | 桌面端 | `Parse`，可选 `OnConnected` |
| `HidDevice` | HID | 桌面端 | `Parse`，可选 `OnConnected` |
| `UsbDevice` | WinUSB（独占访问的裸 USB） | 仅 Windows | `Parse`，可选重载枚举、端点、初始化 |
| `IODevice` | 其他（命名管道、手柄、屏幕触摸等） | 任意 | `Connect`、`Update`、`Parse` |

三个传输基类已经替你处理了连接参数：

- `SerialDevice`：8N1、DTR/RTS 使能、250 ms 读超时、2000 ms 写超时，波特率来自 `IODetector` 的连接信息；
- `HidDevice`：按 VID/PID/设备名过滤并打开，按 `GetMaxInputReportLength()` 分配读缓冲，报告数据以**跳过 Report ID** 后的形式交给 `Parse`；
- `UsbDevice`：枚举 WinUSB 接口、打开中断 IN 端点（默认 `0x81`）、禁用自动挂起、按序列号或标识串匹配设备。

自定义 `Connect` / `Update`（如 `IODevice` 直接派生）时的约定：

- `Connect`：打开硬件，成功返回 `true`。打开失败要清理资源后返回 `false`，不要抛出异常（重连循环会按失败处理）。
- `Update`：单次轮询。读超时属于正常空闲，返回即可；读到 0 字节或流关闭则抛出 `EndOfStreamException`，由基类触发断线重连。
- `Parse`：解析输入报文并 `Publish`。管道/USB 是字节流，必须自己处理粘包、拆包与错误帧重同步。
- `Disconnect`：释放句柄。取消过程中也会被调用，必须**幂等**且能解除阻塞中的 I/O。

## 5. 线程模型与生命周期

`IODevice.Start()` 会创建名为 `IO/<类名> Thread` 的后台线程，循环执行：

1. `Connect`，失败则等待 `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC` 后重试，最多 `MajEnv.IO_DEVICE_RECONNECT_MAX_RETRIES` 次；
2. 连接成功后循环调用 `Update`，两次调用间隔不小于 `PollingInterval`；
3. 任何异常都会标记断线、调用 `Disconnect` 与 `OnDisconnected`，随后回到第 1 步。

需要覆写的两个属性：

```csharp
protected override string DaemonThreadName => "IO/MyDevice Thread";
// 输入设备通常跟随设置中的轮询率；LED 设备跟随刷新率；需要尽快消化数据的设备返回 TimeSpan.Zero
protected override TimeSpan PollingInterval =>
    TimeSpan.FromMilliseconds(MajEnv.Settings.IO.InputDevice.ButtonRing.PollingRateMs);
```

注意事项：

- `IsConnected` 由基类维护，能力接口的使用方（如 `InputManager`）依赖它判断设备在线。
- `OnDisconnected` 中清空状态缓冲，保证断线不会残留卡键、卡触摸。
- `Dispose()` 不可重入地取消并Join后台线程，一般无需覆写。

## 6. 输入设备示例：HID 手台

一个最小可用的 HID 外键设备：

```csharp
#if UNITY_STANDALONE
using System;

namespace MajdataPlay.IO
{
    internal sealed class MyButtonRingDevice : HidDevice, IButtonRingDevice
    {
        readonly InputStateBuffer _buttons = new(12);

        public MyButtonRingDevice() : base(IODetector.ButtonRingHidConnInfo) { }

        protected override string DaemonThreadName => "IO/ButtonRing Thread";
        protected override TimeSpan PollingInterval =>
            TimeSpan.FromMilliseconds(MajEnv.Settings.IO.InputDevice.ButtonRing.PollingRateMs);

        public override void OnPreUpdate() => _buttons.OnPreUpdate();
        public void ReadButtons(Span<bool> states, Span<bool> hadOn, Span<bool> hadOff) =>
            _buttons.CopyTo(states, hadOn, hadOff);
        public bool IsButtonCurrentlyOn(int index) => _buttons.IsCurrentlyOn(index);
        protected override void OnDisconnected() => _buttons.Clear();

        protected override void Parse(ReadOnlySpan<byte> reportData)
        {
            if (reportData.Length < 9)
                return;

            Span<bool> states = stackalloc bool[12];
            states.Clear();
            var data = reportData.Slice(1); // 跳过 Report ID
            for (var i = 0; i < 8; i++)
                states[i] = (data[1] & (1 << i)) != 0;
            states[8] = (data[2] & 0b0000_0001) != 0;  // Test
            states[9] = (data[2] & 0b0000_0010) != 0;  // Select P1
            states[10] = (data[2] & 0b0000_0100) != 0; // Service
            states[11] = (data[2] & 0b0000_1000) != 0; // Select P2

            KeyboardHelper.ReadFunctionButtons(states); // 叠加键盘的功能键
            _buttons.Publish(states);
        }
    }
}
#endif
```

要点：

- 整个类包在 `#if UNITY_STANDALONE` 中；移动端没有这些传输基类。
- `KeyboardHelper.ReadFunctionButtons(states)` 是惯例：允许用键盘的 Test/Service 等键补足设备没有上报的功能键位。
- 每收到一份完整报告就 `Publish` 一次；一帧内出现又消失的短脉冲会由 `InputStateBuffer` 保留到 `hadOn`/`hadOff` 中，不会丢判定。

## 7. 输出设备示例：串口 LED

LED 设备的数据方向相反：主线程调用 `WriteLeds` 写入 `LedOutputState`，I/O 线程在 `Update` 中读取缓冲并下发硬件。

```csharp
#if UNITY_STANDALONE
using System;
using UnityEngine;

namespace MajdataPlay.IO
{
    internal sealed class MyLedDevice : SerialDevice, ILedDevice
    {
        readonly LedOutputState _output = new();
        readonly Color[] _lastColors = new Color[8];
        readonly bool _throttler;
        readonly float _brightness;
        readonly TimeSpan _pollingInterval;
        bool _forceUpdate = true;

        protected override string DaemonThreadName => "IO/Led Thread";
        protected override TimeSpan PollingInterval => _pollingInterval;

        public MyLedDevice() : base(IODetector.LedDeviceSerialConnInfo)
        {
            var options = MajEnv.Settings.IO.OutputDevice.Led;
            _brightness = Mathf.Clamp01(options.Brightness);
            _throttler = options.Throttler;
            _pollingInterval = TimeSpan.FromMilliseconds(Math.Max(0, options.RefreshRateMs));
        }

        public void WriteLeds(ReadOnlySpan<Color> colors, byte cabinetBrightness) =>
            _output.WriteLeds(colors, cabinetBrightness);

        protected override void OnConnected(CancellationToken token)
        {
            base.OnConnected(token);
            _forceUpdate = true; // 重连后强制全量下发一次
        }

        protected override void Update(CancellationToken token)
        {
            var stream = Stream ?? throw new IOException("LED serial device is disconnected.");
            Span<Color> colors = stackalloc Color[8];
            _output.ReadLeds(colors, out _);

            var needUpdate = false;
            for (var i = 0; i < colors.Length; i++)
            {
                if (!_forceUpdate && _throttler && _lastColors[i] == colors[i])
                    continue;
                stream.Write(BuildSetColorPacket(stackalloc byte[10], i, colors[i], _brightness));
                needUpdate = true;
            }
            if (needUpdate)
                colors.CopyTo(_lastColors);
            _forceUpdate = false;
        }

        protected override void Parse(ReadOnlySpan<byte> data) { } // 纯输出设备，无输入报告

        static ReadOnlySpan<byte> BuildSetColorPacket(Span<byte> p, int index, Color color, float brightness)
        {
            p[0] = 0xE0;                       // 帧头，按你的硬件协议定义
            p[1] = 0x11;
            p[2] = 0x01;
            p[3] = 0x05;
            p[4] = 0x31;
            p[5] = (byte)index;                // 灯区 0–7
            p[6] = (byte)(color.r * 255 * brightness);
            p[7] = (byte)(color.g * 255 * brightness);
            p[8] = (byte)(color.b * 255 * brightness);
            byte checksum = 0;
            for (var i = 1; i < 9; i++)
                checksum += p[i];
            p[9] = checksum;
            return p.Slice(0, 10);
        }
    }
}
#endif
```

要点：

- `Throttler` 为 `true` 时跳过未变化的灯区；`Brightness` 在序列化时乘进颜色分量，这两个设置都来自 `OutputDevice.Led`。
- 连接建立（或重连）后必须全量下发一次，否则硬件会保持断线前的颜色。
- 纯输出设备也要实现空的 `Parse`——基类要求，串口上读到的任何字节都应被安全忽略。

## 8. 注册设备

### 8.1 连接信息（`IODetector`）

传输基类从 `IODetector` 的静态连接信息中取得设备参数。若新设备的默认 VID/PID、串口号等与现有厂商不同，需要在 `IODetector.Init()` 中为它增加常量与 `ConnInfo` 赋值分支，包括用户手动指定与自动探测两条路径。现有常量示例：

```csharp
const int GENERAL_HID_1P_VID = 3235;
const int GENERAL_HID_1P_PID = 33;
const int NOV_USB_VID = 0x3356;
const int NOV_USB_PID = 0x3003;
```

### 8.2 厂商选项与 `GameDeviceManager`

在 `DeviceManufacturerOption`（`Assets/Scripts/Misc/Settings/Enums/`）中加入新厂商，然后在 `GameDeviceManager.Init()` 的对应 `switch` 中实例化设备：

```csharp
case DeviceManufacturerOption.MyVendor:
    if (input.ButtonRing.Enable)
        ButtonRing = new MyButtonRingDevice();
    if (input.TouchPanel.Enable)
        TouchPanel = new RosenTouchPanelDevice(); // 触摸可复用其他实现
    if (output.Led.Enable)
        LedDevice = new MyLedDevice();
    break;
```

`Init()` 之后的流程是自动的：`Register` 会去重登记所有设备，并为每个 `IODevice` 调用 `Start()` 启动后台线程；主线程每帧调用 `GameDeviceManager.OnPreUpdate()` 对每个设备快照一次。

`GameDeviceManager` 中已固定存在的通用设备（无需注册）：

- `ScreenTouchPanelDevice`：屏幕触摸；
- `MouseTouchPanelDevice`：鼠标模拟触摸。

### 8.3 设置项（`GameSetting.cs`）

若新设备需要额外配置（灵敏度、轮询率、端点号等），在 `Assets/Scripts/Misc/Settings/GameSetting.cs` 的 `IOOptions` 体系中扩展对应的 Options 类，并配上 `[Description]`、`[Range]` 等特性，让设置界面自动生成条目。

## 9. 现有实现参考

| 目录 | 设备 | 传输 | 能力 |
| --- | --- | --- | --- |
| `Devices/General/` | 键盘 / 手柄 / 屏幕 / 鼠标 | Unity InputSystem、`IODevice` | 外键、触摸 |
| `Devices/Rosen/` | Rosen 通用串口手台 | HID + 串口 | 外键、触摸、LED |
| `Devices/Yuan/` | Yuan 手台 | HID | 外键 |
| `Devices/Dao/` | Maimoller 复合设备 | HID | 外键 + 触摸 + LED（单连接） |
| `Devices/Nov/` | Nov 独占触摸（含 FL 变体） | WinUSB | 触摸 |
| `Devices/Pipe/` | 外部 IO 管理器 | 命名管道 | 外键、触摸、LED |

::: tip 快速测试设备
如果只想快速验证一块新设备能不能用，不必先在 MajdataPlay 中注册新后端：可以编写一个外部 IO 管理器，通过命名管道把设备数据转发给 MajdataPlay 的 `Pipe` 设备后端。这样不用改游戏代码、不用重新编译，即可测试按键、触摸与 LED 的完整链路；确认硬件工作正常后，再按第 1–9 节的流程把它注册为内置后端。协议细节与参考实现见 [外部IO管理器](/majdataplay/development/external-io-manager)。
:::

## 10. 旧版设备适配指南

::: info 版本界定
提交 `fbfe11d7f refactor(io): New IO framework (#338)` 之前的 MajdataPlay 使用本节描述的旧框架。如果你在为旧版本分支或旧 release 适配设备，请阅读本节；新版本请使用正文第 1–9 节的流程。
:::

### 10.1 架构差异

旧框架没有 `IODevice` 基类、能力接口和 `GameDeviceManager`，所有逻辑集中在三个**静态类**中：

| 静态类 | 职责 | 状态数组 |
| --- | --- | --- |
| `InputManager.ButtonRing` | 外键：按厂商×传输选择轮询循环并解析报文 | `_buttonStates`（帧快照）、`_buttonRealTimeStates`（实时）、`_isBtnHadOn(Internal)`、`_isBtnHadOff(Internal)` |
| `InputManager.TouchPanel` | 触摸：同上 | `_sensorStates`、`_sensorRealTimeStates`、`_isSensorHadOn(Internal)`、`_isSensorHadOff(Internal)` |
| `OutputManager.LedDevice` | LED：按厂商×传输选择刷新循环并序列化报文 | `OutputManager._ledRingColors`（8 色）、`_cabinetLightBrightness` |

每个类在 `Init()` 里根据 `IODetector.DeviceManufacturer` 的 `switch` 分支，用 `Task.Factory.StartNew(XxxUpdateLoop, TaskCreationOptions.LongRunning)` 启动**一条专用的长运行线程**：

- `InputManager.ButtonRing`：`KeyboardUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`
- `InputManager.TouchPanel`：`SerialPortUpdateLoop` / `PdxUpdateLoop`（仅 Windows）/ `SlaveThreadUpdateLoop`（Dao）/ `PipeUpdateLoop`
- `OutputManager.LedDevice`：`SerialPortUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`

也就是说，**“一种传输 + 一种厂商协议”对应一个手写的循环函数**，没有可复用的传输基类。

### 10.2 适配步骤

以新增一个 HID 外键设备为例：

1. **厂商枚举**：在 `DeviceManufacturerOption` 中加入新厂商（旧版只有 `General`、`Yuan`、`Dao`、`Nov`、`Pipe`）。
2. **连接信息**：在 `IODetector` 中加入 VID/PID 常量（如 `const int MY_HID_VID = ...`），并在 `Init()` 的用户手动指定与自动探测两条路径中为 `ButtonRingHidConnInfo` 等属性赋值。
3. **解析器**：在 `InputManager.ButtonRing` 内新增嵌套静态解析类，签名统一为 `Parse(ReadOnlySpan<byte> reportData, Span<bool> buffer)`，从 `buffer`（12 个按钮）输出状态。参考 `GeneralHIDDevice`（IO4 位布局）、`AdxHIDDevice`（Yuan 字节布局）、`DaoHIDDevice`。
4. **轮询循环**：编写 `MyDeviceUpdateLoop()`，并在 `Init()` 的 `switch` 中加入启动分支。循环内自行完成：打开设备 → 轮询读取 → 调用解析器 → 发布状态 → 异常断线后重连。
5. **触摸/LED**：如设备还有其他能力，分别到 `InputManager.TouchPanel` / `OutputManager.LedDevice` 重复第 3–4 步（35 槽传感器、8 灯区）。
6. **设置项**：旧版设置结构相同（`GameSetting.cs` 的 `IOOptions` 体系）。

### 10.3 状态发布与线程约定

旧框架没有 `InputStateBuffer`，发布逻辑直接写在各循环里，必须遵守：

- 用 `SpinLock _syncLock`（配合 `LockDisposable`）保护状态写入：

  ```csharp
  var isLocked = false;
  try
  {
      _syncLock.Enter(ref isLocked);
      for (var i = 0; i < 12; i++)
      {
          _buttonRealTimeStates[i] = state[i];
          _isBtnHadOnInternal[i] |= state[i];   // 短脉冲靠 |= 累积
          _isBtnHadOffInternal[i] |= !state[i];
      }
  }
  finally
  {
      if (isLocked) _syncLock.Exit();
  }
  ```

  只写 `*Internal` 与 `*RealTime` 数组；公共数组（`_buttonStates`、`_isBtnHadOn` 等）由主线程 `OnPreUpdate()` 在锁内拷贝并清空 `Internal` 数组，设备代码**不得触碰**。
- 线程名、后台与优先级按惯例设置：

  ```csharp
  currentThread.Name = "IO/ButtonRing Thread"; // DAEMON_THREAD_NAME
  currentThread.IsBackground = true;
  currentThread.Priority = MajEnv.THREAD_PRIORITY_IO;
  _buttonRingUpdateLoop.RegisterAsWorker("ButtonRing I/O Worker");
  ```

- 功能键叠加：`UpdateKeyboardFn(fnButtons, fnBuffer)` 把键盘的 Test/Service 等键位 `|=` 进实时状态，等价新框架的 `KeyboardHelper.ReadFunctionButtons`。
- 断线清理：退出轮询时清空实时状态，并把 `_isBtnHadOffInternal` 全部 `Fill(true)`，避免卡键。

### 10.4 重连与回退行为

旧框架的每个循环各自实现重连，行为与新框架不同：

- 重连间隔同样是 `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC`，但**没有最大重试次数限制**。
- **首次尝试失败会直接退出循环并回退**：串口触摸找不到端口回退到鼠标输入，LED 回退到虚拟设备，且循环不再重试（`isReconnecting` 标记区分首连与重连）。适配新设备时需要决定采用相同策略还是始终重试。
- `IOException` 触发断线：关闭流、`IsConnected = false`、回到重连等待。

### 10.5 复合设备（Dao）的特殊处理

旧框架中一块 HID 设备同时提供外键和触摸时，采用**双线程 + 信号握手**：`HIDUpdateLoop`（按钮线程）读 到报告后先调用 `_ioThreadSync.SignalReadReady()`，由 `DaoHIDDevice.Parse` 解析按钮，再等待 `WaitReadConsumed()`；`SlaveThreadUpdateLoop`（触摸线程）等待读就绪信号后用 `DaoHIDTouchPanel.Parse` 解析同一份报告。新适配复合设备时，可以简化为在单循环内同时填充两套状态数组（注意都在锁内），再由两个静态类的 `OnPreUpdate` 各自消费。

### 10.6 独占触摸（旧版 WinUSB 路径）

旧版的独占触摸代码位于 `Assets/Scripts/IO/PdxTouch/`：

- `ExclusiveTouchHost`：静态槽位，按工厂顺序尝试设备，未连接时由独立重试线程轮询；
- `ExclusiveTouchBase`：抽象基类，自带读线程，通过 WinUSB 打开设备，对外提供 `GetTouchState()`（**34 位掩码**，C 区只有一位）；
- 内置 `InputLatch` 防吃键（两次轮询之间完成的按下+抬起也会被读到）与触点超时清理；
- `TouchSensorMapper`：把触点坐标按 34 个传感器多边形映射成位掩码，支持 `TouchRadius` 与 A–E 区额外半径。

新适配独占触摸设备：继承 `ExclusiveTouchBase`，实现 `ResolveEndpoint(WinUsbIo.DevicePath)` 与 `OnTouchData(byte[])`，在 `OnTouchData` 中调用 `HandlePresses`/`HandleReleases` 提交触点，并把它加入 `PdxUpdateLoop` 中的工厂列表。坐标到传感器的几何映射可直接复用 `TouchSensorMapper`。

### 10.7 协议不变

新旧框架的**线上协议完全一致**，本文件第 2 节的按钮/传感器槽位定义、第 6–7 节示例中的报文布局，以及 [外部IO管理器](/majdataplay/development/external-io-manager) 的 Pipe 协议，在旧版本上同样适用。差异只在宿主侧代码的组织方式。

### 10.8 新旧框架对照

| | 旧框架（重构前） | 新框架（现行） |
| --- | --- | --- |
| 设备抽象 | 无，逻辑内联在 `InputManager` / `OutputManager` 静态类中 | `IODevice` 基类 + 能力接口 + `GameDeviceManager` 注册 |
| 线程管理 | 每个厂商×传输一个手写 `XxxUpdateLoop` | `IODevice` 统一 daemon 循环，子类只实现 `Connect`/`Update`/`Parse` |
| 重连 | 各循环自行实现，无上限，首连失败即回退 | 基类统一实现，有最大重试次数，失败持续重试 |
| 状态缓冲 | 手写数组 + `SpinLock`，`*Internal` 数组累积脉冲 | `InputStateBuffer` / `LedOutputState` |
| 复合设备 | 双线程 + `_ioThreadSync` 信号握手 | 一个设备实例实现多个能力接口，单循环 |
| 新增设备的改动点 | 厂商枚举 + `IODetector` + 三个静态类的 `Init`/循环/解析器 | 厂商枚举 + `IODetector` + 一个设备类 + `GameDeviceManager` 注册 |

::: warning
旧框架的适配说明仅用于维护历史版本，不再随新功能更新。新设备建议面向新框架（第 1–9 节）开发。
:::

## 11. 检查表

- [ ] 设备类为 `internal sealed`，放在 `Assets/Scripts/IO/Devices/<厂商>/` 下，整体包在 `#if UNITY_STANDALONE`（或对应平台宏）中。
- [ ] 按钮状态发布到 12 槽缓冲，触摸发布到 35 槽缓冲（槽位映射见第 2 节）。
- [ ] `OnPreUpdate()` 快照、`OnDisconnected()` 清空缓冲。
- [ ] 输入在 I/O 线程 `Publish`，任何主线程代码不直接读写硬件。
- [ ] 字节流传输（串口、USB、管道）的 `Parse` 能处理粘包、拆包与错误帧。
- [ ] `Disconnect` 幂等，取消时能解除阻塞的 I/O。
- [ ] 重连后输入缓冲已清空，LED 全量重发。
- [ ] `IODetector` 中补充了默认连接信息（含 1P/2P 区分）。
- [ ] `GameDeviceManager.Init()` 中按厂商注册，且仅在对应能力开关启用时实例化。
- [ ] 使用真实硬件验证：连击不丢 `hadOn`、断线后无卡键、重连自动恢复。
