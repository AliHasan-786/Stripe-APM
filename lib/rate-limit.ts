interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS_PER_DAY = 20;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cleanup expired entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  cleanup();

  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || now > existing.resetAt) {
    // First request or window expired
    store.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - 1, resetAt: now + ONE_DAY_MS };
  }

  if (existing.count >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_DAY - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}
