from app.llm.client import ask_llm
from app.llm.prompts import DESIGN_PROMPT
import json


def generate_design(intent: dict):
    response = ask_llm(DESIGN_PROMPT, str(intent))
    return json.loads(response)