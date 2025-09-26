# 🚀 Deployment Guide - CV Management System

This guide will walk you through deploying the CV Management System to GitHub and Vercel.

## 📋 Prerequisites

Before starting, make sure you have:
- [Git](https://git-scm.com/) installed
- A [GitHub](https://github.com/) account
- A [Vercel](https://vercel.com/) account
- A PostgreSQL database (we recommend [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))

## 🔧 Step 1: Prepare Your Project

### 1.1 Clean Up Sensitive Files
The project is already configured to exclude sensitive files, but double-check:

```bash
# Make sure these files are NOT committed:
# - .env
# - .env.local
# - my-web-391112-18a52fc84a32.json (Google service account key)
```

### 1.2 Verify Build Process
```bash
npm install
npm run build
```

## 📤 Step 2: Upload to GitHub

### 2.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: CV Management System v1.5"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/) and sign in
2. Click "New repository"
3. Name it `cv-management-system` (or your preferred name)
4. Set it to **Private** (recommended for business applications)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/cv-management-system.git
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel
1. Go to [Vercel](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `cv-management-system` repository

### 3.2 Configure Build Settings
Vercel should auto-detect Next.js. If not, set:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.3 Environment Variables
Add these environment variables in Vercel dashboard:

#### Required Variables:
```bash
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here
```

#### Optional (for Google Sheets integration):
```bash
GOOGLE_SHEETS_ID=your_google_sheets_id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----"
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

## 🗄️ Step 4: Database Setup

### 4.1 Create PostgreSQL Database
We recommend using [Neon](https://neon.tech/) (free tier available):

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add it to your Vercel environment variables as `DATABASE_URL`

### 4.2 Initialize Database Schema
After deployment, you need to set up the database schema:

1. Clone your repository locally (if not already done)
2. Install dependencies: `npm install`
3. Set up your `.env.local` with the database URL
4. Run Prisma commands:
```bash
npx prisma generate
npx prisma db push
```

### 4.3 Seed Initial Data (Optional)
If you have a seed script:
```bash
npx prisma db seed
```

## 🔐 Step 5: Security Configuration

### 5.1 Update NEXTAUTH_URL
Make sure `NEXTAUTH_URL` in Vercel environment variables points to your actual domain:
```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### 5.2 Configure CORS (if needed)
The `vercel.json` file already includes CORS headers for API routes.

### 5.3 Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments
Vercel automatically deploys when you push to the main branch:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
# Vercel will automatically deploy the changes
```

### 6.2 Preview Deployments
Vercel creates preview deployments for pull requests and other branches automatically.

## 🧪 Step 7: Testing Your Deployment

### 7.1 Basic Functionality Test
1. Visit your deployed URL
2. Try logging in with default credentials:
   - Admin: `admin@cvmanagement.com` / `admin123`
3. Test creating a CV
4. Test PDF export
5. Test Excel import

### 7.2 Performance Check
- Use [PageSpeed Insights](https://pagespeed.web.dev/) to check performance
- Monitor Vercel Analytics for usage patterns

## 🚨 Troubleshooting

### Common Issues:

#### Build Failures
- Check Vercel build logs
- Ensure all environment variables are set
- Verify `package.json` dependencies

#### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database server status
- Ensure database allows connections from Vercel IPs

#### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Ensure database schema includes auth tables

#### File Upload Issues
- Vercel has file size limits (4.5MB for Hobby plan)
- Consider using external storage (AWS S3, Cloudinary) for production

## 📊 Monitoring and Maintenance

### 7.1 Vercel Analytics
Enable Vercel Analytics in your project dashboard for:
- Page views
- Performance metrics
- User behavior

### 7.2 Error Monitoring
Consider integrating:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay

### 7.3 Database Monitoring
- Monitor database performance
- Set up automated backups
- Monitor connection limits

## 🔄 Updates and Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Test locally
npm run build
npm run dev

# Deploy
git add .
git commit -m "Update dependencies"
git push origin main
```

### Database Migrations
When you update the database schema:
```bash
# Update schema
npx prisma db push

# Or create migration
npx prisma migrate dev --name your_migration_name
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review database connection status
3. Verify environment variables
4. Check the project's GitHub issues

---

## 🎉 Congratulations!

Your CV Management System is now deployed and ready for production use!

**Default Login Credentials:**
- Admin: `admin@cvmanagement.com` / `admin123`
- Sub-Admin: `subadmin@cvmanagement.com` / `subadmin123`
- User: `user@cvmanagement.com` / `user123`

**Remember to change these credentials in production!**
