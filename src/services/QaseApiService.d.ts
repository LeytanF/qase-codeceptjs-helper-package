import { QaseConfig, QaseTestResult, QaseTestCase, QaseTestRun, QaseTestRunRequest } from '../types/QaseTypes';
/**
 * Service for interacting with Qase.io API
 */
export declare class QaseApiService {
    private config;
    private rateLimiter;
    private logger;
    constructor(config: QaseConfig);
    /**
     * Submit a single test result to Qase
     */
    submitTestResult(result: QaseTestResult): Promise<boolean>;
    /**
     * Submit multiple test results in bulk
     */
    submitBulkTestResults(results: QaseTestResult[]): Promise<boolean>;
    /**
     * Submit a chunk of test results in bulk
     */
    private submitBulkChunk;
    /**
     * Create a new test run
     */
    createTestRun(runRequest: QaseTestRunRequest): Promise<QaseTestRun | null>;
    /**
     * Create a test case if it doesn't exist
     */
    createTestCase(testCase: QaseTestCase): Promise<number | null>;
    /**
     * Complete a test run (mark it as finished)
     */
    completeTestRun(runId: number): Promise<boolean>;
    /**
     * Make HTTP request with retry logic
     */
    private makeRequest;
    /**
     * Utility function to chunk array
     */
    private chunkArray;
    /**
     * Utility function to sleep
     */
    private sleep;
}
//# sourceMappingURL=QaseApiService.d.ts.map