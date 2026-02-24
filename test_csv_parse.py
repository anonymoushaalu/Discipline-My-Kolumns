import csv
import io

csv_data = """name,age
John,25
Alice,30
Bob,35
Jane,28
Charlie123,40
Eve,22
Frank,55
Grace,18
Henry_Invalid,45
Iris,32
"""

csv_reader = csv.DictReader(io.StringIO(csv_data))
print("Parsed CSV rows:")
for i, row in enumerate(csv_reader):
    print(f"Row {i+1}: {row}")
