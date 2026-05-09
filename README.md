# AssetTrack

Full-stack IT asset management system — Spring Boot backend + React frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Configuration (Neon PostgreSQL)](#database-configuration)
3. [Environment Variables](#environment-variables)
4. [Backend Startup](#backend-startup)
5. [Frontend Startup](#frontend-startup)
6. [Default Credentials](#default-credentials)
7. [API Reference](#api-reference)

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

AssetTrack uses **Neon** (serverless PostgreSQL). The connection URL is already set in
`backend/src/main/resources/application.properties`. You only need to supply the password
via the environment variable `NEON_DB_PASSWORD` — the property file reads:

```
spring.datasource.password=${NEON_DB_PASSWORD}
```

If you are connecting to a different database, update the `spring.datasource.url` and
`spring.datasource.username` values in `application.properties` accordingly.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEON_DB_PASSWORD` | **Yes** | Password for the Neon PostgreSQL database |

Set it before starting the backend:

**Linux / macOS**
```bash
export NEON_DB_PASSWORD=your_password_here
```

**Windows PowerShell**
```powershell
$env:NEON_DB_PASSWORD = "your_password_here"
```

---

## Backend Startup

```bash
cd backend

# Run tests
./mvnw test

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

The Vite dev server proxies `/api/*` requests to `http://localhost:8080` — no extra
configuration is needed.

---

## Default Credentials

When the backend starts for the first time with a fresh database, seed an admin account
via the `/api/auth/register` endpoint or the Sign Up page, then update its role directly
in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

After that you can create additional users through the **User Management** page
(`/users`) and assign roles (`ADMIN`, `MANAGER`, `DEVELOPER`, `USER`) from the UI.

---

## API Reference

All endpoints are prefixed with `/api`. JWT token must be included as:
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
| `serialNumber` | string | Partial match (LIKE) |
| `status` | enum | `AVAILABLE`, `ASSIGNED`, `IN_REPAIR`, `EXPIRED`, `DECOMMISSIONED` |
| `type` | enum | `LAPTOP`, `MONITOR`, `ACCESSORY` |
| `brand` | string | Exact match (case-insensitive) |
| `assignedToEnabled` | boolean | Filter by owner account status |
| `assignedUser` | string | Partial match on owner email |

### Allocations

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/allocations/assign` | ADMIN, MANAGER | Assign asset to user |
| POST | `/allocations/return` | ADMIN, MANAGER | Return asset |
| GET | `/allocations/history/{assetId}` | ADMIN, MANAGER | Allocation history for asset |

### Notifications

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/notifications` | Any authenticated | Current user's unresolved notifications |
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
| PUT | `/users/{id}/toggle` | ADMIN | Activate / deactivate user |
| PUT | `/users/me/profile` | Any authenticated | Update display name |

### Analytics

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/analytics/usage` | ADMIN, MANAGER | Usage duration per user per asset |
| GET | `/analytics/allocation-history` | ADMIN, MANAGER | Monthly allocation counts by type |
| GET | `/analytics/condition-summary` | ADMIN, MANAGER | Asset count grouped by condition |

### Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/dashboard/summary` | ADMIN, MANAGER | KPI summary |

### Condition Reports

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/condition-reports` | Any authenticated | Submit condition report |
| GET | `/condition-reports` | ADMIN, MANAGER | List all reports |
| GET | `/condition-reports/{assetId}` | ADMIN, MANAGER | Reports for specific asset |

---

## Notes

- Expired laptops are auto-flagged to `EXPIRED` status when expiration endpoints are queried.
- Allocation history is preserved even after an asset is returned.
- Email notifications are sent via SMTP (configured for local MailHog by default on port 1025).
