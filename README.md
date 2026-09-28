# Campus Coin — Final ReadMe

**Smart Spending, Student Style • NextGen BudgetBee**

## 1. Project Overview

Campus Coin is a full-stack student budgeting and expense-management web application built with React, Node.js, Express and MongoDB. It is designed around everyday student finances and provides a separate student portal and administrator control center.

Students can record income and expenses, organize transactions with categories, set monthly budgets, monitor spending, import CSV data, manage recurring transactions, review reports, export reports as PDF, receive saving tips and monthly spending insights, and save useful tips/insights as bookmarks.

The administrator has a separate protected panel for managing student accounts, default categories, saving-tip templates and announcements, as well as viewing overall usage statistics.

## 2. Technology Stack

- **Frontend:** React 18, Vite, React Router, Chart.js / react-chartjs-2, Lucide React
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcryptjs
- **Reports:** PDF generation with jsPDF / jsPDF AutoTable
- **File Import:** CSV preview, validation and batch import
- **Intelligent features:** Rule-based expense categorization and monthly spending insights
- **Email:** Nodemailer SMTP for password-reset PIN delivery
- **UI:** Responsive layout, light/dark theme and adjustable font-size controls

## 3. Project Structure

```text
Campus_Coin/
├── frontend/          # React + Vite client
│   ├── src/
│   └── public/
├── backend/           # Express + MongoDB API
│   └── src/
├── database/          # Seed data and admin setup scripts
└── docs/              # Installation, architecture, diagrams and presentation notes
```

## 4. Installation and Local Setup

### Requirements

- Node.js 18+ recommended
- MongoDB running locally or a valid MongoDB connection string
- Modern Chrome, Edge, Firefox or Safari

### 4.1 Start MongoDB

Run MongoDB locally or configure `MONGODB_URI` in the backend environment.

The default local database used by the project is:

```text
mongodb://127.0.0.1:27017/campus_coin
```

### 4.2 Install all dependencies

From the project root:

```bash
npm run install:all
```

### 4.3 Seed demo data

```bash
npm run seed
```

### 4.4 Start the backend

```bash
npm run start:backend
```

Backend:

```text
http://localhost:5000
```

### 4.5 Start the frontend

Open a second terminal:

```bash
npm run start:frontend
```

Frontend:

```text
http://localhost:5173
```

The Vite development proxy forwards `/api` requests to the backend on port 5000.

### Optional: create/reset the demo administrator

```bash
cd backend
npm run setup-admin
```

## 5. Demo Credentials

### Student

- **Email:** `student@example.com`
- **Password:** `ChangeMe123!`

### Administrator

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

These credentials are intended for local demonstration only. They should be changed before any production deployment.

## 6. Main Functional Areas

### Student Portal

- Student registration and login
- Separate administrator login and protected administrator access
- Password recovery using a **6-digit email PIN**
- PIN expiry and single-use reset protection
- Editable student profile
- Income and expense transaction CRUD
- Personal categories
- Recurring income/expense transactions
- Monthly budgets with budget-usage alerts
- Dashboard showing balance, income, expenses and savings goal
- Monthly, daily, weekly and six-month reports
- PDF report export
- CSV preview, validation and batch import
- Rule-based expense-category suggestions
- Monthly spending insights with advisory guidance
- Saving tips with pin/dismiss controls
- Bookmarks for useful tips and insights
- In-app notifications, including read/delete controls
- Light/dark theme
- Adjustable font size for accessibility
- Responsive desktop and mobile navigation

### Administrator Control Center

The admin panel is intentionally kept separate from the student dashboard and organized into simple, self-explanatory sections:

1. **Dashboard** — view total students, active students, disabled accounts, transaction volume and popular categories.
2. **Students** — search student accounts and enable/disable access.
3. **Categories** — add, edit or remove default income and expense categories available to students.
4. **Saving Tips** — manage system saving-tip templates shown to students.
5. **Announcements** — create, edit or remove messages for students.

Administrator APIs are protected by administrator authorization.

### Public Website

The application also includes responsive public pages for:

- Home
- About
- Features
- Contact
- FAQ

Home/About/Features/Contact remain accessible while a user is logged in, while the administrator has a dedicated admin portal.

## 7. Reports and Data Handling

Campus Coin supports:

- Current-month dashboard summaries
- Monthly reports
- Daily reports
- Weekly reports
- Six-month income-vs-expense reports
- PDF export
- CSV import with preview and validation

Financial data is stored in MongoDB and is associated with the authenticated student account.

## 8. Assumptions and Scope

Campus Coin does **not** connect to real bank accounts and does not perform real payment processing or real-money transfers.

Income and expense information is entered manually or imported through CSV. Budgets, reports, tips and insights are based on the data entered by the student.

The intelligent categorization and monthly insight features are advisory. They are intended to help students understand their spending patterns and can be reviewed or overridden by the student. The current implementation includes a deterministic rule-based intelligence layer and does not require an external AI API key for its core insight flow.

## 9. Security Notes

- Protected APIs use JWT authentication.
- Administrator routes require administrator authorization.
- Passwords are protected using bcryptjs hashing.
- Password-reset records store a hash of the reset PIN/token and include expiry and used-state protection.
- Password-reset PINs are single-use and expire after 15 minutes.
- Production deployments should use strong secrets, HTTPS and properly configured SMTP.
- Do not expose SMTP passwords, JWT secrets or other private environment values in the frontend or in a public repository.

## 10. Documentation Included

The `docs/` folder contains project-support documentation including:

- Installation instructions
- Demo credentials
- Architecture notes
- Database design
- Test data
- Presentation runbook
- SRS compliance checklist
- AI usage acknowledgement
- Data-flow and user-flow diagrams
- Gmail SMTP setup notes

## 11. Presentation / Evaluation Notes

For a simple demonstration flow:

1. Open the public Home page.
2. Register or use the student demo account.
3. Add income and expense transactions.
4. Create a category and monthly budget.
5. Open Reports and export a PDF.
6. Import a small CSV file and review the validation preview.
7. Generate a monthly spending insight and pin/dismiss a saving tip.
8. Open the Admin Login.
9. Demonstrate the simplified Admin Dashboard, Students, Categories, Saving Tips and Announcements sections.
10. Verify that the admin portal is separate from the student dashboard.
11. Test password recovery with the email-PIN flow when SMTP is configured.

## 12. AI Tool Acknowledgement

AI-assisted tools were used as development support for guidance, debugging, UI refinement and implementation assistance.

The final project should be presented only after the developer has reviewed and understood the implementation. AI assistance does not replace the developer's own design decisions, testing, coding understanding or ability to explain the project during evaluation.
