/**
 * Environment helper utility for parsing command line environment parameters
 */
export declare class EnvironmentHelper {
    private static readonly ENVIRONMENT_MAPPINGS;
    /**
     * Extract environment from command line arguments
     * Looks for ENV=value parameter
     */
    static getEnvironmentFromCommandLine(): {
        slug: string;
        name: string;
    } | null;
    /**
     * Get environment from environment variable as fallback
     */
    static getEnvironmentFromEnvVar(): {
        slug: string;
        name: string;
    } | null;
    /**
     * Get current test environment with priority:
     * 1. Command line ENV= parameter
     * 2. ENV environment variable
     * 3. TEST_ENV environment variable
     * 4. NODE_ENV environment variable
     * 5. Default to null
     */
    static getCurrentEnvironment(): {
        slug: string;
        name: string;
    } | null;
    /**
     * Validate environment slug
     */
    static isValidEnvironment(slug: string): boolean;
    /**
     * Get environment name from slug
     */
    static getEnvironmentName(slug: string): string | null;
    /**
     * Get all available environments
     */
    static getAvailableEnvironments(): Record<string, string>;
    /**
     * Check if Qase integration is enabled via environment variable
     * Looks for QASE_ENABLED=true environment variable
     */
    static isQaseEnabledFromEnvironment(): boolean;
}
//# sourceMappingURL=EnvironmentHelper.d.ts.map