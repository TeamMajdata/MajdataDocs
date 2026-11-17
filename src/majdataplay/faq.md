# FAQ

此处记录一些常见问题

## 为什么我的 OBS 录制不到 MajdataPlay 的声音? 为什么 MajdataPlay 会阻止其他 App 的视频音频播放?

> 请在设置中关闭 MajdataPlay 音频的独占模式

## 音频无法开始播放或没有声音怎么办？

1. 在 Windows 声音控制面板中关闭所有声音增强。
2. 允许应用程序独占控制，并把独占模式设为优先。
3. 在 `system-settings.json` 中尝试切换 `Audio.Backend`，或适当增大 `Audio.Bass` 的缓冲区。

## CPU 占用过高导致掉帧怎么办？

可以适当增大输入设备的 `PollingRateMs`（例如设为 `2`），降低轮询频率。注意这可能会让判定变差。

## 显卡占用过高导致掉帧怎么办？

1. 在显卡控制面板中调整 MajdataPlay 的图形设置。
2. 降低 `Rendering.RenderQuality`，或使用 `"Custom"` 降低 `Rendering.RenderScale`。
3. 尝试开启 `Rendering.CompatibilityMode`。

## 如何移动游戏窗口到另一个屏幕？

> 同时按下 `Alt` + `Enter` 键取消全屏, 然后使用鼠标拖动到目标屏幕, 再次同时按下 `Alt` + `Enter` 键开启全屏

## 如何查看 MajdataPlay 的日志？

1. 找到[配置文件](/majdataplay/configuration/)所在的文件夹。
2. 打开其中的 `Logs` 文件夹。
3. 使用文本编辑器打开 `MajPlayRuntime.log` 文件。

## 遇到其他问题？

1. 加入MajdataPlay QQ交流群 `667644338`。
2. 描述你遇到的问题（<mark>尽量详细</mark>）。
3. 上传日志文件。
4. 耐心等待群友解答。
