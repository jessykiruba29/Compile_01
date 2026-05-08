from app.utils.logger import logger

def repair_schemas(schemas: dict, validation: dict):
    repairs = []
    repaired_schemas = schemas.copy()
    
    if validation["valid"]:
        return repaired_schemas, repairs

    db_schema = repaired_schemas.get("db_schema", {})
    
    # choose first db provider
    if db_schema:
        db_provider = next(iter(db_schema))
        tables = db_schema[db_provider]
        
        # Find users table or first table
        users_table = None
        if "users" in tables:
            users_table = tables["users"]
        elif tables:
            first_table = next(iter(tables))
            users_table = tables[first_table]
        
        # Repair missing fields
        for error in validation.get("errors", []):
            if "missing in DB" in error:
                # Extract field name from error message
                parts = error.split("'")
                if len(parts) >= 2:
                    field = parts[1]
                    
                    # Add field to table
                    if users_table and field not in users_table:
                        users_table[field] = "TEXT"
                        
                        # Append dict repair (not string)
                        repairs.append({
                            "layer": "db_schema",
                            "field": field,
                            "description": f"Added missing DB field '{field}'",
                            "action": f"ALTER TABLE ADD COLUMN {field} TEXT"
                        })
    
    logger.info(f"Repairs applied: {repairs}")
    
    return repaired_schemas, repairs