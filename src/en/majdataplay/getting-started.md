# Getting started

The first time you launch the game, it creates `settings.json` and `system-settings.json` in the directory that contains the [configuration file](/en/majdataplay/configuration/) and extracts the built-in tracks. Once you have finished [setting up an external controller](/en/majdataplay/configuration/external_device), you can start playing from the song selection screen.

## Without a controller

You can play with a keyboard and mouse even without a controller:

| Action | Default input |
| --- | --- |
| 8 buttons | `W` `E` `D` `C` `X` `Z` `A` `Q` |
| 1P triangle button | Numpad `*` |
| Touch area | Mouse |

The keyboard keys correspond to the 8 button ring positions in the game. If you use a controller, buttons and touch input come from the controller device.

## Song selection screen

| Action | Default input |
| --- | --- |
| Switch difficulty | Buttons 1 / 8 |
| Switch track | Buttons 3 / 6 |
| Start the game | Button 4 |
| Enter practice mode | Press and hold button 4, then release after you hear the explosion sound |
| Back / leave account | Button 5 (hold to sign out while online) |
| Open settings | Button 7 |
| Sort / search | Button 2 or the 1P triangle button |
| Refresh the chart library | Hold the 1P triangle button for about 3 seconds |

On the song selection screen the 1P triangle button is used for sort / search; the sort and search pages require you to confirm by touching the screen, to avoid accidental key presses.

## During play

| Action | Default input |
| --- | --- |
| Quit the track | The 1P triangle button, or the sub-screen click behavior set in the settings |
| Skip the track | Hold buttons 2, 3, 6, and 7 |
| Quick restart | Hold buttons 3, 4, 5, and 6 |
| Quick practice | Hold buttons 1, 2, 7, and 8 |

Skip, quick restart, and quick practice each require the matching option to be enabled under `Game` in `settings.json`. The sub-screen click behavior is controlled by `Game.GameplaySubScreenClickBehavior`.

## Built-in tracks

The installer ships with a set of original / licensed tracks under `MaiCharts/Original`, which you can play right after installation. To import your own charts, see [Charts](/en/majdataplay/feature/chart).

## Audio recommendations

The audio backend is set in `Audio.Backend` in `system-settings.json`. Latency from lowest to highest is roughly:

1. `"Asio"`: lowest latency, but the sound card must support ASIO; for ordinary sound cards you can install [ASIO4ALL](https://asio4all.org/about/download-asio4all/).
2. `"Wasapi"`: the common backend on Windows. Exclusive mode has lower latency, but it prevents programs such as OBS from recording at the same time; turn off `Audio.Wasapi.Exclusive` if you need to stream or record.
3. `"BassSimple"`: the default output method of BASS. Compatibility is better, but latency may fluctuate.
4. `"Unity"`: Unity's built-in audio, a fallback option only.

If you hear crackling, stuttering, or audio/video desync, try:

- Turn off all sound enhancements in the Windows sound control panel, and allow applications to take exclusive control.
- Increase the buffer size under `Audio.Bass` a little, or lower `Rendering.FPSLimit`.
- When using ASIO, open the ASIO control panel and adjust the buffer size.
