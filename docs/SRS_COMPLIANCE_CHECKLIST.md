# Campus Coin — SRS v1.0 Compliance Checklist

This checklist maps the supplied Campus Coin SRS to the implementation included in this package.

## Core functional requirements

| Requirement | Status | Implementation evidence |
|---|---|---|
| Student registration and login | Complete | React auth pages + JWT API |
| Separate administrator login | Complete | `/admin/login` + admin-only middleware |
| Secure session management | Complete | JWT auth middleware, protected routes |
| Password recovery/reset | Complete | One-time hashed reset token with expiry |
| Editable student profile | Complete | Profile API + Settings page |
| CSV transaction import | Complete | Preview, validation, batch import |
| Personal income/expense categories | Complete | Category CRUD |
| Personalized dashboard | Complete | Balance, top category, budget/actual, recent activity |
| Income/expense logging | Complete | Create/edit/delete transactions |
| Recurring entries | Complete | Daily/weekly/monthly/yearly recurrence + processor |
| Expense categorization assistant | Complete | Deterministic category suggestion engine; manual override remains available |
| Batch CSV category suggestions | Complete | CSV preview invokes category suggestions for uncategorized/miscellaneous rows |
| Monthly category reports | Complete | Reports page/API |
| Six-month income vs expense | Complete | Reports API/UI |
| Daily/weekly summaries | Complete | Reports API/UI |
| Report filters | Complete | Date/category/source filters |
| PDF report export | Complete | Server-side PDF export |
| Monthly spending insights | Complete | Insight generation + history |
| Personalized saving tips | Complete | Tip engine based on spending/budgets |
| Pin/dismiss saving tips | Complete | Tip API/UI |
| Budget goals and progress | Complete | Budget CRUD + real-time percentage/progress |
| Budget notifications | Complete | Notification service + in-app notifications |
| Bookmark tips/insights | Complete | Bookmark model/API/UI |
| Admin categories | Complete | Admin Control Center |
| Admin templates/announcements | Complete | Admin CRUD + broadcast notifications |
| Admin user oversight | Complete | Search, enable/disable |
| Admin usage statistics | Complete | Overview statistics |
| Dark mode | Complete | Theme context + UI toggle |
| Font-size accessibility | Complete | Theme/accessibility controls |
| Responsive UI | Complete | Responsive CSS and navigation |
| Breadcrumb/navigation clarity | Implemented through structured app navigation | Student/admin navigation |
| Loading/error feedback | Complete | Loading states, alerts, toasts |
| Sitemap | Complete | `frontend/public/sitemap.xml` + homepage sitemap section |

## Optional SRS capabilities

The SRS marks these as optional/advanced and they are not required for the core submission:

- External AI provider integration
- Recently viewed/edited transaction tracking across sessions
- Monthly forecasting
- Large/duplicate transaction detection
- Email sharing of reports
- AI chatbot integration

## Submission deliverables included in this package

- Installation instructions
- Demo credentials
- Database/schema design notes
- Test data notes
- Architecture description
- User-flow and data-flow diagrams
- SRS compliance checklist
- Presentation runbook
- Existing automated test script

## Verification note

Backend JavaScript syntax was verified with `node --check`. A full frontend production build was not completed in the packaging environment because dependency installation timed out. Run the installation commands in `docs/INSTALLATION.md` before the presentation and perform the smoke test in `docs/PRESENTATION_RUNBOOK.md`.
