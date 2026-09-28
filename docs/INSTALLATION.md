# Campus Coin — Installation Instructions

## Requirements
- Node.js 18+ recommended
- MongoDB running locally or a MongoDB connection string
- Modern Chrome/Edge/Firefox/Safari

## 1. Configure backend

Copy `backend/.env` to your deployment environment or use `.env.example` as the template.

Important values:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- SMTP settings for password-reset PIN emails (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`)

Never use demo secrets in production.

## 2. Install dependencies

From the project root:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## 3. Start MongoDB

Use the local MongoDB service or provide a remote MongoDB URI.

## 4. Seed demo data

From the backend folder:

```bash
npm run seed
```

## 5. Start backend

```bash
cd backend
npm start
```

Default: `http://localhost:5000`

## 6. Start frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Default: `http://localhost:5173`

## 7. Smoke test

1. Open the home page.
2. Register or use the student demo account.
3. Add income and expenses.
4. Create a category and budget.
5. Open Reports and export a PDF.
6. Generate an insight and pin/dismiss a saving tip.
7. Import a small CSV file.
8. Open Admin Login and verify the admin-only panel.
9. Verify Home/About/Features/Contact remain accessible after student and admin login.
10. Test password recovery/reset.


## Password reset by email PIN

The normal Forgot Password flow sends a **6-digit PIN** to the registered email address. The PIN is single-use and expires after **15 minutes**. The user enters the email + PIN on the reset screen and chooses a new password.

For a real email delivery test, configure the SMTP variables in the backend environment before starting the server. If SMTP is not configured during development, the API returns the generated PIN only in development mode so the flow can still be demonstrated locally.
