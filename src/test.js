const AutomationAgent = require('./automationAgent');
require('dotenv').config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  log('\n🧪 Starting Playwright Automation Agent Tests', 'magenta');
  log('=' .repeat(50), 'blue');
  
  let agent = null;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Initialize Agent
    log('\n📌 Test 1: Initializing Agent...', 'yellow');
    agent = new AutomationAgent(process.env.GEMINI_API_KEY);
    await agent.initialize();
    log('✅ Agent initialized successfully', 'green');
    testsPassed++;

    // Test 2: Simple Navigation Task
    log('\n📌 Test 2: Testing Simple Navigation...', 'yellow');
    const navigationTask = 'Navigate to example.com';
    log(`Task: "${navigationTask}"`, 'blue');
    
    const navResults = await agent.executeTask(navigationTask);
    log('Results:', 'blue');
    navResults.forEach(result => {
      if (result.result.success) {
        log(`  ✅ ${result.instruction}`, 'green');
      } else {
        log(`  ❌ ${result.instruction}: ${result.result.error}`, 'red');
      }
    });
    
    const navSuccess = navResults.every(r => r.result.success);
    if (navSuccess) {
      log('✅ Navigation test passed', 'green');
      testsPassed++;
    } else {
      log('❌ Navigation test failed', 'red');
      testsFailed++;
    }

    // Test 3: Search Task
    log('\n📌 Test 3: Testing Search Functionality...', 'yellow');
    const searchTask = 'Go to Google and search for "Playwright testing"';
    log(`Task: "${searchTask}"`, 'blue');
    
    const searchResults = await agent.executeTask(searchTask);
    log('Results:', 'blue');
    searchResults.forEach(result => {
      if (result.result.success) {
        log(`  ✅ ${result.instruction}`, 'green');
      } else {
        log(`  ❌ ${result.instruction}: ${result.result.error}`, 'red');
      }
    });
    
    const searchSuccess = searchResults.some(r => r.result.success);
    if (searchSuccess) {
      log('✅ Search test passed', 'green');
      testsPassed++;
    } else {
      log('❌ Search test failed', 'red');
      testsFailed++;
    }

    // Test 4: Page Analysis
    log('\n📌 Test 4: Testing Page Analysis...', 'yellow');
    const analysis = await agent.analyzePageWithAI();
    log('Page Analysis:', 'blue');
    log(analysis.substring(0, 200) + '...', 'reset');
    log('✅ Page analysis completed', 'green');
    testsPassed++;

    // Test 5: Screenshot Task
    log('\n📌 Test 5: Testing Screenshot Capture...', 'yellow');
    const screenshotTask = 'Take a screenshot of the current page';
    log(`Task: "${screenshotTask}"`, 'blue');
    
    const screenshotResults = await agent.executeTask(screenshotTask);
    log('Results:', 'blue');
    screenshotResults.forEach(result => {
      if (result.result.success) {
        log(`  ✅ ${result.instruction}`, 'green');
        if (result.result.path) {
          log(`     Screenshot saved to: ${result.result.path}`, 'blue');
        }
      } else {
        log(`  ❌ ${result.instruction}: ${result.result.error}`, 'red');
      }
    });
    
    const screenshotSuccess = screenshotResults.some(r => r.result.success && r.result.action === 'screenshot');
    if (screenshotSuccess) {
      log('✅ Screenshot test passed', 'green');
      testsPassed++;
    } else {
      log('❌ Screenshot test failed', 'red');
      testsFailed++;
    }

    // Test 6: Data Extraction Task
    log('\n📌 Test 6: Testing Data Extraction...', 'yellow');
    const extractTask = 'Go to news.ycombinator.com and extract the first 3 headlines';
    log(`Task: "${extractTask}"`, 'blue');
    
    const extractResults = await agent.executeTask(extractTask);
    log('Results:', 'blue');
    extractResults.forEach(result => {
      if (result.result.success) {
        log(`  ✅ ${result.instruction}`, 'green');
        if (result.result.data && Array.isArray(result.result.data)) {
          log(`     Extracted ${result.result.data.length} items`, 'blue');
        }
      } else {
        log(`  ❌ ${result.instruction}: ${result.result.error}`, 'red');
      }
    });
    
    const extractSuccess = extractResults.some(r => r.result.success && r.result.action === 'extracted');
    if (extractSuccess) {
      log('✅ Data extraction test passed', 'green');
      testsPassed++;
    } else {
      log('❌ Data extraction test failed', 'red');
      testsFailed++;
    }

  } catch (error) {
    log(`\n❌ Test Error: ${error.message}`, 'red');
    console.error(error);
    testsFailed++;
  } finally {
    // Cleanup
    if (agent) {
      log('\n🧹 Cleaning up...', 'yellow');
      await agent.close();
      log('✅ Browser closed', 'green');
    }

    // Test Summary
    log('\n' + '=' .repeat(50), 'blue');
    log('📊 Test Summary:', 'magenta');
    log(`  ✅ Passed: ${testsPassed}`, 'green');
    log(`  ❌ Failed: ${testsFailed}`, 'red');
    log(`  📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'blue');
    
    if (testsFailed === 0) {
      log('\n🎉 All tests passed successfully!', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review the results above.', 'yellow');
    }
  }
}

// Run tests
log('🚀 Playwright Automation Agent Test Suite', 'magenta');
log('Using Gemini 2.0 Flash Model', 'blue');

runTests().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});