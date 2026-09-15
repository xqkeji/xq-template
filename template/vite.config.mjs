import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import xqInclude from 'vite-plugin-xq-include'
import xqCpDep from 'vite-plugin-xq-cp-dep'
import xqMultiInput from 'vite-plugin-xq-multi-input'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // 相对路径，方便构建产物直接以 file:// 打开 / 导出 PDF
  base: './',
  // 开发/预览时自动打开浏览器（默认打开首页 /，多页应用可改成具体页面如 '/pages/about/index.html'）
  server: {
    open: true,
  },
  plugins: [
    xqInclude(),
    xqCpDep(),
    xqMultiInput(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // 每个页面目录定义一个入口即可，xq-multi-input 会自动加入同目录其它 .html
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'pages/about/index.html'),
        components: resolve(__dirname, 'pages/components/index.html'),
        contact: resolve(__dirname, 'pages/contact/index.html'),
      },
    },
  },
})
