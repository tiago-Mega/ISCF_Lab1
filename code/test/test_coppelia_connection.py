# test_coppelia_connection.py

"""
Test script for connecting to CoppeliaSim Remote API, 
must be placed in the same directory as coppelia_probe.py 
and run after launching CoppeliaSim but before starting the probe.
"""
import sim

print("Testing CoppeliaSim Remote API connection...")

# Close any existing connections
sim.simxFinish(-1)

# Try to connect
clientID = sim.simxStart('127.0.0.1', 19997, True, True, 5000, 5)

if clientID != -1:
    print("✓ Successfully connected to CoppeliaSim!")
    print(f"  Client ID: {clientID}")
    sim.simxFinish(clientID)
else:
    print("✗ Failed to connect to CoppeliaSim")
    print("\nTroubleshooting:")
    print("1. Make sure CoppeliaSim is running")
    print("2. Check remoteApiConnections.txt is configured")
    print("3. Verify port 19997 is not blocked")
    print("4. Ensure remoteApi.dll is in project directory or PATH")
