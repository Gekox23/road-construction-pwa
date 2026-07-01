export interface AppError { module: string; fn: string; message: string; cause?: unknown; }

export function logError(err: AppError): void {
  console.error(`[${err.module}.${err.fn}] ${err.message}`, err.cause ?? '');
}

export function createErrorResponse(module: string, fn: string, message: string, cause?: unknown) {
  logError({ module, fn, message, cause });
  return { success: false as const, error: `[${module}.${fn}] ${message}` };
}
