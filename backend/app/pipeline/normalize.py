# backend/app/pipeline/normalize.py
def normalize_api_schema(api_schema: dict) -> dict:
    """Ensure API schema has valid endpoints"""
    
    if not api_schema:
        api_schema = {}
    
    normalized = {}
    
    for service_name, service_data in api_schema.items():
        if not isinstance(service_data, dict):
            service_data = {"endpoints": []}
        
        if "endpoints" not in service_data:
            service_data["endpoints"] = []
        
        # Ensure no empty endpoint arrays
        if len(service_data["endpoints"]) == 0:
            # Add default endpoint
            service_data["endpoints"] = [
                {
                    "path": f"/{service_name.replace('_service', '')}",
                    "method": "GET",
                    "request": []
                }
            ]
        
        normalized[service_name] = service_data
    
    # If completely empty, add a default service
    if not normalized:
        normalized["main_service"] = {
            "endpoints": [
                {
                    "path": "/",
                    "method": "GET",
                    "request": []
                }
            ]
        }
    
    return normalized