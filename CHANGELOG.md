# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2025-07-16

### Enhanced
- **HTML Error Display**: Enhanced HTML report error display with comprehensive error information including assertion failures
- **Error Message Formatting**: Improved error message formatting in HTML reports with expected vs actual values
- **Error Styling**: Added enhanced CSS styling for error display in HTML reports with clear visual separation
- **Qase Error Reporting**: Enhanced error reporting in Qase test runs with detailed error information and stack traces
- **Error Debugging**: Added comprehensive error debugging output to help troubleshoot test failures

### Added
- **Assertion Error Display**: Added specific styling and display for assertion errors with expected/actual values
- **Error Type Display**: Enhanced error type display in both HTML reports and Qase integration
- **Stack Trace Formatting**: Improved stack trace formatting in HTML reports with monospace font and proper spacing
- **Error Information Capture**: Added detailed error information capture from multiple CodeceptJS error sources

### Technical
- **Enhanced Error Rendering**: Improved renderError method in ReportGenerator to handle comprehensive error information
- **Error Object Processing**: Enhanced error object processing to capture name, message, expected, actual, and stack trace
- **HTML Template Updates**: Updated HTML template with enhanced error styling and display components
- **Qase Error Integration**: Enhanced Qase error integration with detailed error comments and stack traces

## [1.0.4] - 2025-07-16

### Fixed
- **Error Reporting**: Enhanced error capture in failed tests to include error message, stack trace, and expected/actual values
- **Environment Slug API**: Fixed 400 Bad Request error when using 'release' environment by conditionally adding environment_slug to test run requests
- **Error Handling**: Improved error object parsing from CodeceptJS test failures with multiple fallback sources
- **API Request Debugging**: Added comprehensive logging for test run creation to help diagnose API issues

### Changed
- **Error Capture**: Now captures error from test.err, test.error, and test.failure sources
- **Test Run Creation**: Environment slug is only added to API requests when valid (not 'unknown')
- **API Logging**: Enhanced debugging output for test run creation requests and responses

### Technical
- **Enhanced Error Processing**: Improved _failed() method to capture comprehensive error information
- **API Request Validation**: Better handling of optional environment_slug parameter in test run requests
- **Error Object Structure**: Standardized error object format for consistent processing

## [1.0.3] - 2025-07-14

### Changed
- **Production Logging**: Removed all debug console logging from browser detection process
- **Clean Console Output**: Eliminated verbose step extraction logging for professional production use
- **Optimized Performance**: Streamlined browser detection and step extraction processes
- **Debug Level Logging**: Moved all diagnostic logging to debug level for cleaner production output

### Fixed
- **Browser Detection Performance**: Removed performance-impacting debug logging while maintaining functionality
- **Console Clutter**: Significantly reduced console output noise during test execution
- **Production Readiness**: Cleaned up all development-only logging statements

### Technical
- **Logger Optimization**: Changed browser detection logging from INFO to DEBUG level
- **Step Extraction**: Removed all console.log statements from step extraction process
- **Performance**: Maintained all functionality while reducing console output overhead

## [1.0.2] - 2025-07-14

### Added
- **Enhanced Browser Detection Logging**: Added comprehensive 4-level browser detection debugging
- **Browser Detection Priority Display**: Shows constructor config, environment variable, codecept config, and default values
- **Browser Selection Source**: Clearly indicates which source was used for final browser selection
- **Detection Process Visibility**: Complete visibility into browser detection process for troubleshooting

### Changed
- **Browser Detection Debugging**: Enhanced logging to help debug browser extraction issues
- **Console Output**: More detailed browser detection information for development and debugging

### Fixed
- **Browser Detection Transparency**: Users can now see exactly how browser is being detected
- **Debugging Experience**: Improved ability to troubleshoot browser detection issues

## [1.0.1] - 2025-07-11

### Fixed
- **Browser Detection Priority**: Fixed browser detection to prioritize constructor config parameters over environment variables
- **Constructor Config Support**: Updated getBrowser() and getWindowSizeString() methods to properly use config passed from codecept.conf.ts
- **setBrowser Integration**: Enhanced integration with @codeceptjs/configure setBrowser function
- **Browser Parameter Handling**: Fixed QaseHelper configuration to properly accept browser and windowSize parameters from codecept.conf.ts

### Updated
- Browser detection priority: Constructor config > BROWSER environment variable > codecept config > default
- Window size detection priority: Constructor config > codecept config > default viewport size
- Improved compatibility with @codeceptjs/configure setBrowser function

## [1.0.0] - 2025-07-09

### Added

#### Core Features
- **HTML Report Generation** - Beautiful, responsive HTML reports with test statistics and detailed execution information
- **Qase.io API Integration** - Full integration with Qase.io test management platform for automatic test result submission
- **--steps Flag Support** - Conditional step extraction that only activates when using `--steps` flag in command line
- **Multi-Browser Support** - Compatible with Playwright, Puppeteer, WebDriver, and TestCafe helpers
- **TypeScript Support** - Complete TypeScript implementation with full type definitions

#### Step Extraction Features
- **Comment Block Parsing** - Extracts detailed test steps from comment blocks with Action and Expected Result sections
- **I.say Statement Detection** - Identifies and maps I.say statements to corresponding test steps
- **Smart Step Merging** - Combines comment-based steps with I.say statements for comprehensive step documentation
- **Performance Optimization** - Step extraction only occurs when --steps flag is used to maintain test execution speed

#### Browser and Environment Detection
- **Dynamic Browser Version Detection** - Automatically detects browser versions from running browser instances
- **Playwright Support** - Full support for Playwright browser version detection via page.evaluate()
- **Puppeteer Support** - Chrome/Chromium version detection for Puppeteer tests
- **WebDriver Support** - Browser version detection for WebDriver-based tests
- **Environment Detection** - Supports dev, release, prod_eu, prod_uk, prod_us environments

#### Configuration and Flexibility
- **Environment Variable Support** - Configurable via environment variables or .env.automation file
- **Configurable Test Case Prefix** - Support for custom test case prefixes (KSYS, TC, QT, etc.)
- **Multiple ID Formats** - Supports @KSYS-22, KSYS-22, KSYS: 22, [KSYS123], and .tag('KSYS22') formats
- **Flexible Configuration** - Works with codecept.conf.js and codecept.conf.ts configuration files

#### API and Integration Features
- **Automatic Test Run Creation** - Creates new test runs in Qase.io automatically when tests execute
- **Rate Limiting** - Built-in API rate limiting to respect Qase.io limits (600 requests/minute)
- **Bulk Result Submission** - Efficient bulk submission of test results to Qase.io API
- **Error Handling** - Comprehensive error handling and retry logic for API operations

#### Reporting Features
- **Localized Timestamps** - Timestamps display in local timezone format
- **Test Execution Timeline** - Complete timeline of test execution with detailed timing information
- **Environment Information** - Browser version, viewport size, and environment details in reports
- **Responsive Design** - HTML reports work on both desktop and mobile devices

### Technical Implementation

#### Architecture
- **Service-Oriented Design** - Clean separation of concerns with dedicated services for API, reporting, and configuration
- **Singleton Logger** - Consistent logging throughout the application with debug mode support
- **Configuration Management** - Centralized configuration with validation and merge capabilities
- **Rate Limiting** - Sliding window algorithm for API rate limiting

#### Build and Development
- **TypeScript Compilation** - Full TypeScript build process with source maps and declarations
- **CommonJS Compatibility** - Proper CommonJS exports that work with CodeceptJS module loading
- **Development Tools** - Complete development setup with TypeScript, testing, and build scripts

### Configuration Options

- `enableQaseIntegration` - Enable/disable Qase.io integration (default: false)
- `apiToken` - Qase.io API token (required if Qase integration enabled)
- `projectCode` - Qase.io project code (required if Qase integration enabled)
- `testCasePrefix` - Test case ID prefix (default: 'C')
- `enableReporting` - Enable/disable HTML report generation (default: true)
- `reportPath` - Path for HTML reports (default: './reports')

### Usage Examples

#### Basic Usage
```bash
# HTML reports only
npx codeceptjs run --grep "KSYS-22"

# HTML reports with detailed steps
npx codeceptjs run --grep "KSYS-22" --steps
```

#### Full Qase Integration
```bash
# With Qase integration
QASE_ENABLED=true npx codeceptjs run --grep "KSYS-22"

# With Qase integration and detailed steps
QASE_ENABLED=true npx codeceptjs run --grep "KSYS-22" --steps
```

### Browser Compatibility

- ✅ Playwright - Chrome, Firefox, Safari, Edge
- ✅ Puppeteer - Chrome/Chromium
- ✅ WebDriver - Chrome, Firefox, Safari, Edge
- ✅ TestCafe - All supported browsers

### Dependencies

- `node-fetch` ^3.3.2 - HTTP client for API requests
- `codeceptjs` ^3.0.0 - Peer dependency for CodeceptJS framework

### Development Dependencies

- `typescript` ^5.0.0 - TypeScript compiler
- `@types/node` ^18.0.0 - Node.js type definitions

---

## Release Notes

### v1.0.0 - Initial Release

This is the first stable release of the Qase CodeceptJS Helper. The helper has been thoroughly tested and is ready for production use.

#### Key Highlights

1. **--steps Flag Implementation** - The most requested feature that allows conditional step extraction for detailed test documentation without impacting performance
2. **Multi-Browser Support** - Works seamlessly with all major CodeceptJS helpers (Playwright, Puppeteer, WebDriver, TestCafe)
3. **Production Ready** - Comprehensive error handling, rate limiting, and robust API integration
4. **TypeScript First** - Built with TypeScript for better developer experience and type safety

#### Migration Guide

This is the initial release, no migration required.

#### Known Issues

None at this time.

#### Support

For issues and questions:
- GitHub Issues: Report bugs and request features
- Documentation: View full documentation in README.md