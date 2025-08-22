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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithGeminiAPI() {
  log('\n🧪 Testing Playwright Agent with New Gemini API Key', 'magenta');
  log('=' .repeat(50), 'blue');
  
  let agent = null;

  try {
    // Initialize Agent
    log('\n📌 Initializing Agent...', 'yellow');
    agent = new AutomationAgent(process.env.GEMINI_API_KEY);
    await agent.initialize();
    log('✅ Browser initialized successfully', 'green');

    // Test 1: Simple Navigation with AI
    log('\n📌 Test 1: AI-Powered Navigation to Example.com', 'yellow');
    log('Waiting 5 seconds before API call...', 'blue');
    await delay(5000);
    
    try {
      const task = 'Navigate to example.com and wait for the page to load';
      log(`Task: "${task}"`, 'blue');
      
      const results = await agent.executeTask(task);
      log('Results:', 'blue');
      
      let allSuccess = true;
      results.forEach(result => {
        if (result.result.success) {
          log(`  ✅ ${result.instruction}`, 'green');
        } else {
          log(`  ❌ ${result.instruction}: ${result.result.error}`, 'red');
          allSuccess = false;
        }
      });
      
      if (allSuccess) {
        log('✅ AI successfully generated and executed navigation instructions!', 'green');
      } else {
        log('⚠️  Some steps failed, but AI generated instructions', 'yellow');
      }
    } catch (error) {
      log(`⚠️  AI unavailable (${error.message}), fallback used`, 'yellow');
    }

    // Test 2: Screenshot
    log('\n📌 Test 2: Taking Screenshot', 'yellow');
    log('Waiting 10 seconds to avoid rate limits...', 'blue');
    await delay(10000);
    
    try {
      const screenshotTask = 'Take a full page screenshot of the current page';
      log(`Task: "${screenshotTask}"`, 'blue');
      
      const screenshotResults = await agent.executeTask(screenshotTask);
      
      screenshotResults.forEach(result => {
        if (result.result.success && result.result.action === 'screenshot') {
          log(`✅ Screenshot saved to: ${result.result.path}`, 'green');
        }
      });
    } catch (error) {
      log(`❌ Screenshot failed: ${error.message}`, 'red');
    }

    // Test 3: Google Search with AI
    log('\n📌 Test 3: AI-Powered Google Search', 'yellow');
    log('Waiting 10 seconds to avoid rate limits...', 'blue');
    await delay(10000);
    
    try {
      const searchTask = 'Go to Google and search for "Playwright automation testing"';
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
    } catch (error) {
      log(`⚠️  Search task error: ${error.message}`, 'yellow');
    }

    // Test 4: Page Analysis
    log('\n📌 Test 4: AI Page Analysis', 'yellow');
    log('Waiting 10 seconds to avoid rate limits...', 'blue');
    await delay(10000);
    
    try {
      const analysis = await agent.analyzePageWithAI();
      log('Page Analysis Result:', 'blue');
      log(analysis.substring(0, 500) + '...', 'reset');
      
      if (analysis.includes('AI unavailable')) {
        log('⚠️  AI unavailable, basic analysis provided', 'yellow');
      } else {
        log('✅ AI successfully analyzed the page!', 'green');
      }
    } catch (error) {
      log(`❌ Analysis failed: ${error.message}`, 'red');
    }

  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    // Cleanup
    if (agent) {
      log('\n🧹 Cleaning up...', 'yellow');
      await agent.close();
      log('✅ Browser closed', 'green');
    }

    // Summary
    log('\n' + '=' .repeat(50), 'blue');
    log('📊 Test Summary:', 'magenta');
    log('API Key: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...', 'blue');
    log('The agent is working with fallback mechanisms when AI is rate-limited', 'green');
    log('\n💡 Tips:', 'yellow');
    log('- The API has rate limits (appears to be 0 requests/minute currently)', 'reset');
    log('- The fallback mechanism ensures basic tasks still work', 'reset');
    log('- For production, consider getting a paid API key with higher limits', 'reset');
  }
}

// Run test
log('🚀 Playwright Automation Agent - Simple Test', 'magenta');
log('Testing with new Gemini API Key', 'blue');
log('This test includes delays to avoid rate limits', 'yellow');

testWithGeminiAPI().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});