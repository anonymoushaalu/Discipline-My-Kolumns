from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import csv
import io
from datetime import datetime
from .services.rule_engine import apply_rule

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@localhost/mdm_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

app = FastAPI(title="Discipline-My-Kolumns MDM System")

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Discipline-My-Kolumns MDM System is running"}

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
