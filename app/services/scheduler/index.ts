import { Scheduler } from '#services/scheduler/scheduler'
import CleanExpiredShares from '#services/scheduler/tasks/clean_expired_shares'

/**
 * Register all scheduled tasks
 */
export function registerScheduledTasks() {
  const scheduler = new Scheduler()

  // Register tasks
  scheduler.register(new CleanExpiredShares())

  // Add more tasks here as needed

  return scheduler
}
