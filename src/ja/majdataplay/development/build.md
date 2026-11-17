# MajdataPlay のビルド

MajdataPlay は Unity プロジェクトであるため、Unity Editor でビルドする必要があります。リポジトリルートの `.slnx` と `.csproj` は Unity が生成するファイルです。`dotnet build` や Visual Studio の通常の .NET ビルド機能では、実行可能なゲームを生成できません。

## 開発環境の準備

ビルド前に、次のソフトウェアをインストールしてください。

- [Git](https://git-scm.com/downloads)
- [Unity Hub](https://unity.com/download)
- `ProjectSettings/ProjectVersion.txt` で指定されている Unity Editor のバージョン
- 対象プラットフォーム用の Unity ビルドサポートモジュール
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)（Android の Java バインディング生成にのみ使用し、Unity プロジェクトのビルドには使用しません）

現在のプロジェクトは Unity `6000.3.17f1` を使用しています。プロジェクトをアップグレードした場合は、`ProjectSettings/ProjectVersion.txt` に記載されたバージョンを使用してください。Unity Hub の **Installs** ページでそのバージョンをインストールし、**Add modules** から必要なモジュールをインストールします。

| 対象プラットフォーム | 必要なモジュールまたはツール |
| --- | --- |
| Windows | Windows Build Support |
| Linux | Linux Build Support |
| macOS | Mac Build Support |
| Android | Android Build Support（Android SDK & NDK Tools と OpenJDK を含む） |
| iOS | iOS Build Support。アプリの生成には macOS と Xcode も必要です |

## リポジトリ全体のクローン

リポジトリは一部の依存関係を Git サブモジュールで管理しています。クローン時には `--recurse-submodules` を指定してください。

```bash
git clone --recurse-submodules https://github.com/LingFeng-bbben/MajdataPlay.git
cd MajdataPlay
```

すでにクローン済みの場合は、次のコマンドを実行してください。

```bash
git submodule sync --recursive
git submodule update --init --recursive
```

## Android の Java バインディングの生成

Android のストレージバックエンドは、ローカルでコンパイルした Java wrapper DLL を使用します。初めて Unity にプロジェクトをインポートする前に、リポジトリルートで次を実行してください。

```powershell
dotnet run --project Tools/CSharp/AndroidJavaWrapperGenerator/AndroidJavaWrapperGenerator.csproj -- --project . --unity-data "C:/Program Files/Unity Editors/6000.3.17f1/Editor/Data" --no-docs
```

`--unity-data` には、使用する Unity Editor の `Editor/Data` ディレクトリを指定します。Android SDK を別途インストールしている場合は、`--sdk` で指定してください。生成器はソースを `Tools/AndroidJavaWrapper/src` に書き出し、ビルド成功後に `MajdataPlay.Platform.Android.Runtime.dll` を `Assets/Plugins/MajdataPlay/Platform/Android` に配置します。

Unity で **Tools > MajdataPlay > Android > Regenerate Java wrappers** を実行することもできます。出力先の管理、キャンセル、セットアップについては `Assets/Plugins/MajdataPlay/Platform/Android/README.md` を、部分的な拡張と Java バインディングを再生成せずに DLL を再ビルドする方法については `Tools/AndroidJavaWrapper/README.md` を参照してください。

## Unity Editor でのビルド

1. Unity Hub で **Add > Add project from disk** を選択し、`Assets`、`Packages`、`ProjectSettings` を含むリポジトリルートを選びます。
2. `ProjectSettings/ProjectVersion.txt` で指定された Editor バージョンでプロジェクトを開きます。初回起動時は、Unity がパッケージの復元とアセットのインポートを完了するまで待ちます。
3. **File > Build Profiles** を開きます。
4. 対象プラットフォームの既存プロファイルを選択するか、**Add Build Profile** で新規作成し、**Switch Profile** をクリックします。
5. 設定済みの Scene List を維持したまま **Build** をクリックし、出力をリポジトリ外または `Builds/Windows` などの無視対象ディレクトリに保存します。

Windows と Linux のビルドは、出力ディレクトリ全体と一緒に配布する必要があります。実行ファイルのみをコピーしないでください。

### Android 向けビルド

Android Build Profile では、次の点に注意してください。

- ローカルでのインストールとテストでは、**Build App Bundle (Google Play)** をオフにして APK を生成します。
- Google Play 向けにリリースする場合は、**Build App Bundle (Google Play)** をオンにして AAB を生成し、独自の署名キーを設定します。
- ローカルテストで keystore エラーが発生した場合は、**Player Settings > Publishing Settings** を開いてプロジェクトの公開キーの使用をやめるか、独自の keystore を選択してください。リポジトリには公式の公開キーは含まれていません。

### iOS 向けビルド

Unity の **Build** は Xcode プロジェクトを生成し、IPA ファイルは生成しません。macOS で生成された `Unity-iPhone.xcodeproj` を Xcode で開き、開発チームを選択して署名を設定したうえで、デバイスへのビルドまたはアーカイブの作成を行います。

## コマンドラインからのビルド

`MajdataPlay.Editor.CustomBuild` は、継続的インテグレーションで使用されているものと同じコマンドラインエントリポイントを提供します。リポジトリルートから Windows 向けリリースをビルドするには、次を実行してください。

```powershell
& '<Unity Editor path>\Editor\Unity.exe' `
  -batchmode `
  -quit `
  -projectPath (Get-Location) `
  -executeMethod MajdataPlay.Editor.CustomBuild.BuildRelease `
  -buildTarget StandaloneWindows64 `
  -customBuildPath "$PWD\Builds\Windows\MajdataPlay.exe" `
  -customBuildName MajdataPlay `
  -logFile -
```

`<Unity Editor path>` は、Unity Hub で該当する Editor バージョンのインストールディレクトリに置き換えてください。Development Build が必要な場合は、`BuildRelease` を `BuildDebug` に置き換えます。他のプラットフォームでは、`StandaloneLinux64`、`StandaloneOSX`、`Android`、`iOS` など、対応する Unity の BuildTarget 名を使用します。

## ビルドの問題のトラブルシューティング

- 型や名前空間が見つからない場合は、すべての Git サブモジュールが再帰的に初期化されていることを確認し、Unity がパッケージの復元を完了するまで待ってください。
- **Build Profiles** に対象プラットフォームがない場合は、Unity Hub に戻り、現在の Editor 用の対応する Build Support モジュールをインストールしてください。
- コマンドラインからのビルドに失敗した場合は、ターミナルの Unity ログを確認してください。Editor でのビルドでは、**Window > General > Console** の最初のエラーを確認してください。
- Unity のバージョンを変更すると、プロジェクトのアセットや設定が書き換えられる場合があります。開発中は `ProjectSettings/ProjectVersion.txt` で指定されたバージョンを使用してください。
