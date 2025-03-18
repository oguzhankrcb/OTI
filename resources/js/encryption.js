import { JSEncrypt } from 'jsencrypt'
import pako from 'pako'

/**
 * Encryption utility for RSA encryption/decryption
 */
export class Encryption {
  /**
   * Generate a new RSA key pair
   * @returns {Promise<{publicKey: string, privateKey: string}>} The generated RSA key pair
   */
  static generateKeys() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crypt = new JSEncrypt({default_key_size: 2048})
        crypt.getKey()

        const publicKey = crypt.getPublicKey()
        const privateKey = crypt.getPrivateKey()

        resolve({ publicKey, privateKey })
      }, 0)
    })
  }

  /**
   * Encrypt text with a public key
   * @param {string} text - The text to encrypt
   * @param {string} publicKey - The RSA public key
   * @returns {string} The encrypted text
   */
  static encrypt(text, publicKey) {
    const crypt = new JSEncrypt({default_key_size: 2048})
    crypt.setPublicKey(publicKey)
    return crypt.encrypt(text)
  }

  /**
   * Compress a private key to reduce its size
   * @param {string} privateKey - The RSA private key to compress
   * @returns {string} Compressed private key in URL-safe base64 format
   */
  static compressPrivateKey(privateKey) {
    const encoder = new TextEncoder()
    const data = encoder.encode(privateKey)

    const compressed = pako.deflate(data)

    let base64 = btoa(String.fromCharCode.apply(null, compressed))

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  /**
   * Decompress a previously compressed private key
   * @param {string} compressedKey - The compressed private key
   * @returns {string} The original RSA private key
   */
  static decompressPrivateKey(compressedKey) {
    let base64 = compressedKey.replace(/-/g, '+').replace(/_/g, '/')

    while (base64.length % 4) {
      base64 += '='
    }

    try {
      const binaryStr = atob(base64)

      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }

      const decompressed = pako.inflate(bytes)

      return new TextDecoder().decode(decompressed)
    } catch (e) {
      console.error('Error decompressing key:', e)
      return compressedKey
    }
  }

  /**
   * Decrypt text with a private key
   * @param {string} encryptedText - The encrypted text to decrypt
   * @param {string} privateKey - The RSA private key (can be compressed)
   * @returns {string} The decrypted text
   */
  static decrypt(encryptedText, privateKey) {
    let formattedKey = privateKey
    if (!formattedKey.includes('BEGIN RSA PRIVATE KEY')) {
      formattedKey = this.decompressPrivateKey(formattedKey)
    }

    const decrypt = new JSEncrypt({default_key_size: 2048})
    decrypt.setPrivateKey(formattedKey)

    return decrypt.decrypt(encryptedText)
  }
}
