# Use Node.js 18 as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Install TypeScript globally (optional, if not already in package.json)
RUN npm install -g typescript

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port (change this if your Express server uses a different port)
EXPOSE 3000

# Start the server using the compiled JavaScript files
CMD ["npm", "run", "start"]
