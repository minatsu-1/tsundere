# 傲娇图鉴 · Tsundere Zukan

一个纯静态的「傲娇角色」图鉴站：100 位角色、六种性格型 + 九种番剧类型、台词与批注、搜索与随机。

- 纯静态：HTML / CSS / 原生 JS，无后端、无构建步骤、无第三方 CDN（`anime.umd.min.js` 已本地化）
- 首屏有开场动画（每个标签页播一次，`?intro=1` 可强制重播、`?intro=0` 跳过）

## 目录结构

```
index.html     标题页 + 图鉴目录（搜索、随机、性格九宫格、类型九宫格）
cat.html       分类页（?k=type:高傲·大小姐 / ?k=genre:奇幻）
char.html      角色详情（?id=<AniList id>）
search.html    搜索结果页（?q=标签名 或关键词）
data.js        window.CHARS 100 人 + window.CATS 15 个分类
quotes.js      window.QUOTES 台词与批注（ja 原文 / zh 中译 / en 英文 / src 出处）
img/chars/     头像，文件名 = AniList 角色 id
```

## 部署（GitHub Pages）

1. 新建仓库，把本目录内容（含 `.nojekyll`）推到 `main` 分支根目录；
2. Settings → Pages → Source 选 `Deploy from a branch`，分支 `main` / 目录 `/ (root)`；
3. 等 1–2 分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

`.nojekyll` 已包含：GitHub Pages 默认跑 Jekyll，某些文件名会被吞掉，加上它可让静态文件原样发布。

## 安全说明

- 无后端、无登录、无表单、无 Cookie、无第三方统计脚本；所有资源同源自托管
- 所有渲染走 HTML 转义（含 `img src`），URL 参数只通过 `textContent` 写入
- `document.referrer` 仅用于同源「返回上一页」，且校验了同源前缀
- `same-origin` referrer 策略：跳到外部出处链接时不泄露本站地址
- 仓库内不含任何密钥、令牌、账号或本机路径

## 数据来源与版权

- 角色基础信息（中文名、日文名、作品、年份、收藏数）：**AniList GraphQL API**（<https://anilist.co>）
- 台词：部分取自 **phoenix-wind.com**（名言投稿站，日文原句）；部分取自 **Animechan**（英文）；无原文者标「原作出处待考据」
- 头像：来自 AniList 的角色图，版权归各自作品方所有
- 本站为**非商业同人整理**，仅作学习与展示用途。若权利人要求，可随时下架相关内容。

## 本地预览

```bash
python -m http.server 8123
# 然后打开 http://127.0.0.1:8123/index.html
```
