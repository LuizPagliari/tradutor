# Use a Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app/packages/translation-api

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache
COPY packages/translation-api/package*.json ./ 

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY packages/translation-api/src ./src
COPY packages/translation-api/.env ./.env
COPY packages/translation-worker/config/google-credentials.json /app/packages/translation-worker/config/google-credentials.json

# Expose the port the API will run on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"] 