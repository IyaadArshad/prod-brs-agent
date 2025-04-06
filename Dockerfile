# Use the current Node.js LTS image as the base image
FROM node:22.14.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 1013

# Start the Next.js application with the custom port
CMD ["sh", "-c", "PORT=1013 npm start"]
