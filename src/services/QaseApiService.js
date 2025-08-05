"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaseApiService = void 0;
const RateLimiter_1 = require("../utils/RateLimiter");
const Logger_1 = require("../utils/Logger");
/**
 * Service for interacting with Qase.io API
 */
class QaseApiService {
    constructor(config) {
        this.config = config;
        this.rateLimiter = new RateLimiter_1.RateLimiter();
        this.logger = Logger_1.Logger.getInstance();
    }
    /**
     * Submit a single test result to Qase
     */
    async submitTestResult(result) {
        if (!this.config.runId) {
            this.logger.warn('No run ID specified. Cannot submit test result.');
            return false;
        }
        try {
            await this.rateLimiter.checkRateLimit();
            const url = `${this.config.baseUrl}/result/${this.config.projectCode}/${this.config.runId}`;
            const response = await this.makeRequest(url, 'POST', result);
            if (response.status) {
                this.logger.debug(`Test result submitted successfully for case ${result.case_id}`);
                return true;
            }
            else {
                this.logger.error(`Failed to submit test result: ${response.errorMessage}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error('Error submitting test result', error);
            return false;
        }
    }
    /**
     * Submit multiple test results in bulk
     */
    async submitBulkTestResults(results) {
        if (!this.config.runId) {
            this.logger.warn('No run ID specified. Cannot submit bulk test results.');
            return false;
        }
        if (results.length === 0) {
            this.logger.warn('No test results to submit.');
            return true;
        }
        try {
            // Split results into chunks to respect bulk size limit
            const chunks = this.chunkArray(results, this.config.bulkSize || 100);
            let allSuccessful = true;
            for (const chunk of chunks) {
                const success = await this.submitBulkChunk(chunk);
                if (!success) {
                    allSuccessful = false;
                }
            }
            return allSuccessful;
        }
        catch (error) {
            this.logger.error('Error submitting bulk test results', error);
            return false;
        }
    }
    /**
     * Submit a chunk of test results in bulk
     */
    async submitBulkChunk(results) {
        try {
            await this.rateLimiter.checkRateLimit();
            const url = `${this.config.baseUrl}/result/${this.config.projectCode}/${this.config.runId}/bulk`;
            const bulkRequest = { results };
            
            // Submit bulk test results to Qase API
            
            const response = await this.makeRequest(url, 'POST', bulkRequest);
            
            if (response.status) {
                // Success response logged at debug level only
                this.logger.debug(`Bulk test results submitted successfully (${results.length} results)`);
                return true;
            }
            else {
                this.logger.error(`Failed to submit bulk test results: ${response.errorMessage}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error('Error submitting bulk test results chunk', error);
            return false;
        }
    }
    /**
     * Create a new test run
     */
    async createTestRun(runRequest) {
        try {
            await this.rateLimiter.checkRateLimit();
            const url = `${this.config.baseUrl}/run/${this.config.projectCode}`;
            
            const response = await this.makeRequest(url, 'POST', runRequest);
            
            if (response.status && response.result) {
                return response.result;
            }
            else {
                this.logger.error(`Failed to create test run: ${response.errorMessage}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error('Error creating test run', error);
            return null;
        }
    }
    /**
     * Create a test case if it doesn't exist
     */
    async createTestCase(testCase) {
        if (!this.config.autoCreateTestCases) {
            return null;
        }
        try {
            await this.rateLimiter.checkRateLimit();
            const url = `${this.config.baseUrl}/case/${this.config.projectCode}`;
            const response = await this.makeRequest(url, 'POST', testCase);
            if (response.status && response.result) {
                return response.result.id;
            }
            else {
                this.logger.error(`Failed to create test case: ${response.errorMessage}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error('Error creating test case', error);
            return null;
        }
    }
    /**
     * Complete a test run (mark it as finished)
     */
    async completeTestRun(runId) {
        try {
            await this.rateLimiter.checkRateLimit();
            const url = `${this.config.baseUrl}/run/${this.config.projectCode}/${runId}/complete`;
            const response = await this.makeRequest(url, 'POST', {});
            if (response.status) {
                this.logger.debug(`Test run ${runId} completed successfully`);
                return true;
            }
            else {
                this.logger.error(`Failed to complete test run ${runId}: ${response.errorMessage}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error('Error completing test run', error);
            return false;
        }
    }
    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, method, data) {
        for (let attempt = 1; attempt <= (this.config.retryAttempts || 3); attempt++) {
            try {
                const requestOptions = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': this.config.apiToken,
                    },
                };
                if (data) {
                    requestOptions.body = JSON.stringify(data);
                }
                const response = await fetch(url, requestOptions);
                // Handle rate limiting
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
                    await this.rateLimiter.handleRetryAfter(retryAfter);
                    continue;
                }
                const responseData = await response.json();
                if (response.ok) {
                    return responseData;
                }
                else {
                    this.logger.error(`API request failed (${response.status}): ${response.statusText}`);
                    return {
                        status: false,
                        errorMessage: responseData.errorMessage || `HTTP ${response.status}: ${response.statusText}`,
                        errorFields: responseData.errorFields,
                    };
                }
            }
            catch (error) {
                this.logger.error(`Request attempt ${attempt} failed`, error);
                if (attempt === (this.config.retryAttempts || 3)) {
                    return {
                        status: false,
                        errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    };
                }
                // Wait before retry
                await this.sleep(this.config.retryDelay || 1000);
            }
        }
        return {
            status: false,
            errorMessage: 'Max retry attempts exceeded',
        };
    }
    /**
     * Utility function to chunk array
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * Utility function to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.QaseApiService = QaseApiService;
//# sourceMappingURL=QaseApiService.js.map