import { Helper } from 'codeceptjs';
import { QaseConfig } from './types/QaseTypes';
/**
 * CodeceptJS Helper for Qase.io integration and HTML reporting
 */
declare class QaseHelper extends Helper {
    private config;
    private configManager;
    private apiService;
    private reportGenerator;
    private logger;
    private testResults;
    private testStartTime;
    private executionStartTime;
    private currentRunId;
    constructor(config?: Partial<QaseConfig>);
    /**
     * CodeceptJS event: before all tests
     */
    _beforeSuite(): Promise<void>;
    /**
     * CodeceptJS event: before each test
     */
    _before(): void;
    /**
     * CodeceptJS event: after each test
     */
    _after(): void;
    /**
     * CodeceptJS event: after all tests
     */
    _afterSuite(): Promise<void>;
    /**
     * CodeceptJS event: test passed
     */
    _passed(test: any): void;
    /**
     * CodeceptJS event: test failed
     */
    _failed(test: any): void;
    /**
     * CodeceptJS event: test skipped
     */
    _skipped(test: any): void;
    /**
     * Record test result
     */
    private recordTestResult;
    /**
     * Get test status from test object
     */
    private getTestStatus;
    /**
     * Extract tags from test
     */
    private extractTags;
    /**
     * Extract steps from test
     */
    private extractSteps;
    /**
     * Generate HTML report
     */
    private generateHtmlReport;
    /**
     * Create a new test run in Qase
     */
    private createNewTestRun;
    /**
     * Send results to Qase
     */
    private sendResultsToQase;
    /**
     * Convert test results to Qase format
     */
    private convertToQaseResults;
    /**
     * Map test status to Qase status
     */
    private mapStatusToQase;
    /**
     * Extract Qase case ID from test
     */
    private extractCaseId;
    /**
     * Build report data
     */
    private buildReportData;
    /**
     * Get environment information
     */
    private getEnvironmentInfo;
    /**
     * Get report file path
     */
    private getReportPath;
    /**
     * Complete the test run if all tests passed
     */
    private completeTestRun;
    /**
     * Public method to update configuration
     */
    updateConfig(updates: Partial<QaseConfig>): void;
    /**
     * Public method to get current configuration
     */
    getConfig(): QaseConfig;
}
export = QaseHelper;
//# sourceMappingURL=QaseHelper.d.ts.map