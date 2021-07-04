const containerId = 'recovery-container'
const recoverBtnId = 'recover-btn'

const HDKey = require('hdkey')

const {decryptSeedHex} = require('./lib/decryptSeedHex')

const createSeedPhraseDiv = (seedPhrase) => {
  const seedTextAreaId = 'seed-phrase'
  const seedPhraseDiv = document.createElement('div')
  seedPhraseDiv.innerHTML = `
      <div class="form-group">
        <label for="${seedTextAreaId}" class="fs-15px">Seed phrase</label>
        <textarea class="form-control w-100 my-10px d-flex" id="${seedTextAreaId}" readonly>${seedPhrase}</textarea>
      </div>
    `
  return seedPhraseDiv
}

const createPassphraseDiv = (passphrase) => {
  const passphraseTextAreaId = 'passphrase'
  const passphraseDiv = document.createElement('div')
  passphraseDiv.innerHTML = `
        <div class="form-group">
          <label for="${passphraseTextAreaId}" class="fs-15px">Passphrase</label>
          <textarea class="form-control w-100 my-10px d-flex" id="${passphraseTextAreaId}" readonly>${passphrase}</textarea>
        </div>
      `
  return passphraseDiv
}

const createCreditParagraph = () => {
  const p = document.createElement('p')
  p.className = 'fs-14px text-muted mt-2'
  p.innerHTML = 'Recovered by <a href="/u/recoverseed">@RecoverSeed</a>'
  return p
}

const onRecoverButtonClick = () => {
  const iframe = document.getElementById("identity")
  const lastLoggedInUser = window.localStorage.getItem('lastLoggedInUser')
  if (iframe && lastLoggedInUser) {
    const publicKey = JSON.parse(lastLoggedInUser)
    iframe.contentWindow.postMessage({publicKey}, '*')
  }
}

const addRecoverButton = (settingsPage) => {
  if (document.getElementById(recoverBtnId)) return

  const page = settingsPage.querySelector('.global__mobile-scrollable-section')
  if (page == null) return

  const container = document.createElement('div')
  container.id = containerId

  const button = document.createElement('button')
  button.id = recoverBtnId
  button.className = 'btn btn-warning btn-large font-weight-bold fs-15px'
  button.innerText = 'Recover seed phrase'
  button.onclick = () => onRecoverButtonClick()

  const row = document.createElement('div')
  row.className = 'w-100 my-30px d-flex align-items-center'

  row.appendChild(button)
  container.appendChild(row)
  page.appendChild(container)
}

const downloadText = (val, fileName) => {
  const contents = encodeURIComponent(val)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + contents)
  element.setAttribute('download', fileName)
  element.style.display = 'none'

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const getLastLoggedInUser = () => {
 return JSON.parse(window.localStorage.getItem('lastLoggedInUser'))
}

const getSeedHex = (seedHexKey) => {
  const identityUsers = JSON.parse(window.localStorage.getItem('identityUsers'))
  const lastLoggedInUser = getLastLoggedInUser()
  const encryptedSeedHex = identityUsers[lastLoggedInUser]['encryptedSeedHex']
  return decryptSeedHex(encryptedSeedHex, seedHexKey)
}

const onIdentityMessageReceived = (user, seedHexKey) => {
  console.log(`onIdentityMessageReceived seedHexKey = ${seedHexKey}`)
  if (!user) return

  const container = document.getElementById(containerId)
  if (!container) return

  let seedPhrase = user['mnemonic']
  const passphrase = user['extraText']

  if (!seedPhrase || seedPhrase === 'unknown') {
    const seedHex = getSeedHex(seedHexKey)
    const masterKey = HDKey.fromMasterSeed(Buffer.from(seedHex, 'hex'))
    // const childKey = masterKey.derive('m/44\'/0\'/0\'/0/0', false)
    // downloadText(JSON.stringify(masterKey.toJSON()), getLastLoggedInUser().toString())
  }

  const seedPhraseDiv = createSeedPhraseDiv(seedPhrase)
  container.appendChild(seedPhraseDiv)

  if (passphrase) {
    const passphraseDiv = createPassphraseDiv(passphrase)
    container.appendChild(passphraseDiv)
  }

  const settingsPage = document.querySelector('app-settings-page')
  const button = document.getElementById(recoverBtnId)
  if (!settingsPage || !button) return

  const page = settingsPage.querySelector('.global__mobile-scrollable-section')
  if (page != null) {
    button.innerText = 'Hide seed phrase'
    button.onclick = () => page.removeChild(container)
  }

  if (seedPhrase && seedPhrase !== 'unknown') {
    const p = createCreditParagraph()
    container.appendChild(p)
  }
}

const appRootObserverCallback = () => {
  const settingsPage = document.querySelector('app-settings-page')
  if (settingsPage) {
    addRecoverButton(settingsPage)
  }
}

const observeAppRoot = () => {
  const appRoot = document.querySelector('app-root')
  if (appRoot) {
    const appRootObserverConfig = {childList: true, subtree: true}
    const appRootObserver = new MutationObserver(appRootObserverCallback)
    appRootObserver.observe(appRoot, appRootObserverConfig)
  }
}

const handleFrontendMessage = (message) => {
  const {data: {user: user, seedHexKey: seedHexKey}} = message
  if (user) {
    onIdentityMessageReceived(user, seedHexKey)
  }
}

function postMessageToFrontend(publicKey) {
  const storedUsers = window.localStorage.getItem('users')
  if (storedUsers) {
    const users = JSON.parse(storedUsers)
    const user = users[publicKey]
    const seedHexKey = window.localStorage.getItem('seed-hex-key-bitclout.com')
    const currentWindow = opener || parent
    currentWindow.postMessage({user, seedHexKey}, '*')
  }
}

const handleIdentityMessage = (message) => {
  const trusted_parent_origins = ['https://bitclout.com']
  if (!message.origin || !trusted_parent_origins.includes(message.origin)) return
  const {data: {publicKey: publicKey}} = message
  if (publicKey) postMessageToFrontend(publicKey)
}

const init = () => {
  if (window.location !== window.parent.location) {
    window.addEventListener('message', handleIdentityMessage)
  } else {
    window.addEventListener('message', handleFrontendMessage)
    observeAppRoot()
  }
}

init()
