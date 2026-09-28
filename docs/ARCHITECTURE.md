# Campus Coin — Architecture

Campus Coin follows a three-layer full-stack architecture described by the SRS.

## Presentation layer

React 18 + Vite + React Router provide:
- public marketing pages
- student dashboard and finance tools
- admin control center
- responsive navigation
- charts, reports and accessibility controls

## Application/API layer

Node.js + Express provide:
- authentication and authorization
- transaction/category/budget logic
- reporting
- CSV import
- recurring transaction processing
- saving tips and insights
- bookmarks and notifications
- admin operations

## Data layer

MongoDB + Mongoose store users, transactions, categories, budgets, insights, tips, bookmarks, notifications, announcements and password-reset records.

## Security boundaries

- JWT authentication middleware protects student APIs.
- Admin middleware protects administrative APIs.
- Student and admin login flows are separated at the UI level.
- Password reset tokens are stored hashed and expire.
- Users are scoped to their own financial records.
