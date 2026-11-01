FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Separate layer so dependency installs are cached across code changes.
COPY src/backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src/backend /app/src/backend
COPY src/frontend /app/src/frontend

RUN useradd --create-home --uid 10001 app \
 && mkdir -p /data/uploads && chown -R app:app /data/uploads /app
USER app

WORKDIR /app/src/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
