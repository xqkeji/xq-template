import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as xqUtil from 'xq-util'
import '../scss/style.scss'

// xq-util 提供 domReady；如当前版本无该导出则降级到原生 DOMContentLoaded
const ready = (cb: () => void): void => {
  if (typeof xqUtil.domReady === 'function') {
    xqUtil.domReady(cb)
  } else if (document.readyState !== 'loading') {
    cb()
  } else {
    document.addEventListener('DOMContentLoaded', cb)
  }
}

ready(() => {
  // Bootstrap 交互组件（如需要）已随 bootstrap 自动初始化
  console.log('{{name}} prototype ready')
})
