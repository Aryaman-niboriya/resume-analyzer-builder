#!/usr/bin/env bash
# Deploy frontend to Vercel (requires: vercel login, VITE_API_URL)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${VITE_API_URL:-}" ]]; then
  echo "Set VITE_API_URL to your Render backend URL, e.g.:"
  echo "  export VITE_API_URL=https://resume-ai-api.onrender.com"
  exit 1
fi

if [[ -z "${VITE_GOOGLE_CLIENT_ID:-}" ]]; then
  echo "Warning: VITE_GOOGLE_CLIENT_ID not set (Google login may fail)"
fi

vercel link --yes --project resume-analyzer-builder 2>/dev/null || vercel link --yes

printf '%s' "$VITE_API_URL" | vercel env add VITE_API_URL production --force 2>/dev/null || true
if [[ -n "${VITE_GOOGLE_CLIENT_ID:-}" ]]; then
  printf '%s' "$VITE_GOOGLE_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID production --force 2>/dev/null || true
fi

vercel deploy --prod --yes
