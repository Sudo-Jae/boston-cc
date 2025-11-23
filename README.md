This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local static preview + example backend

This repository includes a static `index.html` preview alongside a minimal example backend in `backend/` which accepts `POST /api/contact` and (optionally) sends email via SendGrid.

Quick preview steps:

```sh
# serve the static preview
cd ~/boston-cc
python3 -m http.server 8000 --directory .
# open http://localhost:8000/index.html

# run the backend in a separate shell
cd backend
npm install
# copy .env.example -> .env and configure keys if you want real email sending
cp .env.example .env
PORT=3002 npm start

# run a smoke test (backend/test/test_flow.sh)
cd backend
npm run test:smoke
```

Notes:
- The backend persists incoming contact submissions to `backend/messages.json` (local dev only).
- An admin endpoint `GET /api/messages` returns saved submissions; protect it in production using `ADMIN_TOKEN` in `backend/.env`.
- Spam protections include a hidden honeypot field and a simple in-memory rate limiter.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
