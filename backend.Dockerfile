# Dockerfile.backend
FROM python:3.13-slim

ENV PDM_IGNORE_SAVED_PYTHON=1 \
    PDM_USE_VENV=false \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir pdm

WORKDIR /app

COPY pyproject.toml ./

RUN pdm install --prod --no-editable

COPY . .

EXPOSE 8000

CMD ["pdm", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
