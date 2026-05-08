# backend/app/pipeline/orchestrator.py
import json
import time
import asyncio
from typing import AsyncGenerator, Callable, Awaitable, TypeVar

from app.pipeline.intent import generate_intent
from app.pipeline.design import generate_design
from app.pipeline.schema import generate_schemas
from app.pipeline.validate import validate_schemas
from app.pipeline.repair import repair_schemas
from app.pipeline.normalize import normalize_api_schema
from app.runtime.database import generate_database
from app.runtime.engine import create_dynamic_routes
from app.utils.logger import logger

T = TypeVar("T")


async def run_stage_with_retry(stage_func: Callable[[], Awaitable[T]], retries: int = 2) -> T:
    last_error: Exception | None = None

    for attempt in range(retries + 1):
        try:
            return await stage_func()
        except Exception as e:
            last_error = e
            logger.warning(f"Retry {attempt + 1} failed: {str(e)}")

    raise last_error


async def run_pipeline_streaming(user_prompt: str) -> AsyncGenerator[str, None]:
    """Run pipeline with SSE streaming for frontend"""
    
    total_start = time.time()
    total_tokens = 0
    
    # ========== STAGE 1: Intent Extraction ==========
    yield f'data: {json.dumps({"event": "stage_start", "data": {"id": "intent", "label": "Intent Extraction"}})}\n\n'
    await asyncio.sleep(0.01)
    
    stage_start = time.time()
    async def intent_stage():
        return await asyncio.to_thread(generate_intent, user_prompt)

    intent = await run_stage_with_retry(intent_stage)
    intent_time = int((time.time() - stage_start) * 1000)
    
    yield f'data: {json.dumps({"event": "stage_complete", "data": {"id": "intent", "label": "Intent Extraction", "latency_ms": intent_time, "tokens": 0, "output": intent}})}\n\n'
    await asyncio.sleep(0.01)
    
    # ========== STAGE 2: System Design ==========
    yield f'data: {json.dumps({"event": "stage_start", "data": {"id": "architecture", "label": "System Design"}})}\n\n'
    await asyncio.sleep(0.01)
    
    stage_start = time.time()
    async def design_stage():
        return await asyncio.to_thread(generate_design, intent)

    design = await run_stage_with_retry(design_stage)
    design_time = int((time.time() - stage_start) * 1000)
    
    yield f'data: {json.dumps({"event": "stage_complete", "data": {"id": "architecture", "label": "System Design", "latency_ms": design_time, "tokens": 0, "output": design}})}\n\n'
    await asyncio.sleep(0.01)
    
    # ========== STAGE 3: Schema Generation ==========
    yield f'data: {json.dumps({"event": "stage_start", "data": {"id": "schema_gen", "label": "Schema Generation"}})}\n\n'
    await asyncio.sleep(0.01)
    
    stage_start = time.time()
    async def schema_stage():
        return await asyncio.to_thread(generate_schemas, design)

    schemas = await run_stage_with_retry(schema_stage)

    if "api_schema" not in schemas:
        schemas["api_schema"] = {}

    schemas["api_schema"] = normalize_api_schema(schemas["api_schema"])
    schema_time = int((time.time() - stage_start) * 1000)
    
    yield f'data: {json.dumps({"event": "stage_complete", "data": {"id": "schema_gen", "label": "Schema Generation", "latency_ms": schema_time, "tokens": 0, "output": schemas}})}\n\n'
    await asyncio.sleep(0.01)
    # ========== STAGE 4 & 5: Validation and Repair ==========
    yield f'data: {json.dumps({"event": "stage_start", "data": {"id": "validation", "label": "Validation & Repair"}})}\n\n'
    await asyncio.sleep(0.01)
    
    stage_start = time.time()
    validation = await asyncio.to_thread(validate_schemas, schemas)
    original_error_count = len(validation.get("errors", []))

    if original_error_count > 0:
        yield f'data: {json.dumps({"event": "log", "data": {"level": "warning", "message": "⚠ Schema inconsistencies detected → Activating repair engine"}})}\n\n'

    schemas, repairs = await asyncio.to_thread(repair_schemas, schemas, validation)
    validation_time = int((time.time() - stage_start) * 1000)

    if len(repairs) > 0:
        yield f'data: {json.dumps({"event": "log", "data": {"level": "success", "message": f"✓ {len(repairs)} issues repaired successfully"}})}\n\n'

    repaired_error_messages: list[str] = []
    for repair in repairs:
        field = repair.get("field")
        if field:
            for error in validation.get("errors", []):
                if field in error:
                    repaired_error_messages.append(error)

    validation["errors"] = [
        err for err in validation.get("errors", [])
        if err not in repaired_error_messages
    ]
    
    # Build issues list for frontend (VALIDATION OBJECT STRUCTURE)
    validation_issues = []
    
    # Add errors from validation
    for error in validation.get("errors", []):
        validation_issues.append({
            "severity": "error",
            "layer": "validation",
            "field": "schema",
            "issue": error,
            "repaired": False
        })
    
    # Add warnings from validation
    for warning in validation.get("warnings", []):
        validation_issues.append({
            "severity": "warning",
            "layer": "validation",
            "field": "schema",
            "issue": warning,
            "repaired": False
        })
    
    # Add repairs (already dicts now from updated repair.py)
    for repair in repairs:
        validation_issues.append({
            "severity": "success",
            "layer": repair.get("layer", "repair"),
            "field": repair.get("field", "unknown"),
            "issue": repair.get("description", str(repair)),
            "repaired": True,
            "repair_action": repair.get("action", repair.get("description", ""))
        })
    
    final_error_count = len(validation.get("errors", []))

    # Create validation object that frontend expects
    validation_output = {
        "passed": final_error_count == 0,
        "repaired": len(repairs) > 0,
        "original_error_count": original_error_count,
        "final_error_count": final_error_count,
        "issues": validation_issues,
        "repaired_count": len(repairs),
        "summary": f"Found {original_error_count} errors. Repaired {len(repairs)} issues. {final_error_count} remaining."
    }
    
    yield f'data: {json.dumps({"event": "stage_complete", "data": {"id": "validation", "label": "Validation & Repair", "latency_ms": validation_time, "tokens": 0, "output": validation_output}})}\n\n'
    await asyncio.sleep(0.01)
    
    # ========== STAGE 6: Runtime Execution ==========
    yield f'data: {json.dumps({"event": "stage_start", "data": {"id": "runtime", "label": "Runtime Execution"}})}\n\n'
    await asyncio.sleep(0.01)
    
    stage_start = time.time()
    await asyncio.to_thread(generate_database, schemas.get("db_schema", {}))
    await asyncio.to_thread(create_dynamic_routes, schemas.get("api_schema", {}))
    runtime_time = int((time.time() - stage_start) * 1000)
    
    yield f'data: {json.dumps({"event": "stage_complete", "data": {"id": "runtime", "label": "Runtime Execution", "latency_ms": runtime_time, "tokens": 0, "output": {"status": "ready", "endpoints": list(schemas.get("api_schema", {}).keys())}}})}\n\n'
    await asyncio.sleep(0.01)
    
    # ========== FINAL COMPLETE ==========
    total_latency = int((time.time() - total_start) * 1000)
    
    final_output = {
        "intent": intent,
        "design": design,
        "schemas": schemas,
        "validation": validation_output,  # ← Use validation_output, not raw validation
        "repairs": repairs,
        "execution_ready": True,
        "meta": {  # ← Add meta for frontend
            "generated_at": time.time(),
            "total_latency_ms": total_latency,
            "total_tokens": total_tokens,
            "total_cost_usd": total_tokens * 0.000002
        }
    }
    
    metrics = {
        "total_latency_ms": total_latency,
        "total_tokens": total_tokens,
        "cost_usd": total_tokens * 0.000002,
        "stages": 5,
        "stage_latencies": {
            "intent": intent_time,
            "architecture": design_time,
            "schema_gen": schema_time,
            "validation": validation_time,
            "runtime": runtime_time
        },
        "stage_tokens": {
            "intent": 0,
            "architecture": 0,
            "schema_gen": 0,
            "validation": 0,
            "runtime": 0
        }
    }
    
    yield f'data: {json.dumps({"event": "complete", "data": {"output": final_output, "metrics": metrics}})}\n\n'


async def run_pipeline(user_prompt: str):
    """Non-streaming version for backwards compatibility"""
    result = None
    async for event in run_pipeline_streaming(user_prompt):
        if '"complete"' in event:
            import json
            data = json.loads(event.replace("data: ", "").strip())
            result = data.get("data", {}).get("output")
    return result