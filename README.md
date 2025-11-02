# 🗺️ Rozgar Map

**A comprehensive platform for tracking MGNREGA employment data across Indian districts with real-time analytics and geolocation services.**

[![GitHub](https://img.shields.io/badge/GitHub-eticloud%2Frozgar--map-blue?logo=github)](https://github.com/eticloud-hub/rozgar-map)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)


## 📌 About

Rozgar Map is a full-stack application that visualizes MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) employment data across Maharashtra districts. It provides real-time metrics, geolocation-based district identification, and automated ETL pipelines to fetch government data.

**Live Demo:**
- Frontend: `https://your-frontend-url.railway.app`
- Backend API: `https://your-backend-url.railway.app`

## ✨ Features

- 🌍 **District-based Analytics** - View employment metrics by district
- 📊 **Real-time Dashboard** - Live updating metrics and performance indicators
- 🎯 **Geolocation Services** - GPS and IP-based district detection
- 🔄 **Automated ETL Pipeline** - Daily MGNREGA data synchronization
- 🌐 **Multi-language Support** - Hindi & English interfaces
- 📱 **Responsive Design** - Mobile-friendly interface
- 🚀 **Production Ready** - Fully containerized with Docker
- 💰 **100% Free** - Deployed on free tier infrastructure

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Ultra-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **i18n** - Internationalization

### Backend
- **Node.js** + Express.js
- **SQLite** - Lightweight database
- **Axios** - HTTP client for data fetching
- **Node-cron** - Task scheduling (ETL)
- **Helmet** - Security headers

### Infrastructure
- **Railway.app** - Cloud deployment (FREE tier)
- **Docker** - Containerization
- **GitHub** - Version control

### APIs
- **data.gov.in** - MGNREGA official data source

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Installation

#### 1. Clone Repository

git clone https://github.com/eticloud-hub/rozgar-map.git
cd rozgar-map

#### 2. Install Dependencies

**Frontend:**

npm install

**Backend:**

cd backend
npm install
cd ..


#### 3. Environment Setup

Create `.env` file in root:

VITE_API_URL=http://localhost:3000

Create `backend/.env`:

NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATA_GOV_API_KEY=your_api_key
ENABLE_SCHEDULER=true

#### 4. Run Locally

**Frontend (Terminal 1):**

npm run dev
Opens at http://localhost:5173

**Backend (Terminal 2):**

cd backend
npm start
Runs at http://localhost:3000


## 📂 Project Structure

rozgar-map/
├── src/ # Frontend (React)
│ ├── pages/
│ │ ├── Home.tsx
│ │ ├── DistrictDashboard.tsx
│ │ └── ComparisonView.tsx
│ ├── components/
│ ├── hooks/
│ ├── utils/
│ └── App.tsx
│
├── backend/ # Backend (Node.js)
│ ├── src/
│ │ ├── app.js # Main app
│ │ ├── config/ # Database, cache config
│ │ ├── routes/ # API endpoints
│ │ ├── middleware/ # Auth, validation
│ │ ├── services/ # Business logic
│ │ │ └── etl/ # ETL pipeline
│ │ └── utils/ # Helpers
│ ├── package.json
│ └── .env
│
├── data/ # SQLite database
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json


## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/districts` | List all districts |
| GET | `/api/v1/districts/:id` | Get district details |
| GET | `/api/v1/districts/:id/summary` | Latest metrics |
| GET | `/api/v1/districts/:id/timeseries` | Historical data |
| POST | `/api/v1/report` | Submit citizen report |
| GET | `/api/v1/admin` | Admin dashboard |

## 🔑 Environment Variables

### Backend

NODE_ENV=production # development, production
PORT=3000 # API port
LOG_LEVEL=info # debug, info, warn, error
CORS_ORIGIN= # Frontend URL for CORS
DATA_GOV_API_KEY= # data.gov.in API key
ADMIN_TOKEN= # Admin authentication
ENABLE_SCHEDULER=true # Enable ETL scheduler

## 🌐 Deployment

### Deploy to Railway (FREE)

1. **Push to GitHub**

git push origin main

2. **Connect Railway**
   - Go to https://railway.app
   - Sign in with GitHub
   - Create new project from repo
   - Railway auto-deploys!

3. **Get Live URLs**
   - Frontend: Check Railway dashboard
   - Backend: Copy public domain URL

4. **Connect Frontend to Backend**
   - Update `VITE_API_URL` in production

---

## 📊 Performance Metrics

- **Frontend Bundle:** ~676 KB (gzipped: ~206 KB)
- **API Response:** < 200ms
- **Database:** SQLite (0 MB at startup)
- **Deployment Time:** ~3 minutes
- **Monthly Cost:** $0 (FREE tier)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**
- GitHub: [@eticloud-hub](https://github.com/eticloud-hub)
- Email: your-email@example.com

---

## 🙏 Acknowledgments

- **data.gov.in** - MGNREGA data source
- **Railway.app** - Free hosting platform
- **React & Node.js communities** - Open source tools
