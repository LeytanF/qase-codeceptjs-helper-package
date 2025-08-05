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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaseConfigManager = void 0;
const EnvironmentHelper_1 = require("../utils/EnvironmentHelper");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Configuration management for Qase helper
 */
class QaseConfigManager {
    constructor(userConfig) {
        this.config = this.mergeConfig(userConfig);
        this.validateConfig();
    }
    mergeConfig(userConfig) {
        // Check for --useQase=TRUE flag in command line arguments
        const useQaseFlag = process.argv.find(arg => arg.includes('--useQase=TRUE'));
        const enableQaseByFlag = !!useQaseFlag;
        // Check for --steps flag in command line arguments
        const stepsFlag = process.argv.find(arg => arg.includes('--steps'));
        const enableStepsExtraction = !!stepsFlag;
        // Get environment from command line or environment variables
        const currentEnvironment = EnvironmentHelper_1.EnvironmentHelper.getCurrentEnvironment();
        // Read credentials from .env.automation file
        const envAutomationCredentials = this.readEnvAutomationFile();
        const defaultConfig = {
            apiToken: envAutomationCredentials.apiToken || process.env.QASE_API_TOKEN || '',
            projectCode: envAutomationCredentials.projectCode || process.env.QASE_PROJECT_CODE || '',
            runId: process.env.QASE_RUN_ID ? parseInt(process.env.QASE_RUN_ID) : undefined,
            reportPath: process.env.QASE_REPORT_PATH || './reports',
            baseUrl: process.env.QASE_BASE_URL || 'https://api.qase.io/v1',
            enableReporting: process.env.QASE_ENABLE_REPORTING !== 'false',
            enableQaseIntegration: enableQaseByFlag || process.env.QASE_ENABLED === 'true' || process.env.QASE_ENABLED === 'TRUE',
            autoCreateTestCases: process.env.QASE_AUTO_CREATE_CASES !== 'false', // Default to true for easier setup
            bulkSize: process.env.QASE_BULK_SIZE ? parseInt(process.env.QASE_BULK_SIZE) : 100,
            retryAttempts: process.env.QASE_RETRY_ATTEMPTS ? parseInt(process.env.QASE_RETRY_ATTEMPTS) : 3,
            retryDelay: process.env.QASE_RETRY_DELAY ? parseInt(process.env.QASE_RETRY_DELAY) : 1000,
            runTitle: process.env.QASE_RUN_TITLE || `Automated Test Run - ${new Date().toISOString()}`,
            runDescription: process.env.QASE_RUN_DESCRIPTION || 'Automated test run created by CodeceptJS Qase Helper',
            environment: currentEnvironment?.name,
            environmentSlug: currentEnvironment?.slug,
            testCasePrefix: this.getTestCasePrefixFromCodeceptConfig() || process.env.QASE_TEST_CASE_PREFIX || 'C',
            enableStepsExtraction: enableStepsExtraction || process.env.QASE_ENABLE_STEPS === 'true',
        };
        // Only merge user config values that are not undefined
        const filteredUserConfig = {};
        for (const [key, value] of Object.entries(userConfig || {})) {
            if (value !== undefined) {
                filteredUserConfig[key] = value;
            }
        }
        const finalConfig = { ...defaultConfig, ...filteredUserConfig };

        return finalConfig;
    }
    /**
     * Read QASE_API_TOKEN and QASE_PROJECT_CODE from .env.automation file
     */
    readEnvAutomationFile() {
        const envFilePaths = [
            // Current working directory first (project root)
            path.join(process.cwd(), '.env.automation'),
            // Relative paths from npm package location
            '.env.automation',
            '../.env.automation',
            '../../.env.automation',
            '../../../.env.automation',
            '../../../../.env.automation',
            './tests/.env.automation',
            // Common project structure locations
            path.join(process.cwd(), 'tests', '.env.automation'),
            path.join(process.cwd(), 'test', '.env.automation'),
            // Parent directories from project root
            path.join(process.cwd(), '..', '.env.automation'),
            path.join(process.cwd(), '..', '..', '.env.automation')
        ];
        for (const filePath of envFilePaths) {
            try {
                if (fs.existsSync(filePath)) {

                    const content = fs.readFileSync(filePath, 'utf8');
                    const result = {};
                    // Extract QASE_API_TOKEN
                    const apiTokenMatch = content.match(/^QASE_API_TOKEN\s*=\s*(.+)$/m);
                    if (apiTokenMatch) {
                        result.apiToken = apiTokenMatch[1].trim().replace(/^["']|["']$/g, '');

                    }
                    // Extract QASE_PROJECT_CODE
                    const projectCodeMatch = content.match(/^QASE_PROJECT_CODE\s*=\s*(.+)$/m);
                    if (projectCodeMatch) {
                        result.projectCode = projectCodeMatch[1].trim().replace(/^["']|["']$/g, '');

                    }
                    if (result.apiToken || result.projectCode) {
                        return result;
                    }
                }
            }
            catch (error) {
                // Silently continue to next file path
                continue;
            }
        }

        return {};
    }
    /**
     * Read CodeceptJS configuration values
     */
    getCodeceptJSConfig() {
        const result = {};
        const configPaths = [
            './codecept.conf.ts',
            './codecept.conf.js',
            path.join(process.cwd(), 'codecept.conf.ts'),
            path.join(process.cwd(), 'codecept.conf.js')
        ];
        for (const configPath of configPaths) {
            try {
                if (fs.existsSync(configPath)) {
                    const configContent = fs.readFileSync(configPath, 'utf8');
                    // Extract testCasePrefix from QaseHelper configuration
                    const qaseHelperMatch = configContent.match(/QaseHelper\s*:\s*{([^}]*)}/s);
                    if (qaseHelperMatch) {
                        const helperConfig = qaseHelperMatch[1];
                        const prefixMatch = helperConfig.match(/testCasePrefix\s*:\s*['"`]([^'"`]+)['"`]/);
                        if (prefixMatch) {
                            result.testCasePrefix = prefixMatch[1];
                        }
                    }
                    // Alternative format: helpers.QaseHelper.testCasePrefix
                    const altMatch = configContent.match(/helpers\s*:\s*{[^}]*QaseHelper\s*:\s*{([^}]*)}/s);
                    if (altMatch) {
                        const helperConfig = altMatch[1];
                        const prefixMatch = helperConfig.match(/testCasePrefix\s*:\s*['"`]([^'"`]+)['"`]/);
                        if (prefixMatch) {
                            result.testCasePrefix = prefixMatch[1];
                        }
                    }
                    // TypeScript export format
                    const exportMatch = configContent.match(/export\s*=\s*{[^}]*helpers\s*:\s*{[^}]*QaseHelper\s*:\s*{([^}]*)}/s);
                    if (exportMatch) {
                        const helperConfig = exportMatch[1];
                        const prefixMatch = helperConfig.match(/testCasePrefix\s*:\s*['"`]([^'"`]+)['"`]/);
                        if (prefixMatch) {
                            result.testCasePrefix = prefixMatch[1];
                        }
                    }
                    // Extract windowSizeString from WebDriver configuration
                    const windowSizeMatch = configContent.match(/windowSizeString\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (windowSizeMatch) {
                        result.windowSizeString = windowSizeMatch[1];
                    }
                    // Extract windowSize from Playwright configuration (windowSize: windowSizeString)
                    const windowSizePlaywrightMatch = configContent.match(/windowSize\s*:\s*windowSizeString/);
                    if (windowSizePlaywrightMatch && !result.windowSizeString) {
                        // Look for the windowSizeString variable definition
                        const windowSizeDefMatch = configContent.match(/const\s+windowSizeString\s*=\s*[^|]+\|\|\s*['"`]([^'"`]+)['"`]/);
                        if (windowSizeDefMatch) {
                            result.windowSizeString = windowSizeDefMatch[1];
                        }
                    }
                    // Direct windowSize with quoted value
                    const windowSizeDirectMatch = configContent.match(/windowSize\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (windowSizeDirectMatch && !result.windowSizeString) {
                        result.windowSizeString = windowSizeDirectMatch[1];
                    }
                    // Extract browser from WebDriver configuration
                    const browserMatch = configContent.match(/browser\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (browserMatch) {
                        result.browser = browserMatch[1];
                    }
                    // Extract browser from Playwright configuration (browser: browser)
                    const browserPlaywrightMatch = configContent.match(/browser\s*:\s*browser/);
                    if (browserPlaywrightMatch && !result.browser) {
                        // Look for the browser variable definition with setBrowser function
                        const browserDefMatch = configContent.match(/const\s+browser\s*=\s*setBrowser\([^)]*\)\s*\|\|\s*['"`]([^'"`]+)['"`]/);
                        if (browserDefMatch) {
                            result.browser = browserDefMatch[1];
                        }
                        // Fallback to simpler pattern
                        const browserSimpleMatch = configContent.match(/const\s+browser\s*=\s*[^|]+\|\|\s*['"`]([^'"`]+)['"`]/);
                        if (browserSimpleMatch && !result.browser) {
                            result.browser = browserSimpleMatch[1];
                        }
                    }
                    // Direct browser with quoted value
                    const browserDirectMatch = configContent.match(/browser\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (browserDirectMatch && !result.browser) {
                        result.browser = browserDirectMatch[1];
                    }
                    // Extract browser version from various configurations
                    const browserVersionMatch = configContent.match(/browserVersion\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (browserVersionMatch) {
                        result.browserVersion = browserVersionMatch[1];
                    }
                    // Extract version from Playwright configuration
                    const playwrightVersionMatch = configContent.match(/version\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (playwrightVersionMatch && !result.browserVersion) {
                        result.browserVersion = playwrightVersionMatch[1];
                    }
                    // Extract version from WebDriver capabilities
                    const capabilitiesVersionMatch = configContent.match(/capabilities\s*:\s*{[^}]*version\s*:\s*['"`]([^'"`]+)['"`]/);
                    if (capabilitiesVersionMatch && !result.browserVersion) {
                        result.browserVersion = capabilitiesVersionMatch[1];
                    }
                    return result;
                }
            }
            catch (error) {
                // Silently continue to next config file
                continue;
            }
        }
        return result;
    }
    /**
     * Read test case prefix from codecept.conf.ts or codecept.conf.js
     */
    getTestCasePrefixFromCodeceptConfig() {
        return this.getCodeceptJSConfig().testCasePrefix;
    }
    /**
     * Get windowSizeString from codecept config
     */
    getWindowSizeString() {
        // Priority: Constructor config > codecept config > default
        return this.config.windowSize || this.getCodeceptJSConfig().windowSizeString || '1920x1080';
    }
    /**
     * Get browser from codecept config
     */
    getBrowser() {
        // Priority: Constructor config > BROWSER environment variable > codecept config > default
        const configBrowser = this.config.browser;
        const envBrowser = process.env.BROWSER;
        const codeceptConfig = this.getCodeceptJSConfig();
        const codeceptBrowser = codeceptConfig.browser;
        const defaultBrowser = 'chrome';
        
        // Determine final browser using priority
        const finalBrowser = configBrowser || envBrowser || codeceptBrowser || defaultBrowser;
        
        return finalBrowser;
    }
    /**
     * Get browser version from codecept config
     */
    getBrowserVersion() {
        return this.getCodeceptJSConfig().browserVersion;
    }
    /**
     * Map windowSizeString to Qase viewport size
     */
    mapToQaseViewportSize(windowSizeString) {
        if (!windowSizeString)
            return undefined;
        // Convert to lowercase for comparison
        const size = windowSizeString.toLowerCase();
        // Check for mobile indicators
        if (size.includes('mobile') || size.includes('phone') || size.includes('375x667') || size.includes('414x736')) {
            return 'Mobile';
        }
        // Check for tablet indicators
        if (size.includes('tablet') || size.includes('ipad') || size.includes('768x1024') || size.includes('1024x768')) {
            return 'Tablet';
        }
        // Default to Desktop for larger sizes or unclear indicators
        return 'Desktop';
    }
    validateConfig() {
        if (this.config.enableQaseIntegration) {
            if (!this.config.apiToken) {
                throw new Error('QASE_API_TOKEN is required when Qase integration is enabled');
            }
            if (!this.config.projectCode) {
                throw new Error('QASE_PROJECT_CODE is required when Qase integration is enabled');
            }
        }
        if (this.config.bulkSize && (this.config.bulkSize < 1 || this.config.bulkSize > 2000)) {
            throw new Error('QASE_BULK_SIZE must be between 1 and 2000');
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.validateConfig();
    }
    isQaseIntegrationEnabled() {
        // Only enable Qase integration if explicitly enabled via environment variable
        const { EnvironmentHelper } = require('../utils/EnvironmentHelper');
        return !!(this.config.enableQaseIntegration &&
            this.config.apiToken &&
            this.config.projectCode &&
            EnvironmentHelper.isQaseEnabledFromEnvironment());
    }
    isReportingEnabled() {
        return !!this.config.enableReporting;
    }
}
exports.QaseConfigManager = QaseConfigManager;
//# sourceMappingURL=QaseConfig.js.map