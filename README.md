# Zeno Store

A mobile-first watch-store project built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Auth.js.

> **Project status:** This repository is still under development. Do not treat checkout, reviews, admin provisioning, or production database setup as production-ready until each flow has been tested on the deployed site.

## Technology

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Auth.js credentials authentication
- Zod validation
- Optional Cloudinary product images

## Requirements

- Node.js LTS and npm
- A PostgreSQL database (for example, a Neon database)
- Environment variables configured locally and in Vercel

## Local setup

1. Clone the repository and enter its directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in valid values. At minimum, configure `DATABASE_URL` and a strong `AUTH_SECRET`. Never commit `.env` or share secret values.
4. Generate the Prisma client:

   ```bash
   npm run db:generate
   ```

5. Apply the database schema using the database workflow agreed for this repository. If Prisma migrations are present, use the migration deployment command; do not assume that running `prisma generate` creates database tables.
6. To load the sample products and the `NEW20` coupon, review `prisma/seed.ts` and then run:

   ```bash
   npm run db:seed
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Admin account

Admin credentials must be configured as environment variables named `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The variables alone do not create an account. After the database schema is initialized, run the provisioning script in a trusted environment:

```bash
npm run admin:provision
```

Use a unique, strong password. Never paste credentials or database URLs into issues, screenshots, or chat messages.

## Build checks

```bash
npm run db:generate
npm run typecheck
npm run lint
npm run build
```

A successful build confirms compilation only; it does not prove that database migrations, login, ordering, or admin flows work at runtime.

## Deployment notes

- Configure the required environment variables in Vercel for the correct environment.
- Ensure the database schema is applied before using database-backed pages or API routes.
- Deployments should use committed, reproducible dependency versions and a lockfile.
- Cloudinary images are allowed through Next.js image configuration, but Cloudinary credentials and upload flows must be configured separately.

## Planned / still to verify

- Complete customer storefront and account flows
- Cart and checkout
- Order management and tracking
- Product and stock administration
- Coupon validation
- Product reviews
- Store settings
- Automated tests for authentication, inventory, coupons, and orders

Do not store payment-card data in this application. Add a trusted payment provider if online payments are introduced.
