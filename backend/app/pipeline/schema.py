from app.llm.client import ask_llm
from app.llm.prompts import ENDPOINT_FIELDS_PROMPT, SCHEMA_PROMPT
import json


def generate_request_fields_with_ai(path: str, method: str, entity: str, app_type: str = "app") -> list:
    """Use AI to generate appropriate request fields for an endpoint"""
    try:
        response = ask_llm(
            ENDPOINT_FIELDS_PROMPT,
            f"Path: {path}, Method: {method}, Entity: {entity}, App type: {app_type}"
        )
        fields = json.loads(response)
        if isinstance(fields, list):
            return fields
        return []
    except Exception as e:
        print(f"AI field generation failed for {path}: {e}")
        # Fallback based on method
        if method == "POST":
            return ["name", "data"]
        elif method in ["PUT", "PATCH"]:
            return ["id", "data"]
        return []


def generate_schemas(design: dict):
    # Extract app type from intent if available
    app_type = design.get("app_type", "app")
    
    response = ask_llm(
        SCHEMA_PROMPT,
        str(design)
    )

    try:
        schemas = json.loads(response)
    except Exception as e:
        print(f"Error parsing schemas: {e}")
        schemas = {
            "db_schema": {},
            "api_schema": {},
            "ui_schema": {},
            "parse_error": response
        }

    if not isinstance(schemas, dict):
        schemas = {}

    schemas.setdefault("db_schema", {})
    schemas.setdefault("api_schema", {})
    schemas.setdefault("ui_schema", {})

    if not isinstance(schemas.get("db_schema"), dict):
        schemas["db_schema"] = {}

    api_schema = schemas.get("api_schema")
    if not isinstance(api_schema, dict):
        api_schema = {}

    normalized_api_schema = {}
    for service_name, service_data in api_schema.items():
        if not isinstance(service_data, dict):
            service_data = {}
        endpoints = service_data.get("endpoints", [])
        if not isinstance(endpoints, list):
            endpoints = []
        endpoints = [e for e in endpoints if isinstance(e, dict)]
        normalized_api_schema[service_name] = {
            **service_data,
            "endpoints": endpoints
        }

    schemas["api_schema"] = normalized_api_schema

    ui_schema = schemas.get("ui_schema")
    if not isinstance(ui_schema, dict):
        ui_schema = {}

    normalized_ui_schema = {}
    for page_name, page_data in ui_schema.items():
        if not isinstance(page_data, dict):
            page_data = {}
        components = page_data.get("components", [])
        if not isinstance(components, list):
            components = []
        normalized_ui_schema[page_name] = {
            **page_data,
            "components": components
        }

    schemas["ui_schema"] = normalized_ui_schema

    if not schemas.get("db_schema"):
        schemas["db_schema"] = {
            "users": {
                "columns": {
                    "id": "INTEGER PRIMARY KEY",
                    "name": "TEXT",
                    "email": "TEXT"
                }
            }
        }

    if not schemas.get("api_schema"):
        schemas["api_schema"] = {
            "main_service": {
                "endpoints": [
                    {
                        "path": "/users",
                        "method": "GET",
                        "request": []
                    }
                ]
            }
        }

    if not schemas.get("ui_schema"):
        schemas["ui_schema"] = {
            "dashboard_page": {
                "components": [
                    "Header",
                    "Sidebar",
                    "Table"
                ]
            }
        }

    # Let AI generate request fields for each endpoint
    for service_name, service_data in schemas.get("api_schema", {}).items():
        if isinstance(service_data, dict):
            if "endpoints" in service_data:
                for endpoint in service_data["endpoints"]:
                    # Only generate if empty or missing
                    if not endpoint.get("request"):
                        path = endpoint.get("path", "")
                        method = endpoint.get("method", "GET")
                        
                        # Extract entity from path
                        entity = path.strip('/').split('/')[0] if path else "item"
                        if entity.endswith('s'):
                            entity = entity[:-1]
                        
                        # Use AI to generate fields
                        endpoint["request"] = generate_request_fields_with_ai(
                            path, method, entity, app_type
                        )

    return schemas