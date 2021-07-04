const {createDecipher} = require("crypto")

function seedHexEncryptionKey(hostEncryptionKey) {
  let encryptionKey = hostEncryptionKey
  if (!encryptionKey || encryptionKey.length !== 64) {
    throw new Error(
      "Failed to load or generate encryption key this should never happen"
    )
  }
  return encryptionKey
}

exports.decryptSeedHex = (encryptedSeedHex, hostEncryptionKey) => {
  const encryptionKey = seedHexEncryptionKey(hostEncryptionKey)
  const decipher = createDecipher("aes-256-gcm", encryptionKey)
  return decipher.update(Buffer.from(encryptedSeedHex, "hex")).toString()
}
