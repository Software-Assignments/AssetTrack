# AssetTrack

Full-stack IT asset management system — Spring Boot backend + React frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Configuration (Neon PostgreSQL)](#database-configuration)
3. [Backend Startup](#backend-startup)
4. [Frontend Startup](#frontend-startup)
5. [Default Credentials](#default-credentials)
6. [API Reference](#api-reference)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ (or use `./mvnw`) |
| Node.js | 18+ |
| npm | 9+ |

---

## Database Configuration

AssetTrack uses **Neon** (serverless PostgreSQL). Open `backend/src/main/resources/application.properties` and replace the password placeholder with your actual Neon database password:

```properties
spring.datasource.password=YOUR_PASSWORD_HERE
```

If you are connecting to a different database, also update `spring.datasource.url` and `spring.datasource.username` in the same file.

---

## Backend Startup

```bash
cd backend

# Start the server (default port 8080)
./mvnw spring-boot:run
```

The API base URL is `http://localhost:8080/api`.

**Key application properties** (in `src/main/resources/application.properties`):

| Property | Default | Description |
|----------|---------|-------------|
| `assettrack.expiration.window-days` | `30` | Days ahead to flag expiring warranties |
| `cors.allowed-origins` | `http://localhost:5173` | Frontend origin allowed by CORS |
| `jwt.expiration-ms` | `86400000` | JWT validity in milliseconds (24 h) |

---

## Frontend Startup

```bash
cd frontend

npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

The Vite dev server proxies `/api/*` requests to `http://localhost:8080` — no extra configuration is needed.

---

## Default Credentials

There are no seed users. On first run, sign up through the `/signup` page, then promote your account to ADMIN directly in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

After that, create additional users through the **User Management** page (`/users`) and assign roles (`ADMIN`, `MANAGER`, `DEVELOPER`) from the UI.

---

## API Reference

All endpoints are prefixed with `/api`. A JWT token must be included in every protected request:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | Public | Returns JWT token |
| POST | `/auth/register` | Public | Create new account |

### Assets

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/assets` | Any authenticated | List all assets |
| POST | `/assets` | ADMIN | Register new asset |
| GET | `/assets/{id}` | Any authenticated | Get asset by ID |
| PUT | `/assets/{id}` | ADMIN | Update asset fields |
| DELETE | `/assets/{id}` | ADMIN | Delete unassigned asset |
| GET | `/assets/search` | ADMIN, MANAGER, DEVELOPER | Search assets |
| GET | `/assets/expiring` | ADMIN, MANAGER | Assets expiring soon |
| GET | `/assets/spare-laptop` | Any authenticated | First available spare laptop |

**Search query parameters** (`GET /assets/search`):

| Param | Type | Description |
|-------|------|-------------|
| `serialNumber` | string | Partial match |
| `status` | enum | `AVAILABLE`, `ASSIGNED`, `IN_REPAIR`, `EXPIRED`, `DECOMMISSIONED` |
| `type` | enum | `LAPTOP`, `SCREEN`, `ACCESSORY` |
| `brand` | string | Case-insensitive match |
| `assignedToEnabled` | boolean | Filter by owner account status |
| `assignedUser` | string | Partial match on owner email |

### Allocations

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/assets/{assetId}/allocate` | ADMIN, MANAGER | Assign or transfer asset to user |
| POST | `/assets/{assetId}/return` | ADMIN, MANAGER | Return asset |
| GET | `/assets/{assetId}/allocation-history` | Any authenticated | Allocation history for an asset |

### Condition Reports

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/reports` | Any authenticated | Submit a condition report |
| GET | `/reports` | ADMIN, MANAGER | List all reports |
| GET | `/reports/asset/{assetId}` | Any authenticated | Reports for a specific asset |
| GET | `/reports/my-reports` | Any authenticated | Reports submitted by current user |

### Notifications

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/notifications` | Any authenticated | Current user's notifications |
| GET | `/notifications/all` | ADMIN, MANAGER | All notifications |
| GET | `/notifications/unread-count` | Any authenticated | Unread count |
| PUT | `/notifications/{id}/read` | Any authenticated | Mark as read |
| PUT | `/notifications/{id}/resolve` | Any authenticated | Mark as resolved |

### Users

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users` | ADMIN, MANAGER | List all users |
| GET | `/users/me` | Any authenticated | Current user profile |
| GET | `/users/{id}` | ADMIN, MANAGER | Get user by ID |
| PUT | `/users/{id}/role` | ADMIN | Change user role |
| PUT | `/users/{id}/toggle` | ADMIN | Enable / disable user account |
| PUT | `/users/me/profile` | Any authenticated | Update display name |

### Analytics

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/analytics/usage` | ADMIN, MANAGER | Usage stats per asset |
| GET | `/analytics/allocation-history` | ADMIN, MANAGER | Allocation history with optional filters |
| GET | `/analytics/condition-summary` | ADMIN, MANAGER | Condition report severity breakdown |

### Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/dashboard/summary` | ADMIN, MANAGER | KPI summary |

---

## Notes

- Warranty expiry is checked automatically by a background scheduler. Assets expiring within the configured window (default 30 days) are flagged and trigger notifications.
- Allocation history is preserved even after an asset is returned.
- Email notifications use SMTP — configured for local MailHog by default on port 1025. No email setup is needed for testing.
