# Use an official Node runtime as a parent image
FROM node:alpine

# Install Bash
RUN apk add bash

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
# COPY . .

# Install any needed packages
# Uncomment the following line if you want to perform npm install during the build
# RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
# ENV NODE_ENV development
# ENV WATCHPACK_POLLING true
# Run npm start when the container launches
# Uncomment the following line if you want to start your application automatically
# CMD ["npm", "start"]
CMD ["sleep", "infinity"]
