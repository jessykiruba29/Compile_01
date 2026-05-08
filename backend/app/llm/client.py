import os
import json
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-3.1-flash-lite")


def ask_llm(system_prompt: str, user_prompt: str):

    full_prompt = f"""
    {system_prompt}

    USER INPUT:
    {user_prompt}

    IMPORTANT:
    Return ONLY valid JSON.
    No markdown.
    No explanation.
    """

    response = model.generate_content(full_prompt)

    text = response.text.strip()

    # remove accidental markdown
    text = text.replace("```json", "")
    text = text.replace("```", "")

    return text