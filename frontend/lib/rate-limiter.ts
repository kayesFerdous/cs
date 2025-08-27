interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

interface ClientData {
  requests: number;
  resetTime: number;
}

const clients = new Map<string, ClientData>();

// Global rate limiting toggle
let rateLimitingEnabled = true;

export function setRateLimitingEnabled(enabled: boolean): void {
  rateLimitingEnabled = enabled;
}

export function isRateLimitingEnabled(): boolean {
  return rateLimitingEnabled;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  check(clientId: string): { allowed: boolean; retryAfter?: number } {
    // If rate limiting is disabled, always allow
    if (!rateLimitingEnabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const client = clients.get(clientId);

    if (!client || now > client.resetTime) {
      // First request or window expired
      clients.set(clientId, {
        requests: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true };
    }

    if (client.requests >= this.config.requests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((client.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment request count
    client.requests++;
    clients.set(clientId, client);
    return { allowed: true };
  }
}

// Helper function to get client identifier
export function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

// Pre-configured rate limiters
export const rateLimiters = {
  health: new RateLimiter({ requests: 100, windowMs: 60000 }), // 100 per minute
  config: new RateLimiter({ requests: 30, windowMs: 60000 }), // 30 per minute
  configPost: new RateLimiter({ requests: 10, windowMs: 60000 }), // 10 per minute
  logs: new RateLimiter({ requests: 50, windowMs: 60000 }), // 50 per minute
  scan: new RateLimiter({ requests: 10, windowMs: 60000 }), // 10 per minute
};

export function createRateLimitResponse(retryAfter: number, detail: string) {
  return new Response(
    JSON.stringify({
      detail: `Rate limit exceeded: ${detail}`,
      retry_after: retryAfter,
      message: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}
