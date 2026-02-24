from backend.services.rule_engine import apply_rule
import re

# Test the rule_engine directly
names_to_test = ["John", "Alice", "Charlie123", "Henry_Invalid", "Bob", "Eve"]

rule_value = "^[A-Za-z]+$"

for name in names_to_test:
    result = apply_rule(name, "regex", rule_value)
    print(f"'{name}' against '{rule_value}': {result}")
