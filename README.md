# ResumeAI — Full-Stack Resume Analyzer

AI-powered resume analysis, skill gap insights, interview prep, resume builder, and HR batch screening.

## Stack

- **Frontend:** React, Vite, Tailwind, shadcn/ui
- **Backend:** Flask (Python)
- **Database:** MongoDB

## Local development

### Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io/)
- Python 3.12+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then edit .env
python app.py
```

API runs at `http://localhost:5001` (health: `/health`).

### Frontend

```bash
cp frontend/.env.example frontend/.env   # edit if needed
pnpm install
pnpm run dev:frontend
```

App runs at `http://localhost:5173`.

## Environment variables

| Variable | Where | Description |
|----------|--------|-------------|
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret for auth tokens |
| `GEMINI_API_KEY` | Backend | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | Backend + Frontend | OAuth client ID |
| `FRONTEND_URL` | Backend | Deployed frontend URL (CORS) |
| `VITE_API_URL` | Frontend | Deployed backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Same as `GOOGLE_CLIENT_ID` |

## Push to GitHub

```bash
git add .
git commit -m "Add ResumeAI app with deploy config"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub details.

## Deploy

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` for cloud hosts).
3. Copy the connection string → use as `MONGO_URI`.

### 2. Backend — [Render](https://render.com)

1. New **Web Service** → connect your GitHub repo.
2. Use **Blueprint** (`render.yaml`) or set manually:
   - **Root directory:** `backend`
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
3. Add environment variables from `backend/.env.example`.
4. Set `FRONTEND_URL` after you deploy the frontend (e.g. `https://your-app.vercel.app`).
5. Copy the service URL (e.g. `https://resume-ai-api.onrender.com`).

### 3. Frontend — [Vercel](https://vercel.com)

1. Import the GitHub repo.
2. Framework preset: **Other** (or use `vercel.json` at repo root).
3. Environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
4. Deploy.

### 4. Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized JavaScript origins:** `http://localhost:5173`, your Vercel URL
- **Authorized redirect URIs:** same origins (OAuth popup flow)

Update `GOOGLE_CLIENT_ID` on Render and `VITE_GOOGLE_CLIENT_ID` on Vercel.

## Project structure

```
backend/          Flask API
frontend/         React app
render.yaml       Render deploy blueprint
vercel.json       Vercel deploy config
```

## License

MIT
