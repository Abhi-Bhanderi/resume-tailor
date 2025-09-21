# Resume Tailor Monorepo

This repository contains the **Proof-first Resume Tailoring** platform built with a Turborepo monorepo structure. The first milestone focuses on AI-assisted resume tailoring against a target job description, highlighting the exact phrases that should be updated for ATS alignment.

## Apps

- `apps/web` – Next.js 14 application (App Router) that powers the authenticated dashboard, resume upload workflow, and AI-driven tailoring insights.

## Key Features

- Email/password authentication with verification links and Google OAuth via NextAuth.
- Resume ingestion (PDF, DOCX, TXT) mapped against a job description.
- OpenAI-powered analysis returning suggested wording updates, mapped requirements, and ATS confidence.
- Highlighted resume view showing phrases that should be updated.
- Prisma + PostgreSQL persistence for users and stored analyses.

## Tech Stack

- Turborepo workspace with Next.js, TypeScript, Tailwind CSS.
- Prisma ORM with PostgreSQL.
- NextAuth for authentication.
- OpenAI API for resume tailoring intelligence.

## Getting Started

1. Install dependencies (requires Node 18+):

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in credentials:

   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   ```

3. Generate the Prisma client and run database migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate --workspace=@resume-tailor/web
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The web application will be available at `http://localhost:3000`.

## Environment Variables

See `.env.example` and `apps/web/.env.example` for the required values. You will need PostgreSQL, SMTP credentials for email verification, and an OpenAI API key.

## Tailoring Endpoint

`POST /api/tailor` (authenticated) accepts multipart form data with a resume file (`resume`) and job description text (`jobDescription`). It returns the AI-generated tailoring response and stores the analysis in the database.

## Scripts

- `npm run dev` – starts all apps in dev mode via Turborepo.
- `npm run build` – builds all apps.
- `npm run lint` – runs linting for all apps.
- `npm run test` – placeholder for future automated tests.
- `npm run prisma:generate` – regenerates Prisma client in all workspaces.

## Roadmap

Future milestones will extend the Verifiable Resume Graph with proof artifacts, gap-closing plans, and shareable links with optional peer confirmations.
