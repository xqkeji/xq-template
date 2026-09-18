# 前端生成规范（AI 必读）

本目录是由 xq-template 生成的**纯 HTML 多页面**产品原型，构建工具为 Vite，技术栈为 **原生 HTML + TypeScript + SCSS**，UI **强制统一使用 Bootstrap 5** 风格。任何由 AI 生成或改写的页面 / 组件都必须遵守以下约定，否则视为不合格。

## 1. 核心规则：用 Bootstrap 5，不要手写布局 CSS
- 一切布局、间距、排版、颜色、卡片、按钮、表单、表格、提示、徽章等都**优先使用 Bootstrap 5 的 class**。
- **禁止**用自写 `<style>` 或内联 `style=` 去实现 Bootstrap 已提供的效果（栅格、margin/padding、字体颜色/粗细、圆角、阴影等）。
- 仅在极少数品牌定制（如主题色）时才写样式，且放进 `src/scss/style.scss`（SCSS），用 Bootstrap 变量/工具类扩展，不另起炉灶。
- 不要引入 Tailwind / Bulma 等其它 UI 框架，也不要使用 React / Vue 等前端框架——本项目就是原生 HTML + Bootstrap。

## 2. 技术栈：TypeScript + SCSS，Bootstrap 经 public 自动注入
- 源码入口是 `src/ts/main.ts`（**TypeScript，不是 .js**）。页面通过 `<script type="module" src="/ts/main.ts">` 引入。它内部 `import '../scss/style.scss'` 引入样式、`import 'xq-util'` 引入工具库。
- 样式写在 `src/scss/style.scss`（**SCSS，不是 .css**）。
- Bootstrap 与 bootstrap-icons **不通过 JS import**：由 `vite-plugin-xq-cp-dep` 把依赖拷贝到 `public/`，再经 `src/partials/header.html` 顶部的**内联脚本**按相对路径动态注入 `<link>`/`<script>`（兼容 http(s) 与 file://、任意嵌套层级）。因此 **不要在 HTML 里手写 `<link ... bootstrap>` 或 `<script ... bootstrap>`**，也**不要**在 `main.ts` 里 `import` bootstrap。
- 下拉、折叠、模态、标签页等交互组件，直接用 Bootstrap 的 `data-bs-*` 属性即可自动初始化，无需手写 JS。
- 类型检查：`npm run typecheck`（tsc --noEmit）。

## 3. 页面骨架（新增页面照抄）
整个 HTML 的开头（doctype / head / title / 依赖注入脚本 / 打开 `<body>` / 顶部导航）已抽进 `src/partials/header.html`，结尾（页脚 / main.ts / 关闭 `</body></html>`）已抽进 `src/partials/footer.html`。内容页只写「开头片段 + 正文 + 结尾片段」：
```html
<xq-include file="/partials/header.html" title="页面标题" docClass=""></xq-include>

<main class="container py-4">
  <!-- 正文：全部用 Bootstrap class 布局 -->
</main>

<xq-include file="/partials/footer.html"></xq-include>
```
- `header.html` 内部用 `<?=$title?>` 输出页面标题、`<?=$docClass?>` 作为 `<body>` 的 class 令牌。**每个页面都必须显式传 `title`（页面标题）和 `docClass`（无额外 class 时传空 `""`）**——xq-include 的「未传变量清理」正则是有 bug 的，不传会残留 `<?`。
- **不要把正文写进 include 标签内部**：插件的 `<?=$content?>` 注入机制在 v1.1.x 是坏的，include 标签内部内容会被丢弃。正文必须放在 `header.html` 与 `footer.html` 两个 include 之间。
- 顶部导航在 `src/partials/header.html`（Bootstrap navbar，已存在），不要在页面里重复写导航；页脚在 `src/partials/footer.html`。
- 复用其它公共片段用 `<xq-include file="/partials/xxx.html">`，路径以 `/` 开头时相对源码根目录（src/）。`<?=$变量?>` 仅适合纯文本参数；**属性值里不能放含双引号的 HTML**（会被 Vite 解析搞坏），要传复杂结构就直接静态写进片段。

## 4. 必须套用的 Bootstrap 写法示例
- 容器与栅格：`<main class="container py-4">`、`<div class="row g-3"><div class="col-md-6">…</div></div>`、`.container-fluid`。
- 卡片：`<div class="card shadow-sm"><div class="card-body">…</div></div>`，标题用 `.card-title`、文本用 `.card-text`。
- 按钮：`<a class="btn btn-primary">`、`<button class="btn btn-outline-secondary">`。
- 表单：`<div class="mb-3"><label class="form-label">姓名</label><input class="form-control"></div>`；栅格表单用 `.row.g-3` + `.col-*`。
- 表格：`<table class="table table-striped table-hover align-middle">`。
- 提示与徽章：`<div class="alert alert-info">`、`<span class="badge bg-success rounded-pill">`。
- 工具类：间距 `mt-4`/`py-5`、文字 `text-muted`/`fw-bold`/`text-center`、弹性 `d-flex align-items-center justify-content-between` 等。
- 主题强调色变量为 `--xq-accent`（见 `src/scss/style.scss`），需要自定义颜色时优先复用它。
- 想看完整可运行范例，参考 `src/pages/components/index.html`（组件陈列页，集中展示上述所有组件的写法，新增页面应优先模仿它）。

## 5. 新增一个页面三步
1. 在 `src/pages/<页面名>/index.html` 新建，套用上方骨架（**务必传 `title` 与 `docClass`**）并用 Bootstrap 写内容。
2. 在 `vite.config.mjs` 的 `build.rollupOptions.input` 增加一条：`<页面名>: resolve(__dirname, 'src/pages/<页面名>/index.html')`。（注意 `root` 已设为 `'src'`，`__dirname` 是项目根，因此路径是 `src/pages/...`，**不要写成 `src/src/pages/...`**）
3. 在 `src/partials/header.html` 导航加一项：`<li class="nav-item"><a class="nav-link" href="/pages/<页面名>/index.html">菜单名</a></li>`。（`root='src'`，URL 以 `/` 开头时相对源码根，即 `/pages/...`，**不是** `/src/pages/...`）

## 6. 禁止事项
- 禁止写 `<style>` 块做布局；禁止引入其它 CSS / JS 框架。
- 禁止在 HTML 里手写引入 Bootstrap（已由 `header.html` 内联脚本注入），也禁止在 `main.ts` 里 `import` bootstrap。
- 禁止用前端框架（React/Vue 等）重写页面。

## 7. 运行与预览（AI 必读）
- 本仓库是 Vite 多页静态站（`root='src'`，构建产物输出到仓库根 `html/`）。**`src/` 下的 HTML 源文件不能用浏览器直接打开**：页面使用 `<xq-include>` 公共片段（以及可选的 `<?=$变量?>` 占位符），这些标记只有在经过 Vite 处理（dev / build）后才会被替换并注入 Bootstrap。直接双击/打开 `src/` 下的源文件，会看到未替换的占位标签和缺失样式（破页面）。
- 预览方式（二选一）：
  1. **开发预览（推荐）**：`npm run dev` 启动 Vite 开发服务器，默认地址 http://localhost:5173/ （具体端口以 `vite.config.mjs` 为准）。浏览器访问 http://localhost:5173/<页面路径> 即可看到已解析的完整页面，并支持热更新。
  2. **构建产物**：`npm run build` 把站点产出到仓库根 `html/` 目录，之后可直接打开 `html/index.html`（已是完整静态、无占位符的成品，兼容 file://）。
- **AI 工具预览约定**：当 AI（WorkBuddy / Trae 等会读取本文件或其 `CLAUDE.md` 副本的工具）需要向用户展示某个页面时，**应提供 dev server URL（如 http://localhost:5173/<页面路径>）或 build 后的 `html/<页面>` 产物路径，而不要直接传 `src/` 下的源文件路径**——否则内置预览会被当作未解析源文件打开，呈现破页面。若 dev server 未启动，先执行 `npm run dev` 再提供 URL。
- 生成器（`xq-template/index.js`）会把本仓库 `AGENTS.md` 与 `CLAUDE.md` 一并拷贝到新项目，因此以上约定对所有由本模板生成的项目自动生效。
