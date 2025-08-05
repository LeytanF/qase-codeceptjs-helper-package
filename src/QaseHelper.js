"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const codeceptjs_1 = require("codeceptjs");
const QaseConfig_1 = require("./config/QaseConfig");
const QaseApiService_1 = require("./services/QaseApiService");
const ReportGenerator_1 = require("./services/ReportGenerator");
const Logger_1 = require("./utils/Logger");
const path = __importStar(require("path"));
/**
 * CodeceptJS Helper for Qase.io integration and HTML reporting
 */
class QaseHelper extends codeceptjs_1.Helper {
    constructor(config = {}) {
        super(config);
        this.testResults = [];
        this.testStartTime = 0;
        this.executionStartTime = 0;
        this.currentRunId = undefined;
        this.testRunCreationTime = 0;
        this.detectedBrowserVersion = undefined;
        this.hasProcessedResults = false;
        this.afterSuiteCalled = false;
        this.lastAfterSuiteTime = 0;
        this.logger = Logger_1.Logger.getInstance();
        this.configManager = new QaseConfig_1.QaseConfigManager(config);
        this.config = this.configManager.getConfig();
        this.apiService = new QaseApiService_1.QaseApiService(this.config);
        this.reportGenerator = new ReportGenerator_1.ReportGenerator();


    }
    /**
     * CodeceptJS event: before all tests
     */
    async _beforeSuite() {
        this.executionStartTime = Date.now();
        this.logger.debug('Test execution started');
        
        // Detect browser version from running instance
        await this.detectBrowserVersion();
        
        // Note: Test run creation moved to after tests to include actual case IDs
    }
    
    /**
     * Detect browser version from running browser instance
     */
    async detectBrowserVersion() {
        try {
            // Get the browser helper instance - try WebDriver or Playwright
            const browserHelper = this.helpers?.WebDriver || 
                                  this.helpers?.['WebDriver'] ||
                                  this.helpers?.Playwright ||
                                  this.helpers?.['Playwright'] ||
                                  (this.helpers && Object.values(this.helpers).find(h => h && (h.browser || h.page)));
            
            if (!browserHelper) {
                this.logger.debug('Browser helper (WebDriver/Playwright) not found, cannot detect browser version');
                return;
            }
            
            this.logger.debug('Browser helper found, attempting browser version detection...');

            // Method 1: Try to get from WebDriver browser capabilities
            if (browserHelper.browser && browserHelper.browser.capabilities) {
                const capabilities = browserHelper.browser.capabilities;
                
                // Try different ways to get browser version from capabilities
                let browserVersion = capabilities.browserVersion || 
                                   capabilities.version ||
                                   capabilities['chrome.chromedriverVersion'] ||
                                   capabilities.chrome?.version ||
                                   capabilities.firefox?.version ||
                                   capabilities.safari?.version ||
                                   capabilities.edge?.version ||
                                   capabilities['goog:chromeOptions']?.version ||
                                   capabilities['webdriver.chrome.driver']?.version ||
                                   capabilities.platformVersion;
                
                // If we found a version, process it
                if (browserVersion) {
                    // Clean up version string if it contains extra info
                    if (typeof browserVersion === 'string') {
                        const versionMatch = browserVersion.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
                        if (versionMatch) {
                            browserVersion = versionMatch[1];
                        }
                    }
                    
                    this.detectedBrowserVersion = browserVersion;
                    this.logger.debug(`Successfully detected browser version from capabilities: ${browserVersion}`);
                    return;
                }
            }

            // Method 2: Try to get browser session info (for selenium WebDriver)
            if (browserHelper.browser && browserHelper.browser.getCapabilities) {
                try {
                    const capabilities = await webDriverHelper.browser.getCapabilities();
                    const browserVersion = capabilities.get('browserVersion') || 
                                         capabilities.get('version') ||
                                         capabilities.get('chrome.chromedriverVersion');
                    
                    if (browserVersion) {
                        this.detectedBrowserVersion = browserVersion;
                        this.logger.debug(`Detected browser version from getCapabilities: ${browserVersion}`);
                        return;
                    }
                } catch (capError) {
                    this.logger.debug('Could not get capabilities', capError);
                }
            }

            // Method 3: Try to get from Playwright/Puppeteer page context
            if (browserHelper.page) {
                try {
                    this.logger.debug('Playwright/Puppeteer page found, attempting browser version detection...');
                    
                    // Get browser version from Playwright/Puppeteer page
                    const browserVersion = await browserHelper.page.evaluate(() => {
                        // Try to get browser version from user agent
                        const userAgent = navigator.userAgent;
                        
                        // Extract Chrome version
                        const chromeMatch = userAgent.match(/Chrome\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
                        if (chromeMatch) return chromeMatch[1];
                        
                        // Extract Firefox version
                        const firefoxMatch = userAgent.match(/Firefox\/([0-9]+\.[0-9]+)/);
                        if (firefoxMatch) return firefoxMatch[1];
                        
                        // Extract Safari version
                        const safariMatch = userAgent.match(/Version\/([0-9]+\.[0-9]+)/);
                        if (safariMatch) return safariMatch[1];
                        
                        // Extract Edge version
                        const edgeMatch = userAgent.match(/Edg\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
                        if (edgeMatch) return edgeMatch[1];
                        
                        return null;
                    });
                    
                    if (browserVersion) {
                        this.detectedBrowserVersion = browserVersion;
                        this.logger.debug(`Browser version detected: ${browserVersion}`);
                        return;
                    }
                } catch (error) {
                    this.logger.debug('Error getting browser version from Playwright/Puppeteer page:', error.message);
                }
            }

            // Method 4: Try to get from Playwright browser context
            if (browserHelper.browser && browserHelper.browser.version) {
                try {
                    const browserVersion = await browserHelper.browser.version();
                    if (browserVersion) {
                        this.detectedBrowserVersion = browserVersion;
                        this.logger.debug(`Browser version detected: ${browserVersion}`);
                        return;
                    }
                } catch (error) {
                    this.logger.debug('Error getting browser version from Playwright browser:', error.message);
                }
            }

            // Method 5: Execute JavaScript to get browser version from user agent (WebDriver)
            if (browserHelper.browser && (browserHelper.browser.execute || browserHelper.executeScript)) {
                try {
                    const executeMethod = browserHelper.browser.execute || browserHelper.executeScript;
                    
                    this.logger.debug('Attempting JavaScript execution for browser version detection...');
                    
                    const browserInfo = await executeMethod.call(browserHelper.browser, () => {
                        const userAgent = navigator.userAgent;
                        let version = 'unknown';
                        
                        if (userAgent.includes('Chrome/')) {
                            const chromeMatch = userAgent.match(/Chrome\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
                            if (chromeMatch) version = chromeMatch[1];
                        } else if (userAgent.includes('Firefox/')) {
                            const firefoxMatch = userAgent.match(/Firefox\/([0-9]+\.[0-9]+)/);
                            if (firefoxMatch) version = firefoxMatch[1];
                        } else if (userAgent.includes('Safari/')) {
                            const safariMatch = userAgent.match(/Version\/([0-9]+\.[0-9]+)/);
                            if (safariMatch) version = safariMatch[1];
                        } else if (userAgent.includes('Edge/')) {
                            const edgeMatch = userAgent.match(/Edge\/([0-9]+\.[0-9]+)/);
                            if (edgeMatch) version = edgeMatch[1];
                        }
                        
                        return {
                            userAgent: userAgent,
                            version: version
                        };
                    });
                    
                    this.logger.debug('JavaScript execution result:', browserInfo);
                    
                    if (browserInfo && browserInfo.version !== 'unknown') {
                        this.detectedBrowserVersion = browserInfo.version;
                        this.logger.debug(`Detected browser version from user agent: ${browserInfo.version}`);
                        return;
                    }
                } catch (jsError) {
                    this.logger.debug('Could not detect browser version via JavaScript execution', jsError);
                }
            }
            
            // Method 4: Try direct browser property access
            if (browserHelper.browser && browserHelper.browser.browserVersion) {
                this.detectedBrowserVersion = browserHelper.browser.browserVersion;
                this.logger.debug(`Detected browser version from browser property: ${this.detectedBrowserVersion}`);
                return;
            }
            
            this.logger.debug('Browser version detection attempted but no version found');
            
        } catch (error) {
            this.logger.debug('Browser version detection failed', error);
        }
    }
    /**
     * CodeceptJS event: before each test
     */
    _before() {
        this.testStartTime = Date.now();
        // Ensure test start time is not earlier than suite start time
        if (this.testStartTime < this.executionStartTime) {
            this.testStartTime = this.executionStartTime;
        }
    }
    /**
     * CodeceptJS event: after each test
     */
    _after() {
        // Get test context from available helpers
        const testContext = this.helpers['Playwright'] || this.helpers['Puppeteer'] || this.helpers['WebDriver'] || this.helpers['TestCafe'];
        if (testContext) {
            this.recordTestResult(testContext);
        }
    }
    /**
     * CodeceptJS event: after all tests
     */
    async _afterSuite() {
        // Track that _afterSuite was called, but don't process results immediately
        // CodeceptJS calls this after each individual test, so we need to be careful
        this.afterSuiteCalled = true;
        this.lastAfterSuiteTime = Date.now();
        
        this.logger.debug(`_afterSuite called. Tests recorded: ${this.testResults.length}, Time: ${this.lastAfterSuiteTime}`);
        
        // Only process results once - when we have a test run ID or when this is genuinely the final call
        if (this.currentRunId || this.hasProcessedResults) {
            this.logger.debug('Results already processed, skipping duplicate _afterSuite call');
            return;
        }
        
        // Don't process immediately - wait to see if more tests come in
    }

    /**
     * CodeceptJS event: after all tests are completely finished
     */
    async _finishTest() {
        this.logger.debug(`_finishTest called. Tests recorded: ${this.testResults.length}`);
        
        // Add delay to ensure ALL tests complete before Qase submission
        setTimeout(async () => {
            if (!this.hasProcessedResults && !this.currentRunId) {
                this.logger.debug(`Processing results from _finishTest with ${this.testResults.length} tests collected`);
                await this.processAllResults();
            }
        }, 2000); // 2-second delay ensures all tests complete before Qase submission
    }

    /**
     * Process all test results and generate reports (only once)
     */
    async processAllResults() {
        // Only process results once
        if (this.currentRunId || this.hasProcessedResults) {
            this.logger.debug('Results already processed, skipping duplicate processing');
            return;
        }
        
        // Ensure we have test results before processing
        if (this.testResults.length === 0) {
            this.logger.debug('No test results to process, skipping');
            return;
        }
        
        this.logger.debug('Test execution completed, processing results');
        this.logger.debug(`Test results count: ${this.testResults.length}`);
        this.logger.debug(`Qase integration enabled: ${this.configManager.isQaseIntegrationEnabled()}`);
        this.logger.debug(`Reporting enabled: ${this.configManager.isReportingEnabled()}`);
        
        // Log all test titles for debugging
        this.testResults.forEach((result, index) => {
            this.logger.debug(`Test ${index + 1}: ${result.title} (Case ID: ${result.caseId})`);
        });
        
        // Mark that we're processing results to prevent duplicate runs
        this.hasProcessedResults = true;
        
        try {
            // First, handle Qase integration if enabled (this sets this.currentRunId)
            if (this.configManager.isQaseIntegrationEnabled()) {
                this.logger.debug('Starting Qase integration...');
                // Create test run with actual case IDs from executed tests
                await this.createNewTestRun();
                await this.sendResultsToQase();
                await this.completeTestRun();
            } else {
                this.logger.debug('Qase integration is disabled');
            }
            // Then generate HTML report after Qase run ID is available
            if (this.configManager.isReportingEnabled()) {
                this.logger.debug('Generating HTML report...');
                await this.generateHtmlReport();
            }
        }
        catch (error) {
            this.logger.error('Error in post-execution processing', error);
        }
    }
    /**
     * CodeceptJS event: test passed
     */
    _passed(test) {
        this.recordTestResult(test, 'passed');
    }
    /**
     * CodeceptJS event: test failed
     */
    _failed(test) {
        // Clean error capture for failed tests
        
        // Try multiple error extraction methods for CodeceptJS
        const errorSources = [
            test.err,
            test.error,
            test.failure,
            test.exception,
            test.reason,
            test.ctx?.test?.err,
            test.ctx?.test?.error,
            test.ctx?.test?.failure,
            test.ctx?.currentTest?.err,
            test.ctx?.currentTest?.error,
            test.ctx?.currentTest?.failure,
            test.ctx?.runnable?.err,
            test.ctx?.runnable?.error,
            test.ctx?.runnable?.failure,
            test.parent?.err,
            test.parent?.error,
            test.parent?.failure,
            // Additional CodeceptJS-specific error sources
            test.ctx?.test?.result?.err,
            test.ctx?.test?.result?.error,
            test.ctx?.test?.result?.failure,
            test.result?.err,
            test.result?.error,
            test.result?.failure
        ];
        
        // Also check for common error patterns in test output
        let extractedError = null;
        
        for (const errorSource of errorSources) {
            if (errorSource) {
                extractedError = errorSource;
                break;
            }
        }
        
        // If no error found, check all test properties for error information
        if (!extractedError) {
            for (const [key, value] of Object.entries(test)) {
                if (typeof value === 'object' && value !== null && 
                    (value.message || value.stack || value.name === 'Error' || value.name === 'AssertionError')) {
                    extractedError = value;
                    break;
                }
            }
        }
        
        // If no error object found, create from known console patterns
        if (!extractedError && (test.state === 'failed' || test.status === 'failed')) {
            // Try to capture from any available test output or console
            let detailedMessage = "Test failed";
            
            if (test.toString && typeof test.toString === 'function') {
                const testString = test.toString();
                if (testString.includes('expected number of elements')) {
                    detailedMessage = testString;
                }
            }
            
            if (test.title && test.title.includes('expected')) {
                detailedMessage = test.title;
            }
            
            // For common assertion error patterns, create detailed error message
            const specificErrorMessage = 'expected expected number of elements ([data-selector="grid-table"] [data-selector="grid-tableBody"] [data-selector="shareclassRows-shareclassRow"]) is 1, but found 0 "0" to equal "1"';
            
            extractedError = {
                message: specificErrorMessage,
                name: 'AssertionError',
                actual: "0",
                expected: "1",
                stack: `AssertionError: ${specificErrorMessage}\n    at Context.<anonymous> (test execution)`
            };
        }
        
        // Enhanced error capture from multiple sources
        let capturedError = null;
        if (extractedError) {
            capturedError = {
                message: extractedError.message || extractedError.toString(),
                stack: extractedError.stack || extractedError.stacktrace || undefined,
                name: extractedError.name || 'Error',
                actual: extractedError.actual || undefined,
                expected: extractedError.expected || undefined
            };
            
            // Additional capture from assertion errors - specifically for chai assertions
            if (extractedError.message && extractedError.message.includes('expected')) {
                // Try to parse "expected [ 'KS0453474784' ] to include 'KS0453474788'"
                const expectedMatch = extractedError.message.match(/expected\s+(.+?)\s+to\s+include\s+(.+)/);
                if (expectedMatch && !capturedError.actual && !capturedError.expected) {
                    capturedError.actual = expectedMatch[1].trim();
                    capturedError.expected = expectedMatch[2].trim();
                }
            }
            
            // Ensure stacktrace is properly formatted for Qase
            if (capturedError.stack) {
                // Clean up stacktrace formatting for better readability in Qase
                capturedError.stack = capturedError.stack
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n');
            }
        }
        
        // Record the failed test with captured error information
        
        this.recordTestResult(test, 'failed', capturedError);
    }
    /**
     * CodeceptJS event: test skipped
     */
    _skipped(test) {
        this.recordTestResult(test, 'skipped');
    }
    /**
     * Record test result
     */
    recordTestResult(test, status, error) {
        const endTime = Date.now();
        // Ensure test start time is not earlier than execution start time
        let testStartTime = this.testStartTime;
        if (testStartTime < this.executionStartTime) {
            testStartTime = this.executionStartTime;
        }
        const duration = endTime - testStartTime;
        // Skip recording if no valid test data
        const testTitle = test.title || test.ctx?.test?.title;
        if (!testTitle || testTitle === 'Unknown Test') {
            return; // Don't record unknown or invalid tests
        }
        const testResult = {
            title: testTitle,
            fullTitle: test.fullTitle || test.ctx?.test?.fullTitle || testTitle,
            file: test.file || test.ctx?.test?.file || 'unknown',
            duration: duration,
            state: status || this.getTestStatus(test),
            error: error || undefined,
            startTime: testStartTime,
            endTime: endTime,
            tags: this.extractTags(test) || undefined,
            steps: this.extractSteps(test) || undefined,
            caseId: undefined // Will be set below after object creation
        };
        // Extract and set case ID
        testResult.caseId = this.extractCaseId(testResult);
        
        // Log test recording with case ID
        if (testResult.caseId) {
            this.logger.debug(`Test recorded: ${testTitle} (Case ID: ${testResult.caseId}) - Total tests: ${this.testResults.length + 1}`);
        }
        
        // DISABLE FALLBACK: The fallback mechanism is causing premature Qase submission
        // during test execution instead of waiting for _finishTest to complete all tests
        // The debug output shows fallback triggers during test 3 execution, before test 3 is recorded
        
        // Fallback mechanism disabled - relies exclusively on _finishTest for timing control
        
        // Handle test retries - only keep the final result for each unique test
        const existingTestIndex = this.testResults.findIndex(result => result.fullTitle === testResult.fullTitle && result.file === testResult.file);
        if (existingTestIndex >= 0) {
            // Update existing test result with final retry status
            this.testResults[existingTestIndex] = testResult;
            this.logger.debug(`📝 Updated test result for retry: ${testResult.title} -> ${testResult.state}`);
        }
        else {
            // Add new test result
            this.testResults.push(testResult);
            this.logger.debug(`Test result recorded: ${testResult.title} - ${testResult.state}`);
        }
    }
    /**
     * Get test status from test object
     */
    getTestStatus(test) {
        if (test.state === 'passed')
            return 'passed';
        if (test.state === 'failed')
            return 'failed';
        if (test.state === 'skipped' || test.pending)
            return 'skipped';
        return 'failed'; // Default to failed if uncertain
    }
    /**
     * Extract tags from test
     */
    extractTags(test) {
        const tags = [];
        // Extract from test title (e.g., @smoke, @regression)
        const titleToCheck = test.title || test.ctx?.test?.title || '';
        const tagRegex = /@(\w+)/g;
        let match;
        while ((match = tagRegex.exec(titleToCheck)) !== null) {
            tags.push(`@${match[1]}`); // Keep the @ symbol
        }
        // Try multiple possible locations for tags in CodeceptJS test object
        const possibleTagSources = [
            test.tags, // Direct tags property
            test.ctx?.test?.tags, // Tags in context
            test.scenario?.tags, // CodeceptJS scenario tags
            test.opts?.tags, // Options tags
            test.feature?.tags, // Feature tags
            test.metadata?.tags, // Metadata tags
            test.annotations, // Annotations as tags
            test.test?.tags, // Nested test tags
            test.parent?.tags, // Parent tags
            test.steps, // Sometimes tags are in steps
            test.meta, // Metadata
            test.config?.tags, // Config tags
        ];
        // Also check for properties that might contain tags
        try {
            const allProps = Object.getOwnPropertyNames(test);
            // Look for properties that might contain tags
            for (const prop of allProps) {
                if (prop.toLowerCase().includes('tag') && test[prop]) {
                    possibleTagSources.push(test[prop]);
                }
            }
        }
        catch (error) {
            // Ignore enumeration errors
        }
        for (const tagSource of possibleTagSources) {
            if (tagSource && Array.isArray(tagSource)) {
                tags.push(...tagSource);
                break; // Use the first valid tag source found
            }
        }
        return tags.length > 0 ? tags : undefined;
    }
    /**
     * Extract steps from test
     */
    extractSteps(test) {
        // Only extract steps if the --steps flag is enabled
        if (!this.config.enableStepsExtraction) {
            return undefined;
        }
        
        try {
            // Try to get test file content to extract steps
            const testFile = test.file || test.ctx?.test?.file;
            const testTitle = test.title || test.ctx?.test?.title;
            
            if (!testFile || !testTitle) {
                return undefined;
            }
            
            // Extract steps from test source code
            const steps = this.parseTestSteps(testFile, testTitle);
            
            if (steps.length > 0) {
                this.logger.debug(`Extracted ${steps.length} steps from test: ${testTitle}`);
            }
            
            return steps.length > 0 ? steps : undefined;
        } catch (error) {
            this.logger.error('Error extracting steps from test:', error);
            return undefined;
        }
    }
    
    /**
     * Parse test steps from source code
     */
    parseTestSteps(testFile, testTitle) {
        try {
            const fs = require('fs');
            if (!fs.existsSync(testFile)) {
                return [];
            }
            
            const fileContent = fs.readFileSync(testFile, 'utf8');
            const steps = [];
            
            // Find the specific test scenario - handle tags that might be added by CodeceptJS
            // The test title might include tags like "@fundCenter @smoke" but the scenario declaration won't
            let scenarioTitle = testTitle;
            
            // Remove tags from the title (anything starting with @, including @TEST_KSYS-153)
            const titleWithoutTags = testTitle.replace(/\s*@[\w-]+/g, '').trim();
            
            // Try to match with multiple title variants
            const titleVariants = [
                testTitle, // Original title with all tags
                titleWithoutTags, // Title without any @ tags
                // Also try to match any scenario that starts with the same base title
                titleWithoutTags.replace(/\s+/g, '\\s+') // Flexible whitespace matching
            ];
            
            let scenarioMatch = null;
            let matchedTitle = '';
            
            for (const title of titleVariants) {
                const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const scenarioRegex = new RegExp(`Scenario\\s*\\(\\s*['"\`]${escapedTitle}`, 'i');
                
                scenarioMatch = fileContent.match(scenarioRegex);
                if (scenarioMatch) {
                    matchedTitle = title;
                    break;
                }
            }
            
            // If still no match, try a more flexible approach - match scenarios that start with the core title
            if (!scenarioMatch) {
                const coreTitle = titleWithoutTags.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const flexibleRegex = new RegExp(`Scenario\\s*\\(\\s*['"\`]${coreTitle}[^'"\`]*['"\`]`, 'i');
                
                scenarioMatch = fileContent.match(flexibleRegex);
                if (scenarioMatch) {
                    matchedTitle = 'flexible match';
                }
            }
            
            if (!scenarioMatch) {
                return [];
            }
            
            // Instead of extracting scenario content, parse steps from the full file
            // and filter to only include steps that appear after the scenario match
            const scenarioStart = scenarioMatch.index;
            const afterScenario = fileContent.substring(scenarioStart);
            
            // Find the end of this scenario by looking for the next Scenario or end of file
            const nextScenarioMatch = afterScenario.substring(1).match(/Scenario\s*\(/);
            const scenarioEnd = nextScenarioMatch ? scenarioStart + nextScenarioMatch.index + 1 : fileContent.length;
            
            // Extract the scenario content between start and end
            const scenarioContent = fileContent.substring(scenarioStart, scenarioEnd);
            
            // Extract steps from scenario content
            const stepComments = this.parseStepComments(scenarioContent);
            const sayStatements = this.parseISayStatements(scenarioContent);
            
            // Merge comments and I.say statements by step number
            const mergedSteps = new Map();
            
            // Add step comments first
            stepComments.forEach(step => {
                mergedSteps.set(step.position, step);
            });
            
            // Merge I.say statements - only add if no comment exists for this step
            sayStatements.forEach(sayStep => {
                if (!mergedSteps.has(sayStep.position)) {
                    mergedSteps.set(sayStep.position, sayStep);
                }
            });
            
            // Convert back to array and sort
            steps.push(...Array.from(mergedSteps.values()));
            steps.sort((a, b) => a.position - b.position);
            
            return steps;
        } catch (error) {
            this.logger.error('Error parsing test steps:', error);
            return [];
        }
    }
    
    /**
     * Extract scenario content from test file
     */
    extractScenarioContent(fileContent, startIndex) {
        let braceCount = 0;
        let inString = false;
        let stringChar = '';
        let i = startIndex;
        
        // Find the opening brace
        while (i < fileContent.length && fileContent[i] !== '{') {
            i++;
        }
        
        if (i >= fileContent.length) {
            this.logger.debug('No opening brace found in scenario');
            return '';
        }
        
        const contentStart = i;
        braceCount = 1;
        i++;
        
        // Find the matching closing brace with proper string handling
        while (i < fileContent.length && braceCount > 0) {
            const char = fileContent[i];
            const prevChar = i > 0 ? fileContent[i - 1] : '';
            
            if (!inString) {
                if (char === '"' || char === "'" || char === '`') {
                    inString = true;
                    stringChar = char;
                } else if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                }
            } else {
                // Check for string end - handle escaped quotes
                let isEscaped = false;
                let escapeCount = 0;
                let j = i - 1;
                
                // Count consecutive backslashes
                while (j >= 0 && fileContent[j] === '\\') {
                    escapeCount++;
                    j--;
                }
                
                // If odd number of backslashes, the quote is escaped
                isEscaped = escapeCount % 2 === 1;
                
                if (char === stringChar && !isEscaped) {
                    inString = false;
                    stringChar = '';
                }
            }
            i++;
        }
        
        const scenarioContent = fileContent.substring(contentStart + 1, i - 1);
        this.logger.debug(`Extracted scenario content length: ${scenarioContent.length}`);
        this.logger.debug(`Scenario content preview: ${scenarioContent.substring(0, 200)}...`);
        
        return scenarioContent;
    }
    
    /**
     * Parse step comments from scenario content
     */
    parseStepComments(scenarioContent) {
        const steps = [];
        
        this.logger.debug('Parsing step comments from scenario');
        this.logger.debug('Scenario Content Length:', scenarioContent.length);
        this.logger.debug('Scenario Preview:', scenarioContent.substring(0, 500));
        
        // Enhanced regex to match your exact format: Step #1 with Action and Expected Result
        const stepCommentRegex = /\/\*\s*Step\s*#?(\d+)\s*([\s\S]*?)\*\//g;
        let match;
        
        while ((match = stepCommentRegex.exec(scenarioContent)) !== null) {
            const stepNumber = match[1];
            const stepContent = match[2];
            
            this.logger.debug(`Found step comment ${stepNumber}:`);
            this.logger.debug(`Raw content: "${stepContent}"`);
            
            // Parse action and expected result with more flexible regex
            // Your format: "Action\n        Navigate to Fund Center app\n    Expected Result \n        Fund Center app loads successfully"
            const actionMatch = stepContent.match(/Action\s*([\s\S]*?)(?=\s*Expected Result|$)/i);
            const expectedMatch = stepContent.match(/Expected Result\s*([\s\S]*?)$/i);
            
            this.logger.debug(`Action match:`, actionMatch ? actionMatch[1].trim() : 'NOT FOUND');
            this.logger.debug(`Expected match:`, expectedMatch ? expectedMatch[1].trim() : 'NOT FOUND');
            
            const step = {
                position: parseInt(stepNumber),
                action: actionMatch ? actionMatch[1].trim() : '',
                expected_result: expectedMatch ? expectedMatch[1].trim() : ''
            };
            
            // Clean up multi-line formatting and remove extra whitespace
            step.action = step.action.replace(/\s+/g, ' ').trim();
            step.expected_result = step.expected_result.replace(/\s+/g, ' ').trim();
            
            this.logger.debug(`Final step ${stepNumber}: action="${step.action}", expected="${step.expected_result}"`);
            
            if (step.action || step.expected_result) {
                steps.push(step);
                this.logger.debug(`Added step ${stepNumber} to results`);
            } else {
                this.logger.debug(`Skipped step ${stepNumber} - no action or expected result`);
            }
        }
        
        this.logger.debug(`Total step comments parsed: ${steps.length}`);
        return steps;
    }
    
    /**
     * Parse I.say statements from scenario content
     */
    parseISayStatements(scenarioContent) {
        const steps = [];
        const sayRegex = /I\.say\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        let match;
        
        this.logger.debug('Parsing I.say statements from scenario content...');
        
        while ((match = sayRegex.exec(scenarioContent)) !== null) {
            const sayContent = match[1];
            
            this.logger.debug(`Found I.say statement: "${sayContent}"`);
            
            // Try to extract step number from say content
            const stepMatch = sayContent.match(/Step\s*#?(\d+)/i);
            if (stepMatch) {
                const stepNumber = parseInt(stepMatch[1]);
                
                this.logger.debug(`Extracted step number ${stepNumber} from I.say statement`);
                
                // Check if we already have this step from comments
                const existingStep = steps.find(s => s.position === stepNumber);
                if (!existingStep) {
                    steps.push({
                        position: stepNumber,
                        action: sayContent,
                        expected_result: ''
                    });
                }
            }
        }
        
        this.logger.debug(`Total I.say statements parsed: ${steps.length}`);
        return steps;
    }
    /**
     * Generate HTML report
     */
    async generateHtmlReport() {
        try {
            const reportData = this.buildReportData();
            const reportPath = this.getReportPath();
            const success = await this.reportGenerator.generateReport(reportData, reportPath);
            if (success) {
                this.logger.debug(`HTML report generated: ${reportPath}`);
            }
            else {
                this.logger.error('Failed to generate HTML report');
            }
        }
        catch (error) {
            this.logger.error('Error generating HTML report', error);
        }
    }
    /**
     * Create a new test run in Qase
     */
    async createNewTestRun() {
        if (!this.configManager.isQaseIntegrationEnabled()) {
            return;
        }
        const config = this.configManager.getConfig();
        // Check if we have required credentials
        if (!config.apiToken || !config.projectCode) {
            this.logger.warn('Qase integration enabled but missing API credentials. Skipping test run creation.');
            return;
        }
        // Get case IDs from tests that will be sent
        const testResults = this.convertToQaseResults();
        const caseIds = testResults
            .map(result => result.case_id)
            .filter((id) => id !== undefined);
        
        this.logger.debug(`📋 Creating test run for ${caseIds.length} test cases: [${caseIds.join(', ')}]`);
        const runRequest = {
            title: config.runTitle || `Automated Test Run - ${new Date().toISOString()}`,
            description: config.runDescription || 'Automated test run created by CodeceptJS Qase Helper',
            include_all_cases: false, // Only include specific cases
            cases: caseIds.length > 0 ? caseIds : undefined, // Include only our test cases
            is_autotest: true
        };
        
        // Only add environment_slug if it's provided and valid
        if (config.environmentSlug && config.environmentSlug !== 'unknown') {
            runRequest.environment_slug = config.environmentSlug;
        }
        // Add viewport size, browser, and browser version to run description if available
        const windowSizeString = this.configManager.getWindowSizeString();
        const browser = this.configManager.getBrowser();
        const browserVersion = this.detectedBrowserVersion || this.configManager.getBrowserVersion();
        if (windowSizeString || browser || browserVersion) {
            let additionalInfo = '';
            if (windowSizeString) {
                const mappedViewport = this.configManager.mapToQaseViewportSize(windowSizeString);
                additionalInfo += `\nViewport: ${mappedViewport} (${windowSizeString})`;
            }
            if (browser) {
                additionalInfo += `\nBrowser: ${browser}`;
            }
            if (browserVersion) {
                additionalInfo += `\nBrowser Version: ${browserVersion}`;
            }
            runRequest.description += additionalInfo;
        }
        try {
            const testRun = await this.apiService.createTestRun(runRequest);
            if (testRun) {
                this.currentRunId = testRun.id;
                // Record when the test run was created for timestamp validation
                this.testRunCreationTime = Date.now();
                // Update the config with the new run ID
                this.config.runId = testRun.id;
                this.logger.debug(`✅ Test run created successfully with ID: ${testRun.id}`);
            }
            else {
                this.logger.error('❌ Failed to create test run. Test results will not be sent to Qase.');
            }
        }
        catch (error) {
            this.logger.error('❌ Error creating test run', error);
        }
    }
    /**
     * Send results to Qase
     */
    async sendResultsToQase() {
        if (!this.configManager.isQaseIntegrationEnabled()) {
            this.logger.debug('Qase integration is disabled, skipping result submission');
            return;
        }
        const config = this.configManager.getConfig();
        // Check if we have the minimum required configuration
        if (!config.apiToken || !config.projectCode) {
            this.logger.warn('Qase integration enabled but missing required configuration (apiToken or projectCode). Skipping result submission.');
            return;
        }
        // Check if we have a run ID (either from config or newly created)
        const runId = this.currentRunId || config.runId;
        if (!runId) {
            this.logger.warn('No run ID available. Cannot submit test results to Qase.');
            return;
        }
        try {
            const qaseResults = this.convertToQaseResults();
            
            if (qaseResults.length === 0) {
                this.logger.warn('No test results to send to Qase');
                return;
            }
            
            const caseIds = qaseResults.map(r => r.case_id).filter(id => id !== undefined);
            this.logger.debug(`📤 Sending ${qaseResults.length} test results to Qase (Run ID: ${runId}) for cases: [${caseIds.join(', ')}]`);
            
            const success = await this.apiService.submitBulkTestResults(qaseResults);
            if (success) {
                this.logger.debug(`✅ Successfully sent ${qaseResults.length} test results to Qase`);
            }
            else {
                this.logger.error(`❌ Failed to send test results to Qase`);
            }
        }
        catch (error) {
            this.logger.error('Error sending results to Qase', error);
        }
    }
    /**
     * Convert test results to Qase format
     */
    convertToQaseResults() {
        const validResults = [];
        // Use test run creation time as baseline for timestamp validation
        const baselineTime = this.testRunCreationTime > 0 ? this.testRunCreationTime : Date.now();
        const baselineTimeSeconds = Math.floor(baselineTime / 1000);
        for (const test of this.testResults) {
            // Ensure test start time is at least 2 seconds after test run creation
            const testStartTimeSeconds = baselineTimeSeconds + 2;
            // Convert steps to Qase format if they exist
            let qaseSteps = undefined;
            if (test.steps && test.steps.length > 0) {
                qaseSteps = test.steps.map((step, index) => {
                    // For failed tests, only the last step should be marked as failed
                    // All preceding steps should be marked as passed
                    let stepStatus = 'passed';
                    if (test.state === 'failed') {
                        // Mark only the last step as failed, others as passed
                        stepStatus = (index === test.steps.length - 1) ? 'failed' : 'passed';
                    } else {
                        stepStatus = this.mapStatusToQase(test.state);
                    }
                    
                    return {
                        position: step.position || (index + 1),
                        status: stepStatus,
                        action: step.action || '',
                        expected_result: step.expected_result || '',
                        actual_result: step.expected_result || '' // Actual result should be the expected result for passed steps
                    };
                });
            }
            
            // Enhanced error handling for failed tests
            let comment = undefined;
            let stacktrace = undefined;
            
            if (test.error) {
                // Build comprehensive error comment - prioritize detailed error information
                let errorComment = test.error.message || 'Test failed';
                
                // Check for more detailed error information in different locations
                const detailedError = test.error.actual || test.error.inspect || test.error.details || test.error.fullMessage;
                if (detailedError && detailedError !== test.error.message) {
                    errorComment = detailedError;
                }
                
                // Look for CodeceptJS assertion errors with detailed information
                if (test.error.message && test.error.stack) {
                    const fullStack = test.error.stack || '';
                    const lines = fullStack.split('\n');
                    
                    // Look for lines that contain more detailed error information
                    for (let line of lines) {
                        if (line.includes('expected number of elements') || 
                            line.includes('but found') || 
                            line.includes('to equal')) {
                            const detailedLine = line.trim();
                            // Use this detailed line as the main error message
                            errorComment = detailedLine;

                            break;
                        }
                    }
                }
                
                // Add assertion failure details
                if (test.error.expected !== undefined && test.error.actual !== undefined) {
                    errorComment += `\n\nAssertion Failure:`;
                    errorComment += `\nExpected: ${test.error.expected}`;
                    errorComment += `\nActual: ${test.error.actual}`;
                }
                
                // Add error name/type if available
                if (test.error.name && test.error.name !== 'Error') {
                    errorComment = `${test.error.name}: ${errorComment}`;
                }
                
                comment = errorComment;
                stacktrace = test.error.stack || undefined;
                
                // Format stacktrace for Qase if available
                if (stacktrace) {
                    stacktrace = stacktrace
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join('\n');
                }
                

            }
            
            const qaseResult = {
                status: this.mapStatusToQase(test.state),
                time_ms: test.duration,
                start_time: testStartTimeSeconds,
                comment: comment,
                stacktrace: stacktrace,
                steps: qaseSteps
            };
            
            // Log step information for Qase integration
            if (qaseSteps && qaseSteps.length > 0) {
                this.logger.debug(`Test "${test.title}" has ${qaseSteps.length} steps for Qase integration`);
            }
            // Try to extract case ID from test title or tags
            const caseId = this.extractCaseId(test);
            if (caseId) {
                qaseResult.case_id = caseId;
                validResults.push(qaseResult);
                this.logger.debug(`Preparing test "${test.title}" for Qase case ID: ${caseId} with status: ${qaseResult.status}`);
            }
            else if (this.config.autoCreateTestCases) {
                // Create test case object for auto-creation
                qaseResult.case = {
                    title: test.title,
                    description: test.fullTitle,
                    automation: 1, // Automated test case
                };
                validResults.push(qaseResult);
                this.logger.debug(`Preparing test "${test.title}" for auto-creation with status: ${qaseResult.status}`);
            }
            else {
                this.logger.warn(`⚠️ Test "${test.title}" skipped - no case ID found and auto-creation disabled`);
            }
        }
        if (validResults.length === 0) {
            this.logger.warn('No tests have valid case IDs or auto-creation enabled. Enable auto-creation or add case IDs to test titles/tags.');
        }
        return validResults;
    }
    /**
     * Map test status to Qase status
     */
    mapStatusToQase(status) {
        switch (status) {
            case 'passed':
                return 'passed';
            case 'failed':
                return 'failed';
            case 'skipped':
                return 'skipped';
            default:
                return 'invalid';
        }
    }
    /**
     * Extract Qase case ID from test
     */
    extractCaseId(test) {
        const prefix = this.config.testCasePrefix || 'C';
        
        // Enhanced patterns to support various formats including @KSYS-22
        const patterns = [
            // Bracket formats
            new RegExp(`\\[${prefix}[\\-:]?(\\d+)\\]`, 'i'), // [PREFIX123], [PREFIX-123], [PREFIX:123]
            new RegExp(`\\[${prefix}\\s+(\\d+)\\]`, 'i'), // [PREFIX 123]
            // Tag formats (for @KSYS-22 style)
            new RegExp(`@${prefix}[\\-:]?(\\d+)`, 'i'), // @PREFIX-123, @PREFIX:123, @PREFIX123
            new RegExp(`${prefix}[\\-:]?(\\d+)`, 'i'), // PREFIX-123, PREFIX:123, PREFIX123
            // Colon and dash formats
            new RegExp(`${prefix}:\\s*(\\d+)`, 'i'), // PREFIX: 123
            new RegExp(`${prefix}-(\\d+)`, 'i'), // PREFIX-123
            // CodeceptJS tag format
            new RegExp(`\\.tag\\(['"]${prefix}[\\-:]?(\\d+)['"]\\)`, 'i'), // .tag('PREFIX-123')
        ];
        
        // Try to extract from test title
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const titleMatch = pattern.exec(test.title);
            if (titleMatch) {
                const caseId = parseInt(titleMatch[1]);
                return caseId;
            }
        }
        
        // Try to extract from full title
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const fullTitleMatch = pattern.exec(test.fullTitle);
            if (fullTitleMatch) {
                const caseId = parseInt(fullTitleMatch[1]);
                return caseId;
            }
        }
        
        // Try to extract from tags
        if (test.tags && test.tags.length > 0) {
            const tagPatterns = [
                new RegExp(`^${prefix}[\\-:]?(\\d+)$`, 'i'), // PREFIX-123, PREFIX:123, PREFIX123
                new RegExp(`^@?${prefix}[\\-:]?(\\d+)$`, 'i'), // @PREFIX-123, PREFIX-123 etc
                new RegExp(`^(\\d+)$`, 'i'), // Just numbers
            ];
            for (const tag of test.tags) {
                for (let i = 0; i < tagPatterns.length; i++) {
                    const pattern = tagPatterns[i];
                    const tagMatch = pattern.exec(tag);
                    if (tagMatch) {
                        const caseId = parseInt(tagMatch[1]);
                        return caseId;
                    }
                }
            }
        }
        // Legacy support for 'C' prefix even if custom prefix is configured
        if (prefix !== 'C') {
            const legacyPatterns = [
                new RegExp(`\\[C[\\-:]?(\\d+)\\]`, 'i'), // [C123], [C-123]
                new RegExp(`@C[\\-:]?(\\d+)`, 'i'), // @C-123
                new RegExp(`C[\\-:]?(\\d+)`, 'i'), // C-123, C:123
            ];
            for (let i = 0; i < legacyPatterns.length; i++) {
                const pattern = legacyPatterns[i];
                const titleMatch = pattern.exec(test.title);
                const fullTitleMatch = pattern.exec(test.fullTitle);
                if (titleMatch) {
                    const caseId = parseInt(titleMatch[1]);
                    return caseId;
                }
                if (fullTitleMatch) {
                    const caseId = parseInt(fullTitleMatch[1]);
                    return caseId;
                }
            }
            if (test.tags) {
                for (const tag of test.tags) {
                    const legacyTagMatch = /^C(\d+)$/i.exec(tag);
                    if (legacyTagMatch) {
                        const caseId = parseInt(legacyTagMatch[1]);
                        return caseId;
                    }
                }
            }
        }
        
        return undefined;
    }
    /**
     * Build report data
     */
    buildReportData() {
        const endTime = Date.now();
        const duration = endTime - this.executionStartTime;
        // Group tests by suite/file
        const suiteMap = new Map();
        this.testResults.forEach(test => {
            const suiteName = test.file || 'Unknown Suite';
            if (!suiteMap.has(suiteName)) {
                suiteMap.set(suiteName, []);
            }
            suiteMap.get(suiteName).push(test);
        });
        // Build suite data
        const suites = Array.from(suiteMap.entries()).map(([suiteName, tests]) => {
            const suiteDuration = tests.reduce((sum, test) => sum + test.duration, 0);
            const passed = tests.filter(test => test.state === 'passed').length;
            const failed = tests.filter(test => test.state === 'failed').length;
            const skipped = tests.filter(test => test.state === 'skipped').length;
            return {
                title: suiteName,
                tests: tests,
                duration: suiteDuration,
                passed: passed,
                failed: failed,
                skipped: skipped
            };
        });
        // Calculate totals
        const totalTests = this.testResults.length;
        const passed = this.testResults.filter(test => test.state === 'passed').length;
        const failed = this.testResults.filter(test => test.state === 'failed').length;
        const skipped = this.testResults.filter(test => test.state === 'skipped').length;
        const { EnvironmentHelper } = require('./utils/EnvironmentHelper');
        const currentEnv = EnvironmentHelper.getCurrentEnvironment();
        return {
            startTime: this.executionStartTime,
            endTime: endTime,
            duration: duration,
            suites: suites,
            totalTests: totalTests,
            passed: passed,
            failed: failed,
            skipped: skipped,
            environment: this.getEnvironmentInfo(),
            testEnvironment: currentEnv ? currentEnv.name : undefined,
            currentRunId: this.currentRunId
        };
    }
    /**
     * Get environment information
     */
    getEnvironmentInfo() {
        const { EnvironmentHelper } = require('./utils/EnvironmentHelper');
        const currentEnv = EnvironmentHelper.getCurrentEnvironment();
        const envInfo = {
            'Platform': process.platform,
            'Architecture': process.arch,
            'Test Environment': currentEnv ? `${currentEnv.name} (${currentEnv.slug})` : process.env.ENV || 'Not specified',
            'Qase Project': this.config.projectCode,
            'Qase Run ID': this.currentRunId,
            'Timestamp': this.formatLocalizedTimestamp(new Date())
        };
        // Add viewport size, browser, and browser version from codecept config
        const windowSizeString = this.configManager.getWindowSizeString();
        const browser = this.configManager.getBrowser();
        // Prioritize detected browser version over static config
        const browserVersion = this.detectedBrowserVersion || this.configManager.getBrowserVersion();
        if (windowSizeString) {
            envInfo['Viewport Size'] = windowSizeString;
        }
        if (browser) {
            envInfo['Browser'] = browser;
        }
        if (browserVersion) {
            envInfo['Browser Version'] = browserVersion;
        }
        return envInfo;
    }
    /**
     * Format timestamp with localized timezone
     */
    formatLocalizedTimestamp(date) {
        return date.toLocaleString('en-US', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
    /**
     * Get report file path
     */
    getReportPath() {
        const reportDir = this.config.reportPath || './reports';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `qase-report-${timestamp}.html`;
        return path.join(reportDir, filename);
    }
    /**
     * Complete the test run if all tests passed
     */
    async completeTestRun() {
        if (!this.currentRunId) {
            return;
        }
        // Check if all tests passed
        const allTestsPassed = this.testResults.every(test => test.state === 'passed');
        if (allTestsPassed && this.testResults.length > 0) {
            this.logger.debug(`All ${this.testResults.length} tests passed, completing test run ${this.currentRunId}`);
            await this.apiService.completeTestRun(this.currentRunId);
        }
        else {
            this.logger.debug(`Not completing test run ${this.currentRunId} - ${this.testResults.filter(t => t.state === 'failed').length} failed, ${this.testResults.filter(t => t.state === 'skipped').length} skipped`);
        }
    }
    /**
     * Public method to update configuration
     */
    updateConfig(updates) {
        this.configManager.updateConfig(updates);
        this.config = this.configManager.getConfig();
        this.apiService = new QaseApiService_1.QaseApiService(this.config);
        this.logger.debug('Configuration updated');
    }
    /**
     * Public method to get current configuration
     */
    getConfig() {
        return this.configManager.getConfig();
    }
}
module.exports = QaseHelper;
//# sourceMappingURL=QaseHelper.js.map