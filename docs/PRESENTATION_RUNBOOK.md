# Campus Coin — Presentation Runbook

## 1. Opening (30 seconds)

“Campus Coin is a student-first budgeting and expense management platform. It helps students track income and expenses, set category budgets, understand spending trends, and receive personalized saving guidance.”

## 2. Public website (1 minute)

Show:
- Home
- About
- Features
- Contact
- Sitemap section
- responsive navbar

Mention that the same public navigation remains available after authentication.

## 3. Student flow (3–4 minutes)

1. Sign in as student.
2. Show dashboard balance and widgets.
3. Add an income transaction.
4. Add an expense.
5. Edit/delete a transaction.
6. Create a personal category.
7. Create a monthly budget.
8. Show progress/alerts.
9. Open Saving Tips and pin/dismiss one.
10. Generate AI-style monthly insight.
11. Open Bookmarks.
12. Open Reports and export PDF.
13. Open CSV Import and show preview/validation.
14. Show recurring transaction controls.
15. Toggle dark mode/font size.

## 4. Authentication (1 minute)

Show Forgot Password, enter a registered email, and explain that Campus Coin sends a 6-digit PIN to the user’s email. The PIN expires after 15 minutes and can be used once. For local development without SMTP, the generated PIN is shown for demo purposes.

## 5. Admin flow (2 minutes)

1. Open Admin Login.
2. Enter admin credentials.
3. Show overview statistics.
4. Search/inspect students.
5. Enable/disable a student account.
6. Search a student and demonstrate enabling/disabling account access.
7. Show default category management.
8. Show saving-tip templates.
9. Show announcement/broadcast controls.

## 6. Closing (30 seconds)

“Campus Coin implements the core functional and non-functional requirements in the supplied SRS, while keeping optional advanced AI integrations replaceable and clearly advisory.”

## If asked about AI

Say: “The current build uses a deterministic intelligent categorization and insight engine so the product works without an external AI key. The service boundary is isolated, so an external AI provider can be connected later.”

## If asked about banking

Say: “The SRS explicitly keeps real banking verification, payment processing and real-money transactions outside the project scope. Campus Coin works with manually entered or CSV-imported data.”
