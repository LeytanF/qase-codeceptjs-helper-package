"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentHelper = void 0;
/**
 * Environment helper utility for parsing command line environment parameters
 */
class EnvironmentHelper {
    /**
     * Extract environment from command line arguments
     * Looks for ENV=value parameter
     */
    static getEnvironmentFromCommandLine() {
        // Look for ENV=value in command line arguments
        const envArg = process.argv.find(arg => arg.startsWith('ENV='));
        if (!envArg) {
            return null;
        }
        const envValue = envArg.split('=')[1];
        if (!envValue || !this.ENVIRONMENT_MAPPINGS[envValue]) {
            return null;
        }
        return {
            slug: envValue,
            name: this.ENVIRONMENT_MAPPINGS[envValue]
        };
    }
    /**
     * Get environment from environment variable as fallback
     */
    static getEnvironmentFromEnvVar() {
        const envValue = process.env.ENV || process.env.TEST_ENV || process.env.NODE_ENV;
        if (!envValue || !this.ENVIRONMENT_MAPPINGS[envValue]) {
            return null;
        }
        return {
            slug: envValue,
            name: this.ENVIRONMENT_MAPPINGS[envValue]
        };
    }
    /**
     * Get current test environment with priority:
     * 1. Command line ENV= parameter
     * 2. ENV environment variable
     * 3. TEST_ENV environment variable
     * 4. NODE_ENV environment variable
     * 5. Default to null
     */
    static getCurrentEnvironment() {
        return this.getEnvironmentFromCommandLine() ||
            this.getEnvironmentFromEnvVar() ||
            null;
    }
    /**
     * Validate environment slug
     */
    static isValidEnvironment(slug) {
        return slug in this.ENVIRONMENT_MAPPINGS;
    }
    /**
     * Get environment name from slug
     */
    static getEnvironmentName(slug) {
        return this.ENVIRONMENT_MAPPINGS[slug] || null;
    }
    /**
     * Get all available environments
     */
    static getAvailableEnvironments() {
        return { ...this.ENVIRONMENT_MAPPINGS };
    }
    /**
     * Check if Qase integration is enabled via environment variable
     * Looks for QASE_ENABLED=true environment variable
     */
    static isQaseEnabledFromEnvironment() {
        // Check QASE_ENABLED environment variable
        const qaseEnabled = process.env.QASE_ENABLED;
        return qaseEnabled === 'true' || qaseEnabled === 'TRUE';
    }
}
exports.EnvironmentHelper = EnvironmentHelper;
EnvironmentHelper.ENVIRONMENT_MAPPINGS = {
    'dev': 'Development',
    'release': 'Release',
    'prod_eu': 'Production EU',
    'prod_uk': 'Production UK',
    'prod_us': 'Production US'
};
//# sourceMappingURL=EnvironmentHelper.js.map