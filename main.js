const containerId = 'recovery-container'
const recoverBtnId = 'recover-btn'

function createSeedPhraseDiv(seedPhrase) {
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

function createPassphraseDiv(passphrase) {
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

function createCreditParagraph() {
  const p = document.createElement('p')
  p.className = 'fs-14px text-muted mt-2'
  p.innerHTML = 'Recovered by <a href="/u/recoverseed">@RecoverSeed</a>'
  return p
}

function onRecoverButtonClick() {
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

const handleUserMessage = (user) => {
  if (!user) return

  const container = document.getElementById(containerId)
  if (!container) return

  const seedPhrase = user['mnemonic']
  const passphrase = user['extraText']

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

const handleMessage = (message) => {
  const {data: {user: user}} = message
  if (user) {
    handleUserMessage(user)
  }
}

const appRootObserverCallback = function () {
  const settingsPage = document.querySelector('app-settings-page')
  if (settingsPage) {
    addRecoverButton(settingsPage)
  }
}

function observeAppRoot() {
  const appRoot = document.querySelector('app-root')
  if (appRoot) {
    const appRootObserverConfig = {childList: true, subtree: true}
    const appRootObserver = new MutationObserver(appRootObserverCallback)
    appRootObserver.observe(appRoot, appRootObserverConfig)
  }
}

const init = function () {
  window.addEventListener('message', handleMessage)
  observeAppRoot()
}

init()
