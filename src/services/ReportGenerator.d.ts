import { TestReportData } from '../types/QaseTypes';
/**
 * Service for generating HTML test reports
 */
export declare class ReportGenerator {
    private logger;
    private templatePath;
    constructor();
    /**
     * Generate HTML report from test data
     */
    generateReport(reportData: TestReportData, outputPath: string): Promise<boolean>;
    /**
     * Load HTML template
     */
    private loadTemplate;
    /**
     * Render template with data
     */
    private renderTemplate;
    /**
     * Render test suite HTML
     */
    private renderSuite;
    /**
     * Render test HTML
     */
    private renderTest;
    /**
     * Render test step HTML
     */
    private renderStep;
    /**
     * Render error HTML
     */
    private renderError;
    /**
     * Render environment HTML
     */
    private renderEnvironment;
    /**
     * Format duration in milliseconds to human readable format
     */
    private formatDuration;
    /**
     * Escape HTML characters
     */
    private escapeHtml;
}
//# sourceMappingURL=ReportGenerator.d.ts.map