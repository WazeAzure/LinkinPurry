# Development Dockerfile for Frontend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the project files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the development server with hot reloading
CMD ["npm", "run", "dev", "--", "--host"]
