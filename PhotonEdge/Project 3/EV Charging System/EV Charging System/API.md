# API Reference

Complete API documentation for the Smart EV Auto-Reservation Platform.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required. For production deployment, implement JWT or OAuth2.

---

## Chargers

### Get All Chargers
Retrieve list of all charging stations.

**Endpoint:** `GET /api/chargers`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Phoenix Mall Baner",
    "lat": 18.5621,
    "lng": 73.7667,
    "available": 1,
    "type": "public",
    "price_per_unit": 18
  },
  {
    "id": 2,
    "name": "Wakad Highway Stop",
    "lat": 18.5987,
    "lng": 73.7638,
    "available": 0,
    "type": "public",
    "price_per_unit": 15
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### Toggle Charger Availability (Admin)
Enable or disable a charging station.

**Endpoint:** `POST /api/admin/toggle`

**Request Body:**
```json
{
  "charger_id": 1,
  "available": 0
}
```

**Parameters:**
- `charger_id` (integer, required) - ID of the charger
- `available` (integer, required) - 1 for available, 0 for unavailable

**Response:**
```json
{
  "success": true,
  "charger_id": 1,
  "available": 0
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing parameters
- `404 Not Found` - Charger not found
- `500 Internal Server Error` - Database error

---

## Reservations

### Create Reservation
Book a charging slot.

**Endpoint:** `POST /api/reserve`

**Request Body:**
```json
{
  "charger_id": 1,
  "ev_id": "EV-AUTO-001"
}
```

**Parameters:**
- `charger_id` (integer, required) - ID of charger to reserve
- `ev_id` (string, required) - Unique identifier for the EV

**Response:**
```json
{
  "success": true,
  "reservation_id": 5,
  "charger_id": 1,
  "ev_id": "EV-AUTO-001",
  "expiry": "2026-01-12T19:25:00.000Z",
  "qr_code": "data:image/png;base64,iVBORw0KG...",
  "token_hash": "a1b2c3d4e5f6...",
  "slot": "A-01",
  "lat": 18.5621,
  "lng": 73.7667
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Charger unavailable or missing parameters
- `404 Not Found` - Charger not found
- `500 Internal Server Error` - Database error

---

### Get Reservation Details
Retrieve information about a specific reservation.

**Endpoint:** `GET /api/reservation/:id`

**Parameters:**
- `id` (integer, path parameter) - Reservation ID

**Response:**
```json
{
  "id": 5,
  "charger_id": 1,
  "ev_id": "EV-AUTO-001",
  "expiry": "2026-01-12T19:25:00.000Z",
  "status": "active",
  "slot": "A-01",
  "charger_name": "Phoenix Mall Baner",
  "lat": 18.5621,
  "lng": 73.7667,
  "qr_code": "data:image/png;base64,iVBORw0KG..."
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Reservation not found
- `500 Internal Server Error` - Database error

---

## Emergency

### Emergency Battery Booking
Instant reservation for critical battery levels (<10%).

**Endpoint:** `POST /api/battery-emergency`

**Request Body:**
```json
{
  "lat": 18.5204,
  "lng": 73.8567,
  "ev_id": "EV-EMERGENCY-001"
}
```

**Parameters:**
- `lat` (float, required) - Current latitude
- `lng` (float, required) - Current longitude
- `ev_id` (string, required) - Unique identifier for the EV

**Response:**
```json
{
  "success": true,
  "emergency": true,
  "reservation_id": 6,
  "charger_id": 2,
  "charger_name": "Wakad Highway Stop",
  "lat": 18.5987,
  "lng": 73.7638,
  "expiry": "2026-01-12T19:25:00.000Z",
  "qr_code": "data:image/png;base64,iVBORw0KG...",
  "token_hash": "xyz789...",
  "slot": "B-03",
  "message": "Emergency reservation created"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - No chargers available
- `500 Internal Server Error` - Database error

---

### Auto Reroute
Automatically rebook if charger becomes unavailable.

**Endpoint:** `POST /api/auto-reroute`

**Request Body:**
```json
{
  "old_charger_id": 1,
  "ev_id": "EV-AUTO-001",
  "lat": 18.5204,
  "lng": 73.8567
}
```

**Parameters:**
- `old_charger_id` (integer, required) - Previous charger ID
- `ev_id` (string, required) - Unique identifier for the EV
- `lat` (float, required) - Current latitude
- `lng` (float, required) - Current longitude

**Response:**
```json
{
  "success": true,
  "new_charger_id": 3,
  "charger_name": "Hinjewadi Tech Park",
  "reservation_id": 7,
  "lat": 18.5913,
  "lng": 73.7389,
  "qr_code": "data:image/png;base64,iVBORw0KG...",
  "slot": "C-05",
  "message": "Rerouted to new charger"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - No alternative chargers available
- `500 Internal Server Error` - Database error

---

## QR Verification

### Verify QR Token
Validate QR code at gate.

**Endpoint:** `POST /api/qr/verify`

**Request Body:**
```json
{
  "token_hash": "a1b2c3d4e5f6...",
  "charger_id": 1
}
```

**Parameters:**
- `token_hash` (string, required) - HMAC SHA-256 token from QR code
- `charger_id` (integer, required) - Charger ID from QR code

**Response:**
```json
{
  "valid": true,
  "message": "Access granted",
  "reservation": {
    "id": 5,
    "ev_id": "EV-AUTO-001",
    "slot": "A-01",
    "expiry": "2026-01-12T19:25:00.000Z"
  }
}
```

**Invalid Response:**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

**Status Codes:**
- `200 OK` - Verification complete (check `valid` field)
- `400 Bad Request` - Missing parameters
- `500 Internal Server Error` - Database error

---

## Health Check

### Server Health
Check server status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T18:55:00.000Z",
  "database": "connected",
  "socket": "active"
}
```

**Status Codes:**
- `200 OK` - Server healthy
- `503 Service Unavailable` - Server issues

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `CHARGER_NOT_FOUND` - Invalid charger ID
- `CHARGER_UNAVAILABLE` - Charger already reserved
- `RESERVATION_NOT_FOUND` - Invalid reservation ID
- `RESERVATION_EXPIRED` - Reservation time limit exceeded
- `INVALID_TOKEN` - QR token verification failed
- `MISSING_PARAMS` - Required parameters not provided
- `DATABASE_ERROR` - Internal database error

---

## Rate Limiting

Currently not implemented. For production:
- Implement rate limiting (e.g., 100 requests/minute)
- Use libraries like `express-rate-limit`
- Add IP-based throttling

---

## Websocket Events

The server emits real-time events via Socket.IO:

### `charger_update`
```javascript
{
  id: 1,
  available: 0
}
```

### `slot_release`
```javascript
{
  charger_id: 1,
  reservation_id: 5
}
```

### `emergency_lock`
```javascript
{
  charger_id: 2,
  ev_id: 'EV-EMERGENCY-001'
}
```

### `reroute`
```javascript
{
  old_charger_id: 1,
  new_charger_id: 3
}
```

---

## Best Practices

1. **Always check charger availability** before attempting reservation
2. **Store QR data securely** in local storage or state
3. **Handle expired reservations** gracefully
4. **Listen to WebSocket events** for real-time updates
5. **Implement retry logic** for network failures
6. **Validate input data** on client-side before API calls
