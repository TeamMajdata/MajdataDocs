# New Device Support

This page is for developers who want to write a device backend in MajdataPlay for new hardware (a button ring controller, a touch panel, an LED controller, etc.).

> This document is based on the current implementation under `Assets/Scripts/IO`: `IODevice`, `HidDevice`, `SerialDevice`, `UsbDevice`, `InputStateBuffer`, `LedOutputState`, `GameDeviceManager`, and the vendor implementations (Rosen, Pipe, Dao, Nov). If a comment disagrees with the actual code, the code wins.

| Section | Content | For whom |
| --- | --- | --- |
| [1. Architecture Overview](#_1-architecture-overview) | The three-layer structure and data flow of the device layer | Everyone |
| [2. Choosing Capability Interfaces](#_2-choosing-capability-interfaces) | Button / touch / LED capability interfaces; button and sensor slot definitions | Everyone |
| [3. State Buffers](#_3-state-buffers) | How to use `InputStateBuffer` / `LedOutputState` | While writing the device class |
| [4. Choosing a Transport Base Class](#_4-choosing-a-transport-base-class) | Serial / HID / WinUSB / custom transport trade-offs | While writing the device class |
| [5. Threading Model and Lifetime](#_5-threading-model-and-lifetime) | Runtime behavior of connect, reconnect, polling and disconnect | While writing the device class |
| [6. Input Device Example: HID Button Ring](#_6-input-device-example-hid-button-ring) | A ready-to-reference HID button ring implementation | While writing the device class |
| [7. Output Device Example: Serial LED](#_7-output-device-example-serial-led) | A ready-to-reference serial LED implementation | While writing the device class |
| [8. Registering the Device](#_8-registering-the-device) | `IODetector`, vendor enum and `GameDeviceManager` registration | While wiring into the game |
| [9. Existing Implementations for Reference](#_9-existing-implementations-for-reference) | Vendor implementation quick reference and quick-testing advice | Everyone |
| [10. Appendix: Pre-refactor Adaptation](#_10-appendix-device-adaptation-before-the-io-framework-refactor) | How adaptation worked before the IO framework refactor (`fbfe11d7f`) | While maintaining old revisions |
| [11. Checklist](#_11-checklist) | Item-by-item self-check before delivery | Before shipping |

## 1. Architecture Overview

The device layer of MajdataPlay.IO consists of three parts:

| Component | Responsibility |
| --- | --- |
| `IODevice` | Abstract base class owning the connection, reconnect loop and background I/O thread lifetime |
| Transport base classes (`HidDevice` / `SerialDevice` / `UsbDevice` / `IODevice` itself) | Open, read/write and close one physical transport |
| Capability interfaces (`IButtonRingDevice` / `ITouchPanelDevice` / `ILedDevice`) | Declare the input/output capabilities a device exposes |

The data flow:

```text
Hardware → I/O background thread (Connect/Update/Parse) → InputStateBuffer.Publish
        → main-thread OnPreUpdate snapshot → InputManager.ButtonRing / InputManager.TouchPanel

Main thread OutputManager.LedDevice.WriteLeds → LedOutputState
        → I/O background thread Update reads → writes to hardware
```

Key points:

- All hardware access happens on a **dedicated background thread** (the daemon thread); the main thread only consumes snapshots and never touches hardware directly.
- One physical device may implement several capability interfaces (for example the Dao composite device implements button ring, touch and LED at once), but each device instance is snapshotted exactly once per frame by `OnPreUpdate()`.
- The player picks a backend through `Manufacturer` and the per-device switches in `MajEnv.Settings.IO`; `GameDeviceManager.Init()` instantiates and starts devices accordingly.

## 2. Choosing Capability Interfaces

Implement one or more of the following interfaces, depending on what the device provides:

| Interface | Members | Data size |
| --- | --- | --- |
| `IButtonRingDevice` | `ReadButtons(states, hadOn, hadOff)`, `IsButtonCurrentlyOn(int)` | 12 buttons |
| `ITouchPanelDevice` | `ReadTouchPanel(states, hadOn, hadOff)`, `IsSensorCurrentlyOn(int)` | 35 sensor slots |
| `ILedDevice` | `WriteLeds(ReadOnlySpan<Color> colors, byte cabinetBrightness)` | 8 ring zones + cabinet brightness |

These interfaces are `internal`. Put the implementation class under `Assets/Scripts/IO/Devices/<vendor>/` and declare it as an `internal sealed class`.

### 2.1 Button Index (`ButtonZone`)

The 12 buttons map to indices 0–11 following the `ButtonZone` enum order:

| Index | Button |
| ---: | --- |
| 0–7 | A1–A8 (the outer ring) |
| 8 | Test |
| 9 | Select P1 |
| 10 | Service |
| 11 | Select P2 |

### 2.2 Sensor Slots (35 Slots)

The touch buffer always uses 35 slots. Note that the `SensorArea` enum has a single `C` member while C1 and C2 are physically two separate sensors, so slots and enum values are not one-to-one:

| Slot | Sensor |
| ---: | --- |
| 0–7 | A1–A8 |
| 8–15 | B1–B8 |
| 16–17 | C1, C2 |
| 18–25 | D1–D8 |
| 26–33 | E1–E8 |
| 34 | Reserved by the current implementation; keep it `false` |

`InputManager.TouchPanel` merges zone C on query (any of C1/C2 pressed means C is pressed; both released means C is released). A device implementation only needs to report slots 16 and 17 faithfully.

## 3. State Buffers

Do not hand-roll state arrays inside the device class; use the existing thread-safe buffers:

- `InputStateBuffer`: input state buffer; pass the slot count to the constructor (`new(12)` for buttons, `new(35)` for touch).
- `LedOutputState`: LED output buffer; keeps the 8 ring colors and cabinet brightness, transferring output snapshots between the main thread and the I/O thread.

The `InputStateBuffer` contract:

| Method | Caller | Description |
| --- | --- | --- |
| `Publish(ReadOnlySpan<bool>)` | I/O background thread | Call once for every complete state report from the hardware; internally merges short pulses between frames into `hadOn` / `hadOff` |
| `OnPreUpdate()` | Main thread (once per frame) | Freezes the live state into the frame snapshot |
| `CopyTo(states, hadOn, hadOff)` | Main thread | Reads the frame snapshot; backs the `ReadButtons` / `ReadTouchPanel` capability methods |
| `IsCurrentlyOn(int)` | Main thread | Live query bypassing the frame snapshot; backs `IsButtonCurrentlyOn` / `IsSensorCurrentlyOn` |
| `Clear()` | On disconnect | Clears live state and marks every slot as released to prevent stuck buttons |

The standard pattern (excerpted from `RosenButtonRingDevice`):

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
If one device implements several capability interfaces (a composite device), use one `InputStateBuffer` per capability and snapshot all of them together in `OnPreUpdate()`; if report parsing needs a lock, snapshot inside the same lock. See `DaoCompositeDevice`.
:::

## 4. Choosing a Transport Base Class

| Base class | Transport | Platform | Members to implement |
| --- | --- | --- | --- |
| `SerialDevice` | Serial port | Desktop | `Parse`, optionally `OnConnected` |
| `HidDevice` | HID | Desktop | `Parse`, optionally `OnConnected` |
| `UsbDevice` | WinUSB (exclusive raw USB) | Windows only | `Parse`, optionally overrides for enumeration, endpoint and initialization |
| `IODevice` | Anything else (named pipes, gamepads, screen touch…) | Any | `Connect`, `Update`, `Parse` |

The three transport base classes already handle the connection parameters:

- `SerialDevice`: 8N1, DTR/RTS enabled, 250 ms read timeout, 2000 ms write timeout; the baud rate comes from the `IODetector` connection info;
- `HidDevice`: filters and opens by VID/PID/device name, allocates the read buffer via `GetMaxInputReportLength()`, and hands reports to `Parse` with the **Report ID already skipped**;
- `UsbDevice`: enumerates WinUSB interfaces, opens the interrupt IN endpoint (default `0x81`), disables auto-suspend, and matches devices by serial number or identifier string.

Conventions when writing your own `Connect` / `Update` (e.g. deriving from `IODevice` directly):

- `Connect`: open the hardware and return `true` on success. On failure, clean up and return `false`; do not throw (the reconnect loop treats it as a failed attempt).
- `Update`: one polling step. A read timeout means normal idle time — just return; a zero-byte read or a closed stream should throw `EndOfStreamException` so the base class triggers a reconnect.
- `Parse`: parse input reports and `Publish` them. Pipes/USB are byte streams, so you must handle coalesced packets, split packets and resynchronization after bad frames yourself.
- `Disconnect`: release handles. It is also called during cancellation, so it must be **idempotent** and able to unblock pending I/O.

## 5. Threading Model and Lifetime

`IODevice.Start()` spawns a background thread named `IO/<ClassName> Thread` that loops:

1. `Connect`; on failure wait `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC` and retry, up to `MajEnv.IO_DEVICE_RECONNECT_MAX_RETRIES` times;
2. Once connected, call `Update` in a loop, with at least `PollingInterval` between calls;
3. Any exception marks the device disconnected, calls `Disconnect` and `OnDisconnected`, then returns to step 1.

Two properties you typically override:

```csharp
protected override string DaemonThreadName => "IO/MyDevice Thread";
// Input devices usually follow the polling rate from settings; LED devices follow the refresh rate;
// return TimeSpan.Zero for devices that should drain data as fast as possible
protected override TimeSpan PollingInterval =>
    TimeSpan.FromMilliseconds(MajEnv.Settings.IO.InputDevice.ButtonRing.PollingRateMs);
```

Notes:

- `IsConnected` is maintained by the base class; consumers of the capability interfaces (such as `InputManager`) rely on it to know the device is online.
- Clear the state buffers in `OnDisconnected` so a disconnect leaves no stuck buttons or touch sensors.
- `Dispose()` cancels and joins the daemon thread non-reentrantly; you normally do not need to override it.

## 6. Input Device Example: HID Button Ring

A minimal HID button ring device:

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
            var data = reportData.Slice(1); // skip Report ID
            for (var i = 0; i < 8; i++)
                states[i] = (data[1] & (1 << i)) != 0;
            states[8] = (data[2] & 0b0000_0001) != 0;  // Test
            states[9] = (data[2] & 0b0000_0010) != 0;  // Select P1
            states[10] = (data[2] & 0b0000_0100) != 0; // Service
            states[11] = (data[2] & 0b0000_1000) != 0; // Select P2

            KeyboardHelper.ReadFunctionButtons(states); // OR in keyboard function buttons
            _buttons.Publish(states);
        }
    }
}
#endif
```

Key points:

- Wrap the whole class in `#if UNITY_STANDALONE`; mobile builds do not have these transport base classes.
- `KeyboardHelper.ReadFunctionButtons(states)` is a convention: it lets keyboard Test/Service keys fill in function buttons the device does not report.
- `Publish` once per complete report; short pulses that appear and disappear within one frame are preserved into `hadOn`/`hadOff` by `InputStateBuffer`, so judgments are not lost.

## 7. Output Device Example: Serial LED

LED devices transfer data in the opposite direction: the main thread calls `WriteLeds` to fill `LedOutputState`, and the I/O thread reads the buffer in `Update` and sends it to the hardware.

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
            _forceUpdate = true; // force a full resend after (re)connecting
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

        protected override void Parse(ReadOnlySpan<byte> data) { } // output-only device; no input reports

        static ReadOnlySpan<byte> BuildSetColorPacket(Span<byte> p, int index, Color color, float brightness)
        {
            p[0] = 0xE0;                       // frame header; define it per your hardware protocol
            p[1] = 0x11;
            p[2] = 0x01;
            p[3] = 0x05;
            p[4] = 0x31;
            p[5] = (byte)index;                // ring zone 0–7
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

Key points:

- When `Throttler` is `true`, unchanged zones are skipped; `Brightness` is multiplied into the color components during serialization. Both settings come from `OutputDevice.Led`.
- After connecting (or reconnecting) you must send a full update once, otherwise the hardware keeps whatever colors it had before the disconnect.
- Even a pure output device implements an empty `Parse` — the base class requires it, and any bytes read from the serial port must be safely ignored.

## 8. Registering the Device

### 8.1 Connection Info (`IODetector`)

The transport base classes take device parameters from the static connection info in `IODetector`. If the new device's default VID/PID, serial port, etc. differ from the existing vendors, add constants and `ConnInfo` assignment branches for it in `IODetector.Init()`, covering both the user-specified and the auto-detection paths. Existing constants for reference:

```csharp
const int GENERAL_HID_1P_VID = 3235;
const int GENERAL_HID_1P_PID = 33;
const int NOV_USB_VID = 0x3356;
const int NOV_USB_PID = 0x3003;
```

### 8.2 Vendor Option and `GameDeviceManager`

Add the new vendor to `DeviceManufacturerOption` (under `Assets/Scripts/Misc/Settings/Enums/`), then instantiate the devices in the matching `switch` branch of `GameDeviceManager.Init()`:

```csharp
case DeviceManufacturerOption.MyVendor:
    if (input.ButtonRing.Enable)
        ButtonRing = new MyButtonRingDevice();
    if (input.TouchPanel.Enable)
        TouchPanel = new RosenTouchPanelDevice(); // touch may reuse another implementation
    if (output.Led.Enable)
        LedDevice = new MyLedDevice();
    break;
```

Everything after `Init()` is automatic: `Register` de-duplicates and registers all devices, and every `IODevice` gets `Start()` called to launch its background thread; the main thread calls `GameDeviceManager.OnPreUpdate()` once per frame to snapshot every device.

Generic devices already present in `GameDeviceManager` (no registration needed):

- `ScreenTouchPanelDevice`: touchscreen input;
- `MouseTouchPanelDevice`: mouse-emulated touch.

### 8.3 Settings (`GameSetting.cs`)

If the new device needs extra configuration (sensitivities, polling rate, endpoint number, …), extend the corresponding Options class in the `IOOptions` hierarchy in `Assets/Scripts/Misc/Settings/GameSetting.cs`, and decorate it with `[Description]`, `[Range]`, etc. so the settings UI generates the entries automatically.

## 9. Existing Implementations for Reference

| Directory | Device | Transport | Capabilities |
| --- | --- | --- | --- |
| `Devices/General/` | Keyboard / gamepad / screen / mouse | Unity InputSystem, `IODevice` | Buttons, touch |
| `Devices/Rosen/` | Rosen generic serial button ring | HID + serial | Buttons, touch, LED |
| `Devices/Yuan/` | Yuan button ring | HID | Buttons |
| `Devices/Dao/` | Maimoller composite device | HID | Buttons + touch + LED (single connection) |
| `Devices/Nov/` | Nov exclusive touch (incl. FL variant) | WinUSB | Touch |
| `Devices/Pipe/` | External IO manager | Named pipes | Buttons, touch, LED |

Protocol details: see [External IO Manager](/en/majdataplay/development/external-io-manager).

::: tip Quick device testing
If you just want to check whether a new device works, you do not have to register a backend in MajdataPlay first: write an external IO manager that forwards the device data to MajdataPlay's `Pipe` device backend over named pipes. This tests the full button, touch and LED pipeline without modifying game code or recompiling; once the hardware is confirmed working, register it as a built-in backend following sections 1–9. Protocol details and reference implementations: [External IO Manager](/en/majdataplay/development/external-io-manager).
:::

## 10. Appendix: Device Adaptation Before the IO Framework Refactor

::: info Version scope
MajdataPlay revisions before commit `fbfe11d7f refactor(io): New IO framework (#338)` used the old framework described in this section. Read it if you are adapting a device for an old branch or release; for the current version follow sections 1–9 above.
:::

### 10.1 Architectural Differences

The old framework has no `IODevice` base class, no capability interfaces and no `GameDeviceManager`; all logic lives in three **static classes**:

| Static class | Responsibility | State arrays |
| --- | --- | --- |
| `InputManager.ButtonRing` | Buttons: selects a polling loop and parses reports per vendor × transport | `_buttonStates` (frame snapshot), `_buttonRealTimeStates` (live), `_isBtnHadOn(Internal)`, `_isBtnHadOff(Internal)` |
| `InputManager.TouchPanel` | Touch: same as above | `_sensorStates`, `_sensorRealTimeStates`, `_isSensorHadOn(Internal)`, `_isSensorHadOff(Internal)` |
| `OutputManager.LedDevice` | LED: selects a refresh loop and serializes reports per vendor × transport | `OutputManager._ledRingColors` (8 colors), `_cabinetLightBrightness` |

Each class starts **one dedicated long-running thread** in `Init()` via `Task.Factory.StartNew(XxxUpdateLoop, TaskCreationOptions.LongRunning)` based on a `switch` over `IODetector.DeviceManufacturer`:

- `InputManager.ButtonRing`: `KeyboardUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`
- `InputManager.TouchPanel`: `SerialPortUpdateLoop` / `PdxUpdateLoop` (Windows only) / `SlaveThreadUpdateLoop` (Dao) / `PipeUpdateLoop`
- `OutputManager.LedDevice`: `SerialPortUpdateLoop` / `HIDUpdateLoop` / `PipeUpdateLoop`

In other words, **each transport + vendor protocol pair gets a hand-written loop function**, with no reusable transport base classes.

### 10.2 Adaptation Steps

Using a new HID button ring as an example:

1. **Vendor enum**: add the new vendor to `DeviceManufacturerOption` (the old version only has `General`, `Yuan`, `Dao`, `Nov`, `Pipe`).
2. **Connection info**: add VID/PID constants in `IODetector` (e.g. `const int MY_HID_VID = ...`) and assign `ButtonRingHidConnInfo` etc. in both the user-specified and the auto-detection paths of `Init()`.
3. **Parser**: add a nested static parser class inside `InputManager.ButtonRing` with the unified signature `Parse(ReadOnlySpan<byte> reportData, Span<bool> buffer)`, writing the 12 button states into `buffer`. See `GeneralHIDDevice` (IO4 bit layout), `AdxHIDDevice` (Yuan byte layout) and `DaoHIDDevice`.
4. **Polling loop**: write `MyDeviceUpdateLoop()` and add a start branch in `Init()`'s `switch`. The loop must handle: opening the device → polling reads → calling the parser → publishing state → reconnecting after an exception.
5. **Touch/LED**: if the device has other capabilities, repeat steps 3–4 in `InputManager.TouchPanel` / `OutputManager.LedDevice` (35 sensor slots, 8 ring zones).
6. **Settings**: the settings layout is the same as today (the `IOOptions` hierarchy in `GameSetting.cs`).

### 10.3 State Publishing and Threading Conventions

The old framework has no `InputStateBuffer`; the publishing logic is written directly inside each loop and must follow these rules:

- Protect state writes with `SpinLock _syncLock` (plus the `LockDisposable` helper):
  ```csharp
  var isLocked = false;
  try
  {
      _syncLock.Enter(ref isLocked);
      for (var i = 0; i < 12; i++)
      {
          _buttonRealTimeStates[i] = state[i];
          _isBtnHadOnInternal[i] |= state[i];   // short pulses accumulate via |=
          _isBtnHadOffInternal[i] |= !state[i];
      }
  }
  finally
  {
      if (isLocked) _syncLock.Exit();
  }
  ```
  Only write the `*Internal` and `*RealTime` arrays; the public arrays (`_buttonStates`, `_isBtnHadOn`, …) are copied and the `Internal` arrays cleared by the main thread inside `OnPreUpdate()` while holding the lock — device code must **never touch them**.
- Thread name, background flag and priority follow the convention:
  ```csharp
  currentThread.Name = "IO/ButtonRing Thread"; // DAEMON_THREAD_NAME
  currentThread.IsBackground = true;
  currentThread.Priority = MajEnv.THREAD_PRIORITY_IO;
  _buttonRingUpdateLoop.RegisterAsWorker("ButtonRing I/O Worker");
  ```
- Function buttons: `UpdateKeyboardFn(fnButtons, fnBuffer)` ORs the keyboard Test/Service keys into the live state — the old equivalent of `KeyboardHelper.ReadFunctionButtons`.
- Disconnect cleanup: on loop exit, clear the live state and `Fill(true)` the entire `_isBtnHadOffInternal` array to avoid stuck buttons.

### 10.4 Reconnect and Fallback Behavior

Each old loop implements reconnection on its own, and the behavior differs from the new framework:

- The reconnect interval is likewise `MajEnv.IO_DEVICE_RECONNECT_INTERVAL_MSEC`, but there is **no maximum retry limit**.
- **A failed first attempt exits the loop and falls back**: serial touch falls back to mouse input when the port is missing, LED falls back to a dummy device, and the loop stops retrying (an `isReconnecting` flag distinguishes first connection from reconnect). When adapting a device you must decide whether to keep this strategy or always retry.
- An `IOException` triggers a disconnect: close the stream, set `IsConnected = false`, and return to the reconnect wait.

### 10.5 Composite Devices (Dao)

In the old framework, when one HID device provides both buttons and touch, it uses **two threads plus signal handshaking**: `HIDUpdateLoop` (the button thread) reads a report, calls `_ioThreadSync.SignalReadReady()`, parses buttons via `DaoHIDDevice.Parse`, then waits on `WaitReadConsumed()`; `SlaveThreadUpdateLoop` (the touch thread) waits for the read-ready signal and parses the same report via `DaoHIDTouchPanel.Parse`. For a new composite device you can simplify this to filling both sets of state arrays inside a single loop (all under the lock), letting the two static classes consume them via their own `OnPreUpdate`.

### 10.6 Exclusive Touch (Old WinUSB Path)

The old exclusive-touch code lives under `Assets/Scripts/IO/PdxTouch/`:

- `ExclusiveTouchHost`: a static slot that tries device factories in order and, while disconnected, polls via a dedicated retry thread;
- `ExclusiveTouchBase`: abstract base class with its own reader thread that opens the device via WinUSB and exposes `GetTouchState()` (a **34-bit mask** — zone C is a single bit);
- Built-in `InputLatch` anti-drop (a press+release completed between two polls is still observed) and touch-point timeout cleanup;
- `TouchSensorMapper`: maps touch-point coordinates to a bit mask over the 34 sensor polygons, supporting `TouchRadius` and per-zone (A–E) extra radii.

To adapt a new exclusive touch device: derive from `ExclusiveTouchBase`, implement `ResolveEndpoint(WinUsbIo.DevicePath)` and `OnTouchData(byte[])`, commit touch points via `HandlePresses`/`HandleReleases` inside `OnTouchData`, and add the factory to the list in `PdxUpdateLoop`. The coordinate-to-sensor geometry mapping can reuse `TouchSensorMapper` directly.

### 10.7 Protocols Are Unchanged

The **wire protocols are identical** across both frameworks: the button/sensor slot definitions in section 2, the report layouts in the section 6–7 examples, and the Pipe protocol in [External IO Manager](/en/majdataplay/development/external-io-manager) all apply to old revisions as well. Only the host-side code organization differs.

### 10.8 Old vs. New Framework

| | Old framework (pre-refactor) | New framework (current) |
| --- | --- | --- |
| Device abstraction | None; logic inlined in the `InputManager` / `OutputManager` static classes | `IODevice` base class + capability interfaces + `GameDeviceManager` registration |
| Thread management | One hand-written `XxxUpdateLoop` per vendor × transport | Unified daemon loop in `IODevice`; subclasses only implement `Connect`/`Update`/`Parse` |
| Reconnect | Implemented per loop, unlimited, first-attempt failure falls back | Implemented once in the base class, capped retries, keeps retrying |
| State buffers | Hand-written arrays + `SpinLock`, pulse accumulation in `*Internal` arrays | `InputStateBuffer` / `LedOutputState` |
| Composite devices | Two threads + `_ioThreadSync` signal handshake | One device instance implementing several capability interfaces, single loop |
| Changes needed for a new device | Vendor enum + `IODetector` + `Init`/loop/parser in three static classes | Vendor enum + `IODetector` + one device class + `GameDeviceManager` registration |

::: warning
The old-framework guide exists only for maintaining historical revisions and will not receive new features. Build new devices against the new framework (sections 1–9).
:::

## 11. Checklist

- [ ] The device class is `internal sealed`, placed under `Assets/Scripts/IO/Devices/<vendor>/`, and wrapped in `#if UNITY_STANDALONE` (or the matching platform define).
- [ ] Button states are published into a 12-slot buffer and touch states into a 35-slot buffer (slot mapping in section 2).
- [ ] `OnPreUpdate()` snapshots and `OnDisconnected()` clears the buffers.
- [ ] Input is `Publish`ed on the I/O thread; no main-thread code reads or writes hardware directly.
- [ ] `Parse` for byte-stream transports (serial, USB, pipes) handles coalesced packets, split packets and bad frames.
- [ ] `Disconnect` is idempotent and unblocks pending I/O during cancellation.
- [ ] Input buffers are cleared after reconnecting; LED colors are fully resent.
- [ ] Default connection info was added to `IODetector` (including the 1P/2P distinction).
- [ ] The device is registered per vendor in `GameDeviceManager.Init()`, and instantiated only when the matching capability switch is enabled.
- [ ] Verified on real hardware: rapid taps do not lose `hadOn`, no stuck buttons after a disconnect, reconnection recovers automatically.
