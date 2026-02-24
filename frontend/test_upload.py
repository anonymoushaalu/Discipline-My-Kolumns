import requests
import csv
import io

# Test if backend is running
try:
    response = requests.get("http://localhost:8000/docs")
    print(" Backend is running")
except Exception as e:
    print(f" Backend not running: {e}")
    exit(1)

# Create a simple test CSV
csv_content = "name,age\nJohn,30\nJane,25\nBob,35"
files = {'file': ('test.csv', io.StringIO(csv_content))}

# Test upload endpoint
try:
    response = requests.post("http://localhost:8000/upload", files=files)
    print(f" Upload successful: {response.json()}")
except Exception as e:
    print(f" Upload failed: {e}")
    print(f"Response: {response.text if 'response' in locals() else 'No response'}")
