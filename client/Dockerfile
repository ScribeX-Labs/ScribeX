# Base image for development
FROM node:18-alpine AS dev
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including devDependencies
RUN pnpm install

# Copy all source code
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Run the Next.js app in development mode with hot-reloading
CMD ["pnpm", "run", "dev"]
