from fastapi import APIRouter

router = APIRouter()


def create_handler(
    current_path,
    current_method
):

    async def handler():

        return {
            "message": "Dynamic endpoint working",
            "path": current_path,
            "method": current_method
        }

    return handler


def create_dynamic_routes(api_schema: dict):

    for service in api_schema.values():

        endpoints = service.get("endpoints", [])

        for endpoint in endpoints:

            path = endpoint["path"]

            method = endpoint["method"].upper()

            router.add_api_route(
                path,
                create_handler(path, method),
                methods=[method]
            )