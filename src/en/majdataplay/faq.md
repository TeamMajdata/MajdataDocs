# FAQ

This page lists some common questions.

## Why can't OBS record MajdataPlay audio? Why does MajdataPlay block video audio playback in other apps?

> Turn off exclusive mode for MajdataPlay audio in the settings.

## What should I do if audio does not start playing or there is no sound?

1. Turn off all sound enhancements in the Windows sound control panel.
2. Allow applications to take exclusive control, and set exclusive mode as the priority.
3. In `system-settings.json`, try switching `Audio.Backend`, or increase the `Audio.Bass` buffer moderately.

## What should I do if high CPU usage causes frame drops?

You can increase the `PollingRateMs` of the input device moderately (for example, set it to `2`) to lower the polling frequency. Note that this may make judgment worse.

## What should I do if high GPU usage causes frame drops?

1. Adjust the graphics settings for MajdataPlay in the GPU control panel.
2. Lower `Rendering.RenderQuality`, or use `"Custom"` to lower `Rendering.RenderScale`.
3. Try enabling `Rendering.CompatibilityMode`.

## How do I move the game window to another display?

> Press `Alt` + `Enter` together to leave full-screen mode, then drag the window to the target display with the mouse, and press `Alt` + `Enter` together again to return to full-screen mode.

## How do I view MajdataPlay logs?

1. Find the folder that contains the [configuration file](/en/majdataplay/configuration/).
2. Open the `Logs` folder inside it.
3. Open the `MajPlayRuntime.log` file with a text editor.

## Encountered another problem?

1. Join the MajdataPlay QQ group `667644338`.
2. Describe the problem you encountered (<mark>be as detailed as possible</mark>).
3. Upload the log file.
4. Wait patiently for other members to answer.
