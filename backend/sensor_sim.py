import random
import math
from datetime import datetime

def get_sensor_data():
    hour = datetime.now().hour
    base_aqi = 100 + 40 * math.sin((hour - 8) * math.pi / 12)
    aqi = round(max(50, base_aqi + random.uniform(-15, 15)))

    if aqi < 50:   air_status = "Good"
    elif aqi < 100: air_status = "Moderate"
    elif aqi < 150: air_status = "Unhealthy for sensitive"
    else:           air_status = "Unhealthy"

    return {
        "aqi": aqi,
        "air_status": air_status,
        "pm25": round(aqi * 0.45 + random.uniform(-5, 5), 1),
        "pm10": round(aqi * 0.65 + random.uniform(-8, 8), 1),
        "co2": round(420 + random.uniform(-20, 40)),
        "temperature": round(28 + random.uniform(-3, 6), 1),
        "humidity": round(55 + random.uniform(-10, 15)),
        "timestamp": datetime.now().isoformat()
    }

_bins = [
    {"id": "A1", "level": 45, "zone": "A", "location": "Main St & 1st Ave"},
    {"id": "A2", "level": 62, "zone": "A", "location": "Park Road"},
    {"id": "A3", "level": 30, "zone": "A", "location": "Market Square"},
    {"id": "A4", "level": 88, "zone": "A", "location": "Bus Terminal"},
    {"id": "A5", "level": 73, "zone": "A", "location": "School Zone"},
    {"id": "B1", "level": 78, "zone": "B", "location": "Industrial Area"},
    {"id": "B2", "level": 55, "zone": "B", "location": "Residential Block 1"},
    {"id": "B3", "level": 91, "zone": "B", "location": "Food Court"},
    {"id": "B4", "level": 22, "zone": "B", "location": "Residential Block 2"},
    {"id": "B5", "level": 50, "zone": "B", "location": "Sports Complex"},
]

def get_all_bins():
    for b in _bins:
        drift = random.uniform(-1, 2)
        b["level"] = min(100, max(0, round(b["level"] + drift, 1)))
        b["status"] = "critical" if b["level"] >= 80 else "warning" if b["level"] >= 60 else "ok"
    return _bins

_leak_mode = {"active": False}

def set_leak(zone_c_override=None):
    _leak_mode["zone_c"] = zone_c_override

def get_water_data():
    hour = datetime.now().hour
    base = 200 + 180 * abs(math.sin(hour * math.pi / 12))
    zone_a = round(base + random.uniform(-30, 30))
    zone_b = round(base * 0.65 + random.uniform(-20, 20))
    zone_c = _leak_mode.get("zone_c") or round(random.uniform(0, 40))

    total = zone_a + zone_b + zone_c
    status = "leak_detected" if zone_c > 400 else "normal" if total < 1600 else "high"

    hourly = []
    for h in range(24):
        v = 100 + 150 * abs(math.sin(h * math.pi / 12))
        hourly.append({"hour": h, "liters": round(v + random.uniform(-20, 20))})

    return {
        "zone_a": zone_a,
        "zone_b": zone_b,
        "zone_c": zone_c,
        "total_liters": total,
        "status": status,
        "hourly": hourly,
        "timestamp": datetime.now().isoformat()
    }
