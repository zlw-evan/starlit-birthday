# 今夜，星河为你亮起

打开 `index.html` 就能体验。第一次点「打开生日惊喜」时，情歌会开始循环播放。右下方的音符可以暂停和继续。访客还可以拆开爱心里的祝福卡，点亮、吹熄生日蜡烛，并在最后复制祝福链接。

链接后可加 `?to=名字`，页面会显示收件人名字。请使用公开时也适合显示的名字或昵称。

## GitHub Pages

解压后，把 `index.html`、`style.css`、`birthday.js`、`galaxy.webp`、`crazy-glue.mp3` 和 `.nojekyll` 一起上传到仓库的 `main` 分支根目录。`README.md` 也可以一并上传。确认在仓库首页能直接看到 `index.html`。

在 **Settings → Pages** 里选择 **Deploy from a branch**，把发布来源设为 **main / (root)** 并保存。等待 **Actions** 里的 Pages 部署成功，再打开 Pages 设置页显示的网址。当前仓库使用默认地址 `https://zlw-evan.github.io/starlit-birthday/`。

## 素材出处

星空背景为 Jeremy Thomas 的 [Colorful galaxy](https://unsplash.com/photos/E0AHdsENmDg)。[Wikimedia Commons 存档](https://commons.wikimedia.org/wiki/File:Colorful_galaxy_(Unsplash).jpg)标注为 CC0 1.0。原图已缩放并转为 WebP。

背景音乐为 Josh Woodward 演唱的 [Crazy Glue](https://freemusicarchive.org/music/Josh_Woodward/The_Wake_1790/JoshWoodward-TheWake-04-CrazyGlue_1790/)，按 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) 使用。网页中的 MP3 经重新编码，音量降低了 7 dB。曲目信息也可在页面中的 ⓘ 查看。

爱心排布沿用原桌面程序的心形参数方程。蛋糕、星尘和彩纸由浏览器实时绘制。
