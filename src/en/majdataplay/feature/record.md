# Record gameplay

::: warning
This feature is not available on mobile devices.
:::

## Configure OBS

MajdataPlay controls the OBS recording shortcut for you. First, configure a scene in OBS and capture MajdataPlay with <mark>Display Capture or Game Capture</mark>. Other capture methods may not work.

![OBS WebSocket configuration](/majdataplay/feature/record/obs_configuration.png)

1. Select **Tools** at the top of OBS.
2. Select **WebSocket Server Settings**.
3. Turn on **Enable WebSocket server**.
4. Set **Server Port** to `4455` and turn off **Enable Authentication**.

## Configure MajdataPlay

Set the recording option to `OBS`.

## Check the recording status

When the connection succeeds, a camera icon appears below the mascot on the secondary display after gameplay starts. The icon shows one of these states:

- **OBS not ready**: MajdataPlay is not connected to OBS.
- **OBS ready**: MajdataPlay is connected and ready to record.
- **OBS recording**: OBS is recording the current play session.
