#!/usr/bin/env bash
# Helper: build the React frontend and ensure build is present at frontend/dist
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
echo "Building frontend (Vite) in $ROOT_DIR/frontend"
cd "$ROOT_DIR/frontend"
npm install
npm run build

echo "Build finished. The built files are in frontend/dist and will be served by Flask as static assets."
