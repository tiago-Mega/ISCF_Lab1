from dotenv import load_dotenv
from pathlib import Path

import os
import sim
import time 
import requests

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / "../.env"
load_dotenv(env_path) 

# global configuration variables
clientID = -1

API_URL = os.getenv("API_URL")
if API_URL is None:
    raise ValueError("API_URL environment variable is not set.")    

WEATHER_API = (f"https://api.openweathermap.org/data/2.5/weather"
    f"?q=Lisbon&appid={os.getenv('OPENWEATHER_API_KEY')}&units=metric"
)

if os.getenv("OPENWEATHER_API_KEY") is None:
    raise ValueError("OPENWEATHER_API_KEY environment variable is not set.")


# Helper function provided by the teaching staff
def get_data_from_simulation(id):
    """Connects to the simulation and gets a float signal value

    Parameters
    ----------
    id : str
        The signal id in CoppeliaSim

    Returns
    -------
    data : float
        The float value retrieved from the simulation. None if retrieval fails.
    """
    if clientID!=-1:
        res, data = sim.simxGetFloatSignal(clientID, id, sim.simx_opmode_blocking)
        if res==sim.simx_return_ok:
            return data
    return None

class DataCollection():
    def __init__(self):
        pass        

    def change_delay(self) -> int:
        """Changes the delay between data retrievals from the simulation.

        Returns
        -------
        int
            The new delay in seconds.
        """
        delay = 5   # Safe default value
        response = requests.get(API_URL + "/delay.json")
        if response.status_code == 200:
            try:
                delay = int(response.json())
            except (ValueError, TypeError):
                print("Invalid delay value from database. Using default.")
        return delay

    def run(self):
        
        while True:
            data = {
                "x": None,
                "y": None,
                "z": None,
                "temperature": None,
                "timestamp": time.time()
            }
            
            for axis, signal in [("x", "accelX"), ("y", "accelY"), ("z", "accelZ")]:
                value = get_data_from_simulation(signal)
                if value is not None:
                    data[axis] = value  # stored as float

            temp = requests.get(WEATHER_API)
            if temp.status_code == 200:
                data["temperature"] = temp.json().get("main", {}).get("temp")

            try:
                response = requests.post(f"{API_URL}/sensor_data.json", json=data)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"Failed to send data to API: {e}")

            try:
                response = requests.get(f"{API_URL}/sensor_data.json")
                response.raise_for_status()
                print(f"Current data:", response.json())
            except requests.exceptions.RequestException as e:
                print(f"Failed to retrieve data from API: {e}")

            time.sleep(self.change_delay())

if __name__ == '__main__':
    print("\n Starting CoppeliaSim connection...")
    sim.simxFinish(-1) # just in case, close all opened connections
    clientID=sim.simxStart('127.0.0.1',19997,True,True,5000,5) # Connect to CoppeliaSim

    if clientID!=-1:        
        print("✓ Successfully connected to CoppeliaSim (clientID: {})".format(clientID))
        print("✓ Starting data collection...\n")
        data_collection = DataCollection()
        data_collection.run()      
    else:
        exit()
    