# Qase CodeceptJS Helper

A TypeScript-based CodeceptJS helper that automatically generates HTML reports and integrates with Qase.io test management platform. Features include detailed test step extraction with the `--steps` flag, browser version detection, and comprehensive reporting capabilities.

## Installation

```bash
npm install qase-codeceptjs-helper
```

## Features

- ✅ **HTML Report Generation** - Beautiful, responsive reports with test statistics
- ✅ **Qase.io API Integration** - Automatic submission of test results to Qase.io
- ✅ **--steps Flag Support** - Detailed step extraction when using `--steps` flag
- ✅ **Multi-Browser Support** - Works with Playwright, Puppeteer, WebDriver, and TestCafe
- ✅ **Browser Version Detection** - Automatically detects browser versions
- ✅ **Environment Support** - Supports multiple test environments
- ✅ **TypeScript Support** - Full TypeScript implementation with type definitions
- ✅ **Rate Limiting** - Built-in API rate limiting for Qase.io integration

## Quick Start

### 1. Configure CodeceptJS

Add the helper to your `codecept.conf.js`:

```javascript
module.exports = {
  helpers: {
    // Your existing helper (Playwright, Puppeteer, WebDriver, etc.)
    Playwright: {
      url: 'http://localhost:3000',
      show: false,
      browser: 'chromium'
    },
    
    // Add QaseHelper
    QaseHelper: {
      require: 'qase-codeceptjs-helper',
      enableQaseIntegration: process.env.QASE_ENABLED || 'false',
      apiToken: process.env.QASE_API_TOKEN,
      projectCode: process.env.QASE_PROJECT_CODE,
      testCasePrefix: 'TC', // Your test case prefix
      enableReporting: true,
      reportPath: './reports'
    }
  }
};
```

### 2. Environment Configuration

Create a `.env.automation` file in your project root:

```env
QASE_API_TOKEN=your_qase_api_token_here
QASE_PROJECT_CODE=your_project_code_here
```

### 3. Write Tests with Case IDs

```javascript
Feature('Sample Tests');

Scenario('Login Test @TC-22 @login', async ({ I }) => {
    // Step 1: Navigate to login page
    // Action: Open login page
    // Expected Result: Login form is displayed
    I.say('Step 1: Navigate to login page');
    I.amOnPage('/login');
    I.see('Login');
    
    // Step 2: Enter credentials
    // Action: Fill username and password fields
    // Expected Result: Credentials are accepted
    I.say('Step 2: Enter credentials');
    I.fillField('username', 'testuser');
    I.fillField('password', 'password123');
    
    // Step 3: Submit login
    // Action: Click login button
    // Expected Result: User is redirected to dashboard
    I.say('Step 3: Submit login');
    I.click('Login');
    I.see('Dashboard');
});
```

## Usage Examples

### Basic HTML Reports (No Qase Integration)

```bash
# Generate HTML reports only
npx codeceptjs run --grep "TC-22"

# Generate HTML reports with detailed steps
npx codeceptjs run --grep "TC-22" --steps
```

### Full Qase Integration

```bash
# Run with Qase integration (no step extraction)
QASE_ENABLED=true npx codeceptjs run --grep "TC-22"

# Run with Qase integration and detailed steps
QASE_ENABLED=true npx codeceptjs run --grep "TC-22" --steps
```

### Environment-Specific Testing

```bash
# Test in different environments
ENV=dev QASE_ENABLED=true npx codeceptjs run --grep "TC-22"
ENV=prod QASE_ENABLED=true npx codeceptjs run --grep "TC-22"
```

## Configuration Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `enableQaseIntegration` | Enable Qase.io integration | `false` | No |
| `apiToken` | Qase.io API token | `undefined` | Yes (if Qase enabled) |
| `projectCode` | Qase.io project code | `undefined` | Yes (if Qase enabled) |
| `testCasePrefix` | Test case ID prefix | `'TC'` | No |
| `enableReporting` | Enable HTML report generation | `true` | No |
| `reportPath` | Path for HTML reports | `'./reports'` | No |

## Test Case ID Formats

The helper supports multiple test case ID formats:

- `@TC-22` - Tag format
- `TC-22` - Title format
- `TC: 22` - Colon format
- `[TC123]` - Bracket format
- `.tag('TC22')` - Tag method format

## Step Extraction

When using the `--steps` flag, the helper extracts detailed test steps from:

1. **Comment Blocks**: Step comments with Action and Expected Result
2. **I.say Statements**: Step descriptions in your test code

### Example with Step Comments:

```javascript
Scenario('Test with detailed steps @TC-22', async ({ I }) => {
    // Step 1: Navigate to homepage
    // Action: Open the homepage URL
    // Expected Result: Homepage loads successfully
    I.say('Step 1: Navigate to homepage');
    I.amOnPage('/');
    
    // Step 2: Search for product
    // Action: Enter product name in search field
    // Expected Result: Search results are displayed
    I.say('Step 2: Search for product');
    I.fillField('search', 'laptop');
    I.click('Search');
});
```

## Browser Support

The helper automatically detects browser versions for:

- ✅ **Playwright** - Chrome, Firefox, Safari, Edge
- ✅ **Puppeteer** - Chrome/Chromium
- ✅ **WebDriver** - Chrome, Firefox, Safari, Edge
- ✅ **TestCafe** - All supported browsers

## Environment Detection

Supports automatic environment detection dependant on .env file being configured for each environment.

## HTML Reports

Generated HTML reports include:

- Test execution summary and statistics
- Individual test results with timing
- Browser version and environment information
- Detailed step execution (when `--steps` flag is used)
- Responsive design for mobile and desktop viewing

## API Integration

When Qase integration is enabled:

- Automatic test run creation in Qase.io
- Test results sent to Qase.io API
- Case ID mapping from test titles and tags
- Step-by-step execution details (with `--steps` flag)
- Browser version included in test run descriptions

## Troubleshooting

### Common Issues

1. **Missing API Token**: Ensure `QASE_API_TOKEN` is set in environment or `.env.automation`
2. **Case IDs Not Detected**: Verify test case ID format matches your `testCasePrefix`
3. **Browser Version Not Detected**: Ensure your browser helper is properly configured
4. **Steps Not Extracted**: Use `--steps` flag or set `QASE_ENABLE_STEPS=true`

### Debug Mode

Enable debug logging:

```bash
DEBUG=qase* npx codeceptjs run
```

## TypeScript Support

The helper is written in TypeScript and includes full type definitions:

```typescript
import { QaseHelper } from 'qase-codeceptjs-helper';

// Type definitions are automatically available
const helper = new QaseHelper({
  enableQaseIntegration: true,
  apiToken: 'your-token',
  projectCode: 'PROJECT'
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Report bugs and request features](https://github.com/your-username/qase-codeceptjs-helper/issues)
- Documentation: [View full documentation](https://github.com/your-username/qase-codeceptjs-helper)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and updates.