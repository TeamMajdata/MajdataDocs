# External devices

## Mobile devices

::: tip
MajdataPlay version `0.1.52 Build 3013` introduced new settings for external arcade-style controllers on mobile devices. Before following this guide, update to this version or later and start the game once.
:::

[Open `settings.json`](/en/majdataplay/configuration/) and scroll to the bottom. The default I/O settings are:

```json
"IO": {
  "InputDevice": {
    "ExternalButtonRing": "None"
  }
}
```

If your controller uses:

- Keyboard input, change `"None"` to `"Keyboard"`.
- Gamepad input, change `"None"` to `"Gamepad"`.
