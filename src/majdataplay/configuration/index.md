# 配置文件

::: tip
请先手动运行一次游戏. 更改设置需要在游戏关闭的情况下进行, 因此请<mark>杀后台</mark>
:::

本节展示各平台 `MajdataPlay` 的配置文件位置, 阅读配置相关文档时默认已阅读本节.

从 **2.1.0-preview6** 起, 配置拆分为两个文件, 它们位于同一目录:

- `settings.json`: **用户设置**, 包含 `Game`、`Judge`、`Display`、`Volume`、`Touch`. 登录在线账号后, 这组设置可能改为从账号读取并上传.
- `system-settings.json`: **系统设置**, 包含 `Common`、`Rendering`、`Audio`、`Encoding`、`Decoding`、`Debug`、`Network`、`IO`. 这组设置描述当前设备, 始终保存在本地.

只想调整游玩、判定或画面显示时, 通常只需修改 `settings.json`; 外接设备、渲染、网络等系统设置则位于 `system-settings.json`. 旧版只有一个 `settings.json`, 新版首次运行时会自动拆分并迁移, 详见 [配置详解](/majdataplay/configuration/configuration).

## Windows

与 `MajdataPlay.exe` 同级的目录中的 `settings.json` 和 `system-settings.json`.

## iOS

<mark>一般情况下, iOS 版本不需要手动更改配置文件. 进入`设置`, 全局搜索`MajdataPlay`或在左侧列表中找到`App`并点击进入, 然后在右侧找到`MajdataPlay`. 在那里你会找到你需要的几乎所有设置.</mark>

打开`文件`App, 在目录中选择`我的设备`(如`我的iPad`), 其中会有`MajdataPlay`文件夹, 进入后有 `settings.json` 和 `system-settings.json`. 更改文件需要使用专门的`json`编辑器, 可以在`App Store`里面搜索安装`Koder`.

## Android

- apk 文件版: `/storage/emulated/0/Documents/MajdataPlay/`
- Play 商店版: `/storage/emulated/0/Android/data/net.majdata.majdataplay/files/`

以上两个目录中均有 `settings.json` 和 `system-settings.json`. 建议使用`MT管理器`等其他带有编辑器的文件管理软件进行更改.
