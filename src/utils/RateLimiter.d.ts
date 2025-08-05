/**
 * Rate limiter for Qase API requests
 * Handles the 600 requests per minute limit
 */
export declare class RateLimiter {
    private requestTimestamps;
    private readonly maxRequests;
    private readonly timeWindow;
    private logger;
    constructor(maxRequests?: number, timeWindowMinutes?: number);
    /**
     * Check if a request can be made and wait if necessary
     */
    checkRateLimit(): Promise<void>;
    /**
     * Handle retry after receiving 429 response
     */
    handleRetryAfter(retryAfterSeconds: number): Promise<void>;
    /**
     * Get current rate limit status
     */
    getRateLimitStatus(): {
        remaining: number;
        resetTime: number;
    };
    private sleep;
}
//# sourceMappingURL=RateLimiter.d.ts.map