#  Smart Feedback and Analysis System

A **full-stack web application** built with **React.js, Node.js, Express, and MySQL** to collect user feedback and perform **automated sentiment analysis**, providing actionable insights through analytics dashboards.

---

##  Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Project Setup](#project-setup)
- [API Endpoints](#api-endpoints)
- [App Flow](#app-flow)
- [Wireframes](#wireframes)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)

---

##  Overview

The **Smart Feedback and Analysis System** automates feedback collection and analysis using **sentiment analysis**.  
It helps organizations understand user opinions, satisfaction, and improvement areas through charts and visual analytics.

**Key Features:**
- Secure login & registration (JWT)
- Multi-question feedback form
- Real-time sentiment analysis
- Admin dashboard with analytics

---

##  Features

 **User Module**
- Register / Login securely  
- Submit structured feedback  
- View individual analytics  

 **Admin Module**
- View all feedback submissions  
- Access overall sentiment reports  
- Delete or manage feedback entries  

 **System**
- Automated NLP sentiment scoring  
- Interactive charts (Pie, Bar, Line)  
- RESTful API with JWT authentication  

---

##  Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Chart.js, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Authentication** | JWT (jsonwebtoken) |
| **Sentiment Analysis** | Sentiment NPM Library |
| **Tools Used** | VS Code, Postman, GitHub, MySQL Workbench, OBS Studio |
| **Environment** | Windows 11 |

---

##  System Architecture
[User/Admin]
   │
   ▼
[Frontend: React.js]
   │ (Axios HTTP)
   ▼
[Backend: Node.js + Express]
   │ (SQL Queries)
   ▼
[MySQL Database]

---

##  Database Schema

**Tables:**
- `users` → stores credentials & roles  
- `questions` → holds feedback questions  
- `feedback` → stores feedback records  
- `feedback_answers` → stores answers with sentiment  

**Sample Schema:**
```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  question_text VARCHAR(500),
  question_type ENUM('text','rating','choice'),
  options JSON
);

CREATE TABLE feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  submitter_type ENUM('guest','user'),
  submitter_id INT,
  overall_sentiment_score FLOAT,
  overall_sentiment_label VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback_answers (
  answer_id INT AUTO_INCREMENT PRIMARY KEY,
  feedback_id INT,
  question_id INT,
  answer_text TEXT,
  sentiment_score FLOAT,
  sentiment_label VARCHAR(32)
);
```

---

##  Project Setup

### 1️ Clone Repository
```bash
git clone https://github.com/username/smart-feedback-system.git
cd smart-feedback-system
```

### 2️ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=feedback_system
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:
```bash
node server.js
```

### 3️ Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

Frontend → `http://localhost:3000`  
Backend → `http://localhost:5000/api`

---

##  API Endpoints

### **Auth Routes**
| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### **User Routes**
| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | `/api/feedback` | Submit feedback (JWT required) |
| GET | `/api/feedback/user/:id` | Get user feedback |
| GET | `/api/analytics` | Get personal analytics |

### **Admin Routes**
| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/admin/feedbacks` | View all feedback |
| GET | `/api/admin/analytics` | Global analytics |
| DELETE | `/api/feedback/:id` | Delete feedback |

---

##  App Flow

1. User registers or logs in → JWT generated.  
2. User fills and submits feedback.  
3. Backend runs sentiment analysis and stores results.  
4. User/Admin view feedback analytics through visual charts.  
5. Admin manages or deletes data as needed.

---

##  Wireframes

**Home Page**
+-------------------------------------------------------+
| SMART FEEDBACK SYSTEM                                 |
|-------------------------------------------------------|
| [ GIVE FEEDBACK ]   [ LOGIN ]   [ REGISTER ]          |
| Empower your organization with smart insights.        |
+-------------------------------------------------------+

**Feedback Form**
+------------------------------------------------+
| SUBMIT NEW FEEDBACK                            |
|------------------------------------------------|
| Q1: What do you like most? [text area]         |
| Q2: What can be improved? [text area]          |
| Q3: Any comments? [text area]                  |
| [ SUBMIT FEEDBACK ]                            |
+------------------------------------------------+

**Admin Dashboard**
+------------------------------------------------+
| ADMIN ANALYTICS DASHBOARD                      |
|------------------------------------------------|
| TOTAL FEEDBACKS | POSITIVE % | NEGATIVE %      |
|------------------------------------------------|
| [ PIE CHART ]  [ BAR CHART ]  [ LINE CHART ]   |
+------------------------------------------------+

---

##  Future Enhancements

- Integrate advanced NLP models (BERT/RoBERTa)  
- Add multilingual support  
- Export analytics as PDF or CSV  
- Deploy using Docker + CI/CD  
- Real-time analytics with WebSocket

---

##  Contributors

**Developed by:**  
**Vidyasagar Vadla**  

**Under the guidance of:** TCS  
**Institute:** JNTUH College of Engineering Manthani  

---

##  License

This project was developed as part of an academic collaboration with TCS.  
All rights reserved © 2025.
