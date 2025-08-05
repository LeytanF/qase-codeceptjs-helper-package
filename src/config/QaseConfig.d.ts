import { QaseConfig } from '../types/QaseTypes';
/**
 * Configuration management for Qase helper
 */
export declare class QaseConfigManager {
    private config;
    constructor(userConfig?: Partial<QaseConfig>);
    private mergeConfig;
    /**
     * Read QASE_API_TOKEN and QASE_PROJECT_CODE from .env.automation file
     */
    private readEnvAutomationFile;
    /**
     * Read CodeceptJS configuration values
     */
    private getCodeceptJSConfig;
    /**
     * Read test case prefix from codecept.conf.ts or codecept.conf.js
     */
    private getTestCasePrefixFromCodeceptConfig;
    /**
     * Get windowSizeString from codecept config
     */
    getWindowSizeString(): string | undefined;
    /**
     * Get browser from codecept config
     */
    getBrowser(): string | undefined;
    /**
     * Map windowSizeString to Qase viewport size
     */
    mapToQaseViewportSize(windowSizeString?: string): 'Desktop' | 'Mobile' | 'Tablet' | undefined;
    private validateConfig;
    getConfig(): QaseConfig;
    updateConfig(updates: Partial<QaseConfig>): void;
    isQaseIntegrationEnabled(): boolean;
    isReportingEnabled(): boolean;
}
//# sourceMappingURL=QaseConfig.d.ts.map