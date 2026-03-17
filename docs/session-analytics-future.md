# Session Analytics — Future Steps

## What's in place

- `auth.session.list` — returns active sessions with IP, userAgent, isCurrentSession
- `auth.session.revoke` — revokes any session by token
- Better Auth already captures `ipAddress` and `userAgent` on every session creation

## Future enhancements

### 1. IP Geolocation enrichment
Resolve IP addresses to human-readable locations (city, country) using a free tier service
(e.g. [ip-api.com](https://ip-api.com), [ipinfo.io](https://ipinfo.io)).

- Add `src/utils/get-location.ts` that calls the geolocation API
- Cache resolved locations in `github_cache` or a dedicated `ip_location_cache` table to avoid
  repeated lookups for the same IP
- Extend `SessionSchema` with a `location: { city, country, flag } | null` field

### 2. Session analytics dashboard (admin)
A protected `/dashboard/sessions` route showing:
- Active sessions per user (table: id, device, location, last seen)
- Revoke button per session
- Flag suspicious sessions (new country, unusual UA)

### 3. Login event log
Persist a `login_events` table with `(user_id, ip, user_agent, location, created_at)` on every
successful sign-in. This decouples analytics from the live sessions table and survives logouts.

Schema sketch:
```ts
export const loginEvents = pgTable('login_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  city: text('city'),
  country: text('country'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

### 4. Device fingerprinting
Parse `userAgent` into structured device info (browser, OS, device type) using a library like
`ua-parser-js` for friendlier display in the sessions UI.

### 5. Suspicious login alerts
Email the user when a session is created from a new country or device, using Better Auth's
email plugin or a transactional email provider (Resend, Postmark).
