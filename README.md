# Apex Tech Academy
**Learn Today. Build Tomorrow.**

A complete, production-ready Learning Management System (LMS) built with the MERN stack.

---

## Project Overview

Apex Tech Academy is a full-stack technology academy platform combining:
- A professional public-facing website
- A secure student learning portal
- An instructor teaching portal
- A comprehensive admin dashboard
- A final assessment system with certification

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, React Router v6     |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB, Mongoose                   |
| Auth        | JWT (1-hour expiry)                 |
| Email       | Nodemailer (Ethereal in dev)        |
| PDF         | PDFKit                              |
| Payments    | Paystack                            |
| Deployment  | Vercel (frontend), Render (backend) |

---

## Project Structure

```
apex-tech-academy/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # AuthContext, ThemeContext
│   │   ├── hooks/       # useApi, useForm, useInactivityLogout
│   │   ├── layouts/     # PublicLayout, AdminLayout, InstructorLayout, StudentLayout
│   │   ├── pages/       # All page components
│   │   │   ├── public/  # Home, About, Courses, Blog, etc.
│   │   │   ├── admin/   # Full admin dashboard (22 pages)
│   │   │   ├── instructor/ # Instructor portal (8 pages)
│   │   │   └── student/  # Student portal (15 pages)
│   │   ├── services/    # API service modules (22 services)
│   │   └── styles/      # Design system (CSS variables + global styles)
└── server/              # Node.js/Express backend
    ├── config/          # DB connection, constants
    ├── controllers/     # Business logic (13 controllers)
    ├── middleware/       # Auth, validation, upload, rate limiting
    ├── models/          # Mongoose models (23 models)
    ├── routes/          # API routes (23 route files)
    ├── utils/           # Email (Nodemailer), PDF (PDFKit)
    └── uploads/         # Uploaded files (gallery, materials, submissions)
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local) or MongoDB Atlas account

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

```bash
# Backend
cp server/.env.example server/.env
# Fill in your values (MongoDB URI, JWT secret, email, Paystack keys)

# Frontend
cp client/.env.example client/.env
# Add your Paystack public key
```

### 3. Seed the database

```bash
cd server
npm run seed          # Full seed (all data)
npm run seed:team     # Seed team members only (preserves existing data)
```

### 4. Start development servers

```bash
# Terminal 1 — MongoDB (if running locally)
& "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"

# Terminal 2 — Backend
cd server
npm run dev

# Terminal 3 — Frontend
cd client
npm run dev
```

Open `http://localhost:5173`

---

## Test Login Credentials (after seeding)

| Role       | Email                                    | Password         |
|------------|------------------------------------------|------------------|
| Admin      | admin@apextechacademy.com                | Admin@1234       |
| Instructor | john.adeyemi@apextechacademy.com         | Instructor@1234  |
| Instructor | sarah.okafor@apextechacademy.com         | Instructor@1234  |
| Student    | emeka.okafor@student.com                 | Student@1234     |
| Student    | aminat.bello@student.com                 | Student@1234     |

The Login page has **Dev Shortcuts** buttons at the bottom for instant one-click login.

---

## Features

### Public Website
- Home page with gallery slideshow, course previews, stats
- Courses page with search and filters
- Course detail page with curriculum accordion
- Blog with article detail pages
- Events, Gallery, Projects, Training, About, Contact
- Certificate verification page (`/verify/:certId`)
- Site-wide search (`/search`)
- Forgot password / Reset password flow
- Dark / Light mode toggle

### Admin Dashboard (22 pages)
- Live dashboard stats
- Student management (add, view, toggle status)
- Instructor management
- Course management + Curriculum builder
- Assessment (exam) management — add 60 MCQs + essays, publish
- Applications review (approve/reject with auto-enrollment)
- Admissions — generate admission letters (PDF)
- Enrollments
- Learning materials overview
- Assignments
- Submissions (view and grade all submissions)
- Payments (verify via Paystack, manual verify)
- Receipts
- Certificates (issue with eligibility check + exam pass requirement)
- Projects (publish student projects)
- Blog management
- Events management
- Gallery management (upload images)
- Team members management (add/delete/hide)
- Announcements
- Messages
- Settings (profile + password)

### Instructor Portal (8 pages)
- Dashboard with stats
- My Courses — with inline Curriculum Builder
- Lessons
- Materials (upload videos, PDFs, notes with inline player)
- Assignments (create, manage)
- Submissions (grade essays with feedback + remarks)
- Announcements
- Assessment Grading (grade essay answers)

### Student Portal (15 pages)
- Dashboard with progress summary
- Profile (edit personal info, change password)
- My Courses (with curriculum accordion, View Curriculum button)
- Lessons (sequential unlock, mark complete, inline video player)
- Learning Materials (video player, PDF viewer, download)
- Assignments (view status, submit)
- Submissions (file upload, view grades and feedback)
- Progress (per-course bars, grade history)
- Announcements
- Admission (apply, view status, download admission letter PDF)
- Payments (Paystack integration)
- Receipts
- Projects (submit with Git repository URL + clone command)
- Certificates (view with gold/white design, download PDF)
- Final Assessment (60 MCQs + essays, 1-hour countdown, auto-save, auto-submit)

---

## Assessment System

- **60 MCQs** (1 mark each = 60 marks) + **Essay questions** (additional marks)
- **1-hour countdown timer** — auto-saves every 30 seconds
- **Auto-submits** when time expires
- MCQs are **auto-graded** on submission
- Essays are **graded by instructor** with per-question marks, feedback and overall remarks
- Students must **pass the assessment** before a certificate can be issued
- Results show score, pass/fail, MCQ review with correct answers

---

## Security Features

- JWT authentication (1-hour expiry)
- Role-based authorization (admin / instructor / student)
- Resource ownership checks
- Input validation (express-validator)
- NoSQL injection prevention (mongo-sanitize)
- Rate limiting (global + auth + upload + contact)
- Secure file upload (private storage, never directly accessible)
- Video streaming with range support (for seeking)
- Secure HTTP headers (Helmet)
- CORS restricted to CLIENT_URL
- Auto-logout after 1 hour of inactivity (with 5-minute warning)
- Password reset via secure token (expires in 30 minutes)
- Payment verification server-side only (never trust client)
- Certificate issuance requires 100% course completion + exam pass

---

## PDF Documents

Both PDFs are generated server-side using PDFKit:

**Admission Letter** — professional white document with:
- Academy header and branding
- Admission number, student name, course, date
- Next steps section

**Certificate of Completion** — white background, gold & navy design:
- Academy name, star emblem
- Student name, course title, grade
- Certificate ID, issue date, signature line
- Public verification URL

---

## Email Notifications

Sent automatically via Nodemailer:
- Welcome email (on registration)
- Congratulations / admission approval (with admission details)
- Admission rejection (with feedback)
- Payment receipt (after payment verified)
- Certificate issued (with PDF attached)
- Password reset link (30-minute expiry)
- Contact form notification + auto-reply

In development — preview emails at the Ethereal URL printed in server terminal.

---

## Paystack Payment Integration

- Student initiates payment → server creates Pending record
- Student redirected to Paystack payment page
- After payment → Paystack redirects back to site
- Server verifies directly with Paystack API (never trusts client)
- Payment marked Verified + Receipt generated
- Paystack webhook also confirms payments server-side

**To enable:** Add your Paystack keys to `server/.env`:
```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

---

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render
- Connect your GitHub repo
- Set environment variables in Render dashboard
- Set build command: `npm install`
- Set start command: `npm start`

### Database → MongoDB Atlas
- Create a free M0 cluster
- Get connection string and set as `MONGO_URI` in production env

---

## Contact

**Apex Tech Academy**
Off Gambari Road, Ilorin, Kwara State, Nigeria
📞 07064359797 | 07081721079
✉️ info@apextechacademy.com

---

© 2026 Apex Tech Academy. All rights reserved.
