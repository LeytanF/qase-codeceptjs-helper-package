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
exports.ReportGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Logger_1 = require("../utils/Logger");
/**
 * Service for generating HTML test reports
 */
class ReportGenerator {
    constructor() {
        this.logger = Logger_1.Logger.getInstance();
        this.templatePath = path.join(__dirname, '../../templates/report.html');
    }
    /**
     * Generate HTML report from test data
     */
    async generateReport(reportData, outputPath) {
        try {
            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // Load template
            const template = await this.loadTemplate();
            // Generate HTML content
            const htmlContent = this.renderTemplate(template, reportData);
            // Write to file
            fs.writeFileSync(outputPath, htmlContent, 'utf8');
            this.logger.debug(`HTML report generated successfully: ${outputPath}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error generating HTML report', error);
            return false;
        }
    }
    /**
     * Load HTML template
     */
    async loadTemplate() {
        try {
            return fs.readFileSync(this.templatePath, 'utf8');
        }
        catch (error) {
            this.logger.error('Error loading template', error);
            throw error;
        }
    }
    /**
     * Render template with data
     */
    renderTemplate(template, data) {
        const { startTime, endTime, duration, totalTests, passed, failed, skipped, suites, environment } = data;
        // Calculate percentages
        const passRate = totalTests > 0 ? (passed / totalTests * 100).toFixed(1) : '0';
        const failRate = totalTests > 0 ? (failed / totalTests * 100).toFixed(1) : '0';
        const skipRate = totalTests > 0 ? (skipped / totalTests * 100).toFixed(1) : '0';
        // Format dates
        const startDate = new Date(startTime).toLocaleString();
        const endDate = new Date(endTime).toLocaleString();
        const durationFormatted = this.formatDuration(duration);
        // Generate test suites HTML
        const suitesHtml = suites.map(suite => this.renderSuite(suite)).join('');
        // Generate environment HTML
        const environmentHtml = environment ? this.renderEnvironment(environment) : '';
        // Replace placeholders
        return template
            .replace(/\{\{startDate\}\}/g, startDate)
            .replace(/\{\{endDate\}\}/g, endDate)
            .replace(/\{\{duration\}\}/g, durationFormatted)
            .replace(/\{\{totalTests\}\}/g, totalTests.toString())
            .replace(/\{\{passed\}\}/g, passed.toString())
            .replace(/\{\{failed\}\}/g, failed.toString())
            .replace(/\{\{skipped\}\}/g, skipped.toString())
            .replace(/\{\{passRate\}\}/g, passRate)
            .replace(/\{\{failRate\}\}/g, failRate)
            .replace(/\{\{skipRate\}\}/g, skipRate)
            .replace(/\{\{suites\}\}/g, suitesHtml)
            .replace(/\{\{environment\}\}/g, environmentHtml);
    }
    /**
     * Render test suite HTML
     */
    renderSuite(suite) {
        const testsHtml = suite.tests.map(test => this.renderTest(test)).join('');
        const suiteDuration = this.formatDuration(suite.duration);
        return `
      <div class="test-suite">
        <h3 class="suite-title">${this.escapeHtml(suite.title)}</h3>
        <div class="suite-summary">
          <span class="suite-duration">Duration: ${suiteDuration}</span>
          <span class="suite-stats">
            <span class="passed">${suite.passed} passed</span>
            <span class="failed">${suite.failed} failed</span>
            <span class="skipped">${suite.skipped} skipped</span>
          </span>
        </div>
        <div class="tests">
          ${testsHtml}
        </div>
      </div>
    `;
    }
    /**
     * Render test HTML
     */
    renderTest(test) {
        const testDuration = this.formatDuration(test.duration);
        const statusClass = test.state;
        const errorHtml = test.error ? this.renderError(test.error) : '';
        const stepsHtml = test.steps ? test.steps.map(step => this.renderStep(step)).join('') : '';
        return `
      <div class="test ${statusClass}">
        <div class="test-header">
          <span class="test-status ${statusClass}">${test.state.toUpperCase()}</span>
          <span class="test-title">${this.escapeHtml(test.title)}</span>
          <span class="test-duration">${testDuration}</span>
        </div>
        <div class="test-details">
          <div class="test-file">${this.escapeHtml(test.file)}</div>
          ${errorHtml}
          ${stepsHtml}
        </div>
      </div>
    `;
    }
    /**
     * Render test step HTML
     */
    renderStep(step) {
        // Handle extracted step format with action and expected_result
        if (step.action || step.expected_result) {
            return `
      <div class="test-step">
        <div class="step-header">
          <span class="step-position">Step ${step.position}</span>
          <span class="step-action">${this.escapeHtml(step.action || '')}</span>
        </div>
        <div class="step-expected">
          <span class="step-expected-label">Expected:</span>
          <span class="step-expected-text">${this.escapeHtml(step.expected_result || '')}</span>
        </div>
      </div>
    `;
        }
        
        // Handle CodeceptJS step format (fallback)
        const stepDuration = this.formatDuration(step.duration || 0);
        const statusClass = step.status || '';
        const errorHtml = step.error ? this.renderError(step.error) : '';
        return `
      <div class="test-step ${statusClass}">
        <div class="step-header">
          <span class="step-name">${this.escapeHtml(step.name || '')}</span>
          <span class="step-duration">${stepDuration}</span>
        </div>
        ${errorHtml}
      </div>
    `;
    }
    /**
     * Render error HTML
     */
    renderError(error) {
        if (!error) return '';
        
        let errorHtml = `<div class="test-error">`;
        
        // Error message
        if (error.message) {
            errorHtml += `<div class="error-message">${this.escapeHtml(error.message)}</div>`;
        }
        
        // Expected vs Actual values for assertion errors
        if (error.expected !== undefined && error.actual !== undefined) {
            errorHtml += `
                <div class="error-assertion">
                    <div class="assertion-expected">
                        <strong>Expected:</strong> ${this.escapeHtml(String(error.expected))}
                    </div>
                    <div class="assertion-actual">
                        <strong>Actual:</strong> ${this.escapeHtml(String(error.actual))}
                    </div>
                </div>
            `;
        }
        
        // Stack trace
        if (error.stack) {
            errorHtml += `<div class="error-stack">${this.escapeHtml(error.stack)}</div>`;
        }
        
        errorHtml += `</div>`;
        return errorHtml;
    }
    /**
     * Render environment HTML
     */
    renderEnvironment(environment) {
        const envItems = Object.entries(environment)
            .map(([key, value]) => `
        <div class="env-item">
          <span class="env-key">${this.escapeHtml(key)}</span>
          <span class="env-value">${this.escapeHtml(String(value))}</span>
        </div>
      `)
            .join('');
        return `
      <div class="environment">
        <h3>Environment</h3>
        <div class="env-items">
          ${envItems}
        </div>
      </div>
    `;
    }
    /**
     * Format duration in milliseconds to human readable format
     */
    formatDuration(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        }
        else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
        }
    }
    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        // Handle null/undefined values
        if (!text) return '';
        
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
exports.ReportGenerator = ReportGenerator;
//# sourceMappingURL=ReportGenerator.js.map