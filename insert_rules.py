from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@localhost/mdm_db"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Insert sample rules
    conn.execute(text("""
        INSERT INTO rules (column_name, rule_type, rule_value, is_active)
        VALUES 
            ('name', 'regex', '^[A-Za-z ]+$', TRUE),
            ('age', 'range', '0-120', TRUE)
        ON CONFLICT DO NOTHING
    """))
    conn.commit()
    
    # Verify rules were inserted
    result = conn.execute(text("SELECT * FROM rules WHERE is_active = TRUE"))
    print("Rules in database:")
    for row in result:
        print(f"  ID: {row[0]}, Column: {row[1]}, Type: {row[2]}, Value: {row[3]}")
