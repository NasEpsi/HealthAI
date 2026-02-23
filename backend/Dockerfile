FROM python:3.12-slim

WORKDIR /app

# deps système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# install python deps
COPY pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir -U pip && pip install --no-cache-dir "uvicorn[standard]" && pip install --no-cache-dir .

# code
COPY src /app/src

ENV PYTHONPATH=/app/src
EXPOSE 8000

CMD ["uvicorn", "healthai.api.main:app", "--host", "0.0.0.0", "--port", "8000"]