# Project OS

Interior/Construction Change Approval OS MVP.

## Setup

1. **Create a Supabase project**
   - Grab the **Project URL**, **anon key**, and **service role key** from the Supabase dashboard.

2. **Create the database schema**
   - Open the Supabase SQL editor and run `supabase/schema.sql`.

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local` and fill in the values.

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Create a new Vercel project from the repo.
3. Set the same environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_BASE_URL` (e.g. `https://your-project.vercel.app`)
4. Deploy.

## Usage Flow

1. Designer logs in via magic link (`/login`).
2. Create a project (`/projects/new`).
3. Add approved budget items and draft change requests.
4. Send a change request to client to generate a public approval link.
5. Client approves or rejects via `/approve/[token]`.
6. Audit log captures the approval action (`/projects/[id]/audit`).
