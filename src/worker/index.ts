import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { CreatePosterRequestSchema, UpdatePosterRequestSchema } from "@/shared/types";
import z from "zod";

const app = new Hono<{ Bindings: Env }>();

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// User management
app.get("/api/user/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const dbUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!dbUser) {
    // Create user record
    await c.env.DB.prepare(
      "INSERT INTO users (mocha_user_id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))"
    ).bind(user.id).run();
    
    return c.json({ 
      mocha_user: user, 
      strava_connected: false 
    });
  }

  return c.json({ 
    mocha_user: user, 
    strava_connected: !!dbUser.strava_access_token 
  });
});

// Strava integration
app.get("/api/strava/auth-url", authMiddleware, async (c) => {
  const url = new (globalThis as any).URL(c.req.url);
  const redirectUri = `${url.origin}/strava/callback`;
  const scope = "read,activity:read_all";
  const state = Math.random().toString(36).substring(7); // Add state for security
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${c.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}&state=${state}`;
  
  return c.json({ authUrl });
});

app.post("/api/strava/callback", authMiddleware, zValidator("json", z.object({ code: z.string() })), async (c) => {
  const { code } = c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const tokenResponse = await (globalThis as any).fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: c.env.STRAVA_CLIENT_ID,
      client_secret: c.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return c.json({ error: "Failed to exchange code for token" }, 400);
  }

  const tokenData = await tokenResponse.json() as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number };
  };
  
  // Update user with Strava credentials
  await c.env.DB.prepare(`
    UPDATE users 
    SET strava_user_id = ?, strava_access_token = ?, strava_refresh_token = ?, 
        strava_expires_at = ?, updated_at = datetime('now')
    WHERE mocha_user_id = ?
  `).bind(
    tokenData.athlete.id.toString(),
    tokenData.access_token,
    tokenData.refresh_token,
    tokenData.expires_at,
    user.id
  ).run();

  return c.json({ success: true });
});

app.post("/api/strava/disconnect", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Clear Strava credentials from user
  await c.env.DB.prepare(`
    UPDATE users 
    SET strava_user_id = NULL, strava_access_token = NULL, strava_refresh_token = NULL, 
        strava_expires_at = NULL, updated_at = datetime('now')
    WHERE mocha_user_id = ?
  `).bind(user.id).run();

  return c.json({ success: true });
});

// Rides endpoints
app.get("/api/rides", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const dbUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!dbUser?.strava_access_token) {
    return c.json({ error: "Strava not connected" }, 400);
  }

  // Check if token needs refresh
  let accessToken = dbUser.strava_access_token;
  if (Date.now() / 1000 > (dbUser.strava_expires_at as number)) {
    const refreshResponse = await (globalThis as any).fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: c.env.STRAVA_CLIENT_ID,
        client_secret: c.env.STRAVA_CLIENT_SECRET,
        refresh_token: dbUser.strava_refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json() as {
        access_token: string;
        refresh_token: string;
        expires_at: number;
      };
      accessToken = refreshData.access_token;
      
      await c.env.DB.prepare(`
        UPDATE users 
        SET strava_access_token = ?, strava_refresh_token = ?, strava_expires_at = ?, updated_at = datetime('now')
        WHERE mocha_user_id = ?
      `).bind(
        refreshData.access_token,
        refreshData.refresh_token,
        refreshData.expires_at,
        user.id
      ).run();
    }
  }

  // Fetch activities from Strava with detailed GPS data
  const activitiesResponse = await (globalThis as any).fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=50&include_all_efforts=false",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!activitiesResponse.ok) {
    return c.json({ error: `Failed to fetch activities: ${activitiesResponse.status}` }, 400);
  }

  const activities = await activitiesResponse.json() as any[];
  
  // Filter for activities with any GPS data (more lenient filter)
  const validActivities = activities.filter((activity: any) => {
    const hasGpsData = activity.map?.summary_polyline || activity.map?.polyline;
    const hasDistance = activity.distance && activity.distance > 0;
    return hasGpsData && hasDistance;
  });
  
  // If no activities with summary_polyline, try to get detailed polylines
  if (validActivities.length === 0 && activities.length > 0) {
    // Try to fetch detailed data for the first few activities
    const detailedActivities = [];
    for (let i = 0; i < Math.min(5, activities.length); i++) {
      const activity = activities[i];
      try {
        const detailResponse = await (globalThis as any).fetch(
          `https://www.strava.com/api/v3/activities/${activity.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (detailResponse.ok) {
          const detailedActivity = await detailResponse.json();
          
          if (detailedActivity.map?.polyline || detailedActivity.map?.summary_polyline) {
            detailedActivities.push(detailedActivity);
          }
        }
      } catch (error) {
        // Skip failed activity fetches
      }
    }
    
    if (detailedActivities.length > 0) {
      validActivities.push(...detailedActivities);
    }
  }

  // Store/update rides in database
  for (const activity of validActivities) {
    try {
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO rides 
        (user_id, strava_activity_id, name, distance, moving_time, total_elevation_gain, 
         start_date_local, polyline, summary_polyline, sport_type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        dbUser.id,
        activity.id.toString(),
        activity.name || 'Untitled Activity',
        activity.distance || 0,
        activity.moving_time || 0,
        activity.total_elevation_gain || 0,
        activity.start_date_local || new Date().toISOString(),
        activity.map?.polyline || null,
        activity.map?.summary_polyline || null,
        activity.sport_type || 'Ride'
      ).run();
    } catch (error) {
      // Skip failed inserts
    }
  }

  // Return all activities from Strava API to help with debugging
  const processedActivities = activities.map((activity: any) => ({
    id: activity.id,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    total_elevation_gain: activity.total_elevation_gain,
    start_date_local: activity.start_date_local,
    sport_type: activity.sport_type,
    map: activity.map,
    polyline: activity.map?.polyline,
    summary_polyline: activity.map?.summary_polyline
  }));
  
  return c.json(processedActivities);
});

// Posters endpoints
app.get("/api/posters", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const dbUser = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!dbUser) {
    return c.json([]);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT p.*, r.name as ride_name, r.distance, r.start_date_local
    FROM posters p
    JOIN rides r ON p.ride_id = r.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).bind(dbUser.id).all();

  return c.json(results);
});

app.post("/api/posters", authMiddleware, zValidator("json", CreatePosterRequestSchema), async (c) => {
  const posterData = c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const dbUser = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!dbUser) {
    return c.json({ error: "User not found" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO posters 
    (user_id, ride_id, name, map_style, primary_color, secondary_color, layout, size, 
     show_stats, show_elevation, custom_title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    dbUser.id,
    posterData.ride_id,
    posterData.name,
    posterData.map_style || 'standard',
    posterData.primary_color || '#ff6b35',
    posterData.secondary_color || '#2c3e50',
    posterData.layout || 'portrait',
    posterData.size || 'medium',
    posterData.show_stats ?? true,
    posterData.show_elevation ?? true,
    posterData.custom_title || null
  ).run();

  const newPoster = await c.env.DB.prepare(
    "SELECT * FROM posters WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(newPoster);
});

app.put("/api/posters/:id", authMiddleware, zValidator("json", UpdatePosterRequestSchema), async (c) => {
  const posterId = parseInt(c.req.param("id"));
  const updates = c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const dbUser = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!dbUser) {
    return c.json({ error: "User not found" }, 400);
  }

  // Verify poster ownership
  const poster = await c.env.DB.prepare(
    "SELECT * FROM posters WHERE id = ? AND user_id = ?"
  ).bind(posterId, dbUser.id).first();

  if (!poster) {
    return c.json({ error: "Poster not found" }, 404);
  }

  // Build update query dynamically
  const updateFields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
  if (updateFields.length === 0) {
    return c.json(poster);
  }

  const setClause = updateFields.map(field => `${field} = ?`).join(", ");
  const values = updateFields.map(field => updates[field as keyof typeof updates]);

  await c.env.DB.prepare(`
    UPDATE posters SET ${setClause}, updated_at = datetime('now') WHERE id = ?
  `).bind(...values, posterId).run();

  const updatedPoster = await c.env.DB.prepare(
    "SELECT * FROM posters WHERE id = ?"
  ).bind(posterId).first();

  return c.json(updatedPoster);
});

export default app;
