import type { Task } from '#services/scheduler/scheduler'
import SecretShare from '#models/secret_share'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

/**
 * Task to clean up expired shares from the database
 */
export default class CleanExpiredShares implements Task {
  /**
   * Unique name for the task
   */
  public name = 'clean:expired_shares'

  /**
   * Cron schedule expression - run every 15 minutes
   *
   * Cron format:
   * * * * * *
   * | | | | |
   * | | | | +-- Day of the week (0 - 7) (Sunday is 0 or 7)
   * | | | +---- Month (1 - 12)
   * | | +------ Day of the month (1 - 31)
   * | +-------- Hour (0 - 23)
   * +---------- Minute (0 - 59)
   */
  public schedule = '*/30 * * * *'

  /**
   * Handle the task - delete all shares that have expired
   */
  public async handle(): Promise<void> {
    try {
      // Find all shares that have expired
      const now = DateTime.now().toSQL()
      const expiredShares = await SecretShare.query().where('expires_at', '<', now)

      if (expiredShares.length === 0) {
        logger.info('No expired shares found')
        return
      }

      // Get the IDs of expired shares
      const expiredIds = expiredShares.map((share) => share.id)

      // Delete the expired shares
      const count = await SecretShare.query().whereIn('id', expiredIds).delete()

      logger.info(`Successfully deleted ${count} expired shares`)
    } catch (error) {
      logger.error(`Error deleting expired shares: ${error}`)
      throw error
    }
  }
}
