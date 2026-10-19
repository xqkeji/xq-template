// 把所有构建产物（html/）下的 HTML 页面合并导出为一个 PDF。
// 页面顺序以 vite.config.mjs 里 build.rollupOptions.input 的注册顺序为准，
// 未被注册（由 xq-multi-input 目录扫描带入）的页面按路径排在末尾。
// 依赖: playwright（首次需 npx playwright install chromium）+ pdf-lib
import { chromium } from 'playwright'
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join, extname, resolve, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PDFDocument } from 'pdf-lib'

const OUTPUT = 'prototype.pdf'
const toPosix = (p) => p.split(sep).join('/')

// 读 vite.config.mjs 拿 root / outDir / 入口注册顺序；读不到则退回按路径排序
async function loadViteConfig() {
  const file = resolve('vite.config.mjs')
  if (!existsSync(file)) return null
  try {
    let config = (await import(pathToFileURL(file).href)).default
    if (typeof config === 'function') config = await config({ command: 'build', mode: 'production' })
    return config ?? null
  } catch (err) {
    console.warn(`! 读取 vite.config.mjs 失败，改用文件名排序导出：${err.message}`)
    return null
  }
}

function collectHtml(dir) {
  let files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(collectHtml(full))
    } else if (extname(entry.name) === '.html') {
      files.push(full)
    }
  }
  return files
}

const config = await loadViteConfig()
const srcDir = resolve(config?.root ?? 'src')
const OUT_DIR = resolve(srcDir, config?.build?.outDir ?? '../html')

if (!existsSync(OUT_DIR)) {
  console.error(`✗ 未找到构建产物目录 "${OUT_DIR}"，请先运行: npm run build`)
  process.exit(1)
}

const allFiles = collectHtml(OUT_DIR).sort()

// 按注册顺序把 src 入口映射到 html 产物路径
const ordered = []
const picked = new Set()
const input = config?.build?.rollupOptions?.input
const entries = Array.isArray(input) ? input : input ? Object.values(input) : []
for (const entry of entries) {
  const rel = toPosix(relative(srcDir, resolve(String(entry))))
  const target = join(OUT_DIR, rel)
  if (!existsSync(target)) {
    console.warn(`! 入口 ${rel} 在构建产物中未找到，已跳过（是否忘了 npm run build？）`)
    continue
  }
  if (picked.has(target)) continue
  ordered.push(target)
  picked.add(target)
}
const extras = allFiles.filter((file) => !picked.has(file))
if (extras.length) {
  console.log(`· ${extras.length} 个页面未在 vite.config.mjs 注册入口，按路径排在末尾`)
}
const htmlFiles = [...ordered, ...extras]

if (htmlFiles.length === 0) {
  console.error('✗ 没有找到任何 HTML 页面')
  process.exit(1)
}

console.log(`发现 ${htmlFiles.length} 个页面，按注册顺序渲染 PDF：`)
for (const file of htmlFiles) console.log(`  · ${toPosix(relative(OUT_DIR, file))}`)
console.log('')

const browser = await chromium.launch().catch((err) => {
  console.error(`✗ 无法启动 Chromium：${err.message}`)
  console.error('  请先安装浏览器内核: npx playwright install chromium')
  process.exit(1)
})
const merged = await PDFDocument.create()

for (const file of htmlFiles) {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' })
  // 等待字体/异步资源就绪，避免 PDF 中文/图标缺失
  await page
    .evaluate(() => (document.fonts ? document.fonts.ready : true))
    .catch(() => {})
  await page
    .pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    })
    .then(async (buf) => {
      const doc = await PDFDocument.load(buf)
      const pages = await merged.copyPages(doc, doc.getPageIndices())
      pages.forEach((p) => merged.addPage(p))
    })
  await page.close()
  console.log(`  ✓ ${toPosix(relative(OUT_DIR, file))}`)
}

await browser.close()

const pdfBytes = await merged.save()
writeFileSync(OUTPUT, pdfBytes)
console.log(`\n✓ 已合并导出: ${OUTPUT}（共 ${merged.getPageCount()} 页）`)
