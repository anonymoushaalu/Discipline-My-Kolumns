from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import csv
import io
from datetime import datetime
import sys
from pathlib import Path

# Add backend directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from services.rule_engine import apply_rule

# Database connection
DATABASE_URL = "postgresql://postgres@127.0.0.1/mdm_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

app = FastAPI(title="Discipline-My-Kolumns MDM System")

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Discipline-My-Kolumns MDM System is running"}

@app.post("/setup-rules")
def setup_rules():
    """
    Initialize sample rules - SETUP ENDPOINT
    """
    try:
        with engine.connect() as conn:
            # Delete existing rules first
            conn.execute(text("DELETE FROM rules"))
            
            # Insert sample rules
            conn.execute(text("""
                INSERT INTO rules (column_name, rule_type, rule_value, is_active)
                VALUES 
                    ('name', 'regex', '^[A-Za-z ]+$', TRUE),
                    ('age', 'range', '0-120', TRUE)
            """))
            conn.commit()
        return {"message": "Rules initialized successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/update-rule")
def update_rule(column_name: str, rule_type: str, rule_value: str):
    """Update a rule in the database"""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE rules
                SET rule_type = :type, rule_value = :value
                WHERE column_name = :column
            """), {
                "type": rule_type,
                "value": rule_value,
                "column": column_name
            })
            conn.commit()
        return {"message": "Rule updated successfully", "column": column_name, "rule_value": rule_value}
    except Exception as e:
        return {"error": str(e)}


class RuleUpdate(BaseModel):
    column_name: str
    rule_type: str
    rule_value: str

@app.put("/rules/{rule_id}")
def update_rule_put(rule_id: int, rule: RuleUpdate):
    """Update a rule via PUT request with JSON body"""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE rules
                SET column_name = :column, rule_type = :type, rule_value = :value
                WHERE id = :id
            """), {
                "id": rule_id,
                "column": rule.column_name,
                "type": rule.rule_type,
                "value": rule.rule_value
            })
            conn.commit()
        return {"message": "Rule updated successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload CSV file for data quality validation.
    Applies rules from database to validate each row.
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV file
        contents = await file.read()
        csv_reader = csv.DictReader(io.StringIO(contents.decode('utf-8')))
        
        conn = engine.connect()
        
        # Fetch active rules from database
        rules_result = conn.execute(text("""
            SELECT column_name, rule_type, rule_value
            FROM rules
            WHERE is_active = TRUE
        """))
        
        rules = rules_result.fetchall()
        
        # Build rule_map: {column_name: [{"type": ..., "value": ...}, ...]}
        rule_map = {}
        for r in rules:
            rule_map.setdefault(r[0], []).append({
                "type": r[1],
                "value": r[2]
            })
        
        # Create a job record
        job_result = conn.execute(text("""
            INSERT INTO jobs (job_name, status, created_at)
            VALUES (:job_name, 'processing', NOW())
            RETURNING id
        """), {"job_name": file.filename})
        
        job_id = job_result.scalar()
        conn.commit()
        
        # Process CSV rows
        clean_count = 0
        quarantine_count = 0
        total_count = 0
        row_number = 0
        
        for row in csv_reader:
            row_number += 1
            total_count += 1
            row_valid = True
            validation_errors = []
            
            # Apply rules from database
            for column, rules_list in rule_map.items():
                if column not in row:
                    continue
                    
                for rule in rules_list:
                    is_valid = apply_rule(
                        row[column],
                        rule["type"],
                        rule["value"]
                    )
                    
                    if not is_valid:
                        row_valid = False
                        validation_errors.append(f"Column '{column}' failed {rule['type']} rule")
                        
                        # Log the validation failure
                        conn.execute(text("""
                            INSERT INTO logs 
                            (job_id, row_number, column_name, original_value, rule_applied, status_color)
                            VALUES (:job_id, :row_number, :column_name, :original_value, :rule_applied, 'red')
                        """), {
                            "job_id": job_id,
                            "row_number": row_number,
                            "column_name": column,
                            "original_value": str(row[column]),
                            "rule_applied": f"{rule['type']}:{rule['value']}"
                        })
            
            # Insert into appropriate table
            if row_valid:
                conn.execute(text("""
                    INSERT INTO clean_data (job_id, name, age, created_at)
                    VALUES (:job_id, :name, :age, NOW())
                """), {
                    "job_id": job_id,
                    "name": row.get("name", ""),
                    "age": int(row.get("age", 0)) if row.get("age", "").isdigit() else 0
                })
                clean_count += 1
                
                # Log successful validation
                conn.execute(text("""
                    INSERT INTO logs 
                    (job_id, row_number, status_color)
                    VALUES (:job_id, :row_number, 'green')
                """), {
                    "job_id": job_id,
                    "row_number": row_number
                })
            else:
                conn.execute(text("""
                    INSERT INTO quarantine_data (job_id, name, age, error_reason, created_at)
                    VALUES (:job_id, :name, :age, :error_reason, NOW())
                """), {
                    "job_id": job_id,
                    "name": row.get("name", ""),
                    "age": int(row.get("age", 0)) if row.get("age", "").isdigit() else 0,
                    "error_reason": "; ".join(validation_errors)
                })
                quarantine_count += 1
        
        # Update job status
        conn.execute(text("""
            UPDATE jobs
            SET status = 'completed', total_rows = :total, clean_rows = :clean, quarantined_rows = :quarantine
            WHERE id = :job_id
        """), {
            "job_id": job_id,
            "total": total_count,
            "clean": clean_count,
            "quarantine": quarantine_count
        })
        
        conn.commit()
        conn.close()
        
        return {
            "message": "CSV processed successfully",
            "job_id": job_id,
            "total_rows": total_count,
            "clean_rows": clean_count,
            "quarantined_rows": quarantine_count,
            "status": "completed"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs/{job_id}")
def get_job_status(job_id: int):
    """Get status of a specific job"""
    try:
        conn = engine.connect()
        result = conn.execute(text("""
            SELECT id, job_name, status, total_rows, clean_rows, quarantined_rows, created_at
            FROM jobs
            WHERE id = :job_id
        """), {"job_id": job_id})
        
        job = result.fetchone()
        conn.close()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return {
            "id": job[0],
            "job_name": job[1],
            "status": job[2],
            "total_rows": job[3],
            "clean_rows": job[4],
            "quarantined_rows": job[5],
            "created_at": job[6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rules")
def get_rules():
    """Get all active rules"""
    try:
        conn = engine.connect()
        result = conn.execute(text("""
            SELECT id, column_name, rule_type, rule_value, is_active
            FROM rules
            WHERE is_active = TRUE
        """))
        
        rules = result.fetchall()
        conn.close()
        
        return [
            {
                "id": r[0],
                "column_name": r[1],
                "rule_type": r[2],
                "rule_value": r[3],
                "is_active": r[4]
            }
            for r in rules
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add-rule")
def add_rule(column_name: str, rule_type: str, rule_value: str):
    """Add a new validation rule"""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO rules (column_name, rule_type, rule_value, is_active)
                VALUES (:column, :type, :value, TRUE)
            """), {
                "column": column_name,
                "type": rule_type,
                "value": rule_value
            })
            conn.commit()
        return {"message": "Rule added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs")
def get_jobs():
    """Get all jobs sorted by most recent first"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, job_name, status, total_rows, clean_rows, quarantined_rows, created_at
                FROM jobs
                ORDER BY created_at DESC
                LIMIT 100
            """))
            jobs = result.fetchall()
        
        return [
            {
                "id": j[0],
                "job_name": j[1],
                "status": j[2],
                "total_rows": j[3],
                "clean_rows": j[4],
                "quarantined_rows": j[5],
                "created_at": str(j[6])
            }
            for j in jobs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quarantine")
def get_quarantine():
    """Get all quarantined rows"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, job_id, name, age, error_reason, created_at
                FROM quarantine_data
                ORDER BY created_at DESC
            """))
            rows = result.fetchall()
        
        return [
            {
                "id": r[0],
                "job_id": r[1],
                "name": r[2],
                "age": r[3],
                "error_reason": r[4],
                "created_at": str(r[5])
            }
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/update-quarantine/{row_id}")
def update_quarantine(row_id: int, name: str, age: int):
    """Update a quarantined row"""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE quarantine_data
                SET name = :name, age = :age
                WHERE id = :id
            """), {
                "name": name,
                "age": age,
                "id": row_id
            })
            conn.commit()
        return {"message": "Row updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/revalidate/{row_id}")
def revalidate_row(row_id: int):
    """Re-validate a quarantined row and move to clean_data if valid"""
    try:
        with engine.connect() as conn:
            # Fetch quarantined row
            row_result = conn.execute(text("""
                SELECT id, job_id, name, age, error_reason
                FROM quarantine_data
                WHERE id = :id
            """), {"id": row_id})
            
            row = row_result.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Row not found")
            
            # Fetch active rules
            rules_result = conn.execute(text("""
                SELECT column_name, rule_type, rule_value
                FROM rules
                WHERE is_active = TRUE
            """))
            
            rules = rules_result.fetchall()
            
            # Build rule_map
            rule_map = {}
            for r in rules:
                rule_map.setdefault(r[0], []).append({
                    "type": r[1],
                    "value": r[2]
                })
            
            # Re-validate the row
            row_valid = True
            validation_errors = []
            
            # Check name
            if "name" in rule_map:
                for rule in rule_map["name"]:
                    if not apply_rule(row[2], rule["type"], rule["value"]):
                        row_valid = False
                        validation_errors.append(f"name failed {rule['type']}")
            
            # Check age
            if "age" in rule_map:
                for rule in rule_map["age"]:
                    if not apply_rule(row[3], rule["type"], rule["value"]):
                        row_valid = False
                        validation_errors.append(f"age failed {rule['type']}")
            
            if row_valid:
                # Move to clean_data
                conn.execute(text("""
                    INSERT INTO clean_data (job_id, name, age, created_at)
                    VALUES (:job_id, :name, :age, NOW())
                """), {
                    "job_id": row[1],
                    "name": row[2],
                    "age": row[3]
                })
                
                # Delete from quarantine
                conn.execute(text("""
                    DELETE FROM quarantine_data
                    WHERE id = :id
                """), {"id": row_id})
                
                # Log the correction
                conn.execute(text("""
                    INSERT INTO logs (job_id, row_number, column_name, original_value, final_value, status_color, rule_applied)
                    VALUES (:job_id, :row_number, 'system', :original, :final, 'green', 'revalidation')
                """), {
                    "job_id": row[1],
                    "row_number": row[0],
                    "original": row[4],
                    "final": "CORRECTED"
                })
                
                conn.commit()
                return {"status": "success", "message": "Row moved to clean_data"}
            else:
                return {"status": "invalid", "message": "Row still invalid", "errors": validation_errors}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs/{job_id}")
def get_logs(job_id: int):
    """Get all logs for a specific job"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, job_id, row_number, column_name, original_value, final_value, status_color, rule_applied, created_at
                FROM logs
                WHERE job_id = :job_id
                ORDER BY row_number, id
            """), {"job_id": job_id})
            
            logs = result.fetchall()
        
        return [
            {
                "id": l[0],
                "job_id": l[1],
                "row_number": l[2],
                "column_name": l[3] or "",
                "original_value": l[4] or "",
                "final_value": l[5] or "",
                "status_color": l[6] or "unknown",
                "rule_applied": l[7] or "",
                "created_at": str(l[8])
            }
            for l in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
