import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from app.models.schemas import PromptRequest
from app.pipeline.orchestrator import run_pipeline_streaming
from app.runtime.engine import router

load_dotenv()

app = FastAPI(title="Compile_01")

frontend_urls = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Compile_01 API Running"}

@app.post("/generate")
async def generate(request: PromptRequest):
    return StreamingResponse(
        run_pipeline_streaming(request.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache"
        }
    )