from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from groq import Groq
from dotenv import load_dotenv
from datetime import datetime
import os
import json
from pathlib import Path

from sensor_sim import get_sensor_data, get_all_bins, get_water_data


# =========================
# Load Environment
# =========================

load_dotenv()

# ✅ SAFE: API key from environment (DO NOT hardcode)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "llama-3.1-8b-instant"


# =========================
# FastAPI App
# =========================

app = FastAPI(title="EcoGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Frontend Setup
# =========================

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_PATH = Path(__file__).resolve().parent.parent / "frontend"


if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIST / "assets")),
        name="assets"
    )

if FRONTEND_PATH.exists():
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_PATH)),
        name="static"
    )


# =========================
# Request Models
# =========================

class ChatMessage(BaseModel):
    message: str


class SensorContext(BaseModel):
    aqi: float
    bins_critical: int
    water_liters: float
    co2: float


# =========================
# Root Route
# =========================

@app.get("/")
def root():
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")

    index = FRONTEND_PATH / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")

    return {"status": "EcoGuard API running", "time": datetime.now().isoformat()}


# =========================
# Sensors APIs
# =========================

@app.get("/api/sensors")
def get_sensors():
    return get_sensor_data()


@app.get("/api/bins")
def get_bins():
    return get_all_bins()


@app.get("/api/water")
def get_water():
    return get_water_data()


# =========================
# GROQ AI Helper
# =========================

def ask_groq(prompt: str):
    if not GROQ_API_KEY:
        return "Groq API key missing"

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are EcoGuard AI. You analyze environmental sensor data and give short, clear insights."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"


# =========================
# AI Analyze
# =========================

@app.post("/api/ai/analyze")
def analyze_environment(ctx: SensorContext):

    prompt = f"""
Sensor readings:

AQI: {ctx.aqi}
Critical bins: {ctx.bins_critical}
Water: {ctx.water_liters} liters
CO2: {ctx.co2}

Give:
1. Environmental status
2. Urgent action
3. 24-hour prediction

Answer in 3–4 sentences.
"""

    return {"analysis": ask_groq(prompt)}


# =========================
# AI Chat
# =========================

@app.post("/api/ai/chat")
def chat(body: ChatMessage):

    sensors = get_sensor_data()
    bins = get_all_bins()
    water = get_water_data()

    critical = [b for b in bins if b["level"] >= 80]

    prompt = f"""
Live EcoGuard Data:

AQI: {sensors['aqi']}
Air Status: {sensors['air_status']}
PM2.5: {sensors['pm25']}
PM10: {sensors['pm10']}
CO2: {sensors['co2']}
Temperature: {sensors['temperature']}

Water: {water['total_liters']} L
Water Status: {water['status']}

Critical Bins: {len(critical)}/{len(bins)}

User Question:
{body.message}

Give a short helpful answer.
"""

    return {"reply": ask_groq(prompt)}


# =========================
# Waste Prediction
# =========================

@app.get("/api/ai/waste-prediction")
def waste_prediction():

    bins = get_all_bins()
    critical = [b for b in bins if b["level"] >= 75]

    summary = ", ".join([f"{b['id']}={b['level']}%" for b in critical])

    prompt = f"""
Waste AI System.

Critical bins:
{summary}

Return ONLY valid JSON:

{{
"collection_order": [],
"estimated_full_times": {{}},
"route_savings_percent": 0,
"recommendation": ""
}}
"""

    response = ask_groq(prompt)

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except:
        return {"recommendation": response}


# =========================
# Leak Detection (FIXED BIAS VERSION)
# =========================

@app.get("/api/ai/leak-check")
def leak_check():

    water = get_water_data()

    zones = {
        "Zone A": water["zone_a"],
        "Zone B": water["zone_b"],
        "Zone C": water["zone_c"]
    }

    avg = sum(zones.values()) / len(zones)

    anomalies = {
        zone: value
        for zone, value in zones.items()
        if abs(value - avg) > 300
    }

    prompt = f"""
Water System Analysis:

All Zones:
{zones}

Detected Anomalies:
{anomalies}

Normal range: 400–600L

IMPORTANT:
- Do NOT assume leak immediately
- Consider sensor failure
- Compare all zones

Return ONLY JSON:

{{
"leak_detected": "yes/no/possible",
"zone": "",
"severity": "Low/Medium/High",
"action": ""
}}
"""

    response = ask_groq(prompt)

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except:
        return {
            "leak_detected": "unknown",
            "action": response
        }


# =========================
# SPA Fallback
# =========================

@app.get("/{full_path:path}")
def fallback(full_path: str):

    if full_path.startswith("api/"):
        return {"detail": "Not Found"}

    file_path = FRONTEND_PATH / full_path
    if file_path.exists() and file_path.is_file():
        if full_path.endswith(".css"):
            return FileResponse(file_path, media_type="text/css")
        elif full_path.endswith(".js"):
            return FileResponse(file_path, media_type="application/javascript")
        elif full_path.endswith(".html"):
            return FileResponse(file_path, media_type="text/html")

    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")

    index = FRONTEND_PATH / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")

    return {"status": "EcoGuard API running"}