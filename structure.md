# SkinWise - Project Structure & Documentation

## 📋 Project Overview

**SkinWise** is a comprehensive **full-stack skin health analysis platform** that combines computer vision with machine learning to analyze facial skin conditions. Users can upload face images to receive detailed skin health assessments, get personalized skincare routines, track progress, and access educational content.

### Key Purpose
- **Skin Analysis**: AI-powered detection of acne, blackheads, wrinkles, pigmentation issues
- **Progress Tracking**: Compare analysis results over time with improvement metrics
- **Personalized Routines**: AI-generated skincare routines based on skin profile
- **Gamification**: Routine streak tracking to encourage consistency
- **Education**: Blog content and consultation features
- **Admin Dashboard**: Analytics and user management

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks |
| **Vite** | Fast build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **PostCSS** | CSS processing |
| **Axios** | HTTP client for API calls |
| **Socket.io Client** | Real-time communication |
| **Firebase SDK** | Authentication (email/password) |
| **Recharts** | Analytics charts & graphs |
| **React Hot Toast + Toastify** | Notifications & alerts |
| **Headless UI** | Accessible UI components |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express v5** | Server runtime & framework |
| **MongoDB + Mongoose** | NoSQL database & ODM |
| **Firebase Admin SDK** | JWT token verification |
| **Redis v5.10** | Caching layer |
| **Socket.io** | Real-time events |
| **Multer** | File upload handling (memory storage) |
| **bcryptjs** | Password hashing |
| **Axios** | HTTP calls to Python service |
| **Rate Limiting Middleware** | DDoS protection |

### Python/ML Service
| Technology | Purpose |
|-----------|---------|
| **Flask** | Lightweight Python web framework |
| **YOLOv5** | Custom-trained acne detection model |
| **MediaPipe** | Face landmark detection (468 points) |
| **OpenCV** | Image processing & computer vision |
| **PyTorch** | Deep learning framework |
| **Pillow** | Image manipulation |
| **NumPy** | Numerical operations |
| **SciPy** | Scientific computing |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **MongoDB Container** | Database service |

---

## 📂 Project Directory Structure

```
Root/
├── docker-compose.yml          # Infrastructure orchestration
├── YOLOV5_ANALYSIS.md         # ML model documentation
│
├── backend/                   # Node.js/Express API Server
│   ├── server.js              # Entry point
│   ├── package.json           # Node dependencies
│   ├── requirements.txt        # Python dependencies (if any)
│   ├── Dockerfile             # Docker image config
│   │
│   ├── config/                # Configuration files
│   │   ├── firebaseAdmin.js    # Firebase Admin setup
│   │   └── redis.js            # Redis connection config
│   │
│   ├── controllers/           # Business logic
│   │   └── userController.js   # User-related operations
│   │
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js   # Firebase token verification
│   │   ├── ratelimiter.js      # Rate limiting
│   │   └── requireAdmin.js     # Admin role verification
│   │
│   ├── models/                # MongoDB Schemas (Mongoose)
│   │   ├── User.js             # User account & profile
│   │   ├── SkinAnalysis.js      # Analysis results
│   │   ├── Routine.js           # Skincare routines
│   │   └── RoutineStreak.js     # Streak tracking
│   │
│   ├── routes/                # API route handlers
│   │   ├── authRoutes.js       # Login/Register
│   │   ├── userRoutes.js       # User profile endpoints
│   │   ├── analyzeRoutes.js     # Image analysis endpoint
│   │   ├── routineRoutes.js     # Routine CRUD
│   │   ├── blogRoutes.js        # Blog/Article search
│   │   ├── adminRoutes.js       # Admin user management
│   │   └── adminAnalyticsRoutes.js # Admin dashboard data
│   │
│   ├── scripts/               # Utility scripts
│   │   └── makeAdmin.js        # Script to assign admin role
│   │
│   └── uploads/               # File upload storage (empty)
│
├── frontend/                  # React.js UI Application
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   ├── eslint.config.js       # Linting rules
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS plugins
│   ├── package.json           # npm dependencies
│   ├── socket.js              # Socket.io client setup
│   ├── Dockerfile             # Docker image config
│   │
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main App component
│   │   ├── App.css            # Global styles
│   │   ├── index.css          # Base styles
│   │   ├── firebase.jsx       # Firebase config
│   │   │
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AdminRoute.jsx      # Admin-only route wrapper
│   │   │   ├── ProtectedRoute.jsx  # Auth-required route wrapper
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Footer.jsx          # Footer component
│   │   │   ├── ThemeToggle.jsx      # Dark/light mode toggle
│   │   │   ├── SEO.jsx             # Meta tags helper
│   │   │   ├── StatCard.jsx        # Stat display card
│   │   │   └── AdminStatCard.jsx   # Admin stat card
│   │   │
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx     # User auth state
│   │   │   └── ThemeContext.jsx    # Light/dark mode state
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useScrollPosition.jsx # Track scroll state
│   │   │
│   │   ├── pages/             # Page components (routes)
│   │   │   ├── HomePage.jsx         # Landing/home page
│   │   │   ├── LoginPage.jsx        # Login form
│   │   │   ├── RegisterPage.jsx     # Registration form
│   │   │   ├── Analyze.jsx          # Image upload & analysis
│   │   │   ├── ProfilePage.jsx      # User profile settings
│   │   │   ├── Routine.jsx          # Routine management
│   │   │   ├── BlogPage.jsx         # Blog articles
│   │   │   ├── AdvicePage.jsx       # Skincare advice
│   │   │   ├── QuizPage.jsx         # Skin type quiz
│   │   │   ├── ConsultationPage.jsx # Consultation booking
│   │   │   ├── ContactPage.jsx      # Contact form
│   │   │   ├── AboutPage.jsx        # About section
│   │   │   └── AdminDashboard.jsx   # Admin analytics
│   │   │
│   │   ├── assets/            # Static files (images, etc.)
│   │   │
│   │   └── public/            # Public static files
│   │       └── images/
│   │           └── blogs/     # Blog article images
│
└── python_service/            # Flask AI/ML Service
    ├── app.py                 # Main Flask application
    ├── app2.py                # Alternative app (testing)
    ├── imagetestingfinal.py   # Image testing utilities
    ├── test_mp.py             # MediaPipe testing
    ├── test2.py               # Additional tests
    ├── requirements.txt       # Python package dependencies
    ├── Dockerfile             # Docker image config
    ├── face_landmarker.task   # MediaPipe model weights
    │
    ├── yolo/                  # YOLOv5 implementation
    │   ├── best.pt            # Custom-trained acne model weights
    │   ├── detect.py          # YOLOv5 detection script
    │   ├── models/            # Model architectures
    │   │   ├── __init__.py
    │   │   ├── yolo.py
    │   │   ├── common.py
    │   │   └── experimental.py
    │   │
    │   └── utils/             # Utility functions
    │       ├── __init__.py
    │       ├── general.py      # General utilities
    │       ├── datasets.py     # Dataset handling
    │       ├── loss.py         # Loss functions
    │       ├── metrics.py      # Evaluation metrics
    │       ├── plots.py        # Visualization
    │       ├── torch_utils.py  # PyTorch helpers
    │       ├── activations.py  # Activation functions
    │       ├── autoanchor.py   # Anchor auto-scaling
    │       ├── add_nms.py      # NMS implementation
    │       ├── google_utils.py # Google integration
    │       ├── aws/            # AWS utilities
    │       ├── google_app_engine/ # GAE deployment
    │       └── wandb_logging/  # Weights & Biases logging
    │
    ├── test_images/           # Sample images for testing
    ├── testing/               # Testing directory
    └── output/                # Analysis output files

```

---

## ✨ Key Features

### 1. Real-time Skin Analysis
- **Image Upload**: Users upload face photos
- **Multi-condition Detection**: 
  - Acne (YOLO + color-based fallback)
  - Blackheads (morphological operations)
  - Wrinkles (edge detection)
  - Pigmentation (color histogram)
- **Severity Scoring**: 0-100 scale for each condition
- **Progress Delta**: Compares current vs. previous analysis
- **Overall Health Score**: Aggregate skin metric

### 2. Progress Tracking
- Compare analysis results across multiple dates
- Visual delta metrics (improvement/worsening trends)
- Historical analysis storage with timestamps
- Analysis metadata (model version, processing time)

### 3. Personalized Skincare Routines
- **Quiz-based**: Generate routine from skin type questionnaire
- **Analysis-based**: Auto-generate from analysis results
- **Morning/Night routines**: Separate step-by-step instructions
- **Product suggestions**: Tailored to user's budget & concerns
- **Step tracking**: Users mark routine steps as complete

### 4. Routine Streak Gamification
- **Current Streak**: Days of consecutive completion
- **Longest Streak**: Historical best performance
- **Completion History**: Track daily progress
- **Motivation**: Visual progress indicators

### 5. Educational Content
- **Blog Integration**: Powered by Twingly Blog API
- **Search articles**: Find skincare advice by topic
- **Recommended articles**: Based on analysis results

### 6. User Management
- **Firebase Authentication**: Email/password signup & login
- **Role-based Access**: User, Admin, Moderator roles
- **User Profiles**: Skin type, concerns, allergies, preferences
- **Budget settings**: Low, Medium, High tier recommendations

### 7. Admin Dashboard
- **User Analytics**: Total users, total analyses performed
- **User Management**: View, search, assign roles
- **Analysis Insights**: Aggregate data on common skin issues
- **Rate limiting**: Protect against abuse

---

## 🔄 How It Works

### User Skin Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS IMAGE                                          │
│    - Navigate to Analyze.jsx                                   │
│    - Select face photo                                         │
│    - Optional: Input skin metadata                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND SENDS REQUEST                                      │
│    - POST /api/analyze (multipart/form-data)                   │
│    - Header: Authorization: Bearer <Firebase_JWT>              │
│    - Body: image file + metadata                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND PROCESSES                                           │
│    ├─ authMiddleware: Verify Firebase token                    │
│    ├─ Extract uid from token → req.user.uid                    │
│    ├─ Multer: Parse multipart form data                        │
│    ├─ Store image in memory (Buffer)                           │
│    └─ POST to Python service: POST localhost:7000/analyze-image│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. PYTHON SERVICE ANALYZES                                     │
│    ├─ Load image (PIL/OpenCV)                                  │
│    ├─ MediaPipe Face Landmarker                                │
│    │   └─ Extract 468 facial landmarks                         │
│    │   └─ Create skin mask (exclude eyes, lips, brows)         │
│    ├─ Run detection algorithms:                                │
│    │   ├─ ACNE: YOLOv5 (NMS: 0.45 IoU, 0.15 conf)            │
│    │   │        → Fallback: HSV color detection               │
│    │   ├─ BLACKHEADS: Morphological operations                │
│    │   ├─ WRINKLES: Canny edge detection + density            │
│    │   └─ PIGMENTATION: Color histogram analysis              │
│    ├─ Normalize scores to 0-100 scale                          │
│    └─ Return JSON with results                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND STORES RESULTS                                      │
│    ├─ Save to MongoDB: SkinAnalysis collection                 │
│    ├─ Calculate delta (vs. previous analysis)                  │
│    ├─ Invalidate Redis cache (stale profile)                   │
│    ├─ Generate routine recommendations (if needed)             │
│    └─ Return JSON response to frontend                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND DISPLAYS RESULTS                                   │
│    ├─ Show severity badges (Acne, Blackheads, etc.)           │
│    ├─ Display progress delta vs. previous analysis            │
│    ├─ Suggest routine adjustments                             │
│    ├─ Offer to start routine                                  │
│    └─ Save to localStorage for offline access                 │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─ User Signs Up/Logs In via Frontend
├─ Firebase: email + password auth
├─ Firebase returns JWT (ID token)
├─ Frontend: Store JWT in localStorage
├─ For each API request:
│  ├─ Add header: Authorization: Bearer <JWT>
│  ├─ Backend: Extract token from header
│  ├─ Firebase Admin SDK: Verify token signature
│  ├─ Decode to get uid, email, claims
│  ├─ Attach req.user = { uid, email, roles, ... }
│  └─ Protected routes check req.user existence
└─ Token expiry: Firebase handles refresh
```

### Real-time Features
- **Socket.io Connection**: WebSocket between frontend & backend
- **Event Flow**: Analysis completion notifications, routine reminders
- **Scalability**: Socket.io rooms for per-user events

---

## 💾 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  uid: String (Firebase UID, unique),
  username: String (unique),
  email: String (unique),
  role: ['user', 'admin', 'moderator'],
  
  skinProfile: {
    skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive',
    concerns: ['acne', 'pigmentation', 'blackheads', 'wrinkles', ...],
    allergies: [String],
    ageRange: '<18' | '18-25' | '26-35' | '36-45' | '46+'
  },
  
  preferences: {
    routineLevel: 'minimal' | 'moderate' | 'advanced',
    budget: 'low' | 'medium' | 'high'
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### SkinAnalysis Model
```javascript
{
  _id: ObjectId,
  user: String (Firebase UID),
  
  raw: {
    acne: { label, count },
    blackheads: { count },
    wrinkles: { edge_density },
    pigmentation: { count }
  },
  
  severity: {
    acne: Number (0-100),
    blackheads: Number (0-100),
    wrinkles: Number (0-100),
    pigmentation: Number (0-100)
  },
  
  overallScore: Number,
  
  delta: {
    acne: Number (vs. previous),
    blackheads: Number,
    wrinkles: Number,
    pigmentation: Number,
    overall: Number
  },
  
  notes: String (recommendations),
  modelVersion: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Routine Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref to User),
  
  routineType: 'morning' | 'night',
  
  steps: [{
    stepOrder: Number,
    title: String,
    productType: String,
    ingredients: [String],
    instructions: String,
    estimatedTime: Number (minutes)
  }],
  
  generatedBy: 'quiz' | 'analysis' | 'manual',
  
  createdAt: Date,
  updatedAt: Date
}
```

### RoutineStreak Model
```javascript
{
  _id: ObjectId,
  user: String (Firebase UID, unique),
  
  currentStreak: Number,
  longestStreak: Number,
  lastCompletedDate: Date,
  
  history: [{
    date: Date,
    completed: Boolean
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/:id` - Get specific user (admin)
- `PUT /api/user/:id/role` - Assign role (admin)

### Skin Analysis
- `POST /api/analyze` - Upload image & analyze
- `GET /api/analysis/history` - Get past analyses
- `GET /api/analysis/:id` - Get specific analysis

### Routines
- `GET /api/routine` - Get user's routines
- `POST /api/routine` - Create routine
- `PUT /api/routine/:id` - Update routine
- `DELETE /api/routine/:id` - Delete routine
- `POST /api/routine/:id/complete` - Mark as complete

### Blog/Articles
- `GET /api/blog/search?q=<query>` - Search articles
- `GET /api/blog/recommendations` - Get recommended articles

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get dashboard stats
- `PUT /api/admin/users/:id` - Modify user

### Python Service (Internal)
- `POST http://localhost:7000/analyze-image` - Analyze image
  - Input: Multipart form-data with image file
  - Output: JSON with detection results

---

## 🔐 Security Features

- **Firebase Authentication**: Secure JWT-based auth
- **Rate Limiting**: Prevent API abuse
- **Admin Middleware**: Role-based access control
- **Password Hashing**: bcryptjs for secure storage
- **CORS**: Cross-origin resource sharing configured
- **Redis Caching**: Reduce database load
- **Input Validation**: Multer file size limits

---

## 🚀 Deployment & Infrastructure

### Docker Services (docker-compose.yml)

```yaml
Services:
├── mongodb          # Database (Port 27017)
├── backend          # Node.js API (Port 5000)
├── python_service   # Flask ML Service (Port 7000)
└── frontend         # React UI (Port 3000)

Networks:
└── Internal Docker network for service-to-service communication
```

### Build & Deploy
- **Frontend**: `npm run build` → Vite creates dist/
- **Backend**: `npm install` → node server.js
- **Python**: `pip install -r requirements.txt` → python app.py
- **Docker**: `docker-compose up` → Spin up all services

---

## 📊 Machine Learning Details

### YOLOv5 Acne Detection

**Model Path**: `python_service/yolo/best.pt`

**Configuration**:
- Input: 640×640 RGB image (normalized 0.0-1.0)
- Output: Bounding boxes + confidence scores
- NMS Thresholds:
  - Confidence: 0.15 (15% minimum)
  - IoU: 0.45 (overlap threshold)

**Fallback Logic**:
```
if YOLOv5_weights_found and model_loads:
  return YOLO_predictions
else:
  return HSV_color_detection_fallback
```

### MediaPipe Face Landmarker

**Model**: `face_landmarker.task` (468 facial landmarks)

**Landmarks Include**:
- Eyes (LEFT_EYE, RIGHT_EYE)
- Lips (LIPS)
- Eyebrows (LEFT_EYEBROW, RIGHT_EYEBROW)
- Face outline & contours
- Cheeks, nose, jaw

**Usage**: Create skin mask to exclude non-skin regions for accurate analysis

### Detection Algorithms

| Condition | Method | Fallback |
|-----------|--------|----------|
| **Acne** | YOLOv5 detection | HSV color-based |
| **Blackheads** | Morphological operations | N/A |
| **Wrinkles** | Canny edge detection | N/A |
| **Pigmentation** | Color histogram analysis | N/A |

---

## 📝 Development Workflow

### Local Setup
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev

# Python Service
cd python_service
pip install -r requirements.txt
python app.py
```

### With Docker
```bash
docker-compose up --build
```

### Key Files to Understand
1. **Backend Entry**: [backend/server.js](backend/server.js)
2. **Frontend Entry**: [frontend/src/main.jsx](frontend/src/main.jsx)
3. **Analysis Logic**: [backend/routes/analyzeRoutes.js](backend/routes/analyzeRoutes.js)
4. **ML Service**: [python_service/app.py](python_service/app.py)
5. **Database**: [backend/models/](backend/models/)

---

## 🔍 Monitoring & Analytics

### Admin Dashboard Shows
- Total users count
- Total analyses performed
- Common skin issues distribution
- User growth trends

### Logging
- Backend: Express request logs
- Frontend: Error tracking (optional Sentry/Rollbar)
- Python: Flask request logs + ML inference metrics

---

## 📚 Additional Resources

- **ML Analysis**: See [YOLOV5_ANALYSIS.md](YOLOV5_ANALYSIS.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Python Service**: [python_service/README.md](python_service/README.md)

---

**Generated**: June 2, 2026  
**Stack**: React + Node.js + Python + MongoDB  
**Status**: Production-Ready Full-Stack Application
