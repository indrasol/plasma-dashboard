# Use an official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Set environment variables to prevent Python from writing pyc files to disc
# and buffering stdout and stderr.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container.
WORKDIR /app

# Copy the requirements file to the container.
# We copy this first to leverage Docker cache layers.
COPY server_fastapi/requirements.txt .

# Install production dependencies.
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the server code into the container.
# We copy the 'server_fastapi' folder into '/app/server_fastapi'
COPY server_fastapi/ ./server_fastapi/

# Copy the root .env file if it exists (Optional: Cloud Run usually injects env vars)
# COPY .env . 

# Expose the port that the application listens on.
# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
ENV PORT=8080

# Run the web service on container startup.
# We use the module syntax (server_fastapi.main:app)
# host 0.0.0.0 is critical for running inside Docker
CMD ["sh", "-c", "uvicorn server_fastapi.main:app --host 0.0.0.0 --port ${PORT}"]

