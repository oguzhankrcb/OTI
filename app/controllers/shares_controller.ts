import type { HttpContext } from '@adonisjs/core/http'
import SecretShare from '#models/secret_share'
import vine from '@vinejs/vine'
import logger from '@adonisjs/core/services/logger'

export default class SharesController {
  public async index({ view, request }: HttpContext) {
    return view.render('pages/share', {
      csrfToken: request.csrfToken,
    })
  }

  public async store({ request, response }: HttpContext) {
    const shareSchema = vine.object({
      encryptedText: vine.string(),
      expiration: vine.string().in(['5m', '1h', '1d', '7d']),
      password: vine.string().nullable(),
    })

    const payload = await vine.validate({
      schema: shareSchema,
      data: request.all(),
    })

    const { encryptedText, expiration, password } = payload

    try {
      const share = await SecretShare.createShare(encryptedText, expiration, password || undefined)

      return {
        success: true,
        accessId: share.accessId,
        expiresAt: share.expiresAt,
      }
    } catch (error) {
      logger.error('Error creating share:', error)
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

  public async getEncryptedText({ request, params, response }: HttpContext) {
    const { id } = params

    const getEncryptedTextSchema = vine.object({
      password: vine.string().optional(),
    })

    const payload = await vine.validate({
      schema: getEncryptedTextSchema,
      data: request.all(),
    })

    const { password } = payload

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
      const result = {
        success: true,
        encryptedText: share.encryptedText,
      }

      await share.delete()

      return result
    } catch (error) {
      logger.error('Error retrieving share:', error)
      return response.status(500).json({
        success: false,
        message: 'An error occurred while processing the share.',
      })
    }
  }
}
