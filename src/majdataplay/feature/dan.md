# 段位

段位 (Dan) 是把多首谱面按顺序串起来、并带有血量规则的挑战模式. 段位文件是放在 `MaiCharts` 目录中的 JSON 文件; 游戏会根据文件里的谱面哈希查找本地或在线谱面.

## 制作段位

1. 找到每首歌的 `maidata.txt`, 计算它的 **MD5 的 Base64** 值.
2. 新建一个 `.json` 文件, 填入段位名称、歌曲哈希和难度.
3. 把 JSON 文件放到 `MaiCharts` 目录 (不要放进歌曲子文件夹).
4. 重启游戏, 或长按 1P 三角键刷新曲库.
5. 在选曲界面的段位分类中进入该段位.

计算哈希的示例:

```powershell
$bytes = [System.IO.File]::ReadAllBytes("maidata.txt")
[Convert]::ToBase64String([System.Security.Cryptography.MD5]::Create().ComputeHash($bytes))
```

Linux / macOS:

```bash
openssl dgst -md5 -binary maidata.txt | base64
```

## 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `Name` | 字符串 | 段位名称, 显示在选曲界面 |
| `Description` | 字符串 | 段位说明, 可选 |
| `SongHashs` | 字符串数组 | 按游玩顺序排列的 `maidata.txt` MD5 Base64 哈希 |
| `SongLevels` | 整数数组 | 每首歌使用的难度, 与 `SongHashs` 一一对应 |
| `StartHP` | 整数 | 初始血量, 默认 `50` |
| `RestoreHP` | 整数 | 每首歌结束后恢复的血量, 默认 `10` |
| `IsPlayList` | 布尔 | 段位请设为 `false`; 设为 `true` 时作为歌单处理 |
| `IsForceGameover` | 布尔 | 血量为 0 时是否强制结束, 默认 `false` |
| `Damages` | 对象 | 各判定等级对应的血量变化, 负数表示扣血 |
| `Mods` | 对象 | 可选的 Mod 覆盖, 键为 Mod 名称 |

难度编号:

| 值 | 难度 |
| --- | --- |
| `0` | Easy |
| `1` | Basic |
| `2` | Advanced |
| `3` | Expert |
| `4` | Master |
| `5` | Re:Master |
| `6` | UTAGE |

`Damages` 的键使用判定等级名, 例如 `Miss`、`TooFast`、`FastGood`、`LateGood`、`FastGreat`、`LateGreat`、`FastGreat2nd`、`FastPerfect3rd`、`Perfect` 等.

## 模板

```json
{
  "Name": "我的段位",
  "Description": "三首歌的练习段位",
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
段位中的歌曲必须已经存在: 本地曲库或已启用的在线曲库都可以. 哈希不匹配时, 对应歌曲会被跳过.
:::

## 歌单文件

如果只想制作一个歌单, 可以使用同样的 JSON 结构, 但设置 `"IsPlayList": true`, 并且不需要 `SongLevels`、血量和伤害字段:

```json
{
  "Name": "我的歌单",
  "SongHashs": [
    "<song-1-hash>",
    "<song-2-hash>"
  ],
  "IsPlayList": true
}
```

歌单文件同样放在 `MaiCharts` 目录; 在选曲界面中会出现在歌单分类里.
