## Linewerks

Transform your Strava rides into beautiful posters. Built with Next.js and deployed on Vercel.

### Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Environment Variables

Create a `.env.local` file with:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Strava API
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Vercel Postgres (auto-added when you create database in Vercel)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework will auto-detect as Next.js

3. **Set up Database**
   - In Vercel dashboard, go to Storage tab
   - Create new Postgres database
   - It will automatically add connection strings to your environment

4. **Add Environment Variables**
   In Vercel project settings, add:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
   - `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` (from Strava API settings)
   - `NEXT_PUBLIC_APP_URL` (your production URL, e.g., https://linewerks.vercel.app)

5. **Configure OAuth Redirect URIs**
   
   **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback`
   
   **Strava OAuth:**
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Set Authorization Callback Domain to your Vercel domain

6. **Deploy**
   ```bash
   vercel
   ```
   Or push to GitHub and auto-deploy

### Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Vercel Postgres
- **Auth:** Google OAuth 2.0
- **APIs:** Strava API for ride data
- **Deployment:** Vercel

### Features

- Google authentication
- Strava integration for importing rides
- Create custom posters from ride data
- Customizable poster designs (colors, layouts, styles)
- Save and manage poster collection
