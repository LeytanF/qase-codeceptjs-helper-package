"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const Logger_1 = require("./Logger");
/**
 * Rate limiter for Qase API requests
 * Handles the 600 requests per minute limit
 */
class RateLimiter {
    constructor(maxRequests = 600, timeWindowMinutes = 1) {
        this.requestTimestamps = [];
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindowMinutes * 60 * 1000; // Convert to milliseconds
        this.logger = Logger_1.Logger.getInstance();
    }
    /**
     * Check if a request can be made and wait if necessary
     */
    async checkRateLimit() {
        const now = Date.now();
        // Remove timestamps older than the time window
        this.requestTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < this.timeWindow);
        if (this.requestTimestamps.length >= this.maxRequests) {
            // Calculate wait time
            const oldestTimestamp = this.requestTimestamps[0];
            const waitTime = this.timeWindow - (now - oldestTimestamp);
            this.logger.warn(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
            await this.sleep(waitTime);
            // Recursive call to check again after waiting
            return this.checkRateLimit();
        }
        // Record this request
        this.requestTimestamps.push(now);
    }
    /**
     * Handle retry after receiving 429 response
     */
    async handleRetryAfter(retryAfterSeconds) {
        const waitTime = retryAfterSeconds * 1000;
        this.logger.warn(`Received 429 Too Many Requests. Waiting ${waitTime}ms before retry.`);
        await this.sleep(waitTime);
    }
    /**
     * Get current rate limit status
     */
    getRateLimitStatus() {
        const now = Date.now();
        const validTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < this.timeWindow);
        const remaining = Math.max(0, this.maxRequests - validTimestamps.length);
        const resetTime = validTimestamps.length > 0
            ? validTimestamps[0] + this.timeWindow
            : now;
        return { remaining, resetTime };
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=RateLimiter.js.map