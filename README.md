## Learner Intervention Tracker

Full-stack Next.js 16 application for EdTech mentors to track at-risk learners and intervention plans with secure CRUD operations.

## Getting Started

Create `frontend/.env.local`:

```bash
MONGODB_URI=<your_mongodb_uri>
AUTH_SECRET=<long_random_secret>
ADMIN_EMAIL=<admin_email_for_elevated_role>
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - run local development
- `npm run lint` - run ESLint
- `npm run build` - create production build
- `npm run test:integration` - run Vitest integration tests
- `npm run test:e2e` - run Playwright end-to-end tests

## CI/CD

GitHub Actions pipeline is configured at `.github/workflows/ci.yml` with:
- lint
- build
- integration tests
- e2e tests

## Security and Architecture Notes

See `docs/ARCHITECTURE_SECURITY.md`.

## Deployment

Deploy to Vercel (recommended for Next.js) or Netlify, then set environment variables in hosting dashboard:
- `MONGODB_URI`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
