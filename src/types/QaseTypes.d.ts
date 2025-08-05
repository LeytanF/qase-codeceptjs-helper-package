/**
 * Type definitions for Qase.io API integration
 */
export interface QaseConfig {
    apiToken: string;
    projectCode: string;
    runId?: number | undefined;
    reportPath?: string | undefined;
    baseUrl?: string | undefined;
    enableReporting?: boolean | undefined;
    enableQaseIntegration?: boolean | undefined;
    autoCreateTestCases?: boolean | undefined;
    bulkSize?: number | undefined;
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
    runTitle?: string | undefined;
    runDescription?: string | undefined;
    environment?: string | undefined;
    environmentSlug?: string | undefined;
    testCasePrefix?: string | undefined;
}
export interface QaseTestResult {
    case_id?: number | undefined;
    case?: QaseTestCase | undefined;
    status: QaseTestStatus;
    start_time?: number | undefined;
    time?: number | undefined;
    time_ms?: number | undefined;
    defect?: boolean | undefined;
    attachments?: string[] | undefined;
    stacktrace?: string | undefined;
    comment?: string | undefined;
    param?: Record<string, any> | undefined;
    param_groups?: string[][] | undefined;
    steps?: QaseTestStep[] | undefined;
    author_id?: number | undefined;
}
export interface QaseTestCase {
    title: string;
    description?: string;
    preconditions?: string;
    postconditions?: string;
    severity?: number;
    priority?: number;
    type?: number;
    layer?: number;
    is_flaky?: boolean;
    suite_id?: number;
    milestone_id?: number;
    automation?: number;
    status?: number;
    custom_field?: Record<string, any>;
    attachments?: string[];
    steps?: QaseTestStep[];
    tags?: string[];
    params?: Record<string, string[]>;
}
export interface QaseTestStep {
    action: string;
    expected_result?: string;
    data?: string;
    attachments?: string[];
}
export type QaseTestStatus = 'passed' | 'failed' | 'blocked' | 'skipped' | 'invalid';
export interface QaseBulkResultRequest {
    results: QaseTestResult[];
}
export interface QaseApiResponse<T = any> {
    status: boolean;
    result?: T;
    errorMessage?: string;
    errorFields?: Record<string, string[]>;
}
export interface QaseTestRun {
    id: number;
    title: string;
    description?: string;
    status: number;
    start_time?: string;
    end_time?: string;
    public: boolean;
    stats?: {
        total: number;
        passed: number;
        failed: number;
        blocked: number;
        skipped: number;
    };
}
export interface QaseTestRunRequest {
    title: string;
    description?: string;
    include_all_cases?: boolean;
    cases?: number[];
    is_autotest?: boolean;
    environment_slug?: string;
}
export interface TestExecutionData {
    title: string;
    fullTitle: string;
    file: string;
    duration: number;
    state: 'passed' | 'failed' | 'skipped';
    error?: Error | undefined;
    startTime: number;
    endTime: number;
    tags?: string[] | undefined;
    steps?: TestStepData[] | undefined;
}
export interface TestStepData {
    name: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
    error?: Error;
}
export interface TestSuiteData {
    title: string;
    tests: TestExecutionData[];
    duration: number;
    passed: number;
    failed: number;
    skipped: number;
}
export interface TestReportData {
    startTime: number;
    endTime: number;
    duration: number;
    suites: TestSuiteData[];
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    environment?: Record<string, any>;
    testEnvironment?: string;
    currentRunId?: number;
}
export interface RateLimitInfo {
    remaining: number;
    reset: number;
    limit: number;
}
//# sourceMappingURL=QaseTypes.d.ts.map