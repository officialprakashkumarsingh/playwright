const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const AutomationAgent = require('./automationAgent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
fs.mkdir(screenshotsDir, { recursive: true }).catch(console.error);

// Store active agents
const agents = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Playwright Automation Agent',
    geminiModel: 'gemini-2.0-flash-exp'
  });
});

// Create a new automation session
app.post('/api/session/create', async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}`;
    const agent = new AutomationAgent(process.env.GEMINI_API_KEY);
    await agent.initialize();
    
    agents.set(sessionId, agent);
    
    res.json({ 
      success: true, 
      sessionId,
      message: 'Automation session created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Execute an automation task
app.post('/api/task/execute', async (req, res) => {
  try {
    const { sessionId, task } = req.body;
    
    if (!sessionId || !task) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID and task are required' 
      });
    }
    
    const agent = agents.get(sessionId);
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found. Please create a new session.' 
      });
    }
    
    const results = await agent.executeTask(task);
    
    res.json({ 
      success: true, 
      results,
      task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Analyze current page with AI
app.post('/api/page/analyze', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required' 
      });
    }
    
    const agent = agents.get(sessionId);
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    const analysis = await agent.analyzePageWithAI();
    
    res.json({ 
      success: true, 
      analysis 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Close an automation session
app.post('/api/session/close', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required' 
      });
    }
    
    const agent = agents.get(sessionId);
    if (agent) {
      await agent.close();
      agents.delete(sessionId);
    }
    
    res.json({ 
      success: true, 
      message: 'Session closed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all active sessions
app.get('/api/sessions', (req, res) => {
  const activeSessions = Array.from(agents.keys());
  res.json({ 
    success: true, 
    sessions: activeSessions,
    count: activeSessions.length
  });
});

// Serve screenshots
app.use('/screenshots', express.static(screenshotsDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Playwright Automation Agent running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Web interface at http://localhost:${PORT}`);
  console.log(`🤖 Using Gemini 2.0 Flash model`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  for (const [sessionId, agent] of agents) {
    await agent.close();
  }
  process.exit(0);
});

module.exports = app;