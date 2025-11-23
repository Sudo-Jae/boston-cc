# Example backend for `index.html` — SendGrid integration

This example shows a minimal Express backend that accepts `POST /api/contact` and sends the submission to an email address using SendGrid.

Prerequisites
- Node.js (16+ recommended)
- A SendGrid account and an API key. You must verify the `CONTACT_FROM_EMAIL` sender in SendGrid or use a domain that SendGrid accepts.

Quick start

```sh
# from repo root
cd backend
npm install
# copy .env.example to .env and fill values
cp .env.example .env
npm start
```

By default the server listens on `http://localhost:3001`.

Configure the frontend
- If you run the static frontend from `http://localhost:8000`, either:
  - Add `data-endpoint="http://localhost:3001/api/contact"` to the `<form id="contactForm">` tag in `index.html` (this repo's `index.html` already uses the endpoint attribute), or
  - Leave the form as-is and the frontend `app.js` will fall back to `http://localhost:3001/api/contact`.

Environment variables
- Create `backend/.env` (copy from `.env.example`) and set:

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
CONTACT_TO_EMAIL=you@yourdomain.com
CONTACT_FROM_EMAIL=website@yourdomain.com
PORT=3001
ALLOWED_ORIGIN=http://localhost:8000
```

- Persistence & admin endpoint
- Added local persistence: incoming contact submissions are saved to `backend/messages.json`.
- Admin read endpoint: `GET /api/messages` returns saved submissions as JSON. Protect it using an `ADMIN_TOKEN` environment variable (example `.env.example`). To call it use `Authorization: Bearer <ADMIN_TOKEN>` header or `?token=<ADMIN_TOKEN>` query.

Notes & next steps
- This server logs incoming contact payloads and returns JSON responses. Replace the simple behaviour with your preferred persistence or integration if you need to store leads in a DB or forward to a CRM.
- For production you can:
  - Deploy this as a small Node service (e.g. on a VM, Heroku, or DigitalOcean App Platform),
  - Or port the route into a Next.js API route to keep it inside the same repo and hosting.
- Consider adding basic spam protections: a honeypot field, rate limiting, and CAPTCHA for higher-volume sites.

Security note: keep `ADMIN_TOKEN` secret (do not commit `.env`). Use production-grade auth for production deployments.

