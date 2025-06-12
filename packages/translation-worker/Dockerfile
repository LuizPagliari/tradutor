# Use a Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app/packages/translation-worker

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache
COPY packages/translation-worker/package*.json ./ 

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY packages/translation-worker/src ./src
COPY packages/translation-worker/.env ./.env
COPY packages/translation-worker/config ./config

# Command to run the application
CMD ["npm", "start"] 