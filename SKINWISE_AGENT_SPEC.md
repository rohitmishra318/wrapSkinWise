# SkinWise — AI Agent Build Specification
## Complete Technical Blueprint for Phase 2 & Phase 3 Development

> **Document Purpose:** This is the authoritative specification for an AI coding agent tasked with building SkinWise Phase 2 and Phase 3. Every section is written to be directly actionable. The agent must read the entire document before writing a single line of code. Ambiguity has been deliberately eliminated — if something is specified here, build it exactly as specified. If something is not specified, use the tech stack and architectural patterns already established in this document.

---

## Table of Contents

1. [Project Overview & Goal](#1-project-overview--goal)
2. [Phase 1 Baseline — What Already Exists](#2-phase-1-baseline--what-already-exists)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Microservices Breakdown](#4-microservices-breakdown)
5. [Technology Stack](#5-technology-stack)
6. [Database Design](#6-database-design)
7. [Complete API Contract](#7-complete-api-contract)
8. [Feature Specifications — User-Facing](#8-feature-specifications--user-facing)
9. [Feature Specifications — B2B Brand Portal](#9-feature-specifications--b2b-brand-portal)
10. [Super-Resolution Pipeline](#10-super-resolution-pipeline)
11. [AI & Computer Vision Pipeline](#11-ai--computer-vision-pipeline)
12. [Hyper-Personalization Engine](#12-hyper-personalization-engine)
13. [Frontend Interface Specification](#13-frontend-interface-specification)
14. [Infrastructure & DevOps](#14-infrastructure--devops)
15. [Security Specification](#15-security-specification)
16. [Build Sequence — Agent Execution Order](#16-build-sequence--agent-execution-order)

---

## 1. Project Overview & Goal

**Product Name:** SkinWise
**Type:** Dermatological analysis and personalized skincare platform
**Target Users:** Two distinct audiences — (A) end consumers seeking skin health analysis and routines, (B) B2B skincare brand partners accessing aggregate analytics and recommendation APIs.

### The Core Value Proposition

A user uploads a face photo. SkinWise:
1. Enhances the image quality via super-resolution if the image is low-resolution.
2. Runs multi-condition dermatological analysis using computer vision.
3. Generates a hyper-personalized skincare routine using LLM inference, enriched by real-time contextual signals (weather, lifestyle, product history).
4. Tracks progress longitudinally across analyses over time.
5. Exposes anonymized aggregate insights to brand partners via a separate authenticated portal and API.

### Success Criteria the Agent Must Target

- Analysis pipeline end-to-end (upload → results rendered) completes in under 12 seconds for standard images; async queue used for SR-enhanced images.
- All ML inference is decoupled from the HTTP request cycle via Bull job queues.
- Brand analytics dashboard renders aggregate data with zero PII exposure.
- All services are containerized and orchestrated via Docker Compose (dev) with Kubernetes manifests generated for production.
- Every API endpoint has input validation, rate limiting, and structured error responses.

---

## 2. Phase 1 Baseline — What Already Exists

The agent must NOT rebuild these. Extend and integrate with them.

### Existing Services
- `backend/` — Node.js + Express v5, port 5000
- `frontend/` — React 18 + Vite, port 3000
- `python_service/` — Flask, port 7000
- MongoDB container, port 27017
- Redis container, port 6379

### Existing Models (MongoDB)
- `User` — Firebase UID, skinProfile, preferences, budget
- `SkinAnalysis` — severity scores (acne, blackheads, wrinkles, pigmentation), delta, modelVersion
- `Routine` — steps array, generatedBy, routineType (morning/night)
- `RoutineStreak` — currentStreak, longestStreak, history

### Existing ML Stack (python_service)
- YOLOv5 custom-trained model at `yolo/best.pt` — acne detection
- MediaPipe Face Landmarker — 468-point mesh
- OpenCV — image processing
- HSV fallback for acne, Canny for wrinkles, morphological ops for blackheads, color histogram for pigmentation

### Existing Auth
- Firebase Authentication (email/password)
- Firebase Admin SDK on backend for JWT verification
- `authMiddleware.js` — verifies bearer token, attaches `req.user`

### Existing API Routes
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET/PUT /api/user/profile`
- `POST /api/analyze`, `GET /api/analysis/history`, `GET /api/analysis/:id`
- `GET/POST/PUT/DELETE /api/routine`, `POST /api/routine/:id/complete`
- `GET /api/blog/search`, `GET /api/blog/recommendations`
- `GET /api/admin/users`, `GET /api/admin/analytics`

---

## 3. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  React 18 SPA (port 3000)          Brand Portal (same SPA, /brand)  │
└─────────────────────────┬────────────────────────┬───────────────────┘
                          │ HTTPS                  │ HTTPS + API Key
                          ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Nginx)                              │
│  SSL termination · Rate limiting · CORS · Request logging            │
└──────┬──────────────────┬───────────────────────┬────────────────────┘
       │                  │                       │
       ▼                  ▼                       ▼
┌────────────┐   ┌─────────────────┐   ┌──────────────────────┐
│  Node.js   │   │  Python ML      │   │  Python SR           │
│  API       │   │  Service        │   │  Service             │
│  (port     │   │  (port 7000)    │   │  (port 7001)         │
│   5000)    │   │                 │   │                      │
│            │   │  YOLOv8-seg     │   │  Real-ESRGAN         │
│  Auth      │   │  MediaPipe      │   │  GFPGAN              │
│  Routines  │   │  DINOv2         │   │  Quality gate        │
│  Streaks   │   │  Colorimetry    │   │                      │
│  Blog      │   │  Zone analysis  │   │                      │
│  Brand API │   │                 │   │                      │
└─────┬──────┘   └────────┬────────┘   └──────────┬───────────┘
      │                   │                        │
      ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SHARED INFRASTRUCTURE                           │
│  MongoDB (port 27017)  ·  Redis (port 6379)  ·  S3-compatible store │
│  Bull Queue (Redis-backed)  ·  Socket.io (real-time events)         │
└─────────────────────────────────────────────────────────────────────┘
```

### Inter-Service Communication Rules
- Node.js API → Python ML Service: HTTP via internal Docker network only. Never exposed externally.
- Node.js API → Python SR Service: HTTP via internal Docker network only.
- Node.js → Bull Queue: Redis `skinwise:analysis` queue for async jobs.
- Frontend → Node.js: REST + Socket.io WebSocket.
- No direct frontend → Python communication. Ever.

---

## 4. Microservices Breakdown

The agent must treat each of the following as an independently deployable unit with its own `Dockerfile`.

### 4.1 Node.js API Service (`/backend`)
**Responsibility:** Authentication, business logic, data persistence, job orchestration, real-time events, brand API.
**Port:** 5000
**Owns:** All MongoDB read/write operations. No Python service writes to MongoDB directly.

### 4.2 Python ML Analysis Service (`/python_service`)
**Responsibility:** All computer vision inference — face detection, zone segmentation, condition severity scoring, colorimetry.
**Port:** 7000
**Input:** Multipart image (POST) or S3 key (for async queue worker mode)
**Output:** JSON analysis result object
**Stateless:** No database connections. Returns pure JSON to Node.js.

### 4.3 Python SR Service (`/sr_service`) — NEW
**Responsibility:** Super-resolution preprocessing only. Receives an image, returns an enhanced image.
**Port:** 7001
**Input:** Multipart image POST
**Output:** Enhanced image as binary (PNG) or S3 key if large
**Stateless:** No database connections. No business logic.
**Model weights location:** `/sr_service/weights/RealESRGAN_x4plus.pth` and `/sr_service/weights/GFPGANv1.4.pth`

### 4.4 React Frontend (`/frontend`)
**Responsibility:** All user-facing UI — consumer and brand portal.
**Port:** 3000 (dev), served by Nginx in production

### 4.5 Nginx Gateway (`/nginx`) — NEW
**Responsibility:** Single ingress point, SSL, rate limiting, reverse proxy.
**Port:** 80/443

---

## 5. Technology Stack

The agent must use exactly these technologies. Do not substitute.

### Backend (Node.js API Service)
| Package | Version | Purpose |
|---|---|---|
| express | ^5.0.0 | HTTP framework |
| mongoose | ^8.x | MongoDB ODM |
| bull | ^4.x | Job queue (Redis-backed) |
| ioredis | ^5.x | Redis client |
| socket.io | ^4.x | WebSocket server |
| axios | ^1.x | HTTP client to Python services |
| multer | ^1.x | Multipart upload handling |
| @aws-sdk/client-s3 | ^3.x | S3-compatible object storage |
| zod | ^3.x | Runtime schema validation |
| express-rate-limit | ^7.x | Rate limiting middleware |
| firebase-admin | ^12.x | JWT verification |
| jsonwebtoken | ^9.x | Brand API key JWTs |
| winston | ^3.x | Structured logging |
| dotenv | ^16.x | Environment config |

### Python ML Service
| Package | Purpose |
|---|---|
| flask | HTTP framework |
| ultralytics | YOLOv8 (replaces manual YOLOv5 implementation) |
| mediapipe | Face mesh (468 landmarks) |
| opencv-python-headless | Image processing |
| torch, torchvision | Deep learning |
| transformers | DINOv2 feature extraction |
| Pillow | Image I/O |
| numpy, scipy | Numerical ops |
| onnxruntime | ONNX model inference (for exported models) |

### Python SR Service (NEW)
| Package | Purpose |
|---|---|
| flask | HTTP framework |
| basicsr | Real-ESRGAN backbone |
| realesrgan | Real-ESRGAN upsampler |
| gfpgan | Face-aware SR (GFPGAN) |
| facexlib | GFPGAN dependency |
| opencv-python-headless | Image I/O |
| torch | Deep learning runtime |
| Pillow | Image manipulation |

### Frontend (React)
| Package | Purpose |
|---|---|
| react, react-dom | ^18.x UI framework |
| vite | Build tool |
| react-router-dom | ^7.x Routing |
| tailwindcss | Utility CSS |
| axios | HTTP client |
| socket.io-client | WebSocket |
| recharts | Charts and progress graphs |
| zustand | Global state management (replaces/augments Context) |
| react-query (@tanstack/react-query) | Server state, caching, loading states |
| react-dropzone | Image upload UI |
| framer-motion | Animations |
| lucide-react | Icons |
| react-hot-toast | Notifications |
| date-fns | Date formatting |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization and local orchestration |
| Nginx | API gateway and static file server |
| MongoDB 7.x | Primary database |
| Redis 7.x | Queue backend + caching |
| AWS S3 / Cloudflare R2 | Object storage for images |

### External APIs
| API | Purpose | Required |
|---|---|---|
| OpenWeatherMap API | Weather context for routine generation | Yes |
| Anthropic API (claude-sonnet-4-20250514) | LLM routine generation | Yes |
| Firebase Authentication | User auth | Yes (existing) |
| Twingly Blog API | Blog content | Yes (existing) |

---

## 6. Database Design

### 6.1 MongoDB Collections

The agent must implement all schemas exactly as specified. Use Mongoose with strict mode enabled.

---

#### Collection: `users`
```javascript
{
  _id: ObjectId,
  uid: { type: String, required: true, unique: true },   // Firebase UID
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, enum: ['user', 'admin', 'moderator', 'brand_admin'], default: 'user' },
  brandId: { type: ObjectId, ref: 'Brand', default: null }, // set if role=brand_admin

  skinProfile: {
    skinType: { type: String, enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], default: null },
    concerns: [{ type: String, enum: ['acne', 'pigmentation', 'blackheads', 'wrinkles', 'dryness', 'oiliness', 'sensitivity', 'dullness'] }],
    allergies: [String],
    ageRange: { type: String, enum: ['<18', '18-25', '26-35', '36-45', '46+'], default: null },
    fitzpatrickEstimate: { type: Number, min: 1, max: 6, default: null }
  },

  preferences: {
    routineLevel: { type: String, enum: ['minimal', 'moderate', 'advanced'], default: 'moderate' },
    budget: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notificationsEnabled: { type: Boolean, default: true },
    dataConsentGiven: { type: Boolean, required: true, default: false },
    analyticsConsentGiven: { type: Boolean, default: false }
  },

  lifestyleProfile: {
    sleepQuality: { type: Number, min: 1, max: 5, default: null },
    stressLevel: { type: Number, min: 1, max: 5, default: null },
    waterIntake: { type: String, enum: ['low', 'standard', 'high'], default: null },
    dietType: { type: String, enum: ['standard', 'vegetarian', 'vegan', 'keto', 'other'], default: null }
  },

  lastWeatherContext: {
    city: String,
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    fetchedAt: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

#### Collection: `skin_analyses`
```javascript
{
  _id: ObjectId,
  user: { type: String, required: true, index: true },   // Firebase UID
  
  imageMetadata: {
    originalResolution: String,        // e.g. "480x640"
    srApplied: { type: Boolean, default: false },
    srModel: { type: String, default: null },   // "RealESRGAN_x4plus" | "GFPGAN"
    originalImageKey: String,          // S3 object key
    enhancedImageKey: String,          // S3 key of SR output, null if no SR
    analysisImageKey: String,          // S3 key of what was actually analyzed
    annotatedImageKey: String,         // S3 key of image with detection overlays
    qualityFlags: [String],            // ['SLIGHT_ANGLE', 'LOW_LIGHT', etc.]
    qualityScore: Number               // 0–100 composite quality score
  },

  raw: {
    acne: { label: String, count: Number, totalArea: Number },
    blackheads: { count: Number },
    wrinkles: { edgeDensity: Number },
    pigmentation: { count: Number, uniformityScore: Number },
    hydration: { textureScore: Number }
  },

  severity: {
    acne: { type: Number, min: 0, max: 100 },
    blackheads: { type: Number, min: 0, max: 100 },
    wrinkles: { type: Number, min: 0, max: 100 },
    pigmentation: { type: Number, min: 0, max: 100 },
    hydration: { type: Number, min: 0, max: 100 }
  },

  zonalSeverity: {
    tZone:      { acne: Number, oiliness: Number, hydration: Number },
    leftCheek:  { acne: Number, pigmentation: Number, hydration: Number },
    rightCheek: { acne: Number, pigmentation: Number, hydration: Number },
    forehead:   { acne: Number, wrinkles: Number, oiliness: Number },
    perioral:   { acne: Number, dryness: Number }
  },

  overallScore: { type: Number, min: 0, max: 100 },
  igaGrade: { type: Number, min: 0, max: 4 },          // IGA clinical scale
  fitzpatrickAtAnalysis: { type: Number, min: 1, max: 6 },

  delta: {
    acne: Number,
    blackheads: Number,
    wrinkles: Number,
    pigmentation: Number,
    hydration: Number,
    overall: Number
  },

  contextAtAnalysis: {
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    userSleepQuality: Number,
    userStressLevel: Number
  },

  notes: String,
  modelVersion: { type: String, default: 'v2.0' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes:
// { user: 1, createdAt: -1 }  — for history queries
// { createdAt: -1 }           — for admin analytics
```

---

#### Collection: `routines`
```javascript
{
  _id: ObjectId,
  user: { type: String, required: true, index: true },   // Firebase UID
  analysisId: { type: ObjectId, ref: 'SkinAnalysis', default: null },

  routineType: { type: String, enum: ['morning', 'night'], required: true },

  steps: [{
    stepOrder: { type: Number, required: true },
    title: { type: String, required: true },
    productType: String,
    recommendedIngredients: [String],
    avoidIngredients: [String],
    instructions: String,
    rationale: String,                // LLM-generated explanation shown to user
    estimatedTime: Number,            // minutes
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }],

  contextUsed: {
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    sleepQuality: Number,
    stressLevel: Number
  },

  ingredientConflictsResolved: [String],   // list of conflicts the LLM avoided
  allergyMatchesAvoided: [String],

  generatedBy: { type: String, enum: ['quiz', 'analysis', 'manual', 'llm-v1'], default: 'llm-v1' },
  llmModel: { type: String, default: null },   // which LLM model generated this
  llmPromptVersion: { type: String, default: null },

  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

#### Collection: `routine_streaks`
```javascript
{
  _id: ObjectId,
  user: { type: String, unique: true, required: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: Date,
  totalCompletions: { type: Number, default: 0 },
  history: [{
    date: Date,
    completed: Boolean,
    morningCompleted: Boolean,
    nightCompleted: Boolean
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

#### Collection: `product_reactions` — NEW
```javascript
{
  _id: ObjectId,
  user: { type: String, required: true, index: true },
  routineId: { type: ObjectId, ref: 'Routine' },
  stepTitle: String,
  productType: String,
  ingredients: [String],
  reaction: { type: String, enum: ['positive', 'neutral', 'irritation', 'breakout', 'no_effect'], required: true },
  weeksUsed: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
}

// Index: { user: 1, productType: 1 }
```

---

#### Collection: `daily_checkins` — NEW
```javascript
{
  _id: ObjectId,
  user: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  sleepQuality: { type: Number, min: 1, max: 5 },
  stressLevel: { type: Number, min: 1, max: 5 },
  waterIntake: { type: String, enum: ['low', 'standard', 'high'] },
  skinFeel: { type: String, enum: ['great', 'normal', 'oily', 'dry', 'breaking_out', 'sensitive'] },
  notes: String,
  createdAt: { type: Date, default: Date.now }
}

// Unique index: { user: 1, date: 1 }
```

---

#### Collection: `analysis_jobs` — NEW
```javascript
{
  _id: ObjectId,
  jobId: { type: String, required: true, unique: true },   // Bull job ID
  user: { type: String, required: true, index: true },
  status: { type: String, enum: ['queued', 'sr_processing', 'analyzing', 'complete', 'failed'], default: 'queued' },
  imageS3Key: String,
  resultAnalysisId: { type: ObjectId, ref: 'SkinAnalysis', default: null },
  errorMessage: String,
  queuedAt: { type: Date, default: Date.now },
  completedAt: Date
}
```

---

#### Collection: `brands` — NEW
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  contactEmail: String,
  apiKey: { type: String, unique: true },      // hashed in DB, sent once on creation
  apiKeyPrefix: String,                         // first 8 chars for identification
  tier: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
  monthlyCallLimit: { type: Number, default: 10000 },
  callsThisMonth: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  catalogProductTypes: [String],               // product categories they manufacture
  createdAt: { type: Date, default: Date.now }
}
```

---

#### Collection: `brand_api_logs` — NEW
```javascript
{
  _id: ObjectId,
  brandId: { type: ObjectId, ref: 'Brand', required: true, index: true },
  endpoint: String,
  requestPayload: Object,         // sanitized, no PII
  responseCode: Number,
  latencyMs: Number,
  createdAt: { type: Date, default: Date.now, expires: 7776000 }  // 90-day TTL
}
```

---

### 6.2 Redis Key Schema

The agent must use these exact key patterns for Redis.

| Key Pattern | TTL | Purpose |
|---|---|---|
| `cache:user:{uid}` | 300s | User profile cache |
| `cache:analysis:history:{uid}` | 120s | Analysis history list |
| `cache:weather:{city}` | 3600s | Weather API response |
| `cache:routine:{uid}:{type}` | 86400s | Active routine per user per type |
| `queue:analysis` | — | Bull queue name |
| `ratelimit:api:{uid}` | 60s | Per-user API rate limit counter |
| `ratelimit:brand:{brandId}` | 60s | Per-brand API rate limit counter |
| `session:sr:{jobId}` | 600s | SR job intermediate state |

---

## 7. Complete API Contract

All endpoints return JSON. All error responses follow this shape:
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```
All success responses follow this shape:
```json
{ "success": true, "data": { ... } }
```

### 7.1 Auth Routes (`/api/auth`)

#### `POST /api/auth/register`
**Auth:** None
**Body:** `{ email, password, username }`
**Response:** `{ uid, email, username, token }`
**Validation:** username 3–30 chars alphanumeric/underscore; email valid format; password min 8 chars.

#### `POST /api/auth/login`
**Auth:** None
**Body:** `{ email, password }`
**Response:** `{ uid, email, username, role, token }`

#### `POST /api/auth/logout`
**Auth:** Bearer token
**Response:** `{ message: "Logged out" }`

---

### 7.2 User Routes (`/api/user`)
All require Bearer token.

#### `GET /api/user/profile`
**Cache:** Redis `cache:user:{uid}`, 300s TTL
**Response:** Full user document minus `_id` internals

#### `PUT /api/user/profile`
**Body:** Partial user document — skinProfile, preferences, lifestyleProfile fields only. Zod-validated.
**Action:** Invalidate `cache:user:{uid}` and `cache:routine:{uid}:*` on update.

#### `POST /api/user/checkin`
**Body:** `{ sleepQuality, stressLevel, waterIntake, skinFeel, notes? }`
**Action:** Upsert today's `daily_checkin` doc. Update `user.lifestyleProfile` with latest values.

#### `GET /api/user/checkin/today`
**Response:** Today's checkin or `null`

---

### 7.3 Analysis Routes (`/api/analyze`)

#### `POST /api/analyze`
**Auth:** Bearer token
**Body:** `multipart/form-data` — field `image` (file), optional `city` (string for weather lookup)
**Rate Limit:** 10 requests per hour per user
**Behavior:**
1. Validate file: type must be `image/jpeg` or `image/png`; max size 15MB.
2. Upload original image to S3 at key `analyses/{uid}/{timestamp}_original.jpg`.
3. Create `analysis_jobs` document with status `queued`.
4. Push job to Bull queue `skinwise:analysis` with payload `{ jobId, uid, imageS3Key, city }`.
5. Return immediately: `{ jobId, status: "queued", message: "Analysis started" }`

**Error Codes:** `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`, `RATE_LIMIT_EXCEEDED`

#### `GET /api/analyze/job/:jobId`
**Auth:** Bearer token (must own the job)
**Response:** `{ jobId, status, resultAnalysisId?, errorMessage? }`
**Note:** Frontend polls this until status is `complete` or `failed`.

#### `GET /api/analysis/history`
**Auth:** Bearer token
**Query params:** `page` (default 1), `limit` (default 10, max 50)
**Cache:** Redis `cache:analysis:history:{uid}`, 120s TTL
**Response:** `{ analyses: [...], totalCount, currentPage, totalPages }`

#### `GET /api/analysis/:id`
**Auth:** Bearer token (must own the analysis)
**Response:** Full `SkinAnalysis` document including `imageMetadata`

#### `GET /api/analysis/:id/image/:type`
**Auth:** Bearer token
**Param `type`:** `original` | `enhanced` | `annotated`
**Response:** Signed S3 URL (expires in 15 minutes)

---

### 7.4 Routine Routes (`/api/routine`)
All require Bearer token.

#### `GET /api/routine`
**Query params:** `type` (`morning` | `night` | `all`)
**Cache:** Redis `cache:routine:{uid}:{type}`, 86400s TTL
**Response:** Array of active routine documents

#### `POST /api/routine/generate`
**Body:** `{ routineType: 'morning'|'night', analysisId?: string, forceRegenerate?: boolean }`
**Behavior:**
1. Fetch user profile, latest analysis (or specified analysisId), today's checkin.
2. Fetch weather from OpenWeatherMap for user's city (or cached).
3. Construct `RoutineContext` object (see Section 12).
4. Call Anthropic API with context + system prompt (see Section 12).
5. Validate response with Zod schema.
6. Save routine to MongoDB.
7. Invalidate `cache:routine:{uid}:{type}`.
8. Return new routine document.
**Rate Limit:** 5 generations per day per user.

#### `PUT /api/routine/:id`
**Body:** Partial routine steps update
**Action:** Invalidate cache.

#### `DELETE /api/routine/:id`
**Action:** Set `isActive: false`. Do not hard-delete.

#### `POST /api/routine/:id/complete`
**Body:** `{ stepIds: [string] }` — array of completed step IDs
**Action:**
1. Mark steps as completed.
2. If all steps complete, update `routine_streaks`.
3. Emit Socket.io event `routine:completed` to user's room.
4. Return updated streak info.

#### `POST /api/routine/:id/reaction`
**Body:** `{ stepTitle, productType, ingredients, reaction, weeksUsed, notes? }`
**Action:** Create `product_reactions` document.

---

### 7.5 Admin Routes (`/api/admin`)
All require Bearer token + `role: admin`.

#### `GET /api/admin/users`
**Query:** `page`, `limit`, `search`, `role`
**Response:** Paginated users list

#### `PUT /api/admin/users/:id/role`
**Body:** `{ role }`
**Action:** Update role. Invalidate user cache.

#### `GET /api/admin/analytics`
**Response:**
```json
{
  "totalUsers": 0,
  "totalAnalyses": 0,
  "analysesLast30Days": 0,
  "avgOverallScore": 0,
  "conditionDistribution": { "acne": 0, "pigmentation": 0, "wrinkles": 0, "blackheads": 0, "hydration": 0 },
  "srUsageRate": 0,
  "topConcerns": [],
  "userGrowthByMonth": [],
  "avgAnalysisLatencyMs": 0
}
```

#### `GET /api/admin/jobs`
**Response:** Recent analysis jobs with status breakdown

---

### 7.6 Brand Partner Routes (`/api/v1/partner`)
**Auth:** Custom `X-Brand-API-Key` header. Verified against hashed key in `brands` collection.
**Rate Limit:** Per brand tier (Starter: 100/min, Growth: 500/min, Enterprise: 2000/min)
**All requests logged to `brand_api_logs`.**

#### `POST /api/v1/partner/recommend`
**Body:**
```json
{
  "skinProfile": {
    "type": "oily",
    "concerns": ["acne", "hyperpigmentation"],
    "fitzpatrick": 4,
    "ageRange": "26-35",
    "allergies": ["fragrance"],
    "zonalSeverity": {
      "tZone": { "acne": 72, "oiliness": 80 },
      "leftCheek": { "pigmentation": 55 }
    }
  },
  "context": {
    "humidity": 78,
    "uvIndex": 6,
    "aqi": 45
  },
  "catalogProductTypes": ["moisturizer", "serum", "cleanser", "spf"],
  "budget": "medium",
  "routineType": "morning"
}
```
**Response:**
```json
{
  "recommendations": [
    {
      "productType": "moisturizer",
      "routineStep": "AM moisturizer",
      "idealIngredients": ["niacinamide", "hyaluronic acid", "zinc"],
      "avoidIngredients": ["fragrance", "alcohol denat"],
      "rationale": "Lightweight gel formula suited for oily T-zone...",
      "confidence": 0.91,
      "stepOrder": 3
    }
  ],
  "routineContext": { "humidity": 78, "uvIndex": 6 },
  "requestId": "req_abc123"
}
```

#### `GET /api/v1/partner/analytics/overview`
**Auth:** Brand API key
**Response:** Aggregate stats for that brand's associated user cohort (users who have logged their catalog products). Zero PII. Minimum cohort size enforced: if <50 users, returns `{ "error": "INSUFFICIENT_COHORT_SIZE" }`.

#### `GET /api/v1/partner/analytics/skin-distribution`
**Query:** `concern`, `ageRange`, `fitzpatrick`, `region`
**Response:** Aggregate distribution data for requested segment.

#### `POST /api/v1/partner/validate-key`
**Body:** `{ apiKey }`
**Response:** `{ valid: true, brandName, tier, callsRemaining }`

---

### 7.7 Internal Routes (Docker network only — not exposed via Nginx)

#### Python SR Service: `POST http://sr_service:7001/enhance`
**Body:** `multipart/form-data` with `image` field
**Response:** JSON `{ enhancedImageBase64: "...", srModel: "RealESRGAN_x4plus", originalSize: "480x640", enhancedSize: "1920x2560", processingTimeMs: 1240 }`

#### Python ML Service: `POST http://python_service:7000/analyze-image`
**Body:** `multipart/form-data` with `image` field + optional `metadata` JSON field `{ fitzpatrickHint, contextHumidity, contextUV }`
**Response:** Full analysis JSON (see Section 11 for exact schema)

---

### 7.8 WebSocket Events (Socket.io)

#### Server → Client Events
| Event | Payload | Trigger |
|---|---|---|
| `job:status` | `{ jobId, status, progress }` | Job status changes |
| `job:complete` | `{ jobId, analysisId, overallScore, delta }` | Analysis finished |
| `job:failed` | `{ jobId, error }` | Analysis failed |
| `routine:completed` | `{ streakCurrent, streakLongest, message }` | Full routine completion |
| `notification:reminder` | `{ message, routineType }` | Scheduled reminder |

#### Client → Server Events
| Event | Payload | Action |
|---|---|---|
| `subscribe:job` | `{ jobId }` | Join job room for updates |
| `subscribe:user` | `{ uid }` | Join user room |

---

## 8. Feature Specifications — User-Facing

### 8.1 Skin Analysis Flow (Async)
1. User navigates to `/analyze`.
2. Dropzone accepts JPEG/PNG up to 15MB. Show preview immediately on drop.
3. Display guidance overlay: "Face centered, good lighting, no glasses."
4. On submit: call `POST /api/analyze`. Receive `jobId`.
5. Subscribe to Socket.io `subscribe:job` event with jobId.
6. Show animated progress UI with stages: "Uploading → Enhancing image → Detecting zones → Scoring conditions → Generating insights"
7. Update progress stage on each `job:status` event.
8. On `job:complete`: navigate to `/analysis/{analysisId}` results page.
9. On `job:failed`: show specific error message + retry button.

### 8.2 Analysis Results Page (`/analysis/:id`)
Display the following sections in order:

**Header section:**
- Overall skin health score (0–100) as animated circular progress gauge
- Delta vs. previous analysis (e.g., "+8 points improved")
- IGA Grade badge
- SR badge if super-resolution was applied ("Enhanced with AI")
- Image quality flags if any ("Slight angle detected")

**Condition breakdown section:**
- 5 cards: Acne, Blackheads, Wrinkles, Pigmentation, Hydration
- Each card: severity score, severity label (Clear/Mild/Moderate/Severe/Very Severe), delta indicator, trend sparkline from history

**Zonal map section:**
- Illustrated face diagram with 5 zones highlighted
- Each zone clickable — shows zone-specific scores on click
- Color intensity encodes severity (green = low, amber = moderate, red = high)

**Image comparison section:**
- Side-by-side: original upload vs. annotated analysis image (with detection overlays)
- If SR was applied: three-way comparison (original → SR-enhanced → annotated)
- Images fetched via `GET /api/analysis/:id/image/:type` signed URL

**Routine recommendation section:**
- "Generate your personalized routine based on this analysis" CTA button
- If routine already generated from this analysis: show summary + link to full routine

### 8.3 Progress Tracking Page (`/progress`)
- Line chart (Recharts): overall score over time, last 90 days
- Multi-line chart: each condition severity over time
- Selectable date range: 30d / 60d / 90d / All time
- Calendar heatmap: analysis dates marked
- "Best skin day" callout — date with highest overall score
- "Skin trajectory" — trend arrow (improving / stable / declining) based on linear regression of last 5 analyses

### 8.4 Personalized Routine Page (`/routine`)

**Routine header:**
- Morning / Night toggle tabs
- Current streak badge + longest streak badge
- "Regenerate routine" button (with confirmation if one already exists)

**Routine steps:**
- Each step as an expandable card showing: step number, title, product type, recommended ingredients, ingredients to avoid, rationale (from LLM), estimated time, complete checkbox
- Context banner: "Routine adapted for today — Humidity 78%, UV Index 6, AQI: Moderate"
- Ingredient conflict notice if any were resolved: "We avoided mixing retinol + AHA in the same step"

**Daily checkin panel (sidebar or collapsible):**
- 4 quick-tap inputs: Sleep Quality (1–5 stars), Stress (1–5), Water Intake (Low/Good/High), Skin Feel (emoji selection)
- Submits to `POST /api/user/checkin`
- Shows "Routine will be refreshed with today's context" toast on submit

**Product reaction log:**
- After marking a step complete: optional "How did this work for you?" prompt
- Reaction options: 👍 Positive / 😐 Neutral / ⚠️ Irritation / ❌ Breakout
- Submits to `POST /api/routine/:id/reaction`

### 8.5 History Page (`/history`)
- Paginated grid of past analysis cards
- Each card: date, overall score, top concern, thumbnail of annotated image
- Filter by date range
- "Compare" mode: select two analyses → side-by-side delta comparison

### 8.6 Daily Check-in Widget
- Persistent widget on dashboard/home showing today's checkin status
- If not completed: animated nudge
- Completion feeds into next routine generation automatically

### 8.7 Skin Quiz Page (`/quiz`)
- Multi-step quiz (6 steps): skin type, concerns, allergies, age range, budget, routine level
- Progress bar
- On complete: update `user.skinProfile` + generate initial routine

### 8.8 Gamification
- Streak display with fire animation at 7+ days
- Milestone badges: "7 Day Warrior", "30 Day Glow", "First Analysis", "Skin Improved 10 Points"
- Badges stored on user document: `user.badges: [{ id, earnedAt }]`

---

## 9. Feature Specifications — B2B Brand Portal

### 9.1 Brand Authentication
- Separate login at `/brand/login`
- Credentials: email + password (Firebase Auth, same system, different role)
- On login: redirect to `/brand/dashboard`
- Brand users can only see data for their own brand cohort

### 9.2 Brand Dashboard (`/brand/dashboard`)

**Overview cards (top row):**
- Total cohort users (users who logged their products)
- Average overall skin score for cohort
- Most common concern in cohort
- Month-over-month cohort improvement rate

**Skin profile distribution (charts):**
- Pie chart: skin type distribution
- Bar chart: concern frequency
- Pie chart: Fitzpatrick type distribution
- Bar chart: age range distribution

**Product efficacy section:**
- For each product type in brand's catalog: average before/after delta for users who consistently used it (≥4 weeks)
- Bar chart comparison

**Geographic distribution:**
- Map component: aggregate concern severity by region/city
- Powered by anonymized location data from user city field

**Segment builder:**
- Filter controls: concern, ageRange, fitzpatrick, budget, region
- All chart panels update to reflect the filtered segment
- Export segment summary as CSV (aggregate stats only, no PII)

### 9.3 Brand API Key Management (`/brand/api-keys`)
- View current API key (masked: `sk_live_abc...xyz`)
- Regenerate key (with confirmation)
- View usage: calls this month, calls remaining, tier limit
- View API logs: last 100 calls with endpoint, timestamp, response code

### 9.4 Brand API Documentation (`/brand/docs`)
- Interactive API reference (OpenAPI/Swagger UI embedded)
- Code examples in JavaScript, Python, cURL

---

## 10. Super-Resolution Pipeline

### 10.1 SR Service Architecture (`/sr_service`)

**New microservice. Completely separate from `python_service`.**

**File structure:**
```
sr_service/
├── app.py                    # Flask app, single route: POST /enhance
├── sr_processor.py           # SRProcessor class
├── quality_gate.py           # QualityGate class
├── requirements.txt
├── Dockerfile
└── weights/                  # Downloaded at build time
    ├── RealESRGAN_x4plus.pth
    └── GFPGANv1.4.pth
```

### 10.2 `quality_gate.py` — QualityGate Class

Implement a `QualityGate` class with a `check(img_bgr)` method returning:
```python
{
  "passed": bool,
  "qualityScore": int,       # 0–100
  "flags": list[str],        # ['BLUR', 'ANGLE', 'TOO_SMALL', 'LOW_LIGHT']
  "needsSR": bool,
  "faceDetected": bool,
  "faceBbox": list or None   # [x1, y1, x2, y2]
}
```

**Checks (in order):**
1. **Face detection:** Use MediaPipe FaceDetector (not FaceMesh — faster). If no face detected, set `faceDetected: false`, `passed: false`, add flag `NO_FACE`.
2. **Resolution check:** If `min(height, width) < 720` OR face short-axis < 300px → set `needsSR: true`.
3. **Blur check:** `cv2.Laplacian(gray, cv2.CV_64F).var()`. If < 80.0 → add flag `BLUR`, set `passed: false` (reject — SR cannot fix blur).
4. **Face angle check:** If MediaPipe face detection confidence < 0.7 OR estimated yaw > 20° → add flag `ANGLE`, reduce quality score but do not hard-reject (allow with warning).
5. **Lighting check:** Compute mean L-channel value in LAB colorspace. If L-mean < 80 or > 220 → add flag `LOW_LIGHT` or `OVEREXPOSED`.
6. **Face coverage:** Face bbox area / total image area. If < 0.08 → add flag `FACE_TOO_SMALL`.
7. **Quality score:** Composite 0–100 from weighted checks: sharpness (40%), face coverage (30%), lighting (20%), angle (10%).

### 10.3 `sr_processor.py` — SRProcessor Class

```python
class SRProcessor:
    """
    Initialized once at Flask startup. Not per-request.
    Supports two models: RealESRGAN_x4plus (general) and GFPGAN (face-aware).
    Select model based on image content: if face is >40% of image area, use GFPGAN.
    """
    
    def select_model(self, face_coverage_ratio: float) -> str:
        # face_coverage_ratio = face_area / total_image_area
        return 'GFPGAN' if face_coverage_ratio > 0.4 else 'RealESRGAN_x4plus'

    def enhance(self, img_bgr: np.ndarray, model_name: str) -> tuple[np.ndarray, str]:
        # Returns (enhanced_img_bgr, model_name_used)
        # Use tile=400, tile_pad=10, half=True for GPU / half=False for CPU
        pass

    def post_process(self, enhanced: np.ndarray, target_size=(1280, 1280)) -> np.ndarray:
        # Downscale to max 1280×1280 using cv2.INTER_AREA after SR
        # This is the image passed to the ML analysis service
        # Do NOT pass the full 4× upscaled image to YOLO (memory waste)
        pass
```

### 10.4 Flask Route in `sr_service/app.py`

`POST /enhance`:
1. Receive image file from Node.js (multipart).
2. Decode to numpy array via OpenCV.
3. Run `QualityGate.check(img)`.
4. If `passed: false` and `flags` contains `BLUR` or `NO_FACE`: return `{ "error": "QUALITY_GATE_FAILED", "flags": [...] }` with HTTP 422.
5. If `needsSR: false`: return `{ "srApplied": false, "imageBase64": <original_as_base64>, "qualityResult": {...} }`.
6. If `needsSR: true`: select model → run `SRProcessor.enhance()` → run `post_process()`.
7. Return `{ "srApplied": true, "srModel": "GFPGAN", "imageBase64": <enhanced_as_base64>, "originalSize": "480x640", "enhancedSize": "1920x2560", "postProcessedSize": "1280x1280", "processingTimeMs": 1240, "qualityResult": {...} }`.

### 10.5 Bull Queue Worker Integration

The Node.js Bull queue worker (in `backend/workers/analysisWorker.js`) processes jobs as follows:

```
Job received: { jobId, uid, imageS3Key, city }

Step 1: Update job status → 'sr_processing'
         Emit Socket.io: job:status { jobId, status: 'sr_processing', progress: 10 }

Step 2: Download image from S3 using imageS3Key

Step 3: POST image to sr_service:7001/enhance
         If error QUALITY_GATE_FAILED: update job status → 'failed', emit job:failed

Step 4: If srApplied: upload enhanced image to S3
         Key: analyses/{uid}/{timestamp}_enhanced.jpg
         Update job status → 'analyzing'
         Emit Socket.io: job:status { jobId, status: 'analyzing', progress: 40 }

Step 5: Fetch weather from OpenWeatherMap for user's city (or cache)

Step 6: POST image to python_service:7000/analyze-image
         Send: enhanced image (if SR applied) or original image
         Include metadata: { fitzpatrickHint, contextHumidity, contextUV, contextAQI }
         Emit Socket.io: job:status { jobId, status: 'analyzing', progress: 70 }

Step 7: Receive analysis JSON from python_service

Step 8: Save SkinAnalysis document to MongoDB
         Include imageMetadata, all severity scores, zonalSeverity, igaGrade

Step 9: Update analysis_jobs document → status: 'complete', resultAnalysisId

Step 10: Emit Socket.io: job:complete { jobId, analysisId, overallScore, delta }
```

---

## 11. AI & Computer Vision Pipeline

### 11.1 ML Service Architecture (`/python_service`)

The agent must refactor `python_service/app.py` to use the following pipeline. The existing `yolo/` directory is replaced by the Ultralytics YOLOv8 package.

**File structure (updated):**
```
python_service/
├── app.py                      # Flask app
├── pipeline/
│   ├── __init__.py
│   ├── face_processor.py       # MediaPipe face mesh + zone masking
│   ├── acne_detector.py        # YOLOv8-seg acne detection
│   ├── condition_analyzer.py   # Blackheads, wrinkles, pigmentation, hydration
│   ├── colorimetry.py          # Fitzpatrick, CIE Lab, ITA angle
│   ├── severity_scorer.py      # Normalize raw counts → 0-100 scores
│   ├── zone_mapper.py          # Zone-specific scoring from mesh landmarks
│   └── annotator.py            # Draw overlays on image for display
├── models/
│   └── best.pt                 # Existing YOLOv5 weights (kept as fallback)
├── weights/
│   └── (YOLOv8 weights auto-downloaded by ultralytics on first run)
├── requirements.txt
└── Dockerfile
```

### 11.2 Analysis Pipeline Execution Order

```
receive_image(img_bytes)
    │
    ▼
face_processor.extract_mesh(img)
    → 468 landmarks
    → face_bbox
    → skin_mask (excludes eyes, lips, brows)
    → zone_masks: { tZone, leftCheek, rightCheek, forehead, perioral }
    │
    ▼
colorimetry.analyze(img, skin_mask)
    → fitzpatrickEstimate (1–6)
    → itaAngle (float)
    → labValues (L*, a*, b* means)
    │
    ▼
acne_detector.detect(img, skin_mask)
    → detections: [{ bbox, confidence, segmentation_mask, area_px }]
    → totalCount
    → totalArea
    │
    ▼
condition_analyzer.analyze(img, skin_mask, zone_masks)
    → blackheads: { count }
    → wrinkles: { edgeDensity }
    → pigmentation: { count, uniformityScore }
    → hydration: { textureScore }
    │
    ▼
zone_mapper.compute_zone_scores(img, zone_masks, detections)
    → zonalSeverity for each of 5 zones
    │
    ▼
severity_scorer.compute(raw, fitzpatrick)
    → normalized severity dict (0–100 per condition)
    → overallScore
    → igaGrade (0–4)
    │
    ▼
annotator.draw(img, detections, zone_masks)
    → annotated_img_bytes (PNG)
    │
    ▼
return analysis_result JSON
```

### 11.3 YOLOv8-seg Integration

Use `ultralytics.YOLO` for acne detection. Load at app startup:

```python
from ultralytics import YOLO
model = YOLO('yolov8n-seg.pt')  # start with nano for speed; upgrade to yolov8m-seg for accuracy
# Fine-tune on existing best.pt weights: model = YOLO('models/best.pt') if compatible, else retrain
```

Detection call per image:
```python
results = model(img_rgb, conf=0.25, iou=0.45, imgsz=640)
# Extract: results[0].boxes.xyxy, results[0].masks.data, results[0].boxes.conf
```

Compute `totalArea` as sum of non-zero pixels across all segmentation masks.

### 11.4 Zone Mapping (MediaPipe Landmarks)

Define zone landmark index sets from MediaPipe's 468-point mesh:

```python
ZONE_LANDMARKS = {
    'tZone': [
        # Nose: 1, 2, 3, 4, 5, 6, 168, 195, 197, 419
        # Center forehead bridge: 9, 8, 107, 336, 151
        # Nose tip to chin center: 4, 5, 195, 197, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18
    ],
    'leftCheek': [
        # Left cheek: 116, 117, 118, 119, 120, 121, 126, 142, 203, 206, 207, 213
    ],
    'rightCheek': [
        # Right cheek: 345, 346, 347, 348, 349, 350, 355, 371, 423, 426, 427, 433
    ],
    'forehead': [
        # Upper forehead: 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379
    ],
    'perioral': [
        # Around mouth: 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95
    ]
}
```

Agent must look up the exact landmark indices from the MediaPipe documentation for these facial regions and define them accurately.

### 11.5 Severity Scoring Normalization

```python
def normalize_acne(count, total_area_px, fitzpatrick):
    # Base score from count: log-scaled, capped
    count_score = min(100, int(np.log1p(count) * 20))
    # Area bonus: large lesion area increases severity
    area_score = min(30, int(total_area_px / 500))
    # Fitzpatrick adjustment: types IV-VI baseline pigmentation
    # reduces false positives from pigmentation → acne confusion
    fitzpatrick_adj = -5 if fitzpatrick >= 4 else 0
    return min(100, max(0, count_score + area_score + fitzpatrick_adj))

def compute_iga_grade(acne_severity):
    if acne_severity == 0: return 0      # Clear
    elif acne_severity <= 20: return 1   # Almost clear
    elif acne_severity <= 40: return 2   # Mild
    elif acne_severity <= 65: return 3   # Moderate
    else: return 4                       # Severe
```

### 11.6 Analysis Result JSON Schema (returned by python_service)

```json
{
  "raw": {
    "acne": { "label": "moderate", "count": 12, "totalArea": 3420 },
    "blackheads": { "count": 8 },
    "wrinkles": { "edgeDensity": 0.032 },
    "pigmentation": { "count": 5, "uniformityScore": 0.74 },
    "hydration": { "textureScore": 0.61 }
  },
  "severity": {
    "acne": 58,
    "blackheads": 32,
    "wrinkles": 24,
    "pigmentation": 41,
    "hydration": 38
  },
  "zonalSeverity": {
    "tZone":      { "acne": 72, "oiliness": 68, "hydration": 30 },
    "leftCheek":  { "acne": 22, "pigmentation": 45, "hydration": 55 },
    "rightCheek": { "acne": 18, "pigmentation": 40, "hydration": 60 },
    "forehead":   { "acne": 55, "wrinkles": 20, "oiliness": 65 },
    "perioral":   { "acne": 30, "dryness": 40 }
  },
  "overallScore": 61,
  "igaGrade": 3,
  "fitzpatrickEstimate": 3,
  "annotatedImageBase64": "...",
  "processingTimeMs": 2140,
  "modelVersion": "v2.0"
}
```

---

## 12. Hyper-Personalization Engine

### 12.1 RoutineContext Object

Built in Node.js before calling the LLM. Every field must be populated; use `null` for unavailable data.

```javascript
const RoutineContext = {
  // User identity
  skinType: user.skinProfile.skinType,
  concerns: user.skinProfile.concerns,
  allergies: user.skinProfile.allergies,
  fitzpatrick: analysis?.fitzpatrickAtAnalysis ?? user.skinProfile.fitzpatrickEstimate,
  ageRange: user.skinProfile.ageRange,
  budget: user.preferences.budget,
  routineLevel: user.preferences.routineLevel,
  routineType: 'morning' | 'night',

  // Latest analysis
  latestSeverity: analysis?.severity ?? null,
  zonalSeverity: analysis?.zonalSeverity ?? null,
  igaGrade: analysis?.igaGrade ?? null,
  overallScore: analysis?.overallScore ?? null,

  // Environmental context
  humidity: weatherData?.humidity ?? null,
  uvIndex: weatherData?.uvIndex ?? null,
  aqi: weatherData?.aqi ?? null,
  temperature: weatherData?.temperature ?? null,

  // Lifestyle signals
  sleepQuality: todayCheckin?.sleepQuality ?? user.lifestyleProfile.sleepQuality,
  stressLevel: todayCheckin?.stressLevel ?? user.lifestyleProfile.stressLevel,
  waterIntake: todayCheckin?.waterIntake ?? null,
  skinFeel: todayCheckin?.skinFeel ?? null,

  // Product history (last 10 reactions)
  productHistory: recentReactions.map(r => ({
    productType: r.productType,
    reaction: r.reaction,
    weeksUsed: r.weeksUsed
  })),

  // Previous routine for continuity
  previousRoutineSteps: currentRoutine?.steps.map(s => s.title) ?? []
}
```

### 12.2 LLM System Prompt (Anthropic API)

The agent must implement this exact system prompt. Store it in `backend/prompts/routineSystemPrompt.js` so it can be versioned.

```
You are SkinWise, an expert dermatologist and skincare formulation specialist. Your task is to generate a personalized skincare routine.

RULES:
1. Output ONLY valid JSON matching the schema below. No preamble, no markdown, no explanation outside the JSON.
2. Generate exactly 4–7 steps for 'morning' routines and 4–6 steps for 'night' routines.
3. NEVER recommend ingredients listed in user.allergies.
4. NEVER recommend retinol and AHA/BHA in the same routine.
5. NEVER recommend vitamin C and niacinamide in the same step (they can be in different steps).
6. If uvIndex > 5, step containing SPF is MANDATORY and must be the final morning step.
7. If humidity > 75, recommend lightweight gel formulations. If humidity < 30, recommend occlusives/ceramides.
8. If aqi > 100, include an antioxidant serum step (vitamin C, niacinamide, or green tea).
9. If sleepQuality <= 2, increase emphasis on barrier repair ingredients.
10. If stressLevel >= 4, avoid fragranced products regardless of allergy list.
11. Each rationale field must be 1 sentence, user-friendly, no jargon. Explain WHY this step addresses their specific situation.
12. List conflicts you resolved in ingredientConflictsResolved.
13. List allergies you screened out in allergyMatchesAvoided.

OUTPUT JSON SCHEMA:
{
  "steps": [
    {
      "stepOrder": 1,
      "title": "string",
      "productType": "string",
      "recommendedIngredients": ["string"],
      "avoidIngredients": ["string"],
      "instructions": "string (1–2 sentences)",
      "rationale": "string (1 sentence, user-facing)",
      "estimatedTime": number
    }
  ],
  "ingredientConflictsResolved": ["string"],
  "allergyMatchesAvoided": ["string"],
  "contextSummary": "string (1 sentence — what context most influenced this routine)"
}
```

### 12.3 LLM API Call Implementation

```javascript
// backend/services/routineGenerator.js

const generateRoutine = async (context) => {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: ROUTINE_SYSTEM_PROMPT,  // from backend/prompts/routineSystemPrompt.js
    messages: [{
      role: 'user',
      content: `Generate a ${context.routineType} skincare routine for this user:\n${JSON.stringify(context, null, 2)}`
    }]
  });

  const rawText = response.content[0].text;
  
  // Strip any accidental markdown fences
  const cleanJson = rawText.replace(/```json|```/g, '').trim();
  
  // Parse and validate with Zod
  const parsed = JSON.parse(cleanJson);
  return RoutineOutputSchema.parse(parsed);  // throws ZodError if invalid
};
```

### 12.4 Zod Validation Schema for LLM Output

```javascript
// backend/schemas/routineSchema.js
import { z } from 'zod';

const StepSchema = z.object({
  stepOrder: z.number().int().min(1).max(10),
  title: z.string().min(2).max(100),
  productType: z.string().min(2).max(60),
  recommendedIngredients: z.array(z.string()).min(1).max(8),
  avoidIngredients: z.array(z.string()).max(6),
  instructions: z.string().min(10).max(300),
  rationale: z.string().min(10).max(200),
  estimatedTime: z.number().int().min(1).max(30)
});

export const RoutineOutputSchema = z.object({
  steps: z.array(StepSchema).min(3).max(8),
  ingredientConflictsResolved: z.array(z.string()),
  allergyMatchesAvoided: z.array(z.string()),
  contextSummary: z.string().min(10).max(200)
});
```

### 12.5 Weather Integration

```javascript
// backend/services/weatherService.js

const getWeather = async (city) => {
  const cacheKey = `cache:weather:${city.toLowerCase().replace(/\s/g, '_')}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
  
  // Fetch weather, then fetch AQI using lat/lon from weather response
  // Extract: humidity, temp, uv_index (from onecall or UV endpoint), aqi (from air_pollution)
  
  const result = { humidity, temperature, uvIndex, aqi, city, fetchedAt: new Date() };
  await redis.setex(cacheKey, 3600, JSON.stringify(result));
  return result;
};
```

---

## 13. Frontend Interface Specification

### 13.1 Route Map

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `HomePage` | No | Landing page |
| `/login` | `LoginPage` | No | Firebase login |
| `/register` | `RegisterPage` | No | Registration |
| `/dashboard` | `DashboardPage` | Yes | User home |
| `/analyze` | `AnalyzePage` | Yes | Upload + async analysis flow |
| `/analysis/:id` | `AnalysisResultPage` | Yes | Results display |
| `/progress` | `ProgressPage` | Yes | Charts + history |
| `/routine` | `RoutinePage` | Yes | Active routines |
| `/history` | `HistoryPage` | Yes | Past analyses grid |
| `/quiz` | `QuizPage` | Yes | Skin profile quiz |
| `/profile` | `ProfilePage` | Yes | User settings |
| `/consultation` | `ConsultationPage` | Yes | Consultation booking |
| `/blog` | `BlogPage` | No | Articles |
| `/about` | `AboutPage` | No | About |
| `/contact` | `ContactPage` | No | Contact |
| `/admin` | `AdminDashboard` | Admin only | Admin panel |
| `/brand/login` | `BrandLoginPage` | No | Brand auth |
| `/brand/dashboard` | `BrandDashboard` | Brand admin | Brand analytics |
| `/brand/api-keys` | `BrandApiKeys` | Brand admin | API key management |
| `/brand/docs` | `BrandDocs` | Brand admin | API docs |

### 13.2 Global State (Zustand)

```javascript
// frontend/src/stores/

// authStore.js — user identity
{ user, firebaseUser, token, isLoading, login, logout, refreshToken }

// analysisStore.js — current analysis job state
{ activeJobId, jobStatus, jobProgress, latestAnalysis, analysisHistory }

// routineStore.js — active routines
{ morningRoutine, nightRoutine, streakData, fetchRoutines, markStepComplete }

// uiStore.js — UI state
{ theme, sidebarOpen, notifications }
```

### 13.3 React Query Hooks

Implement these hooks in `frontend/src/hooks/`:

```javascript
useUserProfile()           // GET /api/user/profile — staleTime: 5min
useAnalysisHistory(page)   // GET /api/analysis/history — paginated
useAnalysis(id)            // GET /api/analysis/:id
useRoutine(type)           // GET /api/routine?type=morning|night
useStreak()                // derived from routine data
useTodayCheckin()          // GET /api/user/checkin/today
useAdminAnalytics()        // GET /api/admin/analytics — admin only
useBrandOverview()         // GET /api/v1/partner/analytics/overview — brand only
```

### 13.4 Key Component Specifications

**`<SkinScoreGauge score={number} delta={number} />`**
- Animated SVG arc — draws from 0 to score value on mount
- Color: 0–30 red, 31–60 amber, 61–80 green, 81–100 teal
- Delta badge below: "+8" in green or "-3" in red

**`<ConditionCard condition="acne" severity={58} delta={-12} history={[...]} />`**
- Severity label mapped: 0–10 Clear, 11–25 Almost Clear, 26–45 Mild, 46–65 Moderate, 66–80 Severe, 81–100 Very Severe
- Trend sparkline using Recharts `<LineChart>`
- Delta: green arrow down = improvement, red arrow up = worsening

**`<FaceZoneMap zones={zonalSeverity} />`**
- SVG face outline divided into 5 clickable zones
- Zone fill color intensity = severity (low opacity green → high opacity red)
- Click zone → show `<ZoneDetailPanel>` with that zone's metrics

**`<AnalysisProgressTracker jobId={string} />`**
- Connects to Socket.io on mount, unsubscribes on unmount
- Visual step tracker with 5 stages (icons + labels)
- Animated progress bar between stages
- Auto-navigates to results page on `job:complete` event

**`<RoutineStepCard step={step} onComplete={fn} onReaction={fn} />`**
- Expandable — collapsed shows title + productType + time estimate
- Expanded shows ingredients, rationale, instructions
- Complete checkbox with animation
- Reaction prompt appears after checking complete

**`<DailyCheckinWidget />`**
- 4 inputs rendered as large tap-target buttons (mobile-friendly)
- Submits via `POST /api/user/checkin`
- Shows completion state with timestamp

### 13.5 Styling Rules

- Use Tailwind CSS utility classes throughout. No custom CSS files except for animations.
- Color palette: Tailwind `rose-*` for danger/high severity, `amber-*` for moderate, `emerald-*` for good, `sky-*` for info.
- Typography: `font-sans` everywhere. Headings `font-semibold`. Body `font-normal`.
- Dark mode: implement via Tailwind `dark:` classes. Toggled by `ThemeContext` (existing).
- Responsive: all layouts must work on mobile (375px) and desktop (1280px+). Use `sm:`, `md:`, `lg:` breakpoints.
- Animations: use Framer Motion for page transitions and score gauge animation. Keep durations under 400ms.

---

## 14. Infrastructure & DevOps

### 14.1 Docker Compose (`docker-compose.yml`)

The agent must produce a complete `docker-compose.yml` with these services:

```yaml
services:
  nginx:          # port 80:80, 443:443 — gateway
  backend:        # port 5000, depends_on: mongodb, redis
  frontend:       # port 3000
  python_service: # port 7000, depends_on: (none external)
  sr_service:     # port 7001 (NEW)
  mongodb:        # port 27017, volume: mongo_data
  redis:          # port 6379, volume: redis_data

networks:
  skinwise_network:  # internal, all services on this network

volumes:
  mongo_data:
  redis_data:
```

All services must have:
- `restart: unless-stopped`
- Health checks (`healthcheck` key with `test`, `interval`, `timeout`, `retries`)
- Environment variables via `.env` file reference (never hardcoded)

### 14.2 Environment Variables

The agent must create `.env.example` with all required variables:

```env
# Node.js API
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/skinwise
REDIS_URL=redis://redis:6379

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AWS S3 / Cloudflare R2
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=  # for R2: https://{account_id}.r2.cloudflarestorage.com

# External APIs
OPENWEATHER_API_KEY=
ANTHROPIC_API_KEY=
TWINGLY_API_KEY=

# Internal service URLs
PYTHON_SERVICE_URL=http://python_service:7000
SR_SERVICE_URL=http://sr_service:7001

# Brand API
BRAND_JWT_SECRET=  # for signing brand API keys

# Frontend (Vite)
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

### 14.3 Nginx Configuration

`nginx/nginx.conf` must configure:
- Upstream blocks for `backend`, `frontend`, `python_service` (internal only)
- `location /api/` → proxy to backend:5000
- `location /socket.io/` → proxy to backend:5000 with WebSocket upgrade headers
- `location /` → proxy to frontend:3000
- Rate limiting zone: `limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m`
- Apply rate limit to `location /api/analyze`
- Gzip compression enabled
- Max body size: 20MB (for image uploads)
- Do NOT proxy `/api/v1/partner/` to python services — it stays on Node.js

### 14.4 Dockerfile Specifications

**`sr_service/Dockerfile`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 wget
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Download model weights at build time
RUN mkdir -p /app/weights && \
    wget -q "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" \
         -O /app/weights/RealESRGAN_x4plus.pth && \
    wget -q "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth" \
         -O /app/weights/GFPGANv1.4.pth
COPY . .
EXPOSE 7001
CMD ["python", "app.py"]
```

**`backend/Dockerfile`:** multi-stage build — `node:20-alpine` base, install deps, copy source, expose 5000.

**`python_service/Dockerfile`:** `python:3.11-slim` base with OpenGL libs, install deps, copy source, expose 7000.

### 14.5 Health Check Endpoints

Each service must implement `/health`:

**Node.js** (`GET /health`): check MongoDB connection + Redis ping. Return `{ status: 'ok', mongo: 'connected', redis: 'connected', uptime: N }`.

**Python ML** (`GET /health`): check YOLO model loaded + MediaPipe initialized. Return `{ status: 'ok', yolo: 'loaded', mediapipe: 'loaded' }`.

**SR Service** (`GET /health`): check Real-ESRGAN model loaded. Return `{ status: 'ok', realesrgan: 'loaded', gfpgan: 'loaded' }`.

### 14.6 Logging

Use Winston in Node.js. All logs output as JSON with fields: `timestamp`, `level`, `service`, `message`, `meta`.

Log the following events at minimum:
- Every incoming request: method, path, statusCode, latencyMs, uid (if authed)
- Every Bull job: jobId, event (queued/started/completed/failed), latencyMs
- Every LLM call: model, tokensUsed, latencyMs, success
- Every SR call: imageSize, srModel, processingTimeMs, srApplied
- Every brand API call: brandId, endpoint, latencyMs

---

## 15. Security Specification

### 15.1 Authentication Layers

| Layer | Mechanism | Where Applied |
|---|---|---|
| User auth | Firebase JWT (Bearer token) | All `/api/*` except public routes |
| Admin auth | Firebase JWT + `role: admin` check | `/api/admin/*` |
| Brand auth | Custom API key (hashed bcrypt in DB) | `/api/v1/partner/*` |
| Internal services | Docker internal network only (no auth needed) | python_service, sr_service |

### 15.2 Input Validation Rules

- All request bodies validated with Zod before any business logic executes.
- Image uploads: whitelist MIME types `['image/jpeg', 'image/png', 'image/webp']`. Verify magic bytes, not just Content-Type header. Reject files > 15MB.
- All MongoDB queries use Mongoose — no raw query string interpolation.
- Brand API keys: store only bcrypt hash in DB. Send plaintext once on creation. Never log plaintext keys.

### 15.3 Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| `POST /api/analyze` | 10 requests | 1 hour per user |
| `POST /api/routine/generate` | 5 requests | 24 hours per user |
| `POST /api/auth/*` | 20 requests | 15 minutes per IP |
| `/api/v1/partner/*` (Starter tier) | 100 requests | 1 minute per brand |
| `/api/v1/partner/*` (Growth tier) | 500 requests | 1 minute per brand |
| `/api/v1/partner/*` (Enterprise) | 2000 requests | 1 minute per brand |

### 15.4 Data Privacy

- Minimum cohort size enforcement: any brand analytics query aggregating fewer than 50 users returns `{ "error": "INSUFFICIENT_COHORT_SIZE" }`. This is enforced in the MongoDB aggregation pipeline with a `$match` after `$group` checking `count >= 50`.
- Image storage: all S3 objects are private. Access only via signed URLs (15-minute expiry).
- User consent flags: `dataConsentGiven` and `analyticsConsentGiven` are checked before including a user in any brand analytics aggregation.
- No raw images or PII ever included in brand API responses.
- Analysis images: original images deleted from hot S3 storage after 90 days (S3 lifecycle policy). Thumbnail and annotated versions kept.

---

## 16. Build Sequence — Agent Execution Order

The agent must follow this exact sequence. Do not skip steps or build out of order — later steps depend on earlier ones.

### Step 1: Infrastructure Foundation
1. Create `docker-compose.yml` with all 7 services, networks, volumes.
2. Create `.env.example` with all variables.
3. Create `nginx/nginx.conf`.
4. Verify existing MongoDB and Redis containers start cleanly.

### Step 2: SR Service (New Microservice)
1. Create `sr_service/` directory with full structure.
2. Implement `quality_gate.py` with all 7 checks.
3. Implement `sr_processor.py` with both model support.
4. Implement `sr_service/app.py` Flask routes `/enhance` and `/health`.
5. Write `sr_service/Dockerfile` (include weight downloads).
6. Write `sr_service/requirements.txt`.
7. Test: `curl -F "image=@test.jpg" http://localhost:7001/enhance` returns valid JSON.

### Step 3: Backend — Database Layer
1. Update all Mongoose models to match Section 6.1 exactly.
2. Add new models: `ProductReaction`, `DailyCheckin`, `AnalysisJob`, `Brand`, `BrandApiLog`.
3. Add all required indexes.
4. Seed script: create one admin user, one test brand.

### Step 4: Backend — Queue and Worker
1. Install Bull, configure queue `skinwise:analysis`.
2. Implement `backend/workers/analysisWorker.js` following the 10-step flow in Section 10.5.
3. Implement S3 upload/download utilities in `backend/services/s3Service.js`.
4. Implement weather service in `backend/services/weatherService.js`.
5. Start worker process alongside main server (use `bull-board` for queue monitoring UI at `/admin/queues`).

### Step 5: Backend — New API Routes
1. Implement `POST /api/analyze` (async version — pushes to queue, returns jobId).
2. Implement `GET /api/analyze/job/:jobId`.
3. Implement `POST /api/user/checkin` and `GET /api/user/checkin/today`.
4. Implement `POST /api/routine/generate` with LLM integration.
5. Implement `POST /api/routine/:id/reaction`.
6. Implement all `/api/v1/partner/*` routes.
7. Implement `GET /api/analysis/:id/image/:type` (signed URL).
8. Add Zod validation middleware to all new routes.

### Step 6: Python ML Service — Refactor
1. Create `python_service/pipeline/` directory with all modules.
2. Migrate from YOLOv5 to YOLOv8-seg (Ultralytics package).
3. Implement zone mapping with MediaPipe landmark indices.
4. Implement `colorimetry.py` with Fitzpatrick/ITA angle.
5. Update `app.py` to use the new pipeline sequence.
6. Update `/health` endpoint to check model loading.
7. Test: POST a face image, verify JSON response matches Section 11.6 schema.

### Step 7: Socket.io Integration
1. Confirm Socket.io server is initialized in `backend/server.js`.
2. Add room management: user rooms `user:{uid}`, job rooms `job:{jobId}`.
3. Emit all events specified in Section 7.8 from the Bull worker.
4. Test: open Socket.io client, submit analysis, observe events firing.

### Step 8: Frontend — State & Data Layer
1. Install all new packages (zustand, @tanstack/react-query, react-dropzone, framer-motion, date-fns).
2. Create Zustand stores: `authStore`, `analysisStore`, `routineStore`, `uiStore`.
3. Set up React Query provider in `main.jsx`.
4. Implement all custom hooks from Section 13.3.
5. Update axios instance to attach Firebase JWT from authStore.

### Step 9: Frontend — Core User Pages
1. Rebuild `AnalyzePage` with dropzone, quality guidance overlay, async progress tracker.
2. Build `AnalysisResultPage` with all 6 sections (Section 8.2).
3. Build `ProgressPage` with Recharts line charts and calendar.
4. Rebuild `RoutinePage` with LLM-generated routine display, checkin panel, reaction logging.
5. Build `HistoryPage` with paginated grid and comparison mode.
6. Update `DashboardPage` to show streak, latest score, today's checkin widget.

### Step 10: Frontend — Brand Portal
1. Implement `BrandLoginPage` and brand-specific `ProtectedRoute`.
2. Build `BrandDashboard` with all chart components (Section 9.2).
3. Build `BrandApiKeys` management page.
4. Build `BrandDocs` with embedded OpenAPI spec UI.

### Step 11: Frontend — Shared Components
1. Implement `<SkinScoreGauge />` with SVG animation.
2. Implement `<ConditionCard />` with sparkline.
3. Implement `<FaceZoneMap />` with clickable SVG zones.
4. Implement `<AnalysisProgressTracker />` with Socket.io integration.
5. Implement `<RoutineStepCard />` with expand/collapse and reaction prompt.
6. Implement `<DailyCheckinWidget />`.
7. Implement gamification badge display components.

### Step 12: Final Integration & Hardening
1. End-to-end test: upload image → SR applied → analysis complete → routine generated.
2. Verify all rate limits fire correctly.
3. Verify brand API key auth works and logs are written.
4. Verify cohort size guard on brand analytics.
5. Verify Socket.io events reach frontend correctly through Nginx proxy.
6. Verify signed S3 URLs work for all three image types.
7. Verify all health check endpoints return 200.
8. Generate final `docker-compose up --build` — all 7 containers must start and pass health checks.

---

## Appendix A: File Structure After Build

```
skinwise/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── server.js
│   ├── Dockerfile
│   ├── package.json
│   ├── config/
│   │   ├── firebaseAdmin.js
│   │   ├── redis.js
│   │   ├── s3.js                        # NEW
│   │   └── bull.js                      # NEW
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── analyzeController.js         # UPDATED
│   │   ├── routineController.js         # UPDATED
│   │   ├── brandController.js           # NEW
│   │   └── adminController.js           # UPDATED
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── brandAuthMiddleware.js        # NEW
│   │   ├── rateLimiter.js               # UPDATED
│   │   ├── requireAdmin.js
│   │   ├── validate.js                  # NEW — Zod validation middleware
│   │   └── requestLogger.js             # NEW
│   ├── models/
│   │   ├── User.js                      # UPDATED
│   │   ├── SkinAnalysis.js              # UPDATED
│   │   ├── Routine.js                   # UPDATED
│   │   ├── RoutineStreak.js
│   │   ├── ProductReaction.js           # NEW
│   │   ├── DailyCheckin.js              # NEW
│   │   ├── AnalysisJob.js               # NEW
│   │   ├── Brand.js                     # NEW
│   │   └── BrandApiLog.js               # NEW
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js                # UPDATED
│   │   ├── analyzeRoutes.js             # UPDATED
│   │   ├── routineRoutes.js             # UPDATED
│   │   ├── blogRoutes.js
│   │   ├── adminRoutes.js               # UPDATED
│   │   ├── adminAnalyticsRoutes.js      # UPDATED
│   │   └── brandRoutes.js               # NEW
│   ├── services/
│   │   ├── s3Service.js                 # NEW
│   │   ├── weatherService.js            # NEW
│   │   ├── routineGenerator.js          # NEW (LLM integration)
│   │   └── socketService.js             # NEW
│   ├── workers/
│   │   └── analysisWorker.js            # NEW
│   ├── schemas/
│   │   ├── routineSchema.js             # NEW (Zod)
│   │   └── analyzeSchema.js             # NEW (Zod)
│   └── prompts/
│       └── routineSystemPrompt.js       # NEW
├── frontend/
│   ├── src/
│   │   ├── stores/
│   │   │   ├── authStore.js             # NEW
│   │   │   ├── analysisStore.js         # NEW
│   │   │   ├── routineStore.js          # NEW
│   │   │   └── uiStore.js               # NEW
│   │   ├── hooks/
│   │   │   ├── useUserProfile.js        # NEW
│   │   │   ├── useAnalysis.js           # NEW
│   │   │   ├── useRoutine.js            # NEW
│   │   │   ├── useStreak.js             # NEW
│   │   │   ├── useCheckin.js            # NEW
│   │   │   └── useScrollPosition.jsx
│   │   ├── components/
│   │   │   ├── SkinScoreGauge.jsx       # NEW
│   │   │   ├── ConditionCard.jsx        # NEW
│   │   │   ├── FaceZoneMap.jsx          # NEW
│   │   │   ├── AnalysisProgressTracker.jsx  # NEW
│   │   │   ├── RoutineStepCard.jsx      # NEW
│   │   │   ├── DailyCheckinWidget.jsx   # NEW
│   │   │   ├── BadgeDisplay.jsx         # NEW
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── BrandRoute.jsx           # NEW
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── pages/
│   │       ├── AnalyzePage.jsx          # REBUILT
│   │       ├── AnalysisResultPage.jsx   # NEW
│   │       ├── ProgressPage.jsx         # NEW
│   │       ├── RoutinePage.jsx          # REBUILT
│   │       ├── HistoryPage.jsx          # NEW
│   │       ├── DashboardPage.jsx        # NEW
│   │       ├── brand/
│   │       │   ├── BrandLoginPage.jsx   # NEW
│   │       │   ├── BrandDashboard.jsx   # NEW
│   │       │   ├── BrandApiKeys.jsx     # NEW
│   │       │   └── BrandDocs.jsx        # NEW
│   │       └── ... (existing pages unchanged)
├── python_service/
│   ├── app.py                           # REFACTORED
│   ├── pipeline/                        # NEW DIRECTORY
│   │   ├── face_processor.py
│   │   ├── acne_detector.py
│   │   ├── condition_analyzer.py
│   │   ├── colorimetry.py
│   │   ├── severity_scorer.py
│   │   ├── zone_mapper.py
│   │   └── annotator.py
│   ├── models/
│   │   └── best.pt                      # Kept as fallback
│   ├── requirements.txt                 # UPDATED
│   └── Dockerfile                       # UPDATED
└── sr_service/                          # NEW SERVICE
    ├── app.py
    ├── sr_processor.py
    ├── quality_gate.py
    ├── requirements.txt
    └── Dockerfile
```

---

## Appendix B: Key Constraints for the Agent

1. Do not use `memoryStorage` for Multer in production paths. Always stream to S3.
2. Do not initialize ML models inside Flask request handlers. Initialize at module level (startup).
3. Do not hard-code any API keys, secrets, or connection strings. Use `process.env` / `os.environ` everywhere.
4. Do not return stack traces or internal error details to clients. Log internally, return sanitized messages.
5. The SR service must not be called synchronously in the HTTP request path. It is called inside the Bull worker only.
6. Brand analytics aggregation pipelines must always include a cohort size check (`count >= 50`) before returning data.
7. All new MongoDB queries must use indexes. Run `explain()` mentally — if a query would do a full collection scan on a large collection, add an index.
8. Socket.io events must be emitted from the Bull worker (server-side), not from HTTP response handlers.
9. The `python_service` and `sr_service` must never be directly accessible from the internet. Nginx must not proxy to them.
10. Every LLM call must have a try/catch with a fallback: if the LLM call fails or Zod validation of the response fails, fall back to the template-based routine generator from Phase 1 and log the failure.

---

*Document version: 2.0 | Generated: June 2026 | Stack: React 18 + Node.js/Express 5 + Python/Flask + MongoDB + Redis + Bull + Docker*
