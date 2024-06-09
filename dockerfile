# Use an official node runtime as a parent image
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use an official node runtime as a parent image for the production environment
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app /app

# Set environment variables
ENV NODE_ENV production
ENV PORT 3002

# Expose the port the app runs on
EXPOSE 3002

# Run the application
CMD ["node", "dist/server"]