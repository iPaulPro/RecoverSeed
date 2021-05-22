function postUser(publicKey) {
  const storedUsers = window.localStorage.getItem('users')
  if (storedUsers) {
    const users = JSON.parse(storedUsers)
    const user = users[publicKey]
    const currentWindow = opener || parent
    currentWindow.postMessage({user}, '*')
  }
}

const handleMessage = (message) => {
  const {data: {publicKey: publicKey}} = message
  postUser(publicKey)
}

const init = function () {
  window.addEventListener('message', handleMessage)
}

init()
