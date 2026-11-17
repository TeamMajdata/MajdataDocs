# Configuration file

::: tip
Run the game once before following this guide. Settings must be changed while the game is closed, so make sure it is not still running in the background.
:::

This page lists the location of the MajdataPlay configuration files on each platform. Other configuration guides assume that you have read this page.

Starting with **2.1.0-preview6**, the configuration is split into two files in the same directory:

- `settings.json`: **user settings**, containing `Game`, `Judge`, `Display`, `Volume` and `Touch`. When you sign in to an online account, this group may be read from and uploaded to the account instead.
- `system-settings.json`: **system settings**, containing `Common`, `Rendering`, `Audio`, `Encoding`, `Decoding`, `Debug`, `Network` and `IO`. This group describes the current device and always stays local.

To change gameplay, judgment or display behavior, you usually only need to edit `settings.json`; system settings such as external devices, rendering and networking are in `system-settings.json`. Older versions had only one `settings.json`; the new version splits and migrates it automatically on first launch. See the [configuration reference](/en/majdataplay/configuration/configuration) for details.

## Windows

Open `settings.json` and `system-settings.json` in the same directory as `MajdataPlay.exe`.

## iOS

<mark>You generally do not need to edit the configuration file manually on iOS. Open **Settings**, search for **MajdataPlay**, or select **Apps** in the sidebar and then select **MajdataPlay**. Almost every setting you need is available there.</mark>

To edit the files directly, open the **Files** app and select **On My iPhone** or **On My iPad**. Open the `MajdataPlay` folder, where you will find `settings.json` and `system-settings.json`. You need a JSON editor to change these files; you can install an editor such as Koder from the App Store.

## Android

- APK version: `/storage/emulated/0/Documents/MajdataPlay/`
- Google Play version: `/storage/emulated/0/Android/data/net.majdata.majdataplay/files/`

Both directories contain `settings.json` and `system-settings.json`. We recommend a file manager with a built-in editor, such as MT Manager.
