# AssetTrack

Spring Boot backend for asset registration, allocation history, expiration tracking, and search (Member 2 scope).

## Quick start

```powershell
./mvnw test
```

```powershell
./mvnw spring-boot:run
```

## Configuration

- Database settings live in `src/main/resources/application.properties`.
- Expiration window defaults to 30 days via `assettrack.expiration.window-days`.

## API overview

Base path: `/api/assets`

- `POST /api/assets` (requires `X-Role: ADMIN` or `X-Role: MANAGER`)
- `PUT /api/assets/{assetId}` (requires `X-Role: ADMIN` or `X-Role: MANAGER`)
- `DELETE /api/assets/{assetId}` (requires `X-Role: ADMIN` or `X-Role: MANAGER`)
- `GET /api/assets`
- `GET /api/assets/{assetId}`
- `GET /api/assets/search?serialNumber=&status=&type=&brand=&userStatus=`
- `GET /api/assets/expirations?windowDays=`
- `GET /api/assets/spare-laptop`
- `POST /api/assets/{assetId}/allocate`
- `POST /api/assets/{assetId}/return`

## Notes

- Allocation history is stored in the `allocations` table.
- Expired laptops are auto-flagged to `EXPIRED` when expiration endpoints are queried.

