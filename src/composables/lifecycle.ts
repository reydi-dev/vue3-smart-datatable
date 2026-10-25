import type { SmartDataTableEmits } from '../types/index.js'

export type TableEmit<Row extends object> = <
  Event extends keyof SmartDataTableEmits<Row>,
>(
  event: Event,
  ...args: SmartDataTableEmits<Row>[Event]
) => void

/** Settle our work promptly even when a consumer ignores its abort signal. */
export function withAbort<T>(
  task: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener('abort', abort)
      reject(
        signal.reason ?? new DOMException('Operation aborted', 'AbortError'),
      )
    }
    task.then(
      (value) => {
        signal.removeEventListener('abort', abort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', abort)
        reject(error)
      },
    )
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })
}
