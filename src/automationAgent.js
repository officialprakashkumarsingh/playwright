const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AutomationAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      this.page = await this.context.newPage();
      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async executeTask(task) {
    try {
      // Get AI instructions for the task
      const instructions = await this.getAIInstructions(task);
      console.log('AI Instructions:', instructions);

      // Execute the instructions
      const result = await this.executeInstructions(instructions);
      return result;
    } catch (error) {
      console.error('Error executing task:', error);
      throw error;
    }
  }

  // Fallback patterns for common tasks when AI is unavailable
  getFallbackInstructions(task) {
    const taskLower = task.toLowerCase();
    
    // Navigation patterns
    if (taskLower.includes('navigate to') || taskLower.includes('go to') || taskLower.includes('visit')) {
      const urlMatch = task.match(/(?:navigate to|go to|visit)\s+([^\s]+)/i);
      if (urlMatch) {
        let url = urlMatch[1];
        if (!url.startsWith('http')) {
          url = `https://${url}`;
        }
        return [
          { type: 'navigate', value: url, description: `Navigate to ${url}` }
        ];
      }
    }
    
    // Search patterns
    if (taskLower.includes('search for') || taskLower.includes('search')) {
      const searchMatch = task.match(/search(?:\s+for)?\s+["']?([^"']+)["']?/i);
      if (searchMatch && taskLower.includes('google')) {
        return [
          { type: 'navigate', value: 'https://www.google.com', description: 'Navigate to Google' },
          { type: 'type', selector: 'textarea[name="q"], input[name="q"]', value: searchMatch[1], description: 'Type search query' },
          { type: 'click', selector: 'input[type="submit"], button[type="submit"]', description: 'Click search button' }
        ];
      }
    }
    
    // Screenshot patterns
    if (taskLower.includes('screenshot') || taskLower.includes('capture')) {
      return [
        { type: 'screenshot', description: 'Take a screenshot' }
      ];
    }
    
    // Extract patterns
    if (taskLower.includes('extract') || taskLower.includes('get')) {
      if (taskLower.includes('headline') || taskLower.includes('title')) {
        return [
          { type: 'extract', selector: 'h1, h2, h3', description: 'Extract headlines' }
        ];
      }
    }
    
    // Default fallback
    return [
      { type: 'wait', value: 1000, description: 'Wait for page to load' }
    ];
  }

  async getAIInstructions(task) {
    try {
      const prompt = `
        You are a Playwright automation expert. Convert the following task into specific Playwright automation steps.
        Return the response as a JSON array of actions. Each action should have:
        - type: 'navigate', 'click', 'type', 'wait', 'screenshot', 'extract', 'scroll', 'select'
        - selector: CSS selector or XPath (if applicable)
        - value: value to type or URL to navigate (if applicable)
        - description: brief description of the action
        
        Task: ${task}
        
        Example response format:
        [
          {"type": "navigate", "value": "https://example.com", "description": "Navigate to website"},
          {"type": "click", "selector": "button.submit", "description": "Click submit button"},
          {"type": "type", "selector": "input#search", "value": "search term", "description": "Type in search box"}
        ]
        
        Respond ONLY with the JSON array, no additional text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error getting AI instructions:', error.message);
      
      // Check if it's a rate limit error
      if (error.status === 429 || error.message.includes('429') || error.message.includes('RATE_LIMIT')) {
        console.log('Rate limit hit, using fallback instructions...');
        return this.getFallbackInstructions(task);
      }
      
      // For other errors, try fallback as well
      console.log('AI unavailable, using fallback instructions...');
      return this.getFallbackInstructions(task);
    }
  }

  async executeInstructions(instructions) {
    const results = [];
    
    for (const instruction of instructions) {
      try {
        console.log(`Executing: ${instruction.description}`);
        let result = null;

        switch (instruction.type) {
          case 'navigate':
            await this.page.goto(instruction.value, { waitUntil: 'networkidle' });
            result = { success: true, action: 'navigated', url: instruction.value };
            break;

          case 'click':
            await this.page.click(instruction.selector, { timeout: 5000 });
            result = { success: true, action: 'clicked', selector: instruction.selector };
            break;

          case 'type':
            await this.page.fill(instruction.selector, instruction.value);
            result = { success: true, action: 'typed', selector: instruction.selector };
            break;

          case 'wait':
            const waitTime = instruction.value || 1000;
            await this.page.waitForTimeout(waitTime);
            result = { success: true, action: 'waited', duration: waitTime };
            break;

          case 'screenshot':
            const screenshotPath = `screenshots/${Date.now()}.png`;
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            result = { success: true, action: 'screenshot', path: screenshotPath };
            break;

          case 'extract':
            const elements = await this.page.$$(instruction.selector);
            const extractedData = [];
            for (const element of elements) {
              const text = await element.textContent();
              extractedData.push(text);
            }
            result = { success: true, action: 'extracted', data: extractedData };
            break;

          case 'scroll':
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            result = { success: true, action: 'scrolled' };
            break;

          case 'select':
            await this.page.selectOption(instruction.selector, instruction.value);
            result = { success: true, action: 'selected', value: instruction.value };
            break;

          default:
            result = { success: false, error: `Unknown action type: ${instruction.type}` };
        }

        results.push({
          instruction: instruction.description,
          result
        });
      } catch (error) {
        results.push({
          instruction: instruction.description,
          result: { success: false, error: error.message }
        });
      }
    }

    return results;
  }

  async analyzePageWithAI() {
    try {
      // Take a screenshot for analysis
      const screenshot = await this.page.screenshot({ encoding: 'base64' });
      
      // Get page content
      const pageContent = await this.page.content();
      const title = await this.page.title();
      const url = this.page.url();

      // If AI is unavailable, provide basic analysis
      try {
        const prompt = `
          Analyze this webpage and provide insights:
          URL: ${url}
          Title: ${title}
          
          Provide:
          1. A summary of the page content
          2. Main interactive elements found
          3. Potential automation opportunities
          
          Page HTML (first 5000 chars): ${pageContent.substring(0, 5000)}
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (aiError) {
        // Fallback analysis without AI
        console.log('AI unavailable for analysis, providing basic information...');
        
        // Extract basic information from the page
        const headings = await this.page.$$eval('h1, h2, h3', els => els.map(el => el.textContent).slice(0, 5));
        const links = await this.page.$$eval('a', els => els.length);
        const forms = await this.page.$$eval('form', els => els.length);
        const buttons = await this.page.$$eval('button, input[type="submit"]', els => els.length);
        
        return `
Page Analysis (Basic - AI unavailable):
========================================
URL: ${url}
Title: ${title}

Summary:
- Found ${headings.length} main headings
- ${links} links on the page
- ${forms} forms available
- ${buttons} buttons/submit elements

Main Headings:
${headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Interactive Elements:
- Forms: ${forms > 0 ? 'Yes' : 'No'}
- Buttons: ${buttons > 0 ? 'Yes' : 'No'}
- Links: ${links > 0 ? 'Yes' : 'No'}

Automation Opportunities:
- Navigation: Can navigate to linked pages
- Form filling: ${forms > 0 ? 'Can fill and submit forms' : 'No forms found'}
- Data extraction: Can extract text content and headings
- Screenshots: Can capture page state
        `;
      }
    } catch (error) {
      console.error('Error analyzing page:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }
}

module.exports = AutomationAgent;