/**
 * Prisma retry utility for transient database errors.
 *
 * Neon PostgreSQL (serverless) can close idle connections (auto-suspend),
 * and the pooler (PgBouncer) may drop connections under load.
 * This wrapper retries on known transient Prisma error codes:
 *   - P1017: Server has closed the connection
 *   - P1001: Can't reach database server
 *   - P2024: Timed out fetching a new connection from the pool
 *   - P1008: Operations timed out
 */

/** Error codes that indicate a transient/retryable connection issue */
const RETRYABLE_CODES = new Set(['P1017', 'P1001', 'P2024', 'P1008']);

/** Check if an error is a retryable Prisma error */
function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  // Prisma errors have a `code` property
  const code = (err as any).code;
  if (code && RETRYABLE_CODES.has(code)) return true;

  // Also check message for connection-related errors without a Prisma code
  const message = (err as any).message || '';
  if (
    message.includes('Server has closed the connection') ||
    message.includes('Connection refused') ||
    message.includes('Connection timed out') ||
    message.includes('ECONNRESET') ||
    message.includes('ECONNREFUSED') ||
    message.includes('socket hang up') ||
    message.includes('Can\'t reach database server')
  ) {
    return true;
  }

  return false;
}

export interface RetryOptions {
  /** Maximum number of attempts (including the first try). Default: 3 */
  maxAttempts?: number;
  /** Base delay in ms before retry (doubled each attempt). Default: 1000 */
  baseDelayMs?: number;
  /** Label for log messages. Default: 'prismaRetry' */
  label?: string;
}

/**
 * Execute a Prisma operation with automatic retry on transient connection errors.
 *
 * Uses exponential backoff: baseDelay, baseDelay*2, baseDelay*4, ...
 *
 * @example
 * const result = await prismaRetry(
 *   () => prisma.jobListing.updateMany({ where: {...}, data: {...} }),
 *   { label: 'aging-deadline', maxAttempts: 3 }
 * );
 */
export async function prismaRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000, label = 'prismaRetry' } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      if (!isRetryableError(err) || attempt === maxAttempts) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      const code = (err as any).code || 'unknown';
      console.warn(
        `[${label}] Transient DB error (${code}), retrying in ${delay}ms (attempt ${attempt}/${maxAttempts}): ${(err as Error).message}`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}
