# Lumina AI Sales Copilot - MVP API Endpoints

## Base URL

```
https://api.lumina.ai/v1
```

## Authentication

All endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## Draft Management

### Get Draft

```http
GET /emails/drafts/:id
```

**Response**:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "workspace_id": "uuid",
  "prospect_id": "uuid",
  "subject": "string",
  "body_html": "string",
  "body_text": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Create/Update Draft

```http
POST /emails/draft
```

**Request Body**:

```json
{
  "id": "uuid (optional, for update)",
  "prospect_id": "uuid",
  "subject": "string",
  "body_html": "string",
  "body_text": "string"
}
```

**Response**:

```json
{
  "id": "uuid",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Notes**:

- Idempotent operation
- Debounced on frontend (500ms)
- No side effects

### Delete Draft

```http
DELETE /emails/draft/:id
```

**Response**: `204 No Content`

---

## AI Operations

### Personalize Email

```http
POST /ai/personalize
```

**Request Body**:

```json
{
  "draft_id": "uuid",
  "prospect_id": "uuid",
  "tone": "professional" | "friendly" | "casual" (optional)
}
```

**Response**:

```json
{
  "suggestion": {
    "subject": "string (optional)",
    "body": "string (optional)",
    "diff": [
      {
        "type": "insert" | "delete" | "replace",
        "position": 0,
        "text": "string"
      }
    ]
  },
  "confidence": 0.85,
  "source_signals": {
    "prospect_match": 0.9,
    "company_match": 0.8,
    "tone_match": 0.95
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "input_hash": "sha256_hash"
}
```

**Notes**:

- Pure function (no DB writes)
- No side effects
- Idempotent

### Rewrite Email

```http
POST /ai/rewrite
```

**Request Body**:

```json
{
  "draft_id": "uuid",
  "instruction": "Make it more concise" | "Add urgency" | "Be more friendly"
}
```

**Response**: Same as `/ai/personalize`

### Score Email

```http
POST /ai/score
```

**Request Body**:

```json
{
  "draft_id": "uuid"
}
```

**Response**:

```json
{
  "spam_risk": 0.15,
  "reply_probability": 0.72,
  "signals": {
    "subject_length": 45,
    "body_length": 250,
    "link_count": 1,
    "spam_keywords": []
  }
}
```

**Notes**:

- Advisory only
- Does not alter content

### Submit AI Feedback

```http
POST /ai/feedback
```

**Request Body**:

```json
{
  "suggestion_id": "uuid (from previous AI response)",
  "action": "accepted" | "rejected" | "edited",
  "feedback": "string (optional)"
}
```

**Response**: `204 No Content`

**Notes**:

- Async, non-blocking
- Used for learning/improvement

---

## Email Sending

### Send Email

```http
POST /emails/send
```

**Request Body**:

```json
{
  "draft_id": "uuid",
  "idempotency_key": "uuid",
  "from_email": "user@example.com",
  "to_email": "prospect@example.com"
}
```

**Headers**:

```
Idempotency-Key: <uuid>
```

**Response**:

```json
{
  "id": "uuid",
  "status": "PENDING_SEND",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Notes**:

- Idempotency key prevents duplicates
- Returns immediately (async send)
- Status is `PENDING_SEND` (not `SENT`)

### Get Email

```http
GET /emails/:id
```

**Response**:

```json
{
  "id": "uuid",
  "draft_id": "uuid",
  "user_id": "uuid",
  "workspace_id": "uuid",
  "prospect_id": "uuid",
  "from_email": "string",
  "to_email": "string",
  "subject": "string",
  "body_html": "string",
  "body_text": "string",
  "status": "PENDING_SEND" | "SENT" | "FAILED" | "BOUNCED",
  "provider_message_id": "string",
  "sent_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Email Events

```http
GET /emails/:id/events
```

**Query Parameters**:

- `event_type` (optional): Filter by event type
- `limit` (optional): Number of events (default: 50)
- `offset` (optional): Pagination offset

**Response**:

```json
{
  "events": [
    {
      "id": "uuid",
      "event_type": "opened" | "replied" | "bounced" | "clicked" | "delivered",
      "event_data": {},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Prospects

### List Prospects

```http
GET /prospects
```

**Query Parameters**:

- `workspace_id` (optional): Filter by workspace
- `search` (optional): Search by email, name, company
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response**:

```json
{
  "prospects": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "company": "string",
      "job_title": "string",
      "custom_fields": {},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Prospect

```http
GET /prospects/:id
```

**Response**:

```json
{
  "id": "uuid",
  "workspace_id": "uuid",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "company": "string",
  "job_title": "string",
  "custom_fields": {},
  "company_data": {
    "domain": "string",
    "name": "string",
    "industry": "string",
    "size": "string",
    "location": "string",
    "metadata": {}
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Create Prospect

```http
POST /prospects
```

**Request Body**:

```json
{
  "workspace_id": "uuid",
  "email": "string",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "company": "string (optional)",
  "job_title": "string (optional)",
  "custom_fields": {}
}
```

**Response**: Same as `GET /prospects/:id`

### Update Prospect

```http
PUT /prospects/:id
```

**Request Body**: Same as `POST /prospects` (all fields optional)

**Response**: Same as `GET /prospects/:id`

### Delete Prospect

```http
DELETE /prospects/:id
```

**Response**: `204 No Content`

---

## Company Data

### Get Company Data

```http
GET /company/:domain
```

**Response**:

```json
{
  "id": "uuid",
  "domain": "string",
  "name": "string",
  "industry": "string",
  "size": "string",
  "location": "string",
  "metadata": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Fetch/Update Company Data

```http
POST /company/fetch
```

**Request Body**:

```json
{
  "domain": "example.com"
}
```

**Response**: Same as `GET /company/:domain`

**Notes**:

- Fetches data from external APIs
- Updates or creates company record

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request body
- `IDEMPOTENCY_CONFLICT` (409): Duplicate idempotency key
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **AI Endpoints**: 20 requests per minute per user
- **Send Endpoint**: 10 requests per minute per user

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks (Incoming)

### Email Event Webhook

```
POST /webhooks/email-events
```

**Headers**:

```
X-Provider: gmail | outlook
X-Signature: <signature>
```

**Request Body** (Gmail example):

```json
{
  "message_id": "string",
  "event_type": "opened" | "replied" | "bounced",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {}
}
```

**Response**: `200 OK`

**Notes**:

- Validates signature
- Maps to `email_id`
- Appends to `email_events` table

---

_Last Updated: [Current Date]_
_Version: 1.0 - MVP_
