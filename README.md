# EcoGuard Cloud AI — Local Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- An Anthropic API key (get one at console.anthropic.com)

---

## Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Create an account and go to API Keys
3. Create a new key and copy it

---

## Step 2 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Open .env and paste your Anthropic API key

# Run the API server
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## Step 3 — Frontend setup (new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will open at: http://localhost:5173

---

## Project structure

```
ecoguard/
├── backend/
│   ├── main.py          ← FastAPI server + all API routes
│   ├── sensor_sim.py    ← IoT sensor data simulator
│   ├── requirements.txt
│   └── .env             ← Your API key goes here
└── frontend/
    ├── src/
    │   ├── App.jsx                    ← Main dashboard
    │   └── components/
    │       ├── WastePanel.jsx         ← Waste management tab
    │       ├── AirPanel.jsx           ← Air quality tab
    │       ├── WaterPanel.jsx         ← Water conservation tab
    │       └── AIChatbot.jsx          ← Floating AI chat
    ├── index.html
    └── package.json
```

---

## API endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /api/sensors          | Live air quality data          |
| GET    | /api/bins             | All smart bin levels           |
| GET    | /api/water            | Water usage data               |
| POST   | /api/ai/analyze       | Claude AI environmental report |
| POST   | /api/ai/chat          | Chatbot with live sensor data  |
| GET    | /api/ai/waste-prediction | Route optimization          |
| GET    | /api/ai/leak-check    | Water leak detection           |

---

## Hackathon demo script

1. Start both servers (backend + frontend)
2. Open http://localhost:5173
3. Show the **Overview** tab — point out live AQI, bin alerts, water status
4. Click **"Get AI analysis"** — Claude generates real insight
5. Go to **Waste tab** → click **"Get AI prediction"** — shows route optimization
6. Go to **Water tab** → click **"Simulate leak"** then **"Check for leaks"** — dramatic anomaly demo
7. Click **"AI Chat"** button → chat with live sensor context
8. Go to **Air tab** — show the live AQI trend chart

This demo shows: IoT simulation → Cloud API → Claude AI → Real-time dashboard
