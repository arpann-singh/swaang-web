// src/lib/rateLimit.ts

interface RateLimitRecord {
  timestamps: number[];
}

const ipMap = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [ip, record] of ipMap.entries()) {
    record.timestamps = record.timestamps.filter(ts => ts > threshold);
    if (record.timestamps.length === 0) {
      ipMap.delete(ip);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory sliding window rate limiter for Next.js API Routes.
 * 
 * @param identifier Client IP or token
 * @param limit Maximum requests allowed in the window
 * @param windowMs Time window in milliseconds (default: 60,000ms / 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(windowMs);

  const clientRecord = ipMap.get(identifier) || { timestamps: [] };
  const windowStart = now - windowMs;

  // Filter out timestamps outside the active window
  clientRecord.timestamps = clientRecord.timestamps.filter(ts => ts > windowStart);

  if (clientRecord.timestamps.length >= limit) {
    const oldestTimestamp = clientRecord.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(resetTime, 1),
    };
  }

  // Record this request
  clientRecord.timestamps.push(now);
  ipMap.set(identifier, clientRecord);

  return {
    success: true,
    limit,
    remaining: limit - clientRecord.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts client IP from Next.js request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
