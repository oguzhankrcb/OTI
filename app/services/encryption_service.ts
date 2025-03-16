import NodeRSA from 'node-rsa'
import { deflateSync, inflateSync } from 'node:zlib'

/**
 * EncryptionService provides asymmetric encryption functionality using RSA
 * for the one-time information sharing application.
 */
export class EncryptionService {
  /**
   * Encrypts the provided text using RSA asymmetric encryption
   *
   * @param text The text to be encrypted
   * @returns An object containing the encrypted text and both public and private keys
   */
  public static encrypt(text: string): {
    encryptedText: string
    publicKey: string
    privateKey: string
  } {
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

  /**
   * Decrypts the encrypted text using the provided private key
   *
   * @param encryptedText The encrypted text in base64 format
   * @param privateKey The private key in PEM format
   * @returns The decrypted text
   */
  public static decrypt(encryptedText: string, privateKey: string): string {
    try {
      const key = new NodeRSA(privateKey)

      const decryptedText = key.decrypt(encryptedText, 'utf8')

      return decryptedText
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error(
        'Failed to decrypt the message. The key may be invalid or the message corrupted.'
      )
    }
  }

  /**
   * Validates if the provided private key can decrypt the encrypted text
   *
   * @param encryptedText The encrypted text in base64 format
   * @param privateKey The private key in PEM format
   * @returns Boolean indicating if the key can decrypt the text
   */
  public static validateKey(encryptedText: string, privateKey: string): boolean {
    try {
      this.decrypt(encryptedText, privateKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Compresses and encodes the private key for use in URL fragments
   *
   * @param privateKey The private key in PEM format
   * @returns The compressed and base64url encoded key
   */
  public static compressPrivateKey(privateKey: string): string {
    try {
      // Compress the private key using zlib
      const compressed = deflateSync(Buffer.from(privateKey, 'utf8'))

      // Encode to base64 and make it URL safe
      return compressed
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    } catch (error) {
      console.error('Key compression failed:', error)
      throw new Error('Failed to compress the private key')
    }
  }

  /**
   * Decompresses the private key from URL fragment format
   *
   * @param compressedKey The compressed and base64url encoded key
   * @returns The original private key in PEM format
   */
  public static decompressPrivateKey(compressedKey: string): string {
    try {
      // Make base64 URL safe string back to regular base64
      let base64 = compressedKey.replace(/-/g, '+').replace(/_/g, '/')

      // Add padding if needed
      while (base64.length % 4) {
        base64 += '='
      }

      // Decompress the key
      const decompressed = inflateSync(Buffer.from(base64, 'base64'))
      return decompressed.toString('utf8')
    } catch (error) {
      console.error('Key decompression failed:', error)
      throw new Error('Failed to decompress the private key. The key may be invalid or corrupted.')
    }
  }
}

export default EncryptionService
