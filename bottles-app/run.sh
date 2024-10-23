#!/bin/bash

# Define a name for the Docker image
IMAGE_NAME="bottles-front-end"

# Define a name for the Docker container
CONTAINER_NAME="bottles-container"

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Check if a container with the same name already exists
if [ $(docker ps -a -q -f name=$CONTAINER_NAME) ]; then
    # Stop and remove the existing container
    echo "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Run the Docker container, exposing port 3000
echo "Running Docker container..."
docker run -v $(pwd):/usr/src/app -eWATCHPACK_POLLING=true -dp 3000:3000 --name $CONTAINER_NAME $IMAGE_NAME

echo "Container is running on http://localhost:3000/"
