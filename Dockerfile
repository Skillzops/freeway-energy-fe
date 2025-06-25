# Set the base image
FROM node:20-alpine

# Create a user with permissions to run the app
RUN addgroup -S app && adduser -S -G app app

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies as root to avoid permission issues
USER root
RUN npm install

# Change ownership of node_modules to the app user
RUN chown -R app:app /app/node_modules

# Switch to app user
USER app

# Copy the rest of the files, ensuring ownership
COPY --chown=app:app . .

# Expose port 5173
EXPOSE 5173

# Command to run both the development server and tests
CMD ["npm", "run", "dev"]
