# LynxHub REST API Specification

All responses use standard envelopes:
- **Success**: `{ "success": true, "data": <payload>, "meta"?: <metadata> }`
- **Error**: `{ "success": false, "error": { "code": "<CODE>", "message": "<Human-readable message>", "details"?: <any> } }`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/signup`
Creates a new user account, initializes their default BioProfile, sets httpOnly session cookies, and emits a simulated verification token.
- **Rate Limit**: 50 req / 15 min
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "username": "creator_name"
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "673f...",
          "email": "user@example.com",
          "username": "creator_name",
          "isEmailVerified": false
        },
        "simulatedVerificationUrl": "http://localhost:5173/verify-email?token=3f8a..."
      }
    }
    ```
  - `400 Bad Request`: Validation errors (e.g. weak password, malformed email).
  - `409 Conflict`: Email or username already registered.

### `POST /api/auth/login`
Authenticates credentials, generates a new 15-minute access token and 7-day refresh token, sets both in secure `httpOnly` cookies, and tracks the session in MongoDB.
- **Rate Limit**: 50 req / 15 min
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Responses**:
  - `200 OK`: Sets cookies `access_token` and `refresh_token`.
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "673f...",
          "email": "user@example.com",
          "username": "creator_name",
          "isEmailVerified": false
        }
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### `POST /api/auth/refresh`
Performs token rotation. Validates active refresh token, revokes it, and issues a new pair of access & refresh cookies.
- **Cookies Required**: `refresh_token`
- **Responses**:
  - `200 OK`: New cookies set.
  - `401 Unauthorized`: Token missing, expired, or reused.

### `POST /api/auth/logout`
Revokes active refresh session and clears `access_token` and `refresh_token` cookies.
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "message": "Logged out successfully" } }`

### `GET /api/auth/me`
Retrieves authenticated user session information.
- **Auth Required**: Yes (`access_token`)
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "user": { ... } } }`
  - `401 Unauthorized`

### `GET /api/auth/verify-email?token=...`
Verifies user's email address using the simulation token.
- **Responses**:
  - `200 OK`: Account updated to `isEmailVerified: true`.
  - `400 Bad Request`: Expired or invalid token.

### `POST /api/auth/forgot-password`
Initiates password reset flow. Emits a simulated reset link in backend console.
- **Request Body**: `{ "email": "user@example.com" }`
- **Responses**:
  - `200 OK`: Anti-enumeration response.

### `POST /api/auth/reset-password`
Resets user's password using the token, invalidates previous sessions.
- **Request Body**:
  ```json
  {
    "token": "a93f...",
    "password": "NewPassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: Password updated.
  - `400 Bad Request`: Expired or invalid token.

---

## 2. Short Link Endpoints (`/api/links`)

### `POST /api/links`
Generates a new 6-character short code or assigns an unreserved vanity custom slug.
- **Auth Required**: Yes
- **Rate Limit**: 60 req / min
- **Request Body**:
  ```json
  {
    "destinationUrl": "https://example.com/very/long/url",
    "title": "Campaign Launch",
    "customSlug": "summer-sale"
  }
  ```
- **Responses**:
  - `201 Created`: Returns newly created `ShortLink` document.
  - `400 Bad Request`: Malformed destination URL or reserved custom slug.
  - `409 Conflict`: Slug already in use (`SLUG_COLLISION`).

### `GET /api/links`
Returns a paginated list of short links owned by the authenticated user with backend search support.
- **Auth Required**: Yes
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `search` (string, optional: matches slug, title, or destinationUrl)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [ ... ],
      "meta": {
        "pagination": {
          "total": 35,
          "page": 1,
          "limit": 10,
          "totalPages": 4
        }
      }
    }
    ```

### `GET /api/links/:id`
Retrieves a single link owned by the user.
- **Auth Required**: Yes
- **Responses**:
  - `200 OK`: Link details.
  - `404 Not Found`: Link doesn't exist or belongs to another user.

### `DELETE /api/links/:id`
Deletes a link and cascades deletion to all associated click telemetry events.
- **Auth Required**: Yes
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "message": "Short link deleted successfully" } }`
  - `404 Not Found`

---

## 3. Analytics Endpoints (`/api/analytics` & `/api/links/:id/analytics`)

### `GET /api/analytics/overview?period=7d|30d|90d|all`
Account-wide aggregation of all links owned by the authenticated user.
- **Auth Required**: Yes
- **Query Params**: `period` ('7d' | '30d' | '90d' | 'all')
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "totalLinks": 12,
        "summary": {
          "totalClicks": 248,
          "uniqueVisitors": 182,
          "topDevice": "Desktop",
          "topReferrer": "twitter.com",
          "latestClickAt": "2026-09-18T04:30:00.000Z"
        },
        "clicksOverTime": [ { "date": "2026-09-01", "clicks": 8 }, ... ],
        "deviceDistribution": [
          { "name": "Desktop", "count": 140, "percentage": 56 },
          { "name": "Mobile", "count": 90, "percentage": 36 },
          { "name": "Tablet", "count": 18, "percentage": 8 }
        ],
        "topReferrers": [
          { "domain": "twitter.com", "count": 110, "percentage": 44 },
          { "domain": "Direct", "count": 85, "percentage": 34 }
        ],
        "recentClicks": [ ... ]
      }
    }
    ```

### `GET /api/links/:id/analytics?period=7d|30d|90d|all`
Metrics specific to one short link owned by the user.
- **Auth Required**: Yes
- **Responses**:
  - `200 OK`: Telemetry metrics + link summary.
  - `404 Not Found`: Not found or access denied.

---

## 4. Bio Profile Endpoints (`/api/bio`)

### `GET /api/bio/me`
Retrieves the authenticated user's customizable bio profile.
- **Auth Required**: Yes
- **Responses**:
  - `200 OK`: Bio profile document.

### `PUT /api/bio/me`
Updates user's display name, bio description, avatar URL, theme, and reordered social links.
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "displayName": "Alice Smith",
    "bio": "Open-source developer building web software.",
    "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=alice",
    "theme": "vibrant-gradient",
    "socialLinks": [
      {
        "id": "sl-1",
        "platform": "github",
        "label": "GitHub",
        "url": "https://github.com/alice",
        "order": 0,
        "isActive": true
      }
    ]
  }
  ```
- **Responses**:
  - `200 OK`: Updated profile.

### `GET /api/bio/:username`
Public endpoint returning creator profile and active social links.
- **Auth Required**: No
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "profile": {
          "username": "alice",
          "displayName": "Alice Smith",
          "bio": "Open-source developer building web software.",
          "avatarUrl": "...",
          "theme": "vibrant-gradient",
          "socialLinks": [ ... ]
        }
      }
    }
    ```
  - `404 Not Found`: Profile does not exist.

---

## 5. Short Link Redirection (`/r/:shortCode`)

### `GET /r/:shortCode`
Resolves short code via unique database index, triggers non-blocking asynchronous click telemetry, and issues HTTP 302 redirect.
- **Auth Required**: No
- **Rate Limit**: 500 req / min
- **Responses**:
  - `302 Found`: `Location: <destinationUrl>`
  - `404 Not Found`: Link not found or invalid format.
