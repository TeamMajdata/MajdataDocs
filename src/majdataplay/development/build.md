# 编译 MajdataPlay

MajdataPlay 是 Unity 项目，必须使用 Unity Editor 编译。仓库根目录中的 `.slnx` 和 `.csproj` 文件由 Unity 生成，不能使用 `dotnet build` 或 Visual Studio 的普通 .NET 构建功能生成可运行的游戏。

## 准备开发环境

编译前需要安装：

- [Git](https://git-scm.com/downloads)
- [Unity Hub](https://unity.com/download)
- `ProjectSettings/ProjectVersion.txt` 中指定的 Unity Editor 版本
- 目标平台对应的 Unity 构建支持模块

当前项目使用 Unity `6000.3.17f1`。项目升级后，请以 `ProjectSettings/ProjectVersion.txt` 中的版本为准。在 Unity Hub 的 **Installs** 页面中安装该版本，再通过 **Add modules** 添加需要的模块。

| 目标平台 | 需要的模块或工具 |
| --- | --- |
| Windows | Windows Build Support |
| Linux | Linux Build Support |
| macOS | Mac Build Support |
| Android | Android Build Support，包括 Android SDK & NDK Tools 和 OpenJDK |
| iOS | iOS Build Support；生成应用还需要 macOS 和 Xcode |

## 拉取完整代码

仓库使用 Git 子模块管理部分依赖。克隆时加上 `--recurse-submodules`：

```bash
git clone --recurse-submodules https://github.com/LingFeng-bbben/MajdataPlay.git
cd MajdataPlay
```

如果已经克隆了仓库，运行：

```bash
git submodule sync --recursive
git submodule update --init --recursive
```

## 在 Unity Editor 中编译

1. 在 Unity Hub 中选择 **Add > Add project from disk**，然后选择包含 `Assets`、`Packages` 和 `ProjectSettings` 的仓库根目录。
2. 使用 `ProjectSettings/ProjectVersion.txt` 指定的 Editor 版本打开项目。首次打开时，等待 Unity 完成包恢复和资源导入。
3. 打开 **File > Build Profiles**。
4. 选择现有的目标平台配置，或选择 **Add Build Profile** 新建配置，然后点击 **Switch Profile**。
5. 保留项目已配置的 Scene List，点击 **Build**，并将输出保存到仓库外或已忽略的目录，例如 `Builds/Windows`。

Windows 和 Linux 版本必须连同整个输出目录一起使用，不要只复制可执行文件。

### 编译 Android 版本

在 Android Build Profile 中：

- 本地安装和测试时，保持 **Build App Bundle (Google Play)** 关闭，生成 APK。
- 发布到 Google Play 时，开启 **Build App Bundle (Google Play)** 生成 AAB，并配置自己的签名密钥。
- 如果本地测试时遇到 keystore 错误，在 **Player Settings > Publishing Settings** 中取消使用项目发布密钥，或改用自己的 keystore。仓库不包含官方发布密钥。

### 编译 iOS 版本

Unity 的 **Build** 操作会生成 Xcode 工程，不会直接生成 IPA。在 macOS 中使用 Xcode 打开生成的 `Unity-iPhone.xcodeproj`，选择开发团队并完成签名设置后，再构建到设备或归档。

## 使用命令行编译

仓库的 `MajdataPlay.Editor.CustomBuild` 提供了与持续集成一致的命令行入口。以 Windows Release 版本为例，在仓库根目录中运行：

```powershell
& '<Unity Editor 路径>\Editor\Unity.exe' `
  -batchmode `
  -quit `
  -projectPath (Get-Location) `
  -executeMethod MajdataPlay.Editor.CustomBuild.BuildRelease `
  -buildTarget StandaloneWindows64 `
  -customBuildPath "$PWD\Builds\Windows\MajdataPlay.exe" `
  -customBuildName MajdataPlay `
  -logFile -
```

将 `<Unity Editor 路径>` 替换为 Unity Hub 中该 Editor 版本的安装目录。需要 Development Build 时，将 `BuildRelease` 替换为 `BuildDebug`。其他平台使用 Unity 的 BuildTarget 名称，例如 `StandaloneLinux64`、`StandaloneOSX`、`Android` 或 `iOS`。

## 排查编译问题

- 出现类型或命名空间缺失时，先确认 Git 子模块已递归初始化，再等待 Unity 完成包恢复。
- **Build Profiles** 中没有目标平台时，返回 Unity Hub 为当前 Editor 安装对应的 Build Support 模块。
- 命令行编译失败时，查看命令行中的 Unity 日志；在 Editor 中编译时，查看 **Window > General > Console** 中的第一个错误。
- 更换 Unity 版本可能会重写项目资源和配置。开发时应使用 `ProjectSettings/ProjectVersion.txt` 指定的版本。
