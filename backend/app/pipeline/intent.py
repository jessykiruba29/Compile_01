from app.llm.client import ask_llm
from app.llm.prompts import INTENT_PROMPT
import json


def generate_intent(user_prompt: str):
    response = ask_llm(INTENT_PROMPT, user_prompt)
    return json.loads(response)