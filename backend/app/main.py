from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.models.schemas import PromptRequest
from app.pipeline.orchestrator import run_pipeline_streaming
from app.runtime.engine import router

app = FastAPI(title="Compile_01")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    """Streaming endpoint for frontend"""
    return StreamingResponse(
        run_pipeline_streaming(request.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )