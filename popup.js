let uidArr = []
let interval = 30
function sendMessageToContentScript(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response)
    })
  })
}
document.querySelector('#start').addEventListener('click', function () {
  uidArr = document.querySelector('#list').value.split(/\n|\r/)
  interval = document.querySelector('#interval').value
  sendMessageToContentScript(
    { cmd: 'start', uids: uidArr, interval: interval },
    function (response) {
      console.log('来自content的回复：' + response)
    }
  )
})

document.querySelector('#stop').addEventListener('click', function () {
  if (document.querySelector('#stop').innerHTML === '停止') {
    document.querySelector('#stop').innerHTML = '继续'
    sendMessageToContentScript({ cmd: 'stop' }, function (response) {
      console.log('来自content的回复：' + response)
    })
  } else {
    document.querySelector('#stop').innerHTML = '停止'
    sendMessageToContentScript({ cmd: 'continue' }, function (response) {
      console.log('来自content的回复：' + response)
    })
  }
})

chrome.extension.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.greeting.length) {
    document.querySelector('#list').value = request.greeting.join('\n')
  }
  if (request.status && request.status === 'stop') {
    document.querySelector('#stop').innerHTML = '继续'
  }
  if (request.status && request.status === 'continue') {
    document.querySelector('#stop').innerHTML = '停止'
  }
  if (request.interval) {
    document.querySelector('#interval').value = request.interval
  }
})
