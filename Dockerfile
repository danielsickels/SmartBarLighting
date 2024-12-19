FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy files
COPY pyproject.toml poetry.lock /app/

# Install dependencies
RUN poetry install --no-root

# Copy app source
COPY app/ /app/app

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
