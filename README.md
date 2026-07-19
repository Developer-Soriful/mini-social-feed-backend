# Mini Social Feed App - Backend API

An enterprise-grade, lightweight Node.js & Express RESTful API utilizing TypeScript, MongoDB, and Firebase Cloud Messaging (FCM) to power a real-time social media feed.

---

## Architecture & Design Patterns

The backend follows a **Domain-Driven Layered Architecture** splitting responsibilities across three clean layers:
1. **Controllers**: Request validation (using Zod schemas), request/response mapping, and routing middleware execution.
2. **Services**: Domain business logic orchestration, Firebase cloud notification triggers, and user session management.
3. **Repositories**: Encapsulated database operations (Mongoose queries and updates) to ensure clean separation from the data persistence layer.

### Key Enterprise Features
* **Security-First**: `helmet` security headers, express rate limiting (200 req/15min global, 15 req/15min on auth routes), body payload size capped at 10kb.
* **FCM Token Uniqueness**: Enforces unique hardware tokens across profiles to prevent target collisions when testing multiple accounts on one physical device.
* **Strict Feeds Filtering**: Optimizes queries to filter posts strictly by username for profile activity tracking while keeping search-relevance sorting active for global feeds.
* **Secure Session JWTs**: Standard authorization headers using JSON Web Tokens. JWT secret validated at startup — server refuses to boot with a missing or weak secret.
* **Centralized Error Handling**: All errors routed through a single middleware that classifies Mongoose, Zod, JWT, and domain errors and returns safe, sanitized responses.

---

## System Requirements
* Node.js v16 or higher
* npm v8 or higher
* MongoDB Instance (Atlas or Local)
* Firebase Project Service Account Key

---

## Getting Started

### 1. Installation
Clone the repository, navigate to the backend directory, and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy [`.env.example`](.env.example) to `.env` and fill in the values:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Must be at least 32 random characters. Generate with: openssl rand -hex 32
JWT_SECRET=REPLACE_WITH_A_STRONG_RANDOM_SECRET_OF_AT_LEAST_32_CHARS

# Paste the full JSON from your Firebase service account key (single line)
# Firebase Console → Project Settings → Service Accounts → Generate new private key
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"...", ...}

# Optional: comma-separated allowed CORS origins (leave empty for mobile-only)
ALLOWED_ORIGINS=
```

### 3. Build & Run
Compile the TypeScript code and start the development server:

* **Development mode** (Hot reloading):
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm run build
  npm start
  ```

---

## API Reference

All requests must set `Content-Type: application/json`. Protected endpoints require an `Authorization: Bearer <JWT>` header.

### ── Authentication ──

#### 1. Sign Up
* **Endpoint**: `POST /api/auth/signup`
* **Request Body**:
  ```json
  {
    "username": "soriful12",
    "email": "soriful@gmail.com",
    "password": "strongpassword123",
    "fcmToken": "cgW2iLk0SbGuX1XxwMc7tq..." // Optional
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "user": {
        "id": "6a5aaf00a66728c960d23f42",
        "username": "soriful12",
        "email": "soriful@gmail.com"
      }
    }
  }
  ```

#### 2. Log In
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "soriful@gmail.com",
    "password": "strongpassword123",
    "fcmToken": "cgW2iLk0SbGuX1XxwMc7tq..." // Optional
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "user": {
        "id": "6a5aaf00a66728c960d23f42",
        "username": "soriful12",
        "email": "soriful@gmail.com"
      }
    }
  }
  ```

---

### ── Posts ──

#### 1. Create Post `[Protected]`
* **Endpoint**: `POST /api/posts`
* **Request Body**:
  ```json
  {
    "text": "Hello, world! This is my first text-only post."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "_id": "6a5ab20076d12901d7438708",
      "text": "Hello, world! This is my first text-only post.",
      "author": "6a5aaf00a66728c960d23f42",
      "likesCount": 0,
      "commentsCount": 0,
      "createdAt": "2026-07-19T02:47:00.000Z"
    }
  }
  ```

#### 2. Get Feed `[Protected]`
* **Endpoint**: `GET /api/posts`
* **Query Parameters**:
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `10`)
  * `username` (optional) - Filter/sort posts by author.
  * `strict` (optional, default: `false`) - Set to `true` to return *only* posts matching `username`.
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "posts": [
        {
          "_id": "6a5ab20076d12901d7438708",
          "text": "Hello, world! This is my first text-only post.",
          "author": {
            "_id": "6a5aaf00a66728c960d23f42",
            "username": "soriful12",
            "headline": "Software Engineer"
          },
          "likesCount": 1,
          "commentsCount": 0,
          "isLiked": true
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```

#### 3. Update Post `[Protected]`
* **Endpoint**: `PUT /api/posts/:id`
* **Request Body**:
  ```json
  {
    "text": "Updated post text content goes here."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "_id": "6a5ab20076d12901d7438708",
      "text": "Updated post text content goes here."
    }
  }
  ```

#### 4. Delete Post `[Protected]`
* **Endpoint**: `DELETE /api/posts/:id`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": { "_id": "6a5ab20076d12901d7438708", "text": "..." }
  }
  ```

---

### ── Interactions ──

#### 1. Like/Unlike Post `[Protected]`
* **Endpoint**: `POST /api/posts/:id/like`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Post liked" // or "Post unliked"
  }
  ```

#### 2. Comment on Post `[Protected]`
* **Endpoint**: `POST /api/posts/:id/comment`
* **Request Body**:
  ```json
  {
    "text": "Great post! Thanks for sharing."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "_id": "6a5ab99387438708c960d77b",
      "text": "Great post! Thanks for sharing.",
      "postId": "6a5ab20076d12901d7438708",
      "userId": {
        "_id": "6a5aaf00a66728c960d23f42",
        "username": "soriful12"
      },
      "createdAt": "2026-07-19T02:49:15.000Z"
    }
  }
  ```

---

### ── Notifications ──

#### 1. Get Notifications List `[Protected]`
* **Endpoint**: `GET /api/notifications`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "_id": "6a5ab99ef4442ef3a99bb8f1",
        "recipient": "6a5aaf00a66728c960d23f42",
        "sender": {
          "_id": "7b5bb40026a54f02a66c42a1",
          "username": "dev12"
        },
        "type": "like",
        "post": {
          "_id": "6a5ab20076d12901d7438708",
          "text": "Hello, world!"
        },
        "isRead": false,
        "createdAt": "2026-07-19T02:50:00.000Z"
      }
    ]
  }
  ```

#### 2. Mark All as Read `[Protected]`
* **Endpoint**: `PATCH /api/notifications/read`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "All notifications marked as read"
  }
  ```

#### 3. Delete Notification `[Protected]`
* **Endpoint**: `DELETE /api/notifications/:id`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Notification deleted successfully"
  }
  ```
