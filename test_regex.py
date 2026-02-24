import re

pattern = "^[A-Za-z]+$"

test_names = [
    "John",
    "Alice", 
    "Charlie123",
    "Henry_Invalid",
    "Eve",
    "Frank"
]

for name in test_names:
    match = bool(re.match(pattern, str(name)))
    print(f"{name}: {match}")
