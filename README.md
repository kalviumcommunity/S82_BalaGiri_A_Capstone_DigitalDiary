# 📓 Digital Diary - Capstone Project

Welcome to the **Digital Diary** – a full-stack MERN (MongoDB, Express, React, Node.js) project built as a capstone to create a secure and visually appealing diary app.

## 🌐 Live URL
> [Add your deployed frontend and backend URLs here once available]

---

## 📌 Features Implemented

### ✅ User Authentication
- 🔐 User registration and login with secure password hashing (bcrypt)
- 🛡️ JWT-based session authentication
- Protected routes using token verification (stored in `localStorage`)

### 📝 Diary Entry Management
- 🧾 Create new diary entries with:
  - Title
  - Content
  - Mood
  - Date
- 🖼️ Upload and attach multiple photos
- 🎙️ Record and attach audio files

### 🔍 Search & View Entries
- 🔎 Filter entries by **title** using a real-time search bar
- 📅 View recent entries sorted by date

### 🧰 CRUD Operations
- ✅ Create (fully functional)
- 🔁 Update (via modal - implemented)
- ❌ Delete (planned)
- 🔎 Read (view and fetch entries with search support)

---

## 💻 Tech Stack

### Frontend
- React + Tailwind CSS
- `lucide-react` icons
- Context-aware themes (Light/Dark)
- `NewEntryModal` component for add/edit
- Audio recording via Web APIs (`MediaRecorder`)
- Form submission via `FormData` API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Multer for file upload handling
- JWT for secure authentication
- Separate route/controllers for `auth` and `diary`
- Static file serving (`/uploads`)

---

## 🔒 Security

### Implemented:
- ✅ JWT Authentication
- ✅ Form validation
- ✅ Environment variables using `.env`

### Planned:
- 🧠 **AES-256 encryption** for:
  - Diary content
  - Uploaded media (images/audio)
- ⚠️ Restricted file size and type validation
