# 读南北朝史事札记

只分享作者原创文章的静态网站，采用纸色、宋体与朱色点缀。文章是主体，注释和历史地图为阅读辅助。

## 本地阅读

安装 Node.js 20 或以上，然后在本目录执行：

```powershell
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

浏览器打开 http://127.0.0.1:4173/ 。无需安装第三方依赖。

## 文章与目录

- `content/about.md`：关于、写作缘起、北朝与南朝背景。
- `content/hanhua/ambition/feng.md`：《汉化之殇》→《孝文帝的雄心》→《冯太后》正文。
- `data/contents.json`：维护一级篇目、二级部分、三级文章。在目录节点填写 `file` 指向 Markdown 即可发布；没有正文的节点显示待续。
- `data/entities.json`：共享的人物、政权、制度、地理注释。正文用 `[[feng|冯太后]]` 调用，鼠标悬停、键盘聚焦或触屏点击均可阅读。

正文支持 `#`、`##`、`###` 标题、空行分段与 `>` 引文；HTML 会转义。只把文章正文写进 Markdown，不需要修改页面代码。构建生成的 `assets/content.js` 请勿手动编辑。

地图提供383、439、490、493、494年视图，可点地名、放大、缩小、拖动及复位。493年表示筹划迁都，494年表示正式迁都。地图是自绘历史地理示意，城市按今址约略定位，河流和海岸为示意，不表示古代疆界或精确行军路线。尚无经过考证的历史疆域数据库。

## GitHub Pages

目标仓库：https://github.com/Rakuyo2333/Rakuyo.github.io

由于账号是 `Rakuyo2333`，仓库是 `Rakuyo.github.io`，这是项目站点，其默认地址为 https://rakuyo2333.github.io/Rakuyo.github.io/ 。全部资源采用相对路径，兼容此地址。

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。`main` 分支每次更新将自动校验并发布 `dist/`。检查 Actions 中“发布原创札记”的运行结果。自定义域名由作者自行设置。

## 字体

使用本地托管的 Noto Serif SC（思源宋体同源宋体风格）字形子集，加载时回退到系统宋体。字体文件与授权放在 `assets/fonts/`，不依赖访问外部字体服务。新增文章的字符不在现有子集中时，浏览器回退到系统宋体；可运行 `node scripts/font.mjs` 重新生成涵盖全文与界面文字的字形子集，然后重新构建。字体使用 SIL Open Font License 1.1；文章版权归作者所有。

## 迁移记录

已读取旧聊天“分支 · 建设国内可访问博客”及原有私有站点信息，确认原项目名为“史札 · 赵致的历史札记”。旧源码仓库在2026-10-12迁移时连接中断，无法恢复源码。本版据作者此次提供的目录与全文在 `D:\APP\GPTWORK\历史博客` 重建；没有补写未提供的章节。旧站保持原状。

参考风格：https://www.shidianguji.com/ 。本网站的布局、地图和注释组件为独立实现。没有使用识典古籍的专有字体、地图服务或百科接口。
