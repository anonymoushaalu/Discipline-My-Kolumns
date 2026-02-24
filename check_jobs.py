import requests

# Get job 4 details
response = requests.get('http://127.0.0.1:8000/jobs/4')
print("Job 4:")
print(response.json())

# Get all jobs
response = requests.get('http://127.0.0.1:8000/jobs')
print("\nAll jobs:")
for job in response.json():
    print(f"Job {job['id']}: {job['total_rows']} total, {job['clean_rows']} clean, {job['quarantined_rows']} quarantine - {job['status']}")
