# External devices

:::tip
Since the software is still being updated continuously, the related options or descriptions may be outdated. If this page cannot meet your needs, you are welcome to join the QQ group `667644338` to ask questions / discuss.
:::

## Windows/Mac/Linux

For the Windows/Mac/Linux version, we provide a wide variety of connection methods and have added automatic detection.

In most cases you do not need to modify the configuration file; the game automatically detects your input method. You can of course also change the related settings yourself in `settings.json`.

[Open `settings.json`](/en/majdataplay/configuration/), scroll to the very bottom. The IO settings look like this by default:

``` json
"IO": {
    "Manufacturer": null,
```
The values we support are as follows:
- `General`	General
- `Yuan` Yuan controller
- `Dao`	Dao controller
- `Nov`	Nov controller
- `null` Auto-detect
- `Pipe` [External IO manager](/en/majdataplay/development/external-io-manager)


## Mobile devices

[Open `settings.json`](/en/majdataplay/configuration/), scroll to the very bottom. The IO settings look like this by default:

``` json
"IO": {
    "InputDevice": {
      "ExternalButtonRing": "None"
  }
}
```

If your controller uses:

- Keyboard input, change `"None"` to `"Keyboard"`
- Gamepad input, change `"None"` to `"Gamepad"`
