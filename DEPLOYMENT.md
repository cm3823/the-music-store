# Deployment Guide

## Free Deployment on Render

### Prerequisites
- GitHub repository with your code
- Render account (free at render.com)

### Deployment Steps

#### Option 1: Single Service (Recommended)
Deploy both frontend and backend as one service:

1. **Connect Repository**
   - Go to render.com and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `the-music-store`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-app-name.onrender.com
   HOST=0.0.0.0
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

#### Option 2: Separate Services (Advanced)
Deploy frontend and backend separately:

1. **Backend Service**
   - Create Web Service for backend
   - Build Command: `npm install`
   - Start Command: `npm run server`
   - Add environment variables

2. **Frontend Service**  
   - Create Static Site for frontend
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-api-url.onrender.com/api`

### Post-Deployment

1. **Update CORS Origins**
   - Note your deployed URL
   - Update `server/server.js` CORS configuration if needed

2. **Test the Application**
   - Visit your deployed URL
   - Test search functionality
   - Add albums to verify database persistence

### Free Tier Limitations

- **Render Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Storage**: Persistent disk (SQLite database will persist)
- **Cold Starts**: 30-60 second wake-up time after sleep

### Alternative Free Hosting Options

#### Railway (Free $5/month credit)
1. Connect GitHub repository
2. Deploy backend service
3. Deploy frontend service
4. Link services with environment variables

#### Vercel + PlanetScale (Serverless)
1. Deploy frontend on Vercel
2. Convert backend to serverless functions
3. Use PlanetScale for database (free tier)

#### Netlify + Supabase
1. Deploy frontend on Netlify
2. Use Supabase for backend and database (free tier)

### Troubleshooting

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs for specific errors

#### API Connection Issues
- Verify CORS configuration
- Check environment variables
- Ensure API URLs are correct

#### Database Issues
- SQLite file persists on Render
- Check file permissions
- Monitor disk usage

### Performance Tips

1. **Keep Service Warm**
   - Use a service like UptimeRobot to ping your app every 5 minutes
   - Or upgrade to paid tier to avoid sleeping

2. **Optimize Bundle Size**
   - Run `npm run build` to check bundle size
   - Use dynamic imports for large libraries

3. **Caching**
   - MusicBrainz API responses are cached for 1 hour
   - Static assets are cached by CDN

### Cost Estimates

- **Render Free**: $0/month (750 hours limit)
- **Render Paid**: $7/month (always-on, faster builds)
- **Railway**: ~$5/month (usage-based after free credit)
- **Vercel + Database**: $0-20/month depending on usage