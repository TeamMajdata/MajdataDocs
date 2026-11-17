# 开始游玩

第一次启动游戏时, 程序会在[配置文件](/majdataplay/configuration/)所在目录创建 `settings.json` 和 `system-settings.json`, 并解压内置曲目. 完成[手台设置](/majdataplay/configuration/external_device)后, 就可以从选曲界面开始游玩.

## 没有手台时

没有手台也可以直接用键盘和鼠标游玩:

| 操作 | 默认输入 |
| --- | --- |
| 8 个按键 | `W` `E` `D` `C` `X` `Z` `A` `Q` |
| 1P 三角键 | 小键盘 `*` |
| 触摸区域 | 鼠标 |

键盘按键对应游戏中的 8 个按键圈位置. 如果使用手台, 按键和触摸会由手台设备提供.

## 选曲界面

| 操作 | 默认输入 |
| --- | --- |
| 切换难度 | 1 / 8 号键 |
| 切换曲目 | 3 / 6 号键 |
| 开始游戏 | 4 号键 |
| 进入练习模式 | 长按 4 号键, 听到爆炸声后松手 |
| 返回 / 离开账号 | 5 号键 (在线时按住可退出登录) |
| 打开设置 | 7 号键 |
| 排序 / 搜索 | 2 号键或 1P 三角键 |
| 刷新曲库 | 长按 1P 三角键约 3 秒 |

选曲界面的 1P 三角键会被用作排序 / 搜索; 在排序和搜索页面中需要触摸屏幕确认, 以免键盘误触.

## 游玩中

| 操作 | 默认输入 |
| --- | --- |
| 退出乐曲 | 1P 三角键, 或按设置中的副屏点击行为操作 |
| 跳过乐曲 | 按住 2、3、6、7 号键 |
| 快速重开 | 按住 3、4、5、6 号键 |
| 快速练习 | 按住 1、2、7、8 号键 |

跳过、快速重开和快速练习都需要在 `settings.json` 的 `Game` 中开启对应选项. 副屏点击行为由 `Game.GameplaySubScreenClickBehavior` 控制.

## 内置曲目

安装包自带一组原创 / 授权曲目, 位于 `MaiCharts/Original` 下, 安装后即可直接游玩. 导入自己的谱面请参考[谱面](/majdataplay/feature/chart).

## 音频建议

音频后端在 `system-settings.json` 的 `Audio.Backend` 中设置. 延迟从低到高大致为:

1. `"Asio"`: 最低延迟, 需要声卡支持 ASIO; 普通声卡可以安装 [ASIO4ALL](https://asio4all.org/about/download-asio4all/).
2. `"Wasapi"`: Windows 常用后端. 独占模式延迟较低, 但会阻止 OBS 等程序同时录音; 需要直播或录制时请关闭 `Audio.Wasapi.Exclusive`.
3. `"BassSimple"`: BASS 的默认输出方式, 兼容性较好, 延迟可能波动.
4. `"Unity"`: Unity 内置音频, 仅作为备用选项.

如果出现爆音、卡顿或音画不同步, 可以尝试:

- 在 Windows 声音控制面板中关闭所有声音增强, 并允许应用程序独占控制.
- 适当增大 `Audio.Bass` 中的缓冲区, 或降低 `Rendering.FPSLimit`.
- 使用 ASIO 时, 打开 ASIO 控制面板并适当调整缓冲区大小.
