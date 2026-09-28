# Gmail SMTP setup for password-reset PINs

The backend loads `backend/.env` when started with `npm run start:backend` or from the `backend` directory.

Set:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=smsproject2405a@gmail.com
EMAIL_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
EMAIL_FROM="Campus Coin <smsproject2405a@gmail.com>"
```

`EMAIL_PASSWORD` must be a Google App Password, not the normal Gmail password.

After changing `.env`, fully restart the backend. A successful reset request logs:

`[Password Reset] PIN email sent to ...`

If SMTP authentication/delivery fails, the API now returns HTTP 503 and the backend console prints the SMTP error code/message. The generated PIN is invalidated when email delivery fails.
