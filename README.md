# create-xq-template

基于 **Vite 8** + xq 插件体系的 **HTML 产品原型**脚手架。一条命令生成一个自带多页面、片段复用、版权信息生成、并可一键导出 PDF 的原型工程。

## 包含的依赖

| 包 | 作用 |
| --- | --- |
| `vite-plugin-xq-cp-dep` | 把 `dependencies` 全部复制到 `public/` |
| `vite-plugin-xq-include` | HTML 片段复用（`<xq-include file="...">`） |
| `vite-plugin-xq-multi-input` | 自动扫描页面目录、配置多 HTML 入口 |
| `xq-banner` | 构建产物自动生成版权信息头 |
| `xq-util` | 前端基础工具库 |
| `bootstrap` | 最新版 UI 框架 |
| `playwright` + `pdf-lib` | 把所有页面合并导出为一个 PDF |

## 使用方式

### 本地（未发布时）
```bash
# 在 npm 工作区根目录执行
npm create ./xq-template my-prototype
# 或者直接跑脚手架脚本
node xq-template/index.js my-prototype
```

### 发布到 npm 之后
```bash
npm create xq-template my-prototype
```

### 生成后
```bash
cd my-prototype
npm install
npm run dev        # 启动开发服务器，编辑 src/ 与 pages/ 下的 HTML
npm run build      # 构建所有 HTML 页面到 html/
npm run pdf        # 合并 html/ 下所有页面导出为 prototype.pdf
```

> 首次使用 `npm run pdf` 前需安装一次浏览器内核：
> ```bash
> npx playwright install chromium
> ```

## 项目结构（生成后）

```
my-prototype/
├─ src/                          # 源码根（Vite root = 'src'）
│  ├─ index.html                 # 首页
│  ├─ pages/
│  │  ├─ about/index.html        # 关于页
│  │  ├─ components/index.html   # 组件样板间（Bootstrap 组件范例）
│  │  └─ contact/index.html      # 联系页（新增页面加子目录即可）
│  ├─ partials/
│  │  ├─ header.html             # 公共头部（导航）
│  │  └─ footer.html             # 公共底部
│  ├─ ts/
│  │  └─ main.ts                 # 入口脚本（TypeScript：引入 bootstrap / xq-util）
│  ├─ scss/
│  │  └─ style.scss              # 样式（Sass / SCSS）
│  └─ vite-env.d.ts             # Vite 类型声明
├─ .github/
│  └─ copilot-instructions.md   # AI 助手（GitHub Copilot）开发约定
├─ AGENTS.md                     # AI 助手（Agent / Claude）开发约定
├─ CLAUDE.md                     # AI 助手（Claude Code）开发约定
├─ tsconfig.json                 # TypeScript 配置
├─ export-pdf.mjs                # Playwright 合并导出 PDF
├─ vite.config.mjs               # 三个 xq 插件接线
└─ package.json
```

## 新增一个页面

1. 在 `src/pages/` 下新建子目录，例如 `src/pages/order/index.html`；
2. 在 `vite.config.mjs` 的 `rollupOptions.input` 增加一条入口：
   ```js
   order: resolve(__dirname, 'src/pages/order/index.html'),
   ```
   `vite-plugin-xq-multi-input` 会自动把它纳入构建；
3. 页面内用 `<xq-include file="/partials/header.html"></xq-include>` 复用公共片段。
