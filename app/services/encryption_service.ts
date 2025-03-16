import { getWorkerPool } from './worker_pool.js'
import logger from '@adonisjs/core/services/logger'
/**
 * EncryptionService provides asymmetric encryption functionality using RSA
 * for the one-time information sharing application.
 *
 * Uses a WorkerPool for CPU-intensive operations to prevent blocking the main thread.
 */
export class EncryptionService {
  /**
   * Encrypts the provided text using RSA asymmetric encryption
   *
   * @param text The text to be encrypted
   * @returns A promise that resolves to an object containing the encrypted text and both public and private keys
   */
  public static async encrypt(text: string): Promise<{
    encryptedText: string
    publicKey: string
    privateKey: string
  }> {
    try {
      // Offload the CPU-intensive encryption to a worker thread
      const result = await getWorkerPool().execute({
        operation: 'encrypt',
        text,
      })

      return result
    } catch (error) {
      logger.error('Encryption failed:', error)
      throw new Error('Failed to encrypt the message.')
    }
  }

  /**
   * Decrypts the encrypted text using the provided private key
   *
   * @param encryptedText The encrypted text in base64 format
   * @param privateKey The private key in PEM format
   * @returns A promise that resolves to the decrypted text
   */
  public static async decrypt(encryptedText: string, privateKey: string): Promise<string> {
    try {
      // Offload the CPU-intensive decryption to a worker thread
      const result = await getWorkerPool().execute({
        operation: 'decrypt',
        encryptedText,
        privateKey,
      })

      return result
    } catch (error) {
      logger.error('Decryption failed:', error)
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
   * @returns A promise that resolves to a boolean indicating if the key can decrypt the text
   */
  public static async validateKey(encryptedText: string, privateKey: string): Promise<boolean> {
    try {
      // Offload validation to a worker thread
      const result = await getWorkerPool().execute({
        operation: 'validateKey',
        encryptedText,
        privateKey,
      })

      return result
    } catch (error) {
      return false
    }
  }

  /**
   * Compresses and encodes the private key for use in URL fragments
   *
   * @param privateKey The private key in PEM format
   * @returns A promise that resolves to the compressed and base64url encoded key
   */
  public static async compressPrivateKey(privateKey: string): Promise<string> {
    try {
      // Offload compression to a worker thread
      const result = await getWorkerPool().execute({
        operation: 'compressKey',
        privateKey,
      })

      return result
    } catch (error) {
      logger.error('Key compression failed:', error)
      throw new Error('Failed to compress the private key')
    }
  }

  /**
   * Decompresses the private key from URL fragment format
   *
   * @param compressedKey The compressed and base64url encoded key
   * @returns A promise that resolves to the original private key in PEM format
   */
  public static async decompressPrivateKey(compressedKey: string): Promise<string> {
    try {
      // Offload decompression to a worker thread
      const result = await getWorkerPool().execute({
        operation: 'decompressKey',
        compressedKey,
      })

      return result
    } catch (error) {
      logger.error('Key decompression failed:', error)
      throw new Error('Failed to decompress the private key. The key may be invalid or corrupted.')
    }
  }
}

export default EncryptionService
