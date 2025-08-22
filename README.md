# 🤖 Playwright AI Automation Agent

An intelligent web automation agent powered by Google's Gemini 2.0 Flash model and Playwright. This agent can understand natural language commands and automatically perform web automation tasks.

## ✨ Features

- **AI-Powered Automation**: Uses Gemini 2.0 Flash to understand and execute natural language commands
- **Browser Automation**: Built on Playwright for reliable cross-browser automation
- **Beautiful Web Interface**: Modern, responsive UI for easy interaction
- **RESTful API**: Full API for programmatic access
- **Session Management**: Handle multiple automation sessions simultaneously
- **Page Analysis**: AI-powered webpage analysis and insights

## 🚀 One-Click Deployment to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment Steps:

1. Fork this repository to your GitHub account
2. Update `render.yaml` with your repository URL
3. Go to [Render Dashboard](https://dashboard.render.com/)
4. Click "New +" → "Blueprint"
5. Connect your GitHub repository
6. Render will automatically detect the `render.yaml` file
7. Click "Apply" to deploy

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd playwright-automation-agent
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Gemini API key
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## 📖 Usage Guide

### Web Interface

1. **Create Session**: Click "Create Session" to initialize a new browser instance
2. **Enter Task**: Describe your automation task in natural language
3. **Execute**: Click "Execute Task" to run the automation
4. **View Results**: See step-by-step execution results

### Example Tasks

- "Go to Google and search for Playwright documentation"
- "Navigate to github.com and find trending repositories"
- "Visit news.ycombinator.com and extract the top 5 headlines"
- "Go to example.com and take a screenshot"

### API Endpoints

#### Health Check
```bash
GET /api/health
```

#### Create Session
```bash
POST /api/session/create
```

#### Execute Task
```bash
POST /api/task/execute
Content-Type: application/json

{
  "sessionId": "session_xxx",
  "task": "Go to Google and search for AI"
}
```

#### Analyze Page
```bash
POST /api/page/analyze
Content-Type: application/json

{
  "sessionId": "session_xxx"
}
```

#### Close Session
```bash
POST /api/session/close
Content-Type: application/json

{
  "sessionId": "session_xxx"
}
```

#### List Sessions
```bash
GET /api/sessions
```

## 🏗️ Architecture

```
├── src/
│   ├── automationAgent.js  # Core automation logic with Gemini integration
│   └── server.js           # Express server and API endpoints
├── public/
│   └── index.html          # Web interface
├── package.json            # Dependencies
├── render.yaml            # Render deployment config
└── .env                   # Environment variables
```

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3000)

### Supported Actions

The agent can perform these automation actions:
- **navigate**: Go to a URL
- **click**: Click on elements
- **type**: Fill in text fields
- **wait**: Wait for specific time
- **screenshot**: Capture screenshots
- **extract**: Extract text from elements
- **scroll**: Scroll the page
- **select**: Select dropdown options

## 🚨 Important Notes

1. **API Key Security**: Never commit your API key to version control
2. **Rate Limits**: Be aware of Gemini API rate limits
3. **Browser Resources**: Close sessions when done to free resources
4. **Render Limits**: Free tier has limitations on compute and memory

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

### Common Issues

1. **Playwright Installation**: If browsers fail to install, run:
```bash
npx playwright install-deps
npx playwright install
```

2. **Memory Issues on Render**: Consider upgrading to a paid plan for more resources

3. **API Key Issues**: Ensure your Gemini API key is valid and has proper permissions

## 📧 Support

For issues and questions, please open a GitHub issue.