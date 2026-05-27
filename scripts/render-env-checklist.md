# Render environment (paste in Dashboard → Environment)

| Key | Example / notes |
|-----|-----------------|
| `MONGO_URI` | `mongodb+srv://resumeai_user:PASSWORD@cluster0.ydf2qm5.mongodb.net/saas_display?retryWrites=true&w=majority` |
| `JWT_SECRET` | long random string |
| `GEMINI_API_KEY` | from Google AI Studio |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `FRONTEND_URL` | your Vercel URL after deploy |

**Service settings:** Root `backend`, Start: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

Test: `GET https://YOUR-SERVICE.onrender.com/health` → `"mongodb": "connected"`
