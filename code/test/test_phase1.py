
"""
Test script for verifying the API server and OpenWeather integration,
must be placed in the same directory as api_server.py and run after starting the API server.
"""
from dotenv import load_dotenv
from pathlib import Path

import os
import time
import requests


BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / "../.gitignore/.env"
load_dotenv(env_path)

API_URL = os.getenv("API_URL")  

WEATHER_API = (
    f"https://api.openweathermap.org/data/2.5/weather"
    f"?q=Lisbon&appid={os.getenv('OPENWEATHER_API_KEY')}&units=metric"
)

# --- Test 1: Can we reach the local API at all? ---
print("\n=== TEST 1: API reachability ===")
try:
    r = requests.get(f"{API_URL}/delay.json")
    print(f"[DELAY] Status: {r.status_code} | Value: {r.json()}")
except Exception as e:
    print(f"[DELAY] ✗ Cannot reach API: {e}")

# --- Test 2: Does the weather API respond? ---
print("\n=== TEST 2: OpenWeather API ===")
try:
    r = requests.get(WEATHER_API)
    print(f"[WEATHER] Status: {r.status_code}")
    if r.status_code == 200:
        temp = r.json().get("main", {}).get("temp")
        print(f"[WEATHER] ✓ Temperature in Lisbon: {temp}°C")
    else:
        print(f"[WEATHER] ✗ Response: {r.text}")
except Exception as e:
    print(f"[WEATHER] ✗ Error: {e}")

# --- Test 3: Send dummy sensor data to the API ---
print("\n=== TEST 3: POST dummy data to API ===")
dummy_data = {
    "x": 0.12,
    "y": -0.05,
    "z": 9.81,
    "timestamp": time.time(),
    "temperature": 15.0
}
try:
    r = requests.post(f"{API_URL}/sensor_data.json", json=dummy_data)
    print(f"[POST] Status: {r.status_code}")
    print(f"[POST] Response: {r.json()}")
except Exception as e:
    print(f"[POST] ✗ Error: {e}")

# --- Test 4: Retrieve what was just stored ---
print("\n=== TEST 4: GET latest data from API ===")
try:
    r = requests.get(f"{API_URL}/sensor_data.json")
    print(f"[GET] Status: {r.status_code}")
    print(f"[GET] Latest record: {r.json()}")
except Exception as e:
    print(f"[GET] ✗ Error: {e}")
