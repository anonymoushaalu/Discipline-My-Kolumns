import requests
import json

# First, get the rules to find the ID for the name rule
rules_response = requests.get('http://127.0.0.1:8000/rules')
rules = rules_response.json()
print("Current rules:")
for rule in rules:
    print(f"  ID {rule['id']}: {rule['column_name']} - {rule['rule_type']} - {rule['rule_value']}")

# Find the name rule ID
name_rule_id = None
for rule in rules:
    if rule['column_name'] == 'name':
        name_rule_id = rule['id']
        break

if name_rule_id:
    # Update the name rule to only allow letters (no spaces, no numbers)
    update_data = {
        "column_name": "name",
        "rule_type": "regex",
        "rule_value": "^[A-Za-z]+$"
    }
    
    response = requests.put(
        f'http://127.0.0.1:8000/rules/{name_rule_id}',
        json=update_data
    )
    print(f"\nUpdate response: {response.json()}")
    
    # Verify the update
    rules_response = requests.get('http://127.0.0.1:8000/rules')
    rules = rules_response.json()
    print("\nUpdated rules:")
    for rule in rules:
        print(f"  {rule['column_name']}: {rule['rule_value']}")
