FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml /app/

# Generate lock file and install dependencies
RUN poetry lock && poetry install --no-root

# Copy app source
COPY app/ /app/app

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
