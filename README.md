# ISCF Lab 1 — UR5 Accelerometer Monitor

A full-stack Cyber-Physical System (CPS) monitoring application that extracts real-time accelerometer data (X, Y, Z axes) from a **UR5 robot** simulated in **CoppeliaSim**, stores it in a cloud database (**Supabase**), enriches it with ambient temperature data from **OpenWeather**, and visualizes everything through a live **Next.js** dashboard deployed on **Vercel**.

---

## Architecture

```
CoppeliaSim (UR5 Robot)
        │
        │  Remote API (port 19997)
        ▼
 Python FastAPI (Local)  ◄──── OpenWeather REST API
        │
        │  REST / Supabase Client
        ▼
    Supabase (PostgreSQL + Realtime)
        │
        │  Realtime Subscriptions
        ▼
  Next.js Dashboard (Vercel)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Robot Simulation | CoppeliaSim Edu v4.1.0 |
| Backend / Integration | Python 3.7 + FastAPI |
| External Weather API | OpenWeather Current Weather |
| Cloud Database | Supabase (PostgreSQL + Realtime) |
| Frontend | Next.js (JavaScript) |
| Deployment | Vercel |
| Version Control | GitHub |

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
│   │   ├── page.tsx               # Main dashboard page
│   │   ├── layout.tsx             # Layout dashboar     
│   │   ├── login
│   │   |   └── page.tsx           # Login page
│   │   └── register
│   │       └── page.tsx           # New client register page
│   │
│   ├── components/
│   │   ├── SensorCard.tsx         # Current reading card
│   │   ├── AccelerationChart.tsx  # X/Y/Z time-series chart
│   │   ├── ReportDownload.tsx     # Report download 
│   │   ├── LogoutButton.tsx       # Logout Button
│   │   ├── TemperatureChart.tsx   # Temperature time-series chart
│   │   └── DelayControl.tsx       # Remote sampling delay slider
│   ├── lib/
│   │   ├── supabase.ts            #
│   │   ├── server.ts              #
│   │   ├── client.ts              #
│   │   └── api.ts                 # API client (axios wrappers)
│   └── package.json
│
├──middleware.ts                   #
├── iscf_lab1_2023.ttt             # CoppeliaSim scene file
├── remoteApiConnections.txt       # CoppeliaSim remote API config reference
└── README.md
```

---

## Prerequisites

- [Anaconda / Miniconda](https://www.anaconda.com/products/individual) with **Python 3.7**
- [CoppeliaSim Edu v4.1.0](https://www.coppeliarobotics.com/previousVersions)
- [Node.js](https://nodejs.org/) (for the Next.js frontend)
- [VSCode](https://code.visualstudio.com/) or equivalent IDE
- A [Vercel](https://vercel.com/) account (recommended: use your github account)
- A [Supabase](https://supabase.com) account (recommended: use your FCT university email `@campus.fct.unl.pt`)
- An [OpenWeather](https://openweathermap.org) API key (register with your student email for a higher free-tier limit via the [student initiative](https://docs.openweather.co.uk/our-initiatives/student-initiative))

---

## Features

- **Real-time accelerometer monitoring** — Continuously reads X, Y, Z axis data from the UR5 robot in CoppeliaSim via a Python FastAPI integration layer
- **Ambient temperature enrichment** — Fetches current weather data from OpenWeather API and stores it alongside sensor readings
- **Cloud persistence** — All data is stored in a Supabase (PostgreSQL) database with real-time subscription support
- **Interactive dashboard** — Next.js frontend with live graphs, configurable polling intervals, and automatic Vercel deployment
- **Downloadable reports** — Automatically generated statistics (average, min, max) for user-defined time intervals (e.g., last 10, 30, 60 minutes)

---

## Environment Variables

### `.env`
Create this file in the `root` directory. **Never commit it.**

```env
# FastAPI server URL (used by the probe to POST data)
API_URL = http://127.0.0.1:8000

# Supabase project URL and anon/service key
DATABASE_URL = https://<your-project>.supabase.co
SUPABASE_KEY = <your-supabase-anon-key>

# OpenWeatherMap API key
OPENWEATHER_API_KEY=<your-openweathermap-key>

# CORS CONFIGURATION 
ALLOWED_ORIGINS = http://localhost:3000,https://your.vercel.app
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

Open **three separate terminals** and run each command in order:

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

Open your browser at **http://localhost:3000** or https://your.vercel.app

---

## API Reference

The FastAPI server exposes the following endpoints.
Interactive docs are available at `http://127.0.0.1:8000/docs` when the server is running.

| Method | Endpoint | Description |
|---|---|---|
| `POST`| `/sensor_data.json` | Receive and store a new sensor reading |
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

## Troubleshooting

**Probe fails to connect to CoppeliaSim**
- Ensure the simulation is running (not paused)
- Verify the Remote API is enabled on port `19997`
- Confirm `sim.py`, `simConst.py`, and `remoteApi.dll` are present in `code/`

**CORS errors in the browser**
- Confirm `CORSMiddleware` is configured in `api_server.py` with `allow_origins = ALLOWED_ORIGINS = http://localhost:3000,https://your.vercel.app`

**No data appearing in the dashboard**
- Run `curl http://127.0.0.1:8000/sensor_data.json` to verify the API is reachable
- Check that `NEXT_PUBLIC_API_URL` is correctly set in `iscf-app/next.config.ts`
- Open browser DevTools → Network tab and check for failed API calls

**Supabase writes failing**
- Double-check `DATABASE_URL` and `SUPABASE_KEY` values in `.env`
- Verify the `accelerometer_data` table exists in your Supabase project

---

## .gitignore Recommendations

Ensure the following are excluded from version control:

```
# Secrets
.env

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
