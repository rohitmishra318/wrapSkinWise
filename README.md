# SkinWise: Comprehensive Skin Health Analysis Platform

SkinWise is a full-stack skin health analysis platform that leverages computer vision and machine learning to analyze facial skin conditions, including acne, blackheads, wrinkles, and pigmentation, providing users with personalized skincare routines.

## 🌟 Features
- **Facial Skin Analysis:** Uses a custom-trained YOLOv5 model for acne detection and MediaPipe for facial landmark extraction.
- **Image Enhancement:** Includes an advanced Super Resolution service (GFPGAN/RealESRGAN) to upscale and enhance facial images for more accurate analysis.
- **Personalized Routines:** Generates customized skincare routines based on analysis results.
- **Dashboard & Profiles:** Track analysis history and routine streaks over time.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, TailwindCSS, Zustand, React Query
- **Backend:** Node.js, Express, MongoDB, Redis, Firebase Admin, Bull (for background jobs)
- **ML Services:** Python, Flask, YOLOv5, MediaPipe, OpenCV
- **Super Resolution:** Python, Flask, GFPGAN, RealESRGAN
- **Infrastructure:** Docker, Docker Compose, Nginx

## 🚀 Getting Started

You can run SkinWise either using Docker (Recommended) or by running the services individually.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (For Docker setup)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/) (3.9+ recommended)
- MongoDB & Redis (if running locally without Docker)

### 1. Clone the repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Environment Variables Setup
You will need to set up your `.env` files. You can use the `.env.example` files as a guide.
Ensure you have the appropriate `.env` files created and populated in:
- `/` (Root directory - for Docker Compose)
- `/frontend`
- `/backend`

*Note: You will need Firebase credentials, a MongoDB URI, and a Redis URL properly configured to use all features locally without Docker.*

### 3. Running with Docker (Recommended)
This is the easiest way to start all interconnected services simultaneously (Frontend, Backend, ML Service, SR Service, DBs, and Nginx).

```bash
# In the root directory
docker-compose up --build
```
Once the containers are successfully running, the application will be accessible via your browser.

### 4. Running Services Individually (Local Development)

If you prefer to run services manually for active development:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```
*(Requires MongoDB and Redis to be running locally or externally accessible)*

**Python ML Service:**
```bash
cd python_service
pip install -r requirements.txt
python app.py
```

**Super Resolution (SR) Service:**
```bash
cd sr_service
pip install -r requirements.txt
python app.py
```

## 📊 SkinWise Architecture & Data Flow Diagrams

Here are some architecture diagrams to help you understand the internal working and features of the SkinWise project.

---

### 1. High-Level System Architecture
This diagram shows all the services running in the SkinWise ecosystem and how they interact.

```mermaid
graph TD
    %% Clients
    Client(Mobile/Web Client)
    Partner(Brand Partner / B2B)

    %% Backend Services
    subgraph NodeBackend [Node.js Backend]
        API[Express API Gateway]
        Socket[Socket.IO Server]
        Worker[BullMQ Worker]
    end

    %% External & ML Services
    subgraph PythonPipeline [Python ML Pipeline]
        SR[SR Service Flask]
        ML[Python Service Flask]
    end

    %% Databases & Queues
    Mongo[(MongoDB)]
    Redis[(Redis Cache / Bull)]
    S3[(AWS S3)]
    Auth[Firebase Auth]

    %% Connections
    Client -->|REST API Requests| API
    Client -->|Real-time Updates| Socket
    Socket -->|Real-time Updates| Client
    Partner -->|API Key Auth| API
    
    API -->|Validates Token| Auth
    API -->|Read/Write| Mongo
    API -->|Cache / Rate Limit| Redis
    API -->|Upload Image| S3
    API -->|Push ML Job| Redis
    
    Redis -->|Pull Job| Worker
    Worker -->|1. Image Enhancment| SR
    Worker -->|2. Analysis| ML
    Worker -->|Save Results| Mongo
    Worker -->|Emit Progress| Socket
```

---

### 2. The Asynchronous ML Inference Pipeline
This sequence diagram shows the non-blocking asynchronous analysis workflow.

```mermaid
sequenceDiagram
    participant User
    participant Express as Node.js API
    participant S3 as AWS S3
    participant Redis as Redis / Bull Queue
    participant Worker as Background Worker
    participant ML as Python ML Services
    participant Socket as Socket.IO

    User->>Express: POST /api/analyze (Image Upload)
    Express->>S3: Save Image
    Express->>Redis: Enqueue Analysis Job
    Express-->>User: 202 Accepted (Returns JobID)
    
    Note over User, Express: User HTTP request closes, preventing blocking
    
    Redis->>Worker: Dequeue Job
    Worker->>Socket: Emit 10% Progress (Started)
    Socket-->>User: Real-time update
    
    Worker->>ML: Send to SR Service (Super Resolution)
    Worker->>Socket: Emit 40% Progress (Enhanced)
    
    Worker->>ML: Send to Python Service (Analysis)
    ML-->>Worker: Return Acne, Score, Severity Data
    Worker->>Socket: Emit 70% Progress (Analyzed)
    
    Worker->>Worker: Save Results to MongoDB
    Worker->>Socket: Emit 100% Progress (Completed) + Results
    Socket-->>User: UI updates with final analysis
```

---

### 3. Skincare Routine Generation Flow
This diagram shows how user data and analysis results are fed into the LLM to generate personalized routines.

```mermaid
graph LR
    A[User Profile & Allergies] --> D
    B[Latest Skin Analysis] --> D
    C[Daily Check-in Data] --> D
    
    subgraph RoutineEngine [Routine Engine]
        D[Routine Controller] -->|Construct Prompt| E(Anthropic API / Claude)
        E -->|Return JSON| F[Parse & Validate]
    end
    
    F -->|Save| G[(MongoDB)]
    G --> H[User Dashboard]
```

---

### 4. B2B Brand Partner Ecosystem
This diagram illustrates the multi-tenancy and data aggregation features built for skincare brands.

```mermaid
graph TD
    Brand[Brand Partner] -->|POST /api/v1/partner/validate-key| API[Express API]
    API -->|Check Hash| DB[(MongoDB)]
    
    Brand -->|GET /analytics/skin-distribution| Aggregator[MongoDB Aggregation Pipeline]
    
    subgraph DataAnonymization [Data Anonymization]
        DB --> Aggregator
        Aggregator -->|Group by Acne/Wrinkles| Cohort[Cohort Analytics]
    end
    
    Cohort -->|Return JSON| Brand
    
    Brand -->|POST /recommend| RecEngine[Recommendation Engine]
    RecEngine -->|Match Ingredients to Skin Profile| Brand
```
