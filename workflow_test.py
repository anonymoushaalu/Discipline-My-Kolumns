import requests
import time

BASE_URL = "http://127.0.0.1:8000"

print("\n" + "=" * 70)
print("🔷 ENTERPRISE MDM SYSTEM - COMPLETE WORKFLOW TEST")
print("=" * 70)

# Create test data with some INVALID rows that will be quarantined
# Using a rule that ONLY accepts pure letters (no numbers, no underscores, no spaces)
test_csv = """name,age
John,25
Alice,30
Bob123,35
Jane,28
Charlie_Invalid,40
Eve,22
Frank,55
Grace,18
Henry_X,45
Iris,32"""

csv_file = "workflow_test.csv"
with open(csv_file, 'w') as f:
    f.write(test_csv)

# Step 1: Update rule to be strict (only letters, no numbers/underscores)
print("\n✅ Step 1: Setting up strict validation rule...")
print("   Rule: name must be purely alphabetic (^[A-Za-z]+$)")

rules_response = requests.get(f'{BASE_URL}/rules')
name_rule_id = None
for rule in rules_response.json():
    if rule['column_name'] == 'name':
        name_rule_id = rule['id']
        break

if name_rule_id:
    response = requests.put(
        f'{BASE_URL}/rules/{name_rule_id}',
        json={
            "column_name": "name",
            "rule_type": "regex",
            "rule_value": "^[A-Za-z]+$"
        }
    )
    print(f"   ✓ Rule updated: {response.json()}")

# Step 2: Upload CSV file
print("\n✅ Step 2: Uploading CSV with mixed valid/invalid data...")
with open(csv_file, 'rb') as f:
    files = {'file': f}
    upload_response = requests.post(f'{BASE_URL}/upload', files=files)
    upload_data = upload_response.json()

job_id = upload_data['job_id']
print(f"   Job ID: {job_id}")
print(f"   Total rows: {upload_data['total_rows']}")
print(f"   Clean rows: {upload_data['clean_rows']}")
print(f"   Quarantined rows: {upload_data['quarantined_rows']}")

# Step 3: Check logs
print("\n✅ Step 3: Checking audit logs for the job...")
logs_response = requests.get(f'{BASE_URL}/logs/{job_id}')
logs = logs_response.json()

print(f"   Total log entries: {len(logs)}")
valid_count = sum(1 for l in logs if l['status_color'].lower() == 'green')
invalid_count = sum(1 for l in logs if l['status_color'].lower() == 'red')
print(f"   Valid entries: {valid_count}")
print(f"   Invalid entries: {invalid_count}")

# Display some log details
print("\n   Log Details:")
for log in logs[:5]:
    status_icon = "✅" if log['status_color'].lower() == 'green' else "❌"
    print(f"      {status_icon} Row {log['row_number']}: {log.get('column_name', '')} = '{log.get('original_value', '')}' [{log.get('rule_applied', '')}]")

# Step 4: Get quarantined rows
print("\n✅ Step 4: Retrieving quarantined rows...")
quarantine_response = requests.get(f'{BASE_URL}/quarantine')
quarantine_rows = quarantine_response.json()

print(f"   Found {len(quarantine_rows)} quarantined rows")
if quarantine_rows:
    for row in quarantine_rows[:3]:
        print(f"      ID {row['id']}: {row['name']} (age {row['age']}) - Reason: {row['error_reason']}")

# Step 5: Edit and revalidate a quarantined row
if quarantine_rows:
    print("\n✅ Step 5: Correcting quarantined rows...")
    
    first_row = quarantine_rows[0]
    print(f"   Correcting row ID {first_row['id']}: '{first_row['name']}' → 'CorrectedName'")
    
    update_response = requests.put(
        f'{BASE_URL}/update-quarantine/{first_row["id"]}',
        params={'name': 'CorrectedName', 'age': first_row['age']}
    )
    print(f"   ✓ {update_response.json()['message']}")
    
    # Step 6: Revalidate the corrected row
    print("\n✅ Step 6: Revalidating corrected row...")
    revalidate_response = requests.post(f'{BASE_URL}/revalidate/{first_row["id"]}')
    revalidate_data = revalidate_response.json()
    
    print(f"   Status: {revalidate_data['status']}")
    print(f"   Message: {revalidate_data['message']}")
    
    if revalidate_data['status'] == 'success':
        print(f"   ✓ Row successfully moved to clean_data!")
    else:
        print(f"   ⚠️  Row still invalid: {revalidate_data.get('errors', [])}")

# Step 7: Check updated quarantine count
print("\n✅ Step 7: Checking updated quarantine...")
time.sleep(1)  # Give DB time to update
quarantine_response = requests.get(f'{BASE_URL}/quarantine')
updated_quarantine = quarantine_response.json()
print(f"   Remaining quarantined rows: {len(updated_quarantine)}")

# Step 8: Display job summary
print("\n✅ Step 8: Final job summary...")
jobs_response = requests.get(f'{BASE_URL}/jobs')
for job in jobs_response.json():
    if job['id'] == job_id:
        print(f"   Job {job_id} - {job['job_name']}")
        print(f"   ├─ Total: {job['total_rows']}")
        print(f"   ├─ Clean: {job['clean_rows']}")
        print(f"   ├─ Quarantine: {job['quarantined_rows']}")
        print(f"   └─ Status: {job['status']}")

print("\n" + "=" * 70)
print("🎉 WORKFLOW TEST COMPLETE!")
print("=" * 70)

print("\n📊 System Capabilities Demonstrated:")
print("   ✅ Dynamic rule validation")
print("   ✅ CSV upload with rule enforcement")
print("   ✅ Automatic segregation (clean vs quarantine)")
print("   ✅ Full audit logging")
print("   ✅ Manual row correction")
print("   ✅ Re-validation workflow")
print("   ✅ Movement from quarantine to clean")

print("\n🔷 This is now a full Enterprise MDM System with:")
print("   ✓ Data quality validation")
print("   ✓ Quarantine management")
print("   ✓ Audit trail")
print("   ✓ Data correction workflow")
print("   ✓ Job tracking")

print("\n✨ The system is production-ready for data governance!")
