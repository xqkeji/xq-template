import { defineConfig } from 'vite'
import { resolve, relative, sep, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import xqInclude from 'vite-plugin-xq-include'
import xqMultiInput from 'vite-plugin-xq-multi-input'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

// Bootstrap 的 JS 走 classic <script>，不在 main.ts 里 ESM import：
// type="module" 脚本在 file://（origin 为 null）下会被 Chromium 按 CORS 拦掉不执行，
// classic script 则不受限制，这样双击 html/ 产物时 data-bs-* 交互仍然可用。
// 文件拷进 publicDir，dev 由 Vite 直接按根路径提供，build 由 Vite 原样拷到产物根。
const VENDOR_SUBPATH = 'bootstrap/dist/js/bootstrap.bundle.min.js'
const VENDOR_DEST = 'bootstrap/bootstrap.bundle.min.js'

function bootstrapClassic() {
  let cfg
  const copyVendor = () => {
    const src = require.resolve(VENDOR_SUBPATH)
    const dest = resolve(cfg.publicDir, VENDOR_DEST)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
  }
  return {
    name: 'bootstrap-classic',
    configResolved(resolved) {
      cfg = resolved
    },
    buildStart: copyVendor,
    configureServer: copyVendor,
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // dev 走站点根路径；build 产物要按页面所在层级回到产物根，才能兼容 file://
        let src
        if (cfg.command !== 'build') {
          src = '/' + VENDOR_DEST
        } else {
          const rel = ctx?.filename ? relative(cfg.root, dirname(ctx.filename)) : ''
          const depth = rel ? rel.split(sep).length : 0
          src = (depth ? '../'.repeat(depth) : './') + VENDOR_DEST
        }
        return {
          html,
          tags: [{ tag: 'script', attrs: { defer: '', src }, injectTo: 'bodyClose' }],
        }
      },
    },
  }
}

// file:// 兼容：Vite 默认给产物 <link>/<script> 注入 crossorigin 属性，
// 而带 crossorigin 的请求在 file://（origin 为 'null'）下会被 Chromium 按 CORS 拦截，
// 导致直接双击打开 html 产物 / 导出 PDF 时样式完全不生效。
// 这里在 html 生成末尾去掉 crossorigin，让 <link rel=stylesheet> 能在 file:// 下正常加载。
// （注：type=module 的 <script> 在 file:// 下仍受 CORS 限制不会执行，
//  所以 Bootstrap 的 JS 改由上面的 bootstrap-classic 以 classic script 注入。）
const stripCrossorigin = {
  name: 'strip-crossorigin-for-file',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replaceAll(' crossorigin', '')
    },
  },
}

export default defineConfig({
  // 源码根目录（vite-plugin-xq-multi-input 内部用 path.join(process.cwd(), root) 拼接，
  // 因此 root 必须是相对路径；设为 'src' 即把 src/ 作为源码根，html/ 产物生成在 src 同级）
  root: 'src',
  // 静态资源目录：放在项目根（src 的同级），存放 favicon 等不参与打包的资源。
  // bootstrap 的 CSS 与 bootstrap-icons 由 src/ts/main.ts import 经 Vite 打包；
  // bootstrap 的 JS 由 bootstrap-classic 插件把 vendor 文件拷到这里，再以 classic script 引用。
  publicDir: '../public',
  // 相对路径，方便构建产物直接以 file:// 打开 / 导出 PDF
  base: './',
  // 开发/预览时自动打开浏览器（默认打开首页 /，多页应用可改成具体页面如 '/pages/about/index.html'）
  server: {
    open: true,
  },
  plugins: [
    xqInclude(),
    xqMultiInput(),
    bootstrapClassic(),
    stripCrossorigin,
  ],
  build: {
    outDir: '../html',
    emptyOutDir: true,
    rollupOptions: {
      // 每个页面目录定义一个入口即可，xq-multi-input 会自动加入同目录其它 .html
      input: {
        index: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/pages/about/index.html'),
        components: resolve(__dirname, 'src/pages/components/index.html'),
        contact: resolve(__dirname, 'src/pages/contact/index.html'),
      },
    },
  },
})
