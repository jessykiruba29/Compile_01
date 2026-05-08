from pydantic import BaseModel
from typing import List, Dict, Any


class PromptRequest(BaseModel):
    prompt: str


class Endpoint(BaseModel):
    path: str
    method: str
    request: List[str]
    response: List[str]


class APISchema(BaseModel):
    endpoints: List[Endpoint]


class FullResponse(BaseModel):
    intent: Dict[str, Any]
    design: Dict[str, Any]
    schemas: Dict[str, Any]
    validation: Dict[str, Any]
    repairs: List[str]