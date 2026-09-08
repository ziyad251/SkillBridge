<div align="center">

# 🎓 SkillBridge

### Full-Stack Learning Management System with Secure Payments

A comprehensive Learning Management System that connects instructors and students through an interactive online learning platform with course management, secure payments, reviews, ratings, and automated certificate generation.

<br>

![React](https://img.shields.io/badge/React.js-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)

<br>

**Online Learning • Course Management • Secure Payments • Full-Stack Development**

</div>

---

## 📌 Overview

**SkillBridge** is a full-stack Learning Management System (LMS) designed to provide a complete online learning experience for students, instructors, and administrators.

The platform enables instructors to create and manage courses while allowing students to explore available courses, securely purchase and enroll in them, access learning content, submit reviews and ratings, and receive certificates upon successful course completion.

Built using the **MERN stack**, SkillBridge combines a responsive React frontend with a RESTful Express.js backend and MongoDB database.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

SkillBridge provides secure user authentication using **JSON Web Tokens (JWT)**.

The platform supports role-based access for:

- 👨‍💼 **Admin**
- 👨‍🏫 **Instructor**
- 🎓 **Student**

Each role receives access to the features and resources relevant to their responsibilities.

---

## 👨‍🏫 Course Creation & Management

Instructors can manage the complete course lifecycle through the platform.

Key capabilities include:

- Create new courses
- Manage existing courses
- Organize learning content
- Update course information
- Manage course availability

This provides instructors with a centralized platform for delivering and managing educational content.

---

## 🎓 Student Enrollment

Students can explore available courses and enroll in courses they want to learn.

The platform provides a structured learning experience where students can:

- Browse available courses
- View course information
- Purchase courses
- Enroll in courses
- Access enrolled course content

---

## 💳 Secure Course Payments

SkillBridge integrates **Razorpay** for online course purchases.

The payment workflow connects course purchases with student enrollment, providing a smooth transition from course discovery to learning access.

```text
Select Course
      │
      ▼
Course Details
      │
      ▼
Initiate Purchase
      │
      ▼
Razorpay Payment
      │
      ▼
Payment Confirmation
      │
      ▼
Course Enrollment
      │
      ▼
Access Learning Content
```

---

## ⭐ Reviews & Ratings

Students can provide feedback on courses through the integrated review and rating system.

This allows students to:

- Rate courses
- Submit reviews
- Share their learning experience

Reviews and ratings help provide useful feedback about course content and the overall learning experience.

---

## 🏆 Certificate Generation

SkillBridge supports automated certificate generation for students after successful course completion.

This provides learners with recognition for completing their enrolled courses.

---

## 📱 Responsive User Interface

The frontend is built using **React.js** and **Tailwind CSS** to provide a responsive and user-friendly experience across different screen sizes.

**Redux Toolkit** is used for application state management, while **Axios** handles communication between the frontend and backend APIs.

---

# 🔄 Platform Workflow

```text
                    User Registration
                           │
                           ▼
                          Login
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
              Admin    Instructor   Student
                │          │          │
                │          ▼          ▼
                │     Create Course  Browse Courses
                │          │          │
                │     Manage Course   ▼
                │          │     Select Course
                │          │          │
                │          │          ▼
                │          │    Secure Payment
                │          │          │
                │          │          ▼
                │          │      Enrollment
                │          │          │
                │          │          ▼
                │          │    Learning Content
                │          │          │
                │          │          ▼
                │          │    Review & Rating
                │          │          │
                │          │          ▼
                │          │      Certificate
                │          │
                └──────────┴───────────────
```

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │         User          │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    React Frontend     │
                         │                       │
                         │ • Authentication      │
                         │ • Course Discovery    │
                         │ • Learning Interface  │
                         │ • User Dashboard      │
                         │ • Reviews & Ratings   │
                         └───────────┬───────────┘
                                     │
                                     │ REST API
                                     ▼
                         ┌───────────────────────┐
                         │  Node.js / Express.js │
                         │                       │
                         │ • Authentication      │
                         │ • Authorization       │
                         │ • Course Management   │
                         │ • Enrollment          │
                         │ • Payment Processing  │
                         │ • Certificate Logic   │
                         └──────┬─────────┬──────┘
                                │         │
                    ┌───────────┘         └───────────┐
                    ▼                                 ▼
          ┌─────────────────────┐           ┌─────────────────────┐
          │       MongoDB       │           │      Razorpay       │
          │                     │           │                     │
          │ • Users             │           │ • Payment Orders    │
          │ • Courses           │           │ • Transactions      │
          │ • Enrollments       │           │ • Payment Status    │
          │ • Reviews           │           └─────────────────────┘
          │ • Learning Data     │
          └─────────────────────┘
```

---

# 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React.js |
| **State Management** | Redux Toolkit |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios |
| **Backend** | Node.js |
| **Backend Framework** | Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT |
| **Payments** | Razorpay |
| **API Architecture** | RESTful APIs |

---

# 📁 Project Structure

```text
SkillBridge/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   └── ...
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
│
├── assets/
│   ├── screenshots/
│   │   ├── home.png
│   │   ├── login.png
│   │   ├── courses.png
│   │   ├── instructor-dashboard.png
│   │   ├── payment.png
│   │   ├── learning.png
│   │   └── certificate.png
│   │
│   └── demo.gif
│
├── README.md
└── RUN_PROJECT.md
```

> The exact internal folder structure may vary depending on the current implementation.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd SkillBridge
```

---

## 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend:

```bash
npm run dev
```

---

## 3. Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install the dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

> The exact start command may differ depending on the project's current package configuration.

For additional setup and execution instructions, refer to **`RUN_PROJECT.md`**.

---

# 🔐 Authentication & Role-Based Access

SkillBridge uses JWT-based authentication to protect user-specific resources and application functionality.

```text
Registration / Login
        │
        ▼
User Authentication
        │
        ▼
JWT Token Generated
        │
        ▼
Protected API Access
        │
        ▼
Role Verification
   ┌────┼────────┐
   │    │        │
   ▼    ▼        ▼
 Admin Instructor Student
```

Role-based access control ensures that different types of users can access only the functionality appropriate to their role.

---

# 💳 Payment & Enrollment Flow

```text
Student Selects Course
          │
          ▼
   Purchase Request
          │
          ▼
   Razorpay Checkout
          │
          ▼
   Payment Processing
          │
          ▼
 Payment Confirmation
          │
          ▼
 Student Enrollment
          │
          ▼
 Course Access Granted
```

---

# 🔌 Core Backend Functionality

The backend provides RESTful APIs for the core application modules:

### Authentication

```text
User Registration
User Login
JWT Authentication
Role-Based Authorization
```

### Course Management

```text
Course Creation
Course Updates
Course Management
Course Discovery
```

### Student Learning

```text
Course Enrollment
Learning Content Access
Course Completion
```

### Payments

```text
Payment Initiation
Razorpay Integration
Payment Confirmation
Course Purchase
```

### Reviews & Certificates

```text
Course Reviews
Course Ratings
Certificate Generation
```

---
# 🤝 Contributing

Contributions and suggestions are welcome.

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m "feat: add your feature"

# Push the branch
git push origin feature/your-feature
```

Then open a Pull Request.

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a **⭐ star**.

<div align="center">

### Built with ⚛️ React, 🟢 Node.js, 🍃 MongoDB, and 💳 Razorpay

</div>
