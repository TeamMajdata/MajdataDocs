# AGENTS.md

Majdata 工具链（MajdataPlay / MajdataX / MajSimai / MajdataNet）的文档站，基于 VitePress 构建，中英双语。

## 项目结构

```text
src/
├── .vitepress/
│   ├── config/
│   │   ├── index.ts    # 入口，合并 locales
│   │   ├── shared.ts   # 共享配置（插件、主题）
│   │   ├── zh.ts       # 中文 nav + sidebar（root locale）
│   │   └── en.ts       # 英文 nav + sidebar（/en/ locale）
│   └── theme/          # 自定义主题组件与样式
├── majdataplay/        # MajdataPlay 中文文档
├── majdatax/           # MajdataX 中文文档
├── majsimai/           # MajSimai 中文文档
├── majdatanet/         # MajdataNet 中文文档
├── other/              # 其他页面
├── en/                 # 英文文档（目录结构与中文镜像）
└── public/             # 静态资源（favicon 等）
```

## 常用命令

```bash
pnpm install          # 安装依赖（需要 pnpm >= 9，Node >= 20）
pnpm dev              # 本地开发服务器（127.0.0.1:3000）
pnpm build            # 生产构建（Vercel 部署使用此命令）
pnpm preview          # 预览构建产物
```

构建错误常见于 dead link 检查失败，构建日志会明确列出死链及其所在文件。

## 约定（重要）

### 双语同步

- `src/<lang>/` 下的每个中文文档应存在对应的 `src/en/<lang>/` 英文镜像，目录结构与文件名保持一致。
- 新增或重命名页面时，必须同时更新 `zh.ts` 和 `en.ts` 的 sidebar；中英侧边栏条目应一一对应。
- 英文文档是中文文档的翻译，内容结构（标题层级、图片、代码块、表格）应与中文版一致；语序可按英文习惯调整。

### 链接

- 中英文档内的站内链接使用各自的语言前缀：中文 `/majdataplay/xxx`，英文 `/en/majdataplay/xxx`。
- 使用 `cleanUrls`，链接不带 `.html` 后缀。
- 删除或重命名页面时，必须清理仓库内所有指向旧路径的引用（包括 `src/en/majdataplay/simai-extension/slidecode.md` 这类重定向页），否则 VitePress 的 dead link 检查会导致构建失败。

### 图片资源

- **相对路径图片不能跨目录**。VitePress/Rollup 解析 Markdown 图片时会在路径前加 `./`，`../../` 形式的路径会构建失败（`Could not resolve "./../.."`）。
- 每个 assets 目录是独立副本：`src/majsimai/slidecode/assets/` 与 `src/en/majsimai/slidecode/assets/` 内容相同但互不共享；修改一方图片时注意同步另一方。
- 修改后应验证所有引用的图片文件确实存在，并运行 `pnpm build` 确认无资源解析错误。

### 判定文档

`majdataplay/judgment/` 下的判定文档（Tap/Hold/Slide/Touch）以 MajdataPlay 源码为准（`LingFeng-bbben/MajdataPlay` 仓库 `Assets/Scripts/Scenes/Game/NoteBehaviours/`）。编写或修改时：

- 注明依据的 commit hash（如 IO 框架重构提交 `fbfe11d7f`），便于追溯。
- 数值必须与源码常量核对（如 `TAP_JUDGE_*`、`TOUCH_JUDGE_*`、`SLIDE_JUDGE_*`、`CLASSIC_HOLD_ALLOW_OVER_LENGTH_SEC`），不要凭记忆或旧文档转抄。
- 中英两版的数据表必须同步更新。

## 验证

- Markdown / 配置语法快速检查：`node --experimental-strip-types --check src/.vitepress/config/<file>.ts`
- 提交前运行 `pnpm build`，确认无 dead link 与资源解析错误。
- `git diff --check` 检查空白错误。

## 其他

- 本项目主题来自 [NapCatDocs](https://github.com/NapNeko/NapCatDocs)，采用与原项目一致的开源协议并保留原项目署名。
- 文档正文以简体中文与英文撰写；代码、标识符、文件路径、shell 命令与未翻译的技术术语保持原文。
