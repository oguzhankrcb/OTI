import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { EncryptionService } from '../services/encryption_service.js'
import crypto from 'node:crypto'

export default class SecretShare extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare encryptedText: string

  @column()
  declare publicKey: string

  @column()
  declare accessId: string

  @column()
  declare passwordHash: string | null

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  public static async createShare(
    text: string,
    expiresIn: string,
    password?: string
  ): Promise<{ share: SecretShare; privateKey: string }> {
    const { encryptedText, publicKey, privateKey } = EncryptionService.encrypt(text)

    const accessId = crypto.randomBytes(32).toString('hex')

    const expiresAt = this.calculateExpirationTime(expiresIn)

    let passwordHash = null
    if (password) {
      passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    }

    const share = await this.create({
      encryptedText,
      publicKey,
      accessId,
      passwordHash,
      expiresAt,
    })

    return { share, privateKey }
  }

  public static async findByAccessId(accessId: string): Promise<SecretShare | null> {
    return await this.query()
      .where('accessId', accessId)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()
  }

  public verifyPassword(password: string): boolean {
    if (!this.passwordHash) return true

    const inputHash = crypto.createHash('sha256').update(password).digest('hex')
    return inputHash === this.passwordHash
  }

  private static calculateExpirationTime(expiresIn: string): DateTime {
    const now = DateTime.now()

    switch (expiresIn) {
      case '5m':
        return now.plus({ minutes: 5 })
      case '1h':
        return now.plus({ hours: 1 })
      case '1d':
        return now.plus({ days: 1 })
      case '7d':
        return now.plus({ days: 7 })
      default:
        return now.plus({ hours: 1 })
    }
  }
}
