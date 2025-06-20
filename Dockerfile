# Step 1
FROM node:20
WORKDIR /app

# Step 2: Copy package.json and install root dependencies
COPY package*.json ./
RUN npm install

# ⬇️ Step 3: Copy the .env file
COPY .env .env

# Step 4: Copy rest of the app
COPY . .

# Step 5: Build frontend
RUN cd frontend && npm install && npm run build

# Step 6: Expose backend port
EXPOSE 8000

# Step 7: Start backend
CMD ["npm", "start"]
