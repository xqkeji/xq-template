import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import xqInclude from 'vite-plugin-xq-include'
import xqMultiInput from 'vite-plugin-xq-multi-input'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// file:// 兼容：Vite 默认给产物 <link>/<script> 注入 crossorigin 属性，
// 而带 crossorigin 的请求在 file://（origin 为 'null'）下会被 Chromium 按 CORS 拦截，
// 导致直接双击打开 html 产物 / 导出 PDF 时样式完全不生效。
// 这里在 html 生成末尾去掉 crossorigin，让 <link rel=stylesheet> 能在 file:// 下正常加载。
// （注：type=module 的 <script> 在 file:// 下仍受 CORS 限制不会执行，但 PDF 为静态渲染，
//  样式生效即可，交互仅在 dev/http 环境需要。）
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
  // bootstrap / bootstrap-icons / xq-util 等依赖已改由 src/ts/main.ts import 经 Vite 打包，
  // 不再需要 vite-plugin-xq-cp-dep 原样拷贝到 public。
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
