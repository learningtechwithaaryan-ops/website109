# VPS Installation Guide for Black-Link-Hub

This guide explains how to install and set up the Black-Link-Hub (GAMEZONE) application on a standard Linux VPS.

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

## 1. Environment Variables (.env)
Create a `.env` file in the root directory and add the following. Replace the placeholders with your actual values:

```env
# Database Configuration
# Replace 'user', 'password', and 'blacklinkhub' with your actual DB credentials
DATABASE_URL=postgresql://user:password@localhost:5432/blacklinkhub

# Authentication
# Generate a long random string for session security
SESSION_SECRET=your_random_long_secret_string

# Application Configuration
PORT=5000
NODE_ENV=production

# Admin Credentials (Set these for your first login)
ADMIN_EMAIL=aaryabpandey@gmail.com
ADMIN_PASSWORD=pandeyaarya254
```

## 2. Installation Steps

### Step 1: Clone the repository
```bash
git clone <your-repo-url>
cd Black-Link-Hub
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Database Setup
Ensure PostgreSQL is running and the database specified in `DATABASE_URL` exists.
Then, push the schema:
```bash
npm run db:push
```

### Step 4: Build the application
```bash
npm run build
```

## 3. Running the Server

### Using PM2 (Recommended for VPS)
PM2 ensures your application restarts automatically if it crashes or the server reboots.
```bash
npm install -g pm2
pm2 start dist/index.cjs --name gamezone
```

## 4. Reverse Proxy (Optional but Recommended)
To access your app on port 80 (HTTP) or 443 (HTTPS), use Nginx.

### Nginx Example Config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 5. Cloudflare Tunnel (Alternative)
If you are using the Cloudflare Tunnel setup:
1. Install `cloudflared` on your VPS.
2. Run: `cloudflared tunnel run --token <YOUR_TOKEN>`
