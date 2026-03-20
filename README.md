# ISCF Lab 1 — CPS Sensor Data Collection & Dashboard

A full-stack Cyber-Physical System (CPS) integration project built for the **Systems Integration (ISCF)** course. The system collects real-time accelerometer data from a CoppeliaSim robotic simulation, enriches it with live weather data, persists it to a cloud database (Supabase), and visualizes it through a web dashboard.

---

## Architecture

```
CoppeliaSim Simulation
        │
        │  Remote API (port 19997)
        ▼
coppelia_probe.py          ← Reads accelX/Y/Z signals + Lisbon weather
        │
        │  HTTP POST /sensor_data.json
        ▼
api_server.py (FastAPI)    ← REST API on port 8000
        │
        │  Supabase REST API
        ▼
Supabase (PostgreSQL)      ← Cloud persistent storage
        ▲
        │  HTTP GET (polling every 5s)
        │
iscf-app/ (Next.js)        ← Web dashboard on port 3000
```

---

## Project Structure

```
ISCF_Lab1_Material/
│
├── code/                          # Python backend
│   ├── api_server.py              # FastAPI REST server
│   ├── coppelia_probe.py          # CoppeliaSim data collection probe
│   ├── sim.py                     # CoppeliaSim Remote API bindings
│   ├── simConst.py                # CoppeliaSim constants
│   ├── remoteApi.dll              # CoppeliaSim Windows DLL (not tracked by git)
│   └── requirements.txt           # Python dependencies
│
├── iscf-app/                      # Next.js frontend
│   ├── app/
│   │   └── page.tsx               # Main dashboard page
│   ├── components/
│   │   ├── SensorCard.tsx         # Current reading card
│   │   ├── AccelerationChart.tsx  # X/Y/Z time-series chart
│   │   ├── TemperatureChart.tsx   # Temperature time-series chart
│   │   └── DelayControl.tsx       # Remote sampling delay slider
│   ├── lib/
│   │   └── api.ts                 # API client (axios wrappers)
│   └── package.json
│
├── iscf_lab1_2023.ttt             # CoppeliaSim scene file
├── remoteApiConnections.txt       # CoppeliaSim remote API config reference
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | ≥ 3.9 | Backend probe and API server |
| Node.js | ≥ 18 | Next.js frontend |
| CoppeliaSim | ≥ 4.x | Robotics simulator |
| Supabase account | — | Cloud database |
| OpenWeatherMap API key | — | Live temperature data |

---

## Environment Variables

### `.gitignore/.env`
Create this file in the `.gitignore/` directory. **Never commit it.**

```env
# FastAPI server URL (used by the probe to POST data)
API_URL=http://127.0.0.1:8000

# Supabase project URL and anon/service key
DATABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-supabase-anon-key>

# OpenWeatherMap API key
OPENWEATHER_API_KEY=<your-openweathermap-key>
```

### `iscf-app/.env`
Create this file in the `iscf-app/` directory. **Never commit it.**

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Supabase Setup

Before running the project, create the data table in your Supabase project.
Run the following SQL in the **Supabase SQL Editor**:

```sql
CREATE TABLE accelerometer_data (
    id          BIGSERIAL PRIMARY KEY,
    x           FLOAT,
    y           FLOAT,
    z           FLOAT,
    temperature FLOAT,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Installation

### Python Backend

```bash
cd code/
pip install -r requirements.txt
```

`requirements.txt` should contain:
```
fastapi
uvicorn
pydantic
requests
python-dotenv
```

### Next.js Frontend

```bash
cd iscf-app/
npm install
```

---

## Running the System

Open **four separate terminals** and run each command in order:

**Terminal 4 — CoppeliaSim:**
```
Get the value int of delay
```
```bash
curl http://127.0.0.1:8000/delay.json
```

**Terminal 1 — FastAPI Server:**
```bash
cd code/
python -m uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Sensor Probe:**
```
Open CoppeliaSim and load the scene: iscf_lab1_2023.ttt
Enable the Remote API server (see remoteApiConnections.txt for config)
Press Play to start the simulation
```
```bash
cd code/
python coppelia_probe.py
```

**Terminal 3 — Next.js Dashboard:**
```bash
cd iscf-app/
npm run dev
```

Open your browser at **http://localhost:3000**

---

## API Reference

The FastAPI server exposes the following endpoints.
Interactive docs are available at `http://127.0.0.1:8000/docs` when the server is running.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sensor_data.json` | Receive and store a new sensor reading |
| `GET` | `/sensor_data.json` | Retrieve the most recent sensor reading |
| `GET` | `/sensor_data/history.json?limit=100` | Retrieve last N readings (max 1000) |
| `GET` | `/delay.json` | Get the current sampling delay (seconds) |
| `PUT` | `/delay.json` | Update the sampling delay |

### Example: Update Delay via `curl`
```bash
curl -X PUT http://127.0.0.1:8000/delay.json \
     -H "Content-Type: application/json" \
     -d '{"value": 10}'
```

---

## Dashboard Features

- **Live sensor cards** — current X, Y, Z acceleration (m/s²) and Lisbon temperature (°C)
- **Acceleration chart** — time-series line chart for all three axes
- **Temperature chart** — temperature trend over the last 50 readings
- **Delay control** — slider to remotely change the probe's sampling interval (1–30 seconds)
- **Auto-refresh** — dashboard polls the API every 5 seconds automatically

---

## Troubleshooting

**Probe fails to connect to CoppeliaSim**
- Ensure the simulation is running (not paused)
- Verify the Remote API is enabled on port `19997`
- Confirm `sim.py`, `simConst.py`, and `remoteApi.dll` are present in `code/`

**CORS errors in the browser**
- Confirm `CORSMiddleware` is configured in `api_server.py` with `allow_origins=["http://localhost:3000"]`

**No data appearing in the dashboard**
- Run `curl http://127.0.0.1:8000/sensor_data.json` to verify the API is reachable
- Check that `NEXT_PUBLIC_API_URL` is correctly set in `iscf-app/.env.local`
- Open browser DevTools → Network tab and check for failed API calls

**Supabase writes failing**
- Double-check `DATABASE_URL` and `SUPABASE_KEY` values in `code/.env`
- Verify the `accelerometer_data` table exists in your Supabase project

---

## .gitignore Recommendations

Ensure the following are excluded from version control:

```
# Secrets
.env
.env.local

# Runtime artifacts
*.db
code/remoteApi.dll

# Node
iscf-app/node_modules/
iscf-app/.next/

# Python
__pycache__/
*.pyc
```
