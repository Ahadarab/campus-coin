# Campus Coin — Database Design

Campus Coin uses MongoDB with Mongoose schemas. The SRS explicitly permits MongoDB and does not require a particular table structure.

## Main entities

### User
- `_id`
- `name`
- `email`
- `password`
- `role`
- `academicYear`
- `monthlyAllowanceBaseline`
- `monthlySavingsGoal`
- `currency`
- account status/timestamps

### Category
- `_id`
- `name`
- `type` (`income` / `expense`)
- `isDefault`
- `userId` for personal categories
- presentation metadata

### Transaction
- `_id`
- `userId`
- `categoryId`
- `amount`
- `type`
- `description`
- `date`
- recurrence fields
- AI suggested category
- timestamps

### Budget
- `_id`
- `userId`
- `categoryId`
- `month`
- `limitAmount`

### Insight
- `_id`
- `userId`
- `month`
- `summaryText`
- `notablePattern`
- `tipText`
- bookmark/generation metadata

### Tip
- `_id`
- category/template fields
- priority and savings impact
- student pin/dismiss state

### Bookmark
- `_id`
- `userId`
- `contentType`
- `contentId`
- title/snippet/metadata

### Notification
- `_id`
- `userId`
- notification type/title/message/link
- read state

### PasswordResetToken
- `_id`
- `userId`
- SHA-256 token hash
- expiry
- used state

### Announcement
- `_id`
- title/message/priority
- broadcast/created metadata

## Relationships

- User 1-to-many Transaction
- User 1-to-many Budget
- User 1-to-many Insight
- User 1-to-many Bookmark
- User 1-to-many Notification
- User 1-to-many personal Category
- Category 1-to-many Transaction
- Category 1-to-many Budget
- User 1-to-many PasswordResetToken
