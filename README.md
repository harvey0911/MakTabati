# Maktabati - Library Management System

Maktabati is a desktop application built with Electron, TypeScript, Express, and React.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## How to Run

### 1. Open Terminal/PowerShell
Navigate to the project directory:
```powershell
cd d:\LMS
```

### 2. Install Dependencies
If you haven't already, install the required packages:
```powershell
npm install
```

### 3. Run in Development Mode
This command will start the Vite frontend, Express backend, and Electron main process concurrently:
```powershell
npm run dev
```

## Project Structure
- `src/main`: Electron main process (lifecycle, window management).
- `src/backend`: Express server and API logic.
- `src/renderer`: React frontend (UI and state).
- `dist/`: Compiled JavaScript files.
