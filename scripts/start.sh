#!/usr/bin/env sh
# Start script that ensures PORT is numeric and launches Gunicorn with a safe default.

if [ -z "${PORT}" ]; then
  echo "PORT not set — falling back to 5001"
  PORT=5001
fi

# Basic validation: ensure PORT is a number
case "$PORT" in
  ''|*[!0-9]*)
    echo "Provided PORT='${PORT}' is not a valid numeric port — exiting" >&2
    exit 1
    ;;
  *)
    echo "Using PORT=${PORT}"
    ;;
esac

exec gunicorn --bind 0.0.0.0:${PORT} app:app --workers 3
