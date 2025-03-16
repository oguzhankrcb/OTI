import { ApplicationService } from '@adonisjs/core/types'
import { registerScheduledTasks } from '#services/scheduler/index'

export default class SchedulerProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  /**
   * Initialize scheduler when the app is ready
   */
  async ready() {
    if (process.env.START_SCHEDULER === 'true') {
      const scheduler = registerScheduledTasks()
      scheduler.start()

      // Stop scheduler when application is shutting down
      this.app.terminating(() => {
        scheduler.stop()
      })
    }
  }
}
