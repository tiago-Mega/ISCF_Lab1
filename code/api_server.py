from fastapi.middleware.cors import CORSMiddleware
from fastapi    import FastAPI, HTTPException
from dotenv     import load_dotenv
from pydantic   import BaseModel
from datetime   import datetime, timedelta
from pathlib    import Path

import os
import time
import requests

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / "../.env"
load_dotenv(env_path) 

# ==================== CONFIGURATION ====================
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not DATABASE_URL or not SUPABASE_KEY:
    print(DATABASE_URL, SUPABASE_KEY)
    raise ValueError("DATABASE_URL and SUPABASE_KEY must be set in .env file")

# Supabase REST API endpoint
SUPABASE_TABLE = f"{DATABASE_URL}/rest/v1/accelerometer_data"

app = FastAPI()

# Allow CORS for all origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_delay = {"value": 5}

class SensorData(BaseModel):
    x: float = None
    y: float = None
    z: float = None
    timestamp: float = None
    temperature: float = None

class DelayUpdate(BaseModel):
    delay: int

# ==================== HELPER FUNCTIONS ====================
def get_supabase_headers():
    """Get headers for Supabase REST API requests"""
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

@app.get("/delay.json")
def get_delay():
    return current_delay["value"]

@app.put("/delay.json")
def set_delay(delay_update: DelayUpdate):
    if delay_update.delay < 1:
        raise HTTPException(status_code=400, detail="Delay must be >= 1 second")
    current_delay["value"] = delay_update.delay
    return {"message": "Delay updated", "delay": delay_update.delay}

@app.post("/sensor_data.json")
def send_sensor_data(data: SensorData):
    """
    Receive sensor data and store in Supabase
    
    Args:
        data: SensorData containing x, y, z, timestamp, temperature
    
    Returns:
        Success message with inserted data
    """
    try:
        # Prepare data for Supabase
        db_data = {
            "x": data.x,
            "y": data.y,
            "z": data.z,
            "temperature": data.temperature,
            "timestamp": datetime.now().isoformat() if data.timestamp is None 
                        else datetime.fromtimestamp(data.timestamp).isoformat()
        }
        
        print(f"[DB] Sending to Supabase: {db_data}")

        # Insert into Supabase
        response = requests.post(
            SUPABASE_TABLE,
            headers=get_supabase_headers(),
            json=db_data
        )
        
        print(f"[DB] Supabase response status: {response.status_code}")
        print(f"[DB] Supabase response body: {response.text}")
        response.raise_for_status()
        
        return {
            "message": "Data received and stored successfully",
            "data": response.json()
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")
    
@app.get("/sensor_data.json")
def get_sensor_data():
    """
    Retrieve the most recent sensor data from Supabase
    
    Returns:
        The most recent sensor data entry
    """
    try:
        response = requests.get(
            SUPABASE_TABLE,
            headers=get_supabase_headers(),
            params={"order": "timestamp.desc", "limit": 1}
        )
        response.raise_for_status()
        data = response.json()
        if data:
            return data[0]  # Return the most recent entry
        else:
            raise HTTPException(status_code=404, detail="No sensor data found")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.get("/sensor_data/history.json")
def get_sensor_data_history(limit: int = 10):
    """
    Retrieve a history of sensor data entries from Supabase
    
    Args:
        limit: Number of recent entries to retrieve (default: 10)
    
    Returns:
        A list of recent sensor data entries
    """
    try:
        response = requests.get(
            SUPABASE_TABLE,
            headers=get_supabase_headers(),
            params={"order": "timestamp.desc", "limit": limit}
        )
        response.raise_for_status()
        data = response.json()
        return {"count": len(data), "data": data}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.get("/sensor_data/report.json")
def get_sensor_data_report(minutes: int = 10):
    """
    Compute statistics (min, max, avg) for all sensor axes
    over the last N minutes.

    Args:
        minutes: Time window in minutes (default: 10)

    Returns:
        Statistics report with per-axis min, max, avg and record count
    """
    try:
        cutoff = (datetime.utcnow() - timedelta(minutes=minutes)).isoformat()
        response = requests.get(
            SUPABASE_TABLE,
            headers=get_supabase_headers(),
            params={"timestamp": f"gte.{cutoff}", "order": "timestamp.asc"}
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            raise HTTPException(status_code=404, detail=f"No data found in the last {minutes} minutes")

        def compute_stats(values):
            valid = [v for v in values if v is not None]
            if not valid:
                return {"min": None, "max": None, "avg": None}
            return {
                "min": round(min(valid), 4),
                "max": round(max(valid), 4),
                "avg": round(sum(valid) / len(valid), 4)
            }

        return {
            "time_window_minutes": minutes,
            "record_count": len(data),
            "from": data[0]["timestamp"],
            "to": data[-1]["timestamp"],
            "x": compute_stats([d.get("x") for d in data]),
            "y": compute_stats([d.get("y") for d in data]),
            "z": compute_stats([d.get("z") for d in data]),
            "temperature": compute_stats([d.get("temperature") for d in data]),
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")