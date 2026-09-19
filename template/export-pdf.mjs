// 把所有构建产物（html/）下的 HTML 页面合并导出为一个 PDF。
// 依赖: playwright（首次需 npx playwright install chromium）+ pdf-lib
import { chromium } from 'playwright'
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PDFDocument } from 'pdf-lib'

const OUT_DIR = resolve('html')
const OUTPUT = 'prototype.pdf'

if (!existsSync(OUT_DIR)) {
  console.error(`✗ 未找到构建产物目录 "${OUT_DIR}"，请先运行: npm run build`)
  process.exit(1)
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

const htmlFiles = collectHtml(OUT_DIR).sort()
if (htmlFiles.length === 0) {
  console.error('✗ 没有找到任何 HTML 页面')
  process.exit(1)
}

console.log(`发现 ${htmlFiles.length} 个页面，开始渲染 PDF ...`)

const browser = await chromium.launch().catch((err) => {
  console.error(`✗ 无法启动 Chromium：${err.message}`)
  console.error('  请先安装浏览器内核: npx playwright install chromium')
  process.exit(1)
})
const merged = await PDFDocument.create()

for (const file of htmlFiles) {
  const rel = file.slice(OUT_DIR.length + 1)
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
  console.log(`  ✓ ${rel}`)
}

await browser.close()

const pdfBytes = await merged.save()
writeFileSync(OUTPUT, pdfBytes)
console.log(`\n✓ 已合并导出: ${OUTPUT}（共 ${merged.getPageCount()} 页）`)
