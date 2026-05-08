
<div align="center">

# Compile_01

### **Deterministic AI App Compiler**

*Multi-stage AI compilation with validation, repair, and runtime execution.*

</div>

---

## Overview

**Compile_01** is a **production-grade deterministic AI application compiler** that transforms natural language requirements into:

- Structured intent models
- System architecture
- Database schemas
- API specifications
- UI schemas
- Validation reports
- Auto-repair logs
- Runtime-ready applications

Unlike traditional AI code generators, Compile_01 assumes:

> **LLM outputs are unreliable by default.**

So instead of generating everything in a single pass, the system introduces:

- Validation layers
- Repair engines
- Runtime checks
- Typed schema enforcement
- Deterministic orchestration

---

## Core Philosophy

Most AI builders fail because they rely on:

- Single-shot generation
- No validation
- No repair pipeline
- Blind execution

Compile_01 solves this with a compiler architecture.

---

## Traditional AI vs Compile_01

| Traditional AI | Compile_01 |
|---|---|
| One-shot generation | Multi-stage deterministic pipeline |
| Unvalidated output | Typed validation at every stage |
| Retry entire generation | Repair only broken layer |
| Black-box execution | Observable architecture |
| Demo-focused | Production-oriented |
| Prompt engineering | Systems engineering |

---



## System Architecture


```text
┌────────────────────────────────────────────────────────────────────────────┐
│                             Compile_01 Pipeline                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  │ Prompt   │────▶│ Intent   │────▶│ Design   │────▶│ Schema   │          │
│  │ Input    │     │ Extract  │     │ Generate │     │ Generate │          │
│  └──────────┘     └──────────┘     └──────────┘     └────┬─────┘          │
│                                                           │                │
│                                                           ▼                │
│                                                    ┌────────────┐          │
│                                                    │ Validation │          │
│                                                    └────┬───────┘          │
│                                                         │                  │
│                        ┌────────────────────────────────┘                  │
│                        ▼                                                   │
│                 ┌────────────┐                                             │
│                 │ Repair     │                                             │
│                 │ Engine     │                                             │
│                 └────┬───────┘                                             │
│                      ▼                                                     │
│               ┌──────────────┐                                             │
│               │ Runtime      │                                             │
│               │ Execution    │                                             │
│               └──────────────┘                                             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
````

---

## Technology Stack

| Layer              | Technology            |
| ------------------ | --------------------- |
| **Backend**        | FastAPI               |
| **Frontend**       | Next.js 14            |
| **Language**       | TypeScript + Python   |
| **Validation**     | Pydantic              |
| **Database**       | SQLite                |
| **ORM**            | SQLAlchemy            |
| **Streaming**      | Server-Sent Events    |
| **Styling**        | Tailwind CSS          |
| **AI Models**      | Gemini Flash / Claude |
| **Authentication** | JWT                   |
| **Charts**         | Recharts              |

---

## Core Features

---

### Multi-Stage AI Compilation

Instead of generating everything in one shot:

```text
Prompt
   ↓
Intent
   ↓
Architecture
   ↓
Schemas
   ↓
Validation
   ↓
Repair
   ↓
Runtime
```

Each stage is:

* Independent
* Typed
* Observable
* Repairable

---

### Typed Schema Generation

Every AI output is validated using strict models.

```python
class IntentSchema(BaseModel):
    app_type: str
    features: List[str]
    roles: List[str]
    entities: List[str]
```

This prevents malformed AI responses from breaking downstream systems.

---

### Validation Engine

Cross-layer consistency checks:

✅ API fields exist in DB <br>
✅ UI components reference valid APIs<br>
✅ Roles are defined correctly<br>
✅ Required schemas are present<br>
✅ Endpoints are structurally valid

---

### Repair Engine

**Compile_01** repairs invalid generations automatically.

### Example

```text
ERROR:
API field 'password' missing in DB

REPAIR:
Added password column to users table
```

Instead of regenerating everything:

* only broken sections are repaired
* schemas stay deterministic
* runtime remains stable

---

### Live Streaming Pipeline

The frontend receives real-time updates via SSE.

```text
[1/5] Intent Extraction — running
✓ Intent Extraction completed

[2/5] System Design — running
✓ System Design completed

[3/5] Schema Generation — running
✓ Schema Generation completed

⚠ Validation issues detected
✓ Repair engine fixed 3 issues

✓ Runtime Execution completed
```

---

### Runtime Execution

Generated schemas become:

* FastAPI routes
* SQLite tables
* Runtime services
* Interactive Swagger docs

---

### Full Observability

Every compilation tracks:

| Metric  | Description               |
| ------- | ------------------------- |
| Latency | Stage execution time      |
| Tokens  | AI token usage            |
| Cost    | Estimated API cost        |
| Repairs | Number of repaired issues |
| Runtime | API runtime status        |

---

## Installation

---

### Requirements

| Requirement | Version |
| ----------- | ------- |
| Python      | 3.11+   |
| Node.js     | 18+     |
| npm         | 9+      |

---

### Backend Setup

```bash
git clone https://github.com/yourusername/compile_01.git

cd compile_01/backend

python -m venv venv
```

---

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### macOS/Linux

```bash
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Configure Environment

```env
GEMINI_API_KEY=your_api_key_here
```

---

### Start Backend

```bash
python -m uvicorn app.main:app --reload --port 8000
```

---

### Frontend Setup

```bash
cd ../frontend

npm install

npm run dev
```

---

## Configuration

---

### Backend `.env`

```env
GEMINI_API_KEY=your_api_key
OPENAI_API_KEY=optional
LOG_LEVEL=INFO
MAX_REPAIRS=3
TEMPERATURE=0
```

---

## Usage

---

### Example Prompt

```text
Build a CRM with authentication, contacts, analytics dashboard, and user roles
```

---

### Live Pipeline Output

```text
▶ Compiler initialized

[1/5] Intent Extraction — running
✓ Intent Extraction completed

[2/5] System Design — running
✓ System Design completed

[3/5] Schema Generation — running
✓ Schema Generation completed

⚠ Schema inconsistencies detected
✓ 3 issues repaired successfully

[5/5] Runtime Execution — running
✓ Runtime Execution completed

✓ Output is EXECUTION READY
```

---

### Pipeline Stages

| Stage                 | Description                                   |
| --------------------- | --------------------------------------------- |
| **Intent Extraction** | Parse natural language into structured intent |
| **System Design**     | Generate entities, flows, roles               |
| **Schema Generation** | Generate DB/API/UI schemas                    |
| **Validation**        | Cross-layer consistency checks                |
| **Repair Engine**     | Auto-fix schema issues                        |
| **Runtime Execution** | Deploy executable runtime                     |

---

## Validation & Repair Engine

---

### Validation Rules

| Rule                    | Severity |
| ----------------------- | -------- |
| API field missing in DB | Error    |
| Invalid role            | Error    |
| Empty schema            | Warning  |
| Missing endpoints       | Warning  |

---

### Repair Actions

| Problem              | Repair                 |
| -------------------- | ---------------------- |
| Missing DB field     | Add inferred column    |
| Missing API endpoint | Generate CRUD endpoint |
| Invalid role         | Add missing role       |
| Empty request body   | Generate defaults      |

---

### Example Repair Logs

```text
⚠ Validation issues detected

ERROR:
API field 'password' missing in DB

REPAIR:
Added password column

ERROR:
API field 'start_date' missing

REPAIR:
Added start_date column

✓ 2 issues repaired successfully
```

---

## API Reference

---

### POST `/generate`

Compile prompt into runtime-ready schemas.

### Request

```json
{
  "prompt": "Build a CRM system"
}
```

---

### SSE Response Events

```text
stage_start
stage_complete
log
complete
error
```

---

## Project Structure

```text
compile_01/
│
├── backend/
│   ├── app/
│   │   ├── pipeline/
│   │   ├── runtime/
│   │   ├── llm/
│   │   ├── models/
│   │   └── utils/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Contributing

---

### Workflow

```bash
git checkout -b feature/amazing-feature
```

---

### Run Tests

```bash
pytest backend/tests/
```

---

### Commit Convention

```text
feat(runtime): add websocket execution layer
fix(validation): resolve schema mismatch issue
docs(readme): improve installation guide
```

---

## License

MIT License

---


