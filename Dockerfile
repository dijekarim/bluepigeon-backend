# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application's source code to the working directory
COPY . .

# Build the application
RUN npm run build

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run the application
CMD [ "npm", "run", "server" ]
