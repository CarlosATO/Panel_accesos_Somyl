### Multi-stage Dockerfile
# 1) Build React frontend
# 2) Install Python libs and copy backend + frontend build

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/vite.config.* ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps for building bcrypt etc (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc libffi-dev && rm -rf /var/lib/apt/lists/*

# copy backend
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy app source
COPY . /app

# copy frontend build output to static folder expected by Flask (frontend/dist)
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5001

# Make sure Flask uses production server in entrypoint (gunicorn recommended)
CMD ["sh", "-lc", "gunicorn --bind 0.0.0.0:${PORT:-5001} app:app --workers 3"]
