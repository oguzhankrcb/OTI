import { Worker } from 'node:worker_threads'
import path from 'node:path'
import os from 'node:os'

interface WorkerTask {
  data: any
  callback: (err: Error | null, result?: any) => void
}

/**
 * WorkerPool manages a pool of worker threads for CPU-intensive operations
 */
export class WorkerPool {
  private workers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeWorkers: number = 0
  private workerPath: string

  /**
   * Creates a new WorkerPool
   *
   * @param workerPath Path to the worker script file
   * @param numWorkers Number of workers to create, defaults to number of CPU cores
   */
  constructor(workerPath: string, numWorkers: number = os.cpus().length) {
    this.workerPath = workerPath
    // Create workers based on CPU cores
    for (let i = 0; i < numWorkers; i++) {
      this.addNewWorker()
    }
  }

  /**
   * Creates and adds a new worker to the pool
   */
  private addNewWorker() {
    const worker = new Worker(this.workerPath)
    worker.on('message', (result) => {
      // Decrease active worker count
      this.activeWorkers--

      // Get callback for current worker task
      const callback = (worker as any).currentCallback
      delete (worker as any).currentCallback

      // Handle success or error
      if (result.success) {
        callback(null, result.result)
      } else {
        const error = new Error(result.error.message)
        error.stack = result.error.stack
        callback(error)
      }

      // Check if there are pending tasks
      if (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!
        this.runTask(worker, task)
      }
    })

    worker.on('error', (err) => {
      if ((worker as any).currentCallback) {
        ;(worker as any).currentCallback(err)
        delete (worker as any).currentCallback
      }

      // Remove the failed worker and create a new one
      const index = this.workers.indexOf(worker)
      if (index !== -1) {
        this.workers.splice(index, 1)
      }

      this.activeWorkers--
      this.addNewWorker()
    })

    this.workers.push(worker)
  }

  /**
   * Runs a task on a worker
   *
   * @param worker The worker to run the task on
   * @param task The task to run
   */
  private runTask(worker: Worker, task: WorkerTask) {
    this.activeWorkers++
    ;(worker as any).currentCallback = task.callback
    worker.postMessage(task.data)
  }

  /**
   * Executes a task in the worker pool
   *
   * @param data The data to send to the worker
   * @returns A promise that resolves with the worker result
   */
  execute(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        data,
        callback: (err, result) => {
          if (err) return reject(err)
          resolve(result)
        },
      }
      // Find an available worker or queue the task
      const availableWorker = this.workers.find((w) => !(w as any).currentCallback)
      if (availableWorker && this.activeWorkers < this.workers.length) {
        this.runTask(availableWorker, task)
      } else {
        this.taskQueue.push(task)
      }
    })
  }

  /**
   * Terminates all workers in the pool
   */
  async close() {
    for (const worker of this.workers) {
      await worker.terminate()
    }
    this.workers = []
    this.activeWorkers = 0
    this.taskQueue = []
  }
}

// Singleton instance for app-wide use
let workerPoolInstance: WorkerPool | null = null

/**
 * Get the global worker pool instance
 */
export function getWorkerPool(): WorkerPool {
  if (!workerPoolInstance) {
    const workerPath = path.join(process.cwd(), 'app', 'workers', 'encryption_worker.js')
    workerPoolInstance = new WorkerPool(workerPath)
  }
  return workerPoolInstance
}

export default getWorkerPool
