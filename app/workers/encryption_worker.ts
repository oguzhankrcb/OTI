import { parentPort } from 'node:worker_threads'
import NodeRSA from 'node-rsa'
import { deflateSync, inflateSync } from 'node:zlib'

// The worker will receive operations to perform via messages
parentPort?.on('message', (data) => {
  try {
    let result

    switch (data.operation) {
      case 'encrypt':
        result = encryptOperation(data.text)
        break
      case 'decrypt':
        result = decryptOperation(data.encryptedText, data.privateKey)
        break
      case 'validateKey':
        result = validateKeyOperation(data.encryptedText, data.privateKey)
        break
      case 'compressKey':
        result = compressKeyOperation(data.privateKey)
        break
      case 'decompressKey':
        result = decompressKeyOperation(data.compressedKey)
        break
      default:
        throw new Error(`Unknown operation: ${data.operation}`)
    }

    // Send the result back to the main thread
    parentPort?.postMessage({ success: true, result })
  } catch (error: any) {
    // Send error back to the main thread
    parentPort?.postMessage({
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
      },
    })
  }
})

// Implementation of encryption operations
function encryptOperation(text: string) {
  const key = new NodeRSA({ b: 2048 })
  const publicKey = key.exportKey('public')
  const privateKey = key.exportKey('private')
  const encryptedText = key.encrypt(text, 'base64')

  return {
    encryptedText,
    publicKey,
    privateKey,
  }
}

function decryptOperation(encryptedText: string, privateKey: string) {
  const key = new NodeRSA(privateKey)
  return key.decrypt(encryptedText, 'utf8')
}

function validateKeyOperation(encryptedText: string, privateKey: string) {
  try {
    decryptOperation(encryptedText, privateKey)
    return true
  } catch (error) {
    return false
  }
}

function compressKeyOperation(privateKey: string) {
  // Compress the private key using zlib
  const compressed = deflateSync(Buffer.from(privateKey, 'utf8'))

  // Encode to base64 and make it URL safe
  return compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decompressKeyOperation(compressedKey: string) {
  // Make base64 URL safe string back to regular base64
  let base64 = compressedKey.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '='
  }

  // Decompress the key
  const decompressed = inflateSync(Buffer.from(base64, 'base64'))
  return decompressed.toString('utf8')
}
