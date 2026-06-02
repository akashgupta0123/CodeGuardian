# 🛡️ CodeGuardian

### AI-Powered Code Analysis & Security Review Platform

CodeGuardian is an intelligent AI-driven code review platform designed to help developers write cleaner, safer, and more maintainable code. It acts as a virtual senior developer by analyzing source code, identifying potential issues, highlighting security vulnerabilities, suggesting performance improvements, and providing actionable recommendations.

Built with a modern React-based frontend and powered by Google's Gemini AI, CodeGuardian delivers instant professional code reviews through an interactive and visually rich developer experience.

---

## 🚀 Live Demo

Frontend: `Add Your Deployment Link`

Backend API: `Add Your Backend Deployment Link`

---

## 📸 Screenshots

### Home Screen

Add Screenshot Here

### AI Analysis Workflow

Add Screenshot Here

### Review Output Dashboard

Add Screenshot Here

### Rate Limit Handling Screen

Add Screenshot Here

---

# ✨ Features

### 🤖 AI-Powered Code Review

Analyze source code using Google's Gemini AI and receive detailed professional feedback.

### 🔒 Security Analysis

Detect common vulnerabilities such as:

* SQL Injection
* XSS Risks
* Hardcoded Credentials
* Authentication Issues
* Authorization Problems
* Input Validation Issues

### ⚡ Performance Optimization

Identify:

* Inefficient algorithms
* Redundant operations
* Expensive loops
* Memory-heavy patterns
* Unnecessary re-renders

### 📊 Interactive Score Dashboard

Visual scoring system for:

* Security
* Performance
* Maintainability
* Readability

### 🌐 Multi-Language Support

Currently supports:

* JavaScript
* TypeScript
* Python
* Java
* C++

### 🎨 Modern Developer Experience

* Premium dark theme
* Smooth animations using Framer Motion
* Responsive layout
* Interactive UI components
* Markdown rendering support

### 📋 Copy Review Results

Quickly copy AI-generated review reports.

### ⏳ Smart Rate-Limit Handling

Beautiful waiting state with:

* Animated cooldown timer
* Progress ring
* Retry functionality

### 📱 Fully Responsive Design

Optimized for:

* Desktop
* Tablet
* Mobile Devices

---

# 🏗️ System Architecture

```text
┌─────────────────────────┐
│       Frontend UI       │
│        React.js         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Express API        │
│       Node.js           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Gemini API         │
│   AI Code Analysis      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Review Suggestions    │
│ Security + Performance  │
└─────────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Framer Motion
* React Simple Code Editor
* PrismJS
* React Markdown
* Rehype Highlight
* Axios
* Lucide React
* HTML5
* CSS3

## Backend

* Node.js
* Express.js
* Gemini AI API

## Development Tools

* Vite
* Git
* GitHub
* VS Code

---

# 📂 Project Structure

```text
CodeGuardian/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# ⚙️ Installation Guide

## Clone Repository

```bash
git clone https://github.com/yourusername/CodeGuardian.git

cd CodeGuardian
```

---

## Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
GOOGLE_GEMINI_KEY=your_gemini_api_key
PORT=3000
```

Start backend server:

```bash
npm start
```

Server will run on:

```text
http://localhost:3000
```

---

## Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Application will run on:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Backend `.env`

```env
GOOGLE_GEMINI_KEY=your_gemini_api_key
PORT=3000
```

---

# 🧠 How It Works

1. User enters source code.
2. CodeGuardian sends code to backend API.
3. Backend forwards request to Gemini AI.
4. Gemini analyzes:

   * Code Quality
   * Security
   * Performance
   * Maintainability
5. AI returns structured feedback.
6. Frontend displays results with interactive visualizations.

---

# 🎯 Use Cases

### Students

Get instant feedback on coding assignments.

### Developers

Improve code quality before deployment.

### Freelancers

Perform quick audits before project delivery.

### Job Preparation

Practice technical interview coding reviews.

### Learning

Understand best coding practices through AI suggestions.

---

# 🔮 Future Improvements

Planned Features:

* File Upload Support
* Repository Analysis
* AI Chat Assistant
* Export Review Reports
* Review History
* Team Collaboration
* Authentication System
* Multi-File Review
* CI/CD Integration
* GitHub Repository Scanner

---

# 📈 Performance Goals

* Fast review generation
* Smooth user experience
* Responsive design
* Secure API communication
* Scalable architecture

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve CodeGuardian:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

### Akash Kumar Gupta

BCA Graduate | Full Stack Developer

Skills:

* React.js
* JavaScript
* Node.js
* Express.js
* MongoDB
* Git & GitHub

---

## ⭐ Support

If you found this project useful, please consider giving it a star on GitHub.

It helps increase visibility and motivates future development.

⭐ Star the repository if you like the project!
