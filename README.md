# 离骚背诵

一个完全离线的《离骚》精读、点字查词与背诵 App。当前正式版为 `1.0.1`。

## 下载

- [GitHub Releases](https://github.com/c6823821-sketch/lisao-recite-app/releases/latest)
- 当前安装包为 Android 7.0+ ARM64 版本。
- 大小：26,412,782 字节
- SHA256：`C518994A6FF68763ADDA18976637051E08E3B1D214C4645C2957619F3CF157CB`

![离骚背诵 APK 下载二维码](docs/qr.png)

## 页面

| 今日 | 分章 |
| --- | --- |
| ![今日](docs/today.png) | ![分章](docs/sections.png) |

| 全篇导读 | 分章精读 |
| --- | --- |
| ![导读](docs/guide.png) | ![精读](docs/reader.png) |

| 点字查读音与释义 | 背诵 |
| --- | --- |
| ![点字释义](docs/dictionary.png) | ![背诵](docs/recite.png) |

| 学习档案 |
| --- |
| ![学习档案](docs/mine.png) |

## 内容

- `382` 个原文分句，`188` 个背诵句对，`15` 个语义章节。
- 全文 `808` 个不重复汉字，`100%` 可在原文中点击查看读音、通用义项和本句语境。
- 每个句对包含原文与现代汉语译意；每章另有历史处境、故事线、深度解读和读后问题。
- 全篇按句对使用 FSRS 记忆曲线安排复习。
- 每日可设置新学 `4 / 8 / 12 / 16` 个句对，到期复习额外加入。
- 背诵支持遮字、全文核对、译意提示、不会回炉和四档自评。
- “我的”会列出今天背过什么、已学原句、掌握程度、上次评分和下次复习时间。
- 应用内检查 GitHub 正式版、下载更新并调用 Android 系统安装器。
- 所有学习记录只保存在本机。

## 原文

原文取自现有诗词项目内置《离骚》完整文本，来源标注为
`chinese-poetry/chinese-poetry`（MIT）。现代译意、分章、词注和背诵资料为本 App 本地内容。

## 开发

```powershell
pnpm install
pnpm run check
pnpm run export:web
```
