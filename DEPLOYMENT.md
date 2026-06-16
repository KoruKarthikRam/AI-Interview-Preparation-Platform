# Deployment Guide: AI Interview Preparation Platform

This guide provides step-by-step instructions for deploying the AI Interview Preparation Platform in different environments. 

The application consists of:
1. **Frontend (Client)**: Next.js (App Router, React 19, Tailwind CSS)
2. **Backend (Server)**: Express.js (Node.js, TypeScript, Prisma)
3. **Database**: SQLite (local development) or PostgreSQL (production deployment)

---

## 🐋 Option 1: Docker Containerized Deployment (Recommended for VPS or local production)

This option uses the provided `docker-compose.yml` to spin up the client, server, and a dedicated PostgreSQL database in isolated containers.

### Prerequisites
- Docker and Docker Compose installed on your host machine.
- Your `GEMINI_API_KEY` (Google AI Studio key).

### Step-by-Step Instructions
1. Clone the repository onto your host server/system.
2. In the root directory, create a `.env` file containing your Gemini key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the following command to build and launch the containers:
   ```bash
   docker compose up -d --build
   ```
4. Verify the containers are running:
   ```bash
   docker compose ps
   ```
5. Access the services:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000/api`
   - **Database**: Port `5432`

*Note: On container startup, the backend automatically runs scripts to switch the Prisma schema to PostgreSQL, runs the Prisma migrations (`db push`), and spins up the Node.js application.*

---

## ☁️ Option 2: Cloud PaaS Deployment (Recommended for scalability & zero maintenance)

This is the standard approach using cloud providers. We deploy the **Frontend to Vercel**, the **Backend to Render/Railway**, and the **Database to Neon/Supabase**.

### Step 1: Create a PostgreSQL Database
Deploy a database using a free PostgreSQL host like **Neon.tech** or **Supabase**.
1. Create a database instance and copy the **Connection String** (URI).
2. The URL will look like: `postgresql://username:password@hostname:port/database_name?sslmode=require`.

### Step 2: Deploy the Backend (Render/Railway)
We will host the Express backend on a platform that supports persistent services.

#### Using Render:
1. Create a **New Web Service** and link your GitHub repository.
2. Set the root directory to `server`.
3. Set the **Build Command** to:
   ```bash
   npm run prisma:use-postgres && npm install && npm run build
   ```
4. Set the **Start Command** to:
   ```bash
   npx prisma db push && npm start
   ```
5. Add the following **Environment Variables**:
   - `PORT`: `5000` (Render will map this automatically)
   - `DATABASE_URL`: `your_postgresql_connection_string_copied_earlier`
   - `JWT_SECRET`: `your_strong_random_secret_string`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` (You can update this after deploying the frontend)

### Step 3: Deploy the Frontend (Vercel)
Vercel is the natural choice for Next.js deployments.
1. Create a **New Project** on Vercel and import your repository.
2. Set the root directory to `client`.
3. Vercel will auto-detect Next.js. Keep the default build settings (`npm run build`).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api` (Use the URL assigned to your backend Web Service)
5. Click **Deploy**. Once completed, copy the frontend URL and update the `CLIENT_URL` variable in your Render backend settings to resolve CORS permissions.

---

## 🖥️ Option 3: VPS Self-Hosting (Ubuntu, PM2, Nginx)

If you are deploying directly to an Ubuntu VPS (DigitalOcean, AWS EC2, Linode, etc.) without Docker.

### 1. Install Node.js, PM2, Nginx, and Git
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install pm2 -g

# Install Nginx
sudo apt install nginx -y
```

### 2. Configure Database & Environment
1. Set up a PostgreSQL instance on your server, or use SQLite if you mount a persistent path.
2. Clone your codebase:
   ```bash
   git clone https://github.com/KoruKarthikRam/AI-Interview-Preparation-Platform.git /var/www/ai-interview-platform
   cd /var/www/ai-interview-platform
   ```

### 3. Build & Run Backend
```bash
cd /var/www/ai-interview-platform/server

# Create production .env file
nano .env
# Include PORT, JWT_SECRET, GEMINI_API_KEY, and DATABASE_URL

# Switch to Postgres (if deploying with Postgres, otherwise skip)
npm run prisma:use-postgres

# Install dependencies and build
npm install
npm run build
npx prisma generate
npx prisma db push

# Start with PM2
pm2 start dist/app.js --name "ai-interview-backend"
```

### 4. Build & Run Frontend
```bash
cd /var/www/ai-interview-platform/client

# Create production .env file
nano .env.local
# Add: NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Install and build
npm install
npm run build

# Start Next.js server with PM2
pm2 start npm --name "ai-interview-frontend" -- start
```

### 5. Configure Nginx Reverse Proxy
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/ai-interview
```
Add the following layout:
```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or IP

    # Client application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ai-interview /etc/nginx/sites-enabled/
sudo nginx -t
sudo system service nginx restart
```

---

## 🛠️ Verification & Troubleshooting

- **Check API Status**: Hit `https://<your-backend-domain>/health` in your browser. It should return:
  `{"status":"ok","message":"AI Interview Prep API is running smoothly"}`.
- **Prisma Client Issues**: If you get a mismatch error, run `npx prisma generate` inside the build context to recompile the types.
- **CORS Issues**: Ensure the frontend host matches one of the values inside the backend `CLIENT_URL` variable.
- **Gemini Mock Mode**: If features return static mock responses, verify that the `GEMINI_API_KEY` is loaded and valid.
