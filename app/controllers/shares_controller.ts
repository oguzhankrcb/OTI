import type { HttpContext } from '@adonisjs/core/http'
import SecretShare from '#models/secret_share'
import { EncryptionService } from '#services/encryption_service'
import vine from '@vinejs/vine'

export default class SharesController {
  public async index({ view, request }: HttpContext) {
    return view.render('pages/share', {
      csrfToken: request.csrfToken,
    })
  }

  public async store({ request, response }: HttpContext) {
    const shareSchema = vine.object({
      content: vine.string(),
      expiration: vine.string().in(['5m', '1h', '1d', '7d']),
      password: vine.string().nullable(),
    })

    const payload = await vine.validate({
      schema: shareSchema,
      data: request.all(),
    })

    const { content, expiration, password } = payload

    try {
      const { share, privateKey } = await SecretShare.createShare(
        content,
        expiration,
        password || undefined
      )

      const compressedKey = await EncryptionService.compressPrivateKey(privateKey)

      return {
        success: true,
        shareUrl: `/share/${share.accessId}#${compressedKey}`,
        expiresAt: share.expiresAt,
      }
    } catch (error) {
      console.error('Error creating share:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to create encrypted share',
      })
    }
  }

  public async show({ params, view, request }: HttpContext) {
    const { id } = params

    const share = await SecretShare.findByAccessId(id)

    if (!share) {
      return view.render('pages/share_not_found')
    }

    return view.render('pages/share_decrypt', {
      accessId: id,
      csrfToken: request.csrfToken,
      hasPassword: !!share.passwordHash,
    })
  }

  public async decrypt({ request, params, response }: HttpContext) {
    const { id } = params

    const decryptSchema = vine.object({
      privateKey: vine.string(),
      password: vine.string().optional(),
    })

    const payload = await vine.validate({
      schema: decryptSchema,
      data: request.all(),
    })

    let { privateKey, password } = payload

    if (privateKey && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      try {
        privateKey = await EncryptionService.decompressPrivateKey(privateKey)
      } catch (error) {
        console.error('Failed to decompress private key:', error)
      }
    }

    const share = await SecretShare.findByAccessId(id)

    if (!share) {
      return response.status(404).json({
        success: false,
        message: 'Share not found or expired',
      })
    }

    if (share.passwordHash && !share.verifyPassword(password || '')) {
      return response.status(401).json({
        success: false,
        message: 'Invalid password',
      })
    }

    try {
      const decryptedText = await EncryptionService.decrypt(share.encryptedText, privateKey)

      await share.delete()

      return {
        success: true,
        content: decryptedText,
      }
    } catch (error) {
      console.error('Decryption failed:', error)
      return response.status(400).json({
        success: false,
        message: 'Failed to decrypt the content. The private key may be invalid.',
      })
    }
  }
}
