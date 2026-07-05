# Run Project

## Prerequisites

- Node.js
- MongoDB
- Razorpay Test API Keys

---

## Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Steps to Run

1. Start MongoDB.
2. Start the backend server.
3. Start the frontend server.
4. Open `http://localhost:5173` in your browser.
5. Register as a new user or log in.
6. Browse courses, enroll, and test payments using Razorpay test mode.

---

## Demo Credentials (Optional)

If available, you can add demo accounts here.

```
Student
Email:
Password:

Instructor
Email:
Password:
```

---

## Notes

- Use Razorpay **Test Mode** credentials during development.
- Ensure MongoDB is running before starting the backend.
- Refer to the README.md file for project overview and features.