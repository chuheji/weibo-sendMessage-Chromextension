function injectCustomJs(jsPath) {
  jsPath = jsPath || 'js/inject.js'
  var temp = document.createElement('script')
  temp.setAttribute('type', 'text/javascript')
  temp.src = chrome.extension.getURL(jsPath)
  temp.onload = function () {
    this.parentNode.removeChild(this)
  }
  document.head.appendChild(temp)
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function Toast(msg, duration) {
  duration = isNaN(duration) ? 3000 : duration
  var m = document.createElement('div')
  m.innerHTML = msg
  m.style.cssText =
    'max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;'
  document.body.appendChild(m)
  setTimeout(function () {
    var d = 0.5
    m.style.webkitTransition =
      '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in'
    m.style.opacity = '0'
    setTimeout(function () {
      document.body.removeChild(m)
    }, d * 1000)
  }, duration)
}

window.addEventListener('load', function() {
  injectCustomJs()
})

let timer
let sendTimer
let uidArr = []
let interval
let initinterval
let status = ''

chrome.extension.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.cmd == 'start') {
    Toast('已开始发私信', 2000)
    uidArr = request.uids
    initinterval = request.interval
    interval = (+request.interval + getRandomInt(1, 5)) * 1000
    status = 'start'
    timer = setInterval(() => {
      if (uidArr.length) {
        window.open(
          `https://api.weibo.com/chat/#/chat?to_uid=${uidArr[0]}&source_from=9`,
          '_blank'
        )
        uidArr.shift()
        sendResponse('recived')
      } else {
        clearInterval(timer)
      }
    }, interval)
  }
  if (request.cmd == 'stop') {
    status = 'stop'
    Toast('已结束发私信', 2000)
    clearInterval(timer)
  }
  if (request.cmd == 'continue') {
    status = 'continue'
    Toast('已继续发私信', 2000)
    timer = setInterval(() => {
      if (uidArr.length) {
        window.open(
          `https://api.weibo.com/chat/#/chat?to_uid=${uidArr[0]}&source_from=9`,
          '_blank'
        )
        uidArr.shift()
        sendResponse('recived')
      } else {
        clearInterval(timer)
      }
    }, interval)
  }
})
sendTimer = setInterval(() => {
  chrome.extension.sendMessage(
    { greeting: uidArr, status: status, interval: initinterval },
    function (response) {
      // console.log('收到来自后台的回复：' + response);
    }
  )
}, 1000)
if (status === 'stop') {
  clearInterval(sendTimer)
}
