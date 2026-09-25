# 🔒 SourceLock — Personal Study SPACE

> **A 100% Free, Local-First AI Study Assistant with Verbatim Answer Locating & Linked Split-Screen UI.**  
> Built for students with zero paid APIs, zero hallucination, and full mobile support.

---

## 🌟 Key Features

### 1. 📂 Locked Document Vault (Read-Only)
- **Multi-Format Ingestion**: Supports PDF, DOCX, and TXT lecture notes and textbooks.
- **Strict Read-Only Vault**: Uploaded study materials are safely stored in a local `/vault` directory and locked against editing.
- **Automatic Local Indexing**: Extracted text is split into paragraphs and indexed locally using pure vector embeddings.

### 2. 📖 Linked Split-Screen UI
- **Left Half Screen**: Displays the original verbatim text from the source document (PDF/DOC/TXT) with exact paragraph numbering.
- **Right Half Screen**: Shows AI explanations in simple student language.
- **Synced & Toggleable**: Both screens are linked. Users can toggle the AI panel on or off for distraction-free reading.

### 3. 🎯 Smart Answer Locator (Zero Hallucination)
- **Exact Coordinates**: Automatically returns the exact location of the answer in the file (e.g. `Found: Page 1, Para 2`).
- **"Go to Source & Highlight"**: With one click, the Left Screen auto-scrolls to the exact location and applies a **bright glowing yellow highlight** to the located paragraph.
- **Strict Verbatim Context**: The AI is restricted to the retrieved chunks with zero outside hallucinations.

### 4. 🧠 All-Time Memory (Never Forgets)
- **Persistent Profile**: Stores your complete university syllabus, timetable, course, semester, and exam pattern.
- **Automatic Prompt Injection**: This persistent memory is automatically prepended as system context into every AI question, guaranteeing personalized answers tailored to your syllabus.
- **Pre-Built Templates**: Includes a 1-click VTU B.Tech Computer Science template.

### 5. 🎓 Live University Watch + Screenshot Proof
- **Automated Web Scraper**: Powered by Playwright to monitor official university portals (e.g., `vtu.ac.in`) for new circulars, exam dates, and notifications.
- **Full-Page Screenshot Proof**: When an update is detected, Playwright captures a full-page screenshot with a timestamp as verifiable proof.
- **Scheduled Checks**: Background cron jobs automatically check for updates every 6 hours.

### 6. 📅 Dynamic Study Planner
- **Intelligent Timetable Integration**: Analyzes your uploaded study documents and college timetable to generate daily study sessions (e.g., *"Today 7:00 PM - 9:00 PM: Study DBMS Unit 2 Pages 1-15"*).
- **Interactive Checklist**: Mark sessions as complete to track study progress.

### 7. 📱 100% Android Mobile & PWA Ready
- **PWA Installation**: Installable directly onto Android phones via Chrome ("Add to Home screen") to run as a standalone app.
- **Responsive Touch Design**: Smooth horizontal navigation tabs and mobile tab switching between Source and AI views.

---

## 🛠️ 100% Free Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Ultra-fast UI with hot reload |
| **Styling** | Tailwind CSS v4, Lucide Icons | Sky Blue Glassmorphism theme |
| **Backend** | Node.js, Express, TypeScript | Lightweight local server |
| **Database** | `sql.js` (WebAssembly SQLite) | Pure JavaScript, zero C++/Python build dependencies |
| **Vector DB** | `vectra` | Lightweight local vector search for CPU |
| **Scraper** | Playwright Chromium | Full-page browser automation with screenshot proof |
| **AI Inference** | Groq API / Google Gemini API | Free tier with generous daily limits |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Free AI API Key from [Groq Console](https://console.groq.com) or [Google AI Studio](https://aistudio.google.com)

### 1. Clone the Repository
```bash
git clone https://github.com/move-on-D/SourceLock.git
cd SourceLock
```

### 2. Configure Environment Variables
Copy the template file to `.env`:
```bash
copy .env.example .env
```
Open `.env` and paste your free API key:
```env
GROQ_API_KEY=your_free_groq_api_key_here
# or
GEMINI_API_KEY=your_free_gemini_api_key_here

AI_PROVIDER=groq
PORT=3001
```

### 3. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install
npx playwright install chromium

# Frontend dependencies
cd ../frontend
npm install
```

### 4. One-Click Launch (Windows)
Double-click `start.bat` in the root folder, or start each service manually:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open your browser to **`http://localhost:5173`**.

---

## 📱 Running on Android Mobile

1. Make sure your phone and laptop are connected to the same Wi-Fi.
2. Find your laptop's local IP address (e.g. `10.216.233.68`).
3. Open Chrome on your Android phone and navigate to:
   ```
   http://YOUR_LAPTOP_IP:5173
   ```
4. Tap the **three dots (⋮)** in Chrome and select **"Add to Home screen"** or **"Install App"**.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 **Dinesh**.
