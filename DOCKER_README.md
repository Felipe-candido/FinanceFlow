This project contains a FastAPI backend and a Next.js frontend. The files added here help you run both services using Docker Compose locally.

Quick start

1. Copy example env files to real env files (do NOT commit secrets):

```bash
cp .env.backend.example .env.backend
cp .env.frontend.example .env.frontend
```

2. (Optional) Edit `.env.backend` and `.env.frontend` to set real keys and database credentials.

3. Build and start services:

```bash
docker compose build
docker compose up -d
```

4. Run Alembic migrations (one-time / after DB reset):

```bash
docker compose run --rm backend alembic upgrade head
```

5. Open the frontend at `http://localhost:3000` and the backend at `http://localhost:8000`.

Exposing to the internet

- For quick public access use a tunnel like `ngrok` or `cloudflared`:

```bash
ngrok http 3000
```

- For production deploy to dedicated providers (Vercel for frontend, Railway/Render/Fly for backend, Supabase for DB).

Notes

- The backend `Dockerfile` installs system packages needed for `psycopg`/Postgres and builds Python deps. If you use a hosted Postgres (Supabase) you can remove the `db` service from `docker-compose.yml` and set `DATABASE_URL` accordingly.
- Use the `postgresql+psycopg://` URL prefix when running locally, because the backend dependencies include `psycopg` (psycopg3).
- Keep secrets out of git; use environment-specific secret stores in production.
