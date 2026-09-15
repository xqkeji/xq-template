# 前端生成规范（AI 必读）

本目录是由 xq-template 生成的**纯 HTML 多页面**产品原型，构建工具为 Vite，UI **强制统一使用 Bootstrap 5** 风格。任何由 AI 生成或改写的页面 / 组件都必须遵守以下约定，否则视为不合格。

## 1. 核心规则：用 Bootstrap 5，不要手写布局 CSS
- 一切布局、间距、排版、颜色、卡片、按钮、表单、表格、提示、徽章等都**优先使用 Bootstrap 5 的 class**。
- **禁止**用自写 `<style>` 或内联 `style=` 去实现 Bootstrap 已提供的效果（栅格、margin/padding、字体颜色/粗细、圆角、阴影等）。
- 仅在极少数品牌定制（如主题色）时才写 CSS，且放进 `src/style.css`，用 Bootstrap 变量/工具类扩展，不另起炉灶。
- 不要引入 Tailwind / Bulma 等其它 UI 框架，也不要使用 React / Vue 等前端框架——本项目就是原生 HTML + Bootstrap。

## 2. Bootstrap 已自动注入，不要再引
- `src/main.js` 已经 `import 'bootstrap/dist/css/bootstrap.min.css'` 和 `import * as bootstrap from 'bootstrap'`，构建时自动注入每个页面。
- 因此 **不要在 HTML 里写** `<link ... bootstrap.css>` 或 `<script ... bootstrap.bundle.js>`。
- 下拉、折叠、模态、标签页等交互组件，直接用 Bootstrap 的 `data-bs-*` 属性即可自动初始化，无需手写 JS。

## 3. 页面骨架（新增页面照抄）
```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>页面标题</title>
</head>
<body>
  <xq-include file="/partials/header.html"></xq-include>

  <main class="container py-4">
    <!-- 正文：全部用 Bootstrap class 布局 -->
  </main>

  <xq-include file="/partials/footer.html"></xq-include>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```
- 顶部导航在 `partials/header.html`（Bootstrap navbar，已存在），不要在页面里重复写导航。
- 页脚在 `partials/footer.html`，不要重复写。
- 复用公共片段用 `<xq-include file="/partials/xxx.html">`，路径以 `/` 开头时相对项目根目录。

## 4. 必须套用的 Bootstrap 写法示例
- 容器与栅格：`<main class="container py-4">`、`<div class="row g-3"><div class="col-md-6">…</div></div>`、`.container-fluid`。
- 卡片：`<div class="card shadow-sm"><div class="card-body">…</div></div>`，标题用 `.card-title`、文本用 `.card-text`。
- 按钮：`<a class="btn btn-primary">`、`<button class="btn btn-outline-secondary">`。
- 表单：`<div class="mb-3"><label class="form-label">姓名</label><input class="form-control"></div>`；栅格表单用 `.row.g-3` + `.col-*`。
- 表格：`<table class="table table-striped table-hover align-middle">`。
- 提示与徽章：`<div class="alert alert-info">`、`<span class="badge bg-success rounded-pill">`。
- 工具类：间距 `mt-4`/`py-5`、文字 `text-muted`/`fw-bold`/`text-center`、弹性 `d-flex align-items-center justify-content-between` 等。
- 主题强调色变量为 `--xq-accent`（见 `src/style.css`），需要自定义颜色时优先复用它。

## 5. 新增一个页面三步
1. 在 `pages/<页面名>/index.html` 新建，套用上方骨架并用 Bootstrap 写内容。
2. 在 `vite.config.mjs` 的 `build.rollupOptions.input` 增加一条：`<页面名>: resolve(__dirname, 'pages/<页面名>/index.html')`。
3. 在 `partials/header.html` 导航加一项：`<li class="nav-item"><a class="nav-link" href="/pages/<页面名>/index.html">菜单名</a></li>`。

## 6. 禁止事项
- 禁止写 `<style>` 块做布局；禁止引入其它 CSS / JS 框架。
- 禁止在 HTML 里再引入一次 Bootstrap（已自动注入）。
- 禁止用前端框架（React/Vue 等）重写页面。
