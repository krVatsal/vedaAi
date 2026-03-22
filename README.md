# VedaAI — Assessment Creator

A full-stack AI-powered assessment generator. Teachers describe their requirements, upload reference material, and Claude AI generates a complete, structured question paper in seconds.

![VedaAI Assessment Creator](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Redis-blue)
![AI](https://img.shields.io/badge/AI-Claude%20Sonnet%20(Anthropic)-green)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                     │
│  • AssignmentForm  → Form with validation                    │
│  • Zustand Store   → Client state management                 │
│  • WebSocket Hook  → Real-time job updates                   │
│  • QuestionPaper   → Structured output display               │
│  • PDF Export      → jsPDF-based formatted download          │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (Node + Express)                  │
│  • POST /api/assignments  → Create & queue job               │
│  • GET  /api/assignments  → List (with Redis cache)          │
│  • GET  /api/assignments/:id → Get with result               │
│  • POST /api/assignments/:id/regenerate → Re-queue           │
│  • WebSocket /ws          → Real-time updates to clients     │
└──────────────┬─────────────────────┬───────────────────────┘
               │                     │
    ┌──────────▼──────┐    ┌─────────▼─────────────┐
    │  BullMQ + Redis │    │  MongoDB               │
    │  • Job Queue    │    │  • Assignments         │
    │  • Job State    │    │  • Generated Results   │
    │  • Rate Control │    │  • Caching (30s-5min)  │
    └──────────┬──────┘    └───────────────────────┘
               │
    ┌──────────▼──────────────────────────────────┐
    │  BullMQ Worker (separate process)            │
    │  1. Picks job from queue                     │
    │  2. Builds structured prompt                 │
    │  3. Calls Anthropic claude-sonnet-4          │
    │  4. Parses + normalizes JSON response        │
    │  5. Stores result in MongoDB                 │
    │  6. Broadcasts via WebSocket                 │
    └─────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (with devtools) |
| Real-time | WebSocket (native `ws` library) |
| Backend | Node.js + Express + TypeScript |
| Queue | BullMQ |
| Cache | Redis (IORedis) |
| Database | MongoDB (Mongoose) |
| AI | Anthropic Claude Sonnet 4 |
| PDF Export | jsPDF |
| Validation | Zod |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Anthropic API key

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assessment-creator
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
```

### 3. Start Services

```bash
# Terminal 1 — Backend API server
cd backend && npm run dev

# Terminal 2 — BullMQ Worker
cd backend && npm run worker

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000`

### Using Docker (optional)

```bash
# Start MongoDB + Redis
docker run -d -p 27017:27017 mongo
docker run -d -p 6379:6379 redis
```

---

## Flow

1. Teacher fills out the assessment form (title, subject, grade, question types, difficulty)
2. Optionally uploads a PDF/TXT reference file
3. On submit → `POST /api/assignments` creates a MongoDB document and enqueues a BullMQ job
4. The Worker picks up the job, constructs a detailed prompt, calls Claude API
5. Response is validated, normalized and stored in MongoDB
6. WebSocket broadcasts real-time progress updates (10% → 20% → 70% → 85% → 100%)
7. Frontend receives the update and renders the structured question paper
8. Teacher can: fill in student info, collapse/expand sections, export to PDF, or regenerate

---

## Key Design Decisions

### Structured AI Prompting
The prompt is not a simple question — it includes exact JSON schema, mark distribution requirements, difficulty ratios, and subject-appropriate question generation guidelines. The parser handles markdown-wrapped JSON and JSON embedded in prose.

### No Raw AI Rendering
The `normalizeAssessment()` function validates every field before display:
- Difficulty tags are constrained to `easy | medium | hard`
- MCQ questions must have exactly 4 options
- Marks totals are computed fresh from the questions
- Missing IDs get fresh UUIDs

### Real-time Architecture
BullMQ Workers directly call `wsManager.broadcast()` which maintains a Map of WebSocket clients subscribed to specific assignment IDs. Progress updates fire at key milestones (prompt build → API call → parse → store).

### Redis Caching Strategy
- Assignment list: 30-second TTL (fast refresh for dashboard)
- Completed assessments: 5-minute TTL (avoid re-querying completed results)
- Cache is invalidated on regenerate

---

## Bonus Features

- **PDF Export**: Fully formatted A4 paper with header, student info section, colored difficulty badges, MCQ options in 2-column layout, answer lines for open questions
- **Answer Key Toggle**: Teacher-side answer display per question (hidden by default)
- **Regenerate**: Re-queues the same assignment for a fresh generation
- **Recent Assessments**: Lists last 5 assessments with live status indicators
- **File Upload**: PDF and TXT files are extracted server-side and injected into the AI prompt as reference context
- **Difficulty Distribution Bar**: Visual breakdown of easy/medium/hard question ratio

---

## Project Structure

```
assessment-creator/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express + WebSocket server
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── models/
│   │   │   └── Assignment.ts     # Mongoose schema
│   │   ├── routes/
│   │   │   └── assignments.ts    # API endpoints
│   │   ├── services/
│   │   │   ├── aiGenerator.ts    # Anthropic integration + prompt builder
│   │   │   ├── queue.ts          # BullMQ setup
│   │   │   ├── redis.ts          # Redis + caching utils
│   │   │   └── websocket.ts      # WS manager
│   │   └── workers/
│   │       └── assessmentWorker.ts # Background job processor
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                    # Home / create form
    │   │   ├── layout.tsx                  # Root layout + fonts
    │   │   ├── globals.css                 # Tailwind + custom CSS
    │   │   └── assessment/[id]/page.tsx    # Result page
    │   ├── components/
    │   │   ├── assessment/
    │   │   │   ├── AssignmentForm.tsx
    │   │   │   ├── QuestionTypeRow.tsx
    │   │   │   ├── GenerationProgress.tsx
    │   │   │   ├── QuestionPaper.tsx
    │   │   │   └── RecentAssignments.tsx
    │   │   └── ui/
    │   │       └── Header.tsx
    │   ├── hooks/
    │   │   └── useWebSocket.ts
    │   ├── lib/
    │   │   ├── api.ts
    │   │   └── pdfExport.ts
    │   ├── store/
    │   │   └── assessmentStore.ts
    │   └── types/
    │       └── index.ts
    └── package.json
```
