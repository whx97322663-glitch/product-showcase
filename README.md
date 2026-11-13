# AERIN · 驭风 X1 — 单产品官网（面试作品集）

电影感单产品滚动叙事站，风格参考 nanfu.global 一类的深色 3D 产品展示站。
原生 HTML/CSS/JS，零依赖、无构建。双击 `index.html` 即可在浏览器预览。

## 文件结构

```
product-showcase/
├── index.html   # 单页，10 章滚动叙事（preloader → hero → manifesto → sticky 三章 → 规格 → 细节 → 气流动画 → 设计背后 → CTA/页脚）
├── style.css    # :root 设计变量（bg #0a0a0f / accent 暖铜 #d9a066），全部样式
├── script.js    # preloader / 自定义光标 / 辉光 / 滚动显现 / sticky 进度 / 数字跳动 / macro 缩放 / canvas 气流动画
└── assets/
    ├── hero.png            # 吹风机成品渲染（1.png）
    ├── process-blender.png # Blender Cycles 渲染设置截图
    ├── showreel.mp4        # 场景渲染视频（25M，如嫌大可另压）
    ├── scene.png           # 视频封面（方块世界）
    └── resume.pdf          # 作品集简历 PDF
```

## 章节速查

| 章节 | 说明 |
|------|------|
| Preloader | AERIN 字标逐字揭示 + 进度条，揭幕 |
| Hero | 产品渲染悬浮居中 + 超大标题 + 鼠标辉光 + scroll cue |
| Manifesto | 超大字逐词揭示 |
| Sticky 三章 | 产品 sticky，章节切换缩放/位移，数字滚动（01 AIRFLOW / 02 CORE / 03 CLIMATE·IONS） |
| 规格 | 参数排版列表，hover 逐条亮起 |
| 细节 Macro | hero 图 scroll 驱动 zoom 裁切 |
| 气流动画 | canvas 粒子流场，鼠标扰动 |
| 设计背后 | 渲染设置截图 + 渲染视频 + 成品对照 + 工具链（面试加分章） |
| CTA + 页脚 | 联系 / 简历下载 / 回顶部 |

## 可改项

- 品牌名 / 型号 / 文案：`index.html` 全文直接编辑
- 配色：`style.css` 顶部 `:root`（`--accent` 换色即可）
- 联系方式：页脚 `<footer class="cta">` 区块
- 所有动效尊重 `prefers-reduced-motion`

## 本地预览（如需 HTTP 访问）

```bash
node _serve.js   # 或任意静态服务器（python -m http.server 等），端口 8099
```

## 部署 GitHub Pages

推仓库后 Settings → Pages 选目录 `product-showcase/` 即可；
`assets/` 总量约 40M（主要是 25M 视频），在 1GB 限额内。
