# {{name}}

基于 **Vite 8 + xq 插件**的 HTML 产品原型工程（由 `xq-template` 生成）。

所有源码统一放在 `src/` 下；`npm run build` 的构建产物输出到 `src` 同级的 `html/` 目录。

## 快速开始

```bash
npm install
npm run dev      # 开发服务器，编辑 src/ 下的 HTML（页面位于 src/pages/...）
npm run build    # 构建所有页面到 html/
npm run pdf      # 合并 html/ 下所有页面，导出 prototype.pdf
```

> 首次使用 `npm run pdf` 前需安装一次浏览器内核：
> ```bash
> npx playwright install chromium
> ```

## 命令一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建全部 HTML 页面到 `html/` |
| `npm run banner` / `build:full` | 构建并生成版权信息头（xq-banner） |
| `npm run preview` | 预览构建产物 |
| `npm run pdf` | 将所有页面合并导出为 `prototype.pdf` |

## 目录结构

```
src/index.html                 # 首页
src/pages/about/index.html     # 关于页
src/pages/contact/index.html   # 联系页（新增页面加子目录即可）
src/partials/header.html       # 公共头部
src/partials/footer.html       # 公共底部
src/js/main.js                 # 入口脚本（bootstrap / xq-util）
src/css/style.css
export-pdf.mjs                 # Playwright 合并导出 PDF
vite.config.mjs                # 三个 xq 插件接线
```

> 页面内用 `<xq-include file="/partials/header.html">` 复用公共片段：
> 路径以 `/` 开头时相对源码根 `src/`，即 `src/partials/header.html`。

## 新增页面

1. 在 `src/pages/` 下新建子目录与 `index.html`；
2. 在 `vite.config.mjs` 的 `rollupOptions.input` 增加一条入口：
   ```js
   order: resolve(__dirname, 'src/pages/order/index.html'),
   ```
   `vite-plugin-xq-multi-input` 会自动纳入构建；
3. 用 `<xq-include file="/partials/header.html"></xq-include>` 复用公共片段。
