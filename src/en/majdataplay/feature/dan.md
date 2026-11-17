# Dan courses

A dan course is a challenge mode that chains several charts together in order and adds health rules. A dan course file is a JSON file placed in the `MaiCharts` directory; the game looks up local or online charts by the chart hashes stored in the file.

## Creating a dan course

1. Find the `maidata.txt` of each song and compute its **MD5 in Base64**.
2. Create a new `.json` file and fill in the dan course name, the song hashes, and the levels.
3. Put the JSON file in the `MaiCharts` directory (not inside a song subfolder).
4. Restart the game, or hold the 1P triangle button to refresh the chart library.
5. Open the dan course from the dan category on the song selection screen.

Example of computing the hash:

```powershell
$bytes = [System.IO.File]::ReadAllBytes("maidata.txt")
[Convert]::ToBase64String([System.Security.Cryptography.MD5]::Create().ComputeHash($bytes))
```

Linux / macOS:

```bash
openssl dgst -md5 -binary maidata.txt | base64
```

## Fields

| Field | Type | Description |
| --- | --- | --- |
| `Name` | String | Dan course name, shown on the song selection screen |
| `Description` | String | Dan course description, optional |
| `SongHashs` | String array | MD5 Base64 hashes of the `maidata.txt` files, in play order |
| `SongLevels` | Integer array | The level used for each song, one-to-one with `SongHashs` |
| `StartHP` | Integer | Starting health, default `50` |
| `RestoreHP` | Integer | Health restored after each song, default `10` |
| `IsPlayList` | Boolean | Set to `false` for a dan course; when set to `true` it is handled as a playlist |
| `IsForceGameover` | Boolean | Whether to force a game over when health reaches 0, default `false` |
| `Damages` | Object | Health change for each judgment grade, negative values drain health |
| `Mods` | Object | Optional Mod overrides, keyed by Mod name |

Level numbers:

| Value | Level |
| --- | --- |
| `0` | Easy |
| `1` | Basic |
| `2` | Advanced |
| `3` | Expert |
| `4` | Master |
| `5` | Re:Master |
| `6` | UTAGE |

The keys of `Damages` are judgment grade names, for example `Miss`, `TooFast`, `FastGood`, `LateGood`, `FastGreat`, `LateGreat`, `FastGreat2nd`, `FastPerfect3rd`, `Perfect`, and so on.

## Template

```json
{
  "Name": "My dan course",
  "Description": "A practice dan course with three songs",
  "SongHashs": [
    "<song-1-hash>",
    "<song-2-hash>",
    "<song-3-hash>"
  ],
  "SongLevels": [4, 4, 4],
  "StartHP": 50,
  "RestoreHP": 10,
  "IsPlayList": false,
  "IsForceGameover": true,
  "Damages": {
    "Miss": -5,
    "TooFast": -5,
    "FastGood": -3,
    "LateGood": -3,
    "FastGreat": -2,
    "LateGreat": -2,
    "FastGreat2nd": -2,
    "LateGreat2nd": -2,
    "FastGreat3rd": -2,
    "LateGreat3rd": -2,
    "FastPerfect2nd": 0,
    "LatePerfect2nd": 0,
    "FastPerfect3rd": 0,
    "LatePerfect3rd": 0,
    "Perfect": 0
  }
}
```

::: tip
The songs in a dan course must already exist: either in the local chart library or in an enabled online chart library. If a hash does not match, the corresponding song is skipped.
:::

## Playlist files

If you only want to make a playlist, you can use the same JSON structure but set `"IsPlayList": true`, and you do not need `SongLevels`, the health fields, or the damage fields:

```json
{
  "Name": "My playlist",
  "SongHashs": [
    "<song-1-hash>",
    "<song-2-hash>"
  ],
  "IsPlayList": true
}
```

Playlist files also go in the `MaiCharts` directory; they appear in the playlist category on the song selection screen.
