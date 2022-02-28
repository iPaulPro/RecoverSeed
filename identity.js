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
  const trusted_parent_origins = ['https://bitclout.com', 'https://node.deso.org']
  if (!message.origin || !trusted_parent_origins.includes(message.origin)) return
  const {data: {publicKey: publicKey}} = message
  if (publicKey) postUser(publicKey)
}

const init = function () {
  window.addEventListener('message', handleMessage)
}

init()
