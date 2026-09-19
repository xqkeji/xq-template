#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = path.join(__dirname, 'template')

const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.svg', '.pdf',
])

// 模板目录里若残留本地构建产物 / lockfile（未清理的工作区），不应拷进新生成的工程
const SKIP_TOP_LEVEL = new Set([
  'node_modules', '.git', 'html', 'prototype.pdf', 'package-lock.json',
])
// 构建期由插件生成的 vendor 目录（模板自身 public/ 下用户资源仍会拷贝）
const SKIP_GENERATED = ['public/bootstrap']

const HELP = `xq-template — 基于 Vite + xq 插件的 HTML 产品原型脚手架

用法:
  npm create xq-template <project-name> [options]      (发布后)
  npm create ./xq-template <project-name> [options]    (本地, 未发布时)
  node xq-template/index.js <project-name> [options]   (任意)

选项:
  --install     脚手架生成后自动执行 npm install
  -h, --help   显示本帮助

示例:
  npm create xq-template my-prototype
  cd my-prototype && npm install && npm run dev

生成的工程包含:
  · vite-plugin-xq-include  HTML 片段复用
  · vite-plugin-xq-multi-input  多页面自动入口
  · xq-banner               构建产物版权信息生成
  · xq-util                 基础工具库
  · bootstrap               最新版 UI 框架
  · export-pdf.mjs          用 Playwright 把所有页面合并导出为一个 PDF
`

function fail(msg) {
  console.error('✗ ' + msg)
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.includes('-h') || args.includes('--help') || args.length === 0) {
  console.log(HELP)
  process.exit(args.length === 0 ? 1 : 0)
}

const projectName = args[0]
const doInstall = args.includes('--install')
const targetDir = path.resolve(process.cwd(), projectName)

if (!/^[\w.-]+$/.test(projectName)) {
  fail(`项目名不合法: ${projectName}（仅允许字母/数字/./-/_）`)
}

if (existsSync(targetDir) && (await fs.readdir(targetDir)).length > 0) {
  fail(`目标目录已存在且非空: ${targetDir}`)
}

const placeholders = {
  name: projectName,
  year: String(new Date().getFullYear()),
}

await copyTemplate(TEMPLATE_DIR, targetDir, placeholders)
console.log(`✓ 已创建项目: ${projectName}`)

if (doInstall) {
  console.log('\n正在执行 npm install ...')
  const res = spawnSync('npm', ['install'], { cwd: targetDir, stdio: 'inherit', shell: true })
  if (res.status !== 0) fail('npm install 失败，请手动进入目录执行 npm install')
}

console.log(`\n下一步:\n  cd ${projectName}\n  npm install          # 若未加 --install\n  npm run dev          # 启动开发服务器\n  npm run build        # 构建 HTML 页面\n  npm run pdf          # 合并导出 prototype.pdf（首次需: npx playwright install chromium）`)

async function copyTemplate(src, dest, ph) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    if (src === TEMPLATE_DIR && SKIP_TOP_LEVEL.has(e.name)) continue
    const s = path.join(src, e.name)
    const rel = path.relative(TEMPLATE_DIR, s).split(path.sep).join('/')
    if (SKIP_GENERATED.includes(rel)) continue
    const d = path.join(dest, e.name)
    if (e.isDirectory()) {
      await copyTemplate(s, d, ph)
    } else {
      await copyFileWithReplace(s, d, ph)
    }
  }
}

async function copyFileWithReplace(src, dest, ph) {
  if (BINARY_EXTS.has(path.extname(src).toLowerCase())) {
    await fs.copyFile(src, dest)
    return
  }
  let content = await fs.readFile(src, 'utf8')
  for (const [k, v] of Object.entries(ph)) {
    content = content.split(`{{${k}}}`).join(v)
  }
  await fs.writeFile(dest, content)
}
