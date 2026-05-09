from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from app.models.schemas import PromptRequest
from app.pipeline.orchestrator import run_pipeline_streaming
from app.runtime.engine import router

app = FastAPI(title="Compile_01")

# CORS middleware with explicit allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://compile-01.vercel.app",
        "https://compile01-ctwu3hmzn-jessykiruba29s-projects.vercel.app", 
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Compile_01 API Running"}

@app.options("/generate")
async def options_generate():
    """Handle CORS preflight"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://compile-01.vercel.app",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.post("/generate")
async def generate(request: PromptRequest):
    return StreamingResponse(
        run_pipeline_streaming(request.prompt),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )