#!/usr/bin/env bash
# Full deploy helper — requires scripts/.env.deploy.local (see env.deploy.example)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/scripts/.env.deploy.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Create $ENV_FILE from scripts/env.deploy.example and fill secrets."
  echo "Then run: bash scripts/deploy-all.sh"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

missing=()
for v in MONGO_URI JWT_SECRET GEMINI_API_KEY GOOGLE_CLIENT_ID VITE_API_URL VITE_GOOGLE_CLIENT_ID; do
  [[ -z "${!v:-}" ]] && missing+=("$v")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing in .env.deploy.local: ${missing[*]}"
  exit 1
fi

echo "==> Vercel frontend"
export VITE_API_URL VITE_GOOGLE_CLIENT_ID
bash "$ROOT/scripts/deploy-vercel.sh"

echo ""
echo "==> Render backend (manual — CLI needs login)"
echo "1. Terminal: render login"
echo "2. Dashboard: https://dashboard.render.com → New Web Service → repo resume-analyzer-builder"
echo "   Root: backend | Start: gunicorn wsgi:app --bind 0.0.0.0:\$PORT --workers 2 --timeout 120"
echo "3. Paste env from scripts/.env.deploy.local (MONGO_URI, JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID)"
echo "4. Set FRONTEND_URL to your Vercel URL, redeploy Render"
echo "5. Test: curl \$VITE_API_URL/health"
