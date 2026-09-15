import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import * as xqUtil from 'xq-util'
import './style.css'

// xq-util 提供 domReady；如当前版本无该导出则降级到原生 DOMContentLoaded
const ready = (cb) => {
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
