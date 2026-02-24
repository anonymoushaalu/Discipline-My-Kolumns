import requests
import os

csv_file = "testdata_temp.csv"

# Upload the file
with open(csv_file, 'rb') as f:
    files = {'file': f}
    response = requests.post('http://127.0.0.1:8000/upload', files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

# Clean up
try:
    os.remove(csv_file)
except:
    pass
