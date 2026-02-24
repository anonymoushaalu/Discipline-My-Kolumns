import requests

# Update rule to be more strict - only allow pure alphabetic names
update_url = "http://127.0.0.1:8000/update-rule"
data = {
    "column_name": "name",
    "rule_type": "regex",
    "rule_value": "^[A-Za-z ]+$"
}

# Since we're updating via SQL, let's use a direct query approach
# For now, let's check current rules first
rules_url = "http://127.0.0.1:8000/rules"
response = requests.get(rules_url)
print("Current rules:")
print(response.json())
