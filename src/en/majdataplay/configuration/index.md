# Configuration file

::: tip
Run the game once manually first. Settings must be changed while the game is closed, so <mark>kill the background process</mark>.
:::

This section shows where the `MajdataPlay` configuration files are located on each platform. The other configuration guides assume that you have already read this section.

Starting with **2.1.0-preview6**, the configuration is split into two files in the same directory:

- `settings.json`: **user settings**, containing `Game`, `Judge`, `Display`, `Volume` and `Touch`. After you sign in to an online account, this group of settings may instead be read from the account and uploaded to it.
- `system-settings.json`: **system settings**, containing `Common`, `Rendering`, `Audio`, `Encoding`, `Decoding`, `Debug`, `Network` and `IO`. This group of settings describes the current device and is always stored locally.

If you only want to adjust gameplay, judgment or the display, you usually only need to edit `settings.json`; system settings such as external devices, rendering and networking are in `system-settings.json`. Older versions had only a single `settings.json`; the new version splits and migrates it automatically on first launch. See [Configuration reference](/en/majdataplay/configuration/configuration) for details.

## Windows

`settings.json` and `system-settings.json` in the same directory as `MajdataPlay.exe`.

## iOS

<mark>Normally the iOS version does not need the configuration file changed manually. Open `Settings`, search for `MajdataPlay` globally or find `App` in the left-hand list and tap it, then find `MajdataPlay` on the right. There you will find almost every setting you need.</mark>

Open the `Files` app, select `On My Device` (such as `On My iPad`) in the directory list, and you will find a `MajdataPlay` folder containing `settings.json` and `system-settings.json`. Changing the files requires a dedicated `json` editor; you can search for and install `Koder` from the `App Store`.

## Android

- APK version: `/storage/emulated/0/Documents/MajdataPlay/`
- Play Store version: `/storage/emulated/0/Android/data/net.majdata.majdataplay/files/`

On first launch, the Android version may request read/write storage permission. After you grant it, the game uses `Documents/MajdataPlay` as the data directory; if you deny it, the app-specific `Android/data/net.majdata.majdataplay/files` directory is used.

The first launch extracts the built-in resources, but custom skins, tracks and `settings.json` may still need to be placed in the storage directory manually. Both directories above contain `settings.json` and `system-settings.json`; we recommend a file manager with an editor, such as `MT Manager`.
