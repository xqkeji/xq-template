import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import xqInclude from 'vite-plugin-xq-include'
import xqMultiInput from 'vite-plugin-xq-multi-input'
import xqCpDep from 'vite-plugin-xq-cp-dep'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // 源码根目录（vite-plugin-xq-multi-input 内部用 path.join(process.cwd(), root) 拼接，
  // 因此 root 必须是相对路径；设为 'src' 即把 src/ 作为源码根，html/ 产物生成在 src 同级）
  root: 'src',
  // 静态资源目录：放在项目根（src 的同级），存放 favicon 等不参与打包的资源；
  // 同时 vite-plugin-xq-cp-dep 会把 dependencies（bootstrap / bootstrap-icons / xq-util）
  // 拷贝到此处（插件已改为读取 Vite 解析后的 config.publicDir，因此尊重本配置）。
  // 依赖经 header.html 中的内联脚本按相对路径从 public 引用，不再经 JS import 打包。
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
    xqCpDep(),
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
