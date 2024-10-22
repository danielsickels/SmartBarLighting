#!/bin/bash

# Build the Docker image
docker build -t fastapi-poetry .

# Run the Docker container in development mode with volume mount
docker run -it --rm \
  -v "$(pwd):/app" \
  -w /app \
  -p 8000:8000 \
  fastapi-poetry \
  poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
