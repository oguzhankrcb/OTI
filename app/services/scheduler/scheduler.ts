import cron from 'node-cron'
import type { ScheduledTask } from 'node-cron'
import logger from '@adonisjs/core/services/logger'

/**
 * Task interface representing a scheduled job
 */
export interface Task {
  name: string
  schedule: string
  handle: () => Promise<void>
}

/**
 * Scheduler class for managing cron jobs
 */
export class Scheduler {
  private static instance: Scheduler
  private tasks: Map<string, { task: Task; cronJob: ScheduledTask }> = new Map()

  /**
   * Get the singleton instance of Scheduler
   */
  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler()
    }
    return Scheduler.instance
  }

  /**
   * Register a task with the scheduler
   */
  public register(task: Task): void {
    const cronJob = cron.schedule(
      task.schedule,
      async () => {
        try {
          logger.info(`Running scheduled task: ${task.name}`)
          await task.handle()
          logger.info(`Completed scheduled task: ${task.name}`)
        } catch (error) {
          logger.error(`Error running scheduled task ${task.name}: ${error}`)
        }
      },
      {
        scheduled: false,
      }
    )

    this.tasks.set(task.name, { task, cronJob })
    logger.info(`Registered task: ${task.name} with schedule: ${task.schedule}`)
  }

  /**
   * Start all registered tasks
   */
  public start(): void {
    for (const [name, { cronJob }] of this.tasks.entries()) {
      cronJob.start()
      logger.info(`Started task: ${name}`)
    }
    logger.info('Scheduler started')
  }

  /**
   * Stop all registered tasks
   */
  public stop(): void {
    for (const [name, { cronJob }] of this.tasks.entries()) {
      cronJob.stop()
      logger.info(`Stopped task: ${name}`)
    }
    logger.info('Scheduler stopped')
  }

  /**
   * Get a list of all registered tasks
   */
  public getTasks(): Task[] {
    return Array.from(this.tasks.values()).map(({ task }) => task)
  }
}

/**
 * Get the global scheduler instance
 */
export function getScheduler(): Scheduler {
  return Scheduler.getInstance()
}
