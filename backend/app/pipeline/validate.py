from app.utils.logger import logger

def validate_schemas(schemas: dict):
    errors = []
    warnings = []
    seen_errors = set()  # ← Track duplicates

    db_schema = schemas.get("db_schema", {})
    api_schema = schemas.get("api_schema", {})
    ui_schema = schemas.get("ui_schema", {})

    db_fields = set()
    db_tables = set()

    # collect DB fields safely
    for db_type_name, db_type in db_schema.items():
        if not isinstance(db_type, dict):
            continue
        for table_name, table in db_type.items():
            if not isinstance(table, dict):
                continue
            db_tables.add(table_name)
            for field in table.keys():
                db_fields.add(field)

    # validate API fields
    for service_name, service in api_schema.items():
        if not isinstance(service, dict):
            continue
        endpoints = service.get("endpoints", [])
        for endpoint in endpoints:
            if not isinstance(endpoint, dict):
                continue
            
            request_fields = endpoint.get("request", [])
            
            # Check API fields exist in DB (with duplicate prevention)
            for field in request_fields:
                if field not in db_fields:
                    error_msg = f"API field '{field}' missing in DB"
                    if error_msg not in seen_errors:  # ← Prevent duplicates
                        errors.append(error_msg)
                        seen_errors.add(error_msg)
            
            # FIX: Add warning AND suggest adding default fields
            if len(request_fields) == 0:
                path = endpoint.get('path', 'unknown')
                method = endpoint.get('method', 'GET')
                
                # For POST/PUT methods, suggest required fields
                if method in ['POST', 'PUT', 'PATCH']:
                    warnings.append(f"Endpoint {path} ({method}) has no request fields - Add required fields like 'id', 'name'")
                else:
                    warnings.append(f"Endpoint {path} ({method}) has no request parameters - Consider adding query params or path params")

    # validate UI schema
    pages = ui_schema.get("pages", {})
    if isinstance(pages, dict):
        for page_name, page_data in pages.items():
            if not isinstance(page_data, dict):
                error_msg = f"{page_name} page invalid"
                if error_msg not in seen_errors:
                    errors.append(error_msg)
                    seen_errors.add(error_msg)
                continue
            if "components" not in page_data:
                error_msg = f"{page_name} missing components"
                if error_msg not in seen_errors:
                    errors.append(error_msg)
                    seen_errors.add(error_msg)
            
            # Warning for empty components
            if len(page_data.get("components", [])) == 0:
                warnings.append(f"{page_name} page has no components - Add components like 'Form', 'Table', 'Modal'")

    # Add warning if no tables found
    if len(db_tables) == 0:
        warnings.append("No database tables defined - Add tables for users, items, etc.")

    logger.info(f"Validation errors: {errors}, warnings: {warnings}")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }