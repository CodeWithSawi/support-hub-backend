# Support Hub Backend: Frontend Integration Guide

This guide documents the API currently implemented in this repository. It is
intended for the frontend engineer building against the backend running on the
same laptop.

## Connection and startup

Use this API base URL during local development:

```text
http://localhost:5001/api
```

The backend reads `PORT` from its environment and otherwise defaults to `5000`.
The base URL above assumes the backend is started with `PORT=5001` (as in the
current local setup). The frontend should keep the API base URL in its own
environment/configuration rather than hard-coding it throughout the app.

The backend needs its `.env` values for MongoDB (`CONNECTION_STRING`) and JWT
signing (`JWT_SECRET`) in order to start and authenticate requests. Do not copy
those secret values into frontend code. The backend can be started from this
repository with:

```bash
npm run dev
```

The server connects to MongoDB before it starts listening. The frontend does not
connect to MongoDB directly; all data access goes through the HTTP API.

### Browser/CORS note

The Express app currently does **not** configure CORS. If the frontend is served
from a different origin (for example `http://localhost:5173`), the browser may
block API calls even though the backend is reachable. The backend will need to
allow the frontend's development origin before browser-based cross-origin
requests can work. A same-origin proxy in the frontend dev server is another
option.

## Request conventions

- Send and receive JSON. For requests with a body, set
  `Content-Type: application/json`.
- All routes except registration, login, and health require a bearer token:

  ```http
  Authorization: Bearer <token>
  ```

- Login returns a JWT that expires after **1 hour**. There is no refresh-token
  or logout endpoint. After a `401`, the frontend should clear its saved token
  and ask the user to sign in again.
- The backend reads the user's current role and account status from MongoDB on
  each authenticated request. A changed role therefore takes effect on the
  next request; inactive accounts are rejected.
- Path IDs are MongoDB ObjectIds represented as strings. Dates are serialized
  as ISO 8601 strings.
- Most errors use this shape:

  ```json
  { "message": "Description of the error." }
  ```

- List endpoints return arrays directly, not `{ "items": [...] }` wrappers.
  There is currently no pagination.

## Roles and access

| Role | Intended frontend capabilities |
| --- | --- |
| `customer` | Create tickets; view and comment on tickets they own; view their own profile. |
| `support_agent` | List active tickets; view assigned tickets; view/comment on tickets assigned to them; update tickets assigned to them; view their own profile. |
| `admin` | Manage users, tickets, assignments, archived tickets, and dashboard stats. Admins can view any user's profile and any ticket. |

These are only UI hints; the API enforces access. A user who is not the ticket's
customer, assigned agent, or an admin cannot read or comment on it.

## Authentication

### `POST /auth/register` — public

Create a customer account. Registration always assigns role `customer` and
account status `active`; the client cannot register an admin or support agent.

Request:

```json
{
  "name": "Alex Customer",
  "email": "alex@example.com",
  "password": "at-least-8-characters"
}
```

Success: `201`

```json
{
  "message": "User registered successfully.",
  "user": {
    "_id": "MongoDB ObjectId",
    "name": "Alex Customer",
    "email": "alex@example.com",
    "role": "customer",
    "accountStatus": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

Typical errors: `400` invalid/missing fields or password shorter than 8
characters; `409` email already registered; `500` unexpected server error.

### `POST /auth/login` — public

Request:

```json
{
  "email": "alex@example.com",
  "password": "at-least-8-characters"
}
```

Success: `200`

```json
{
  "message": "Login successful.",
  "token": "<JWT>",
  "user": {
    "_id": "MongoDB ObjectId",
    "name": "Alex Customer",
    "email": "alex@example.com",
    "role": "customer",
    "accountStatus": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

Typical errors: `400` missing/invalid fields; `401` invalid email/password;
`403` inactive account; `500` unexpected server error.

## Health

### `GET /health` — public

Success: `200` when MongoDB is connected.

```json
{
  "healthStatus": {
    "server": "up",
    "database": "Connected"
  }
}
```

Returns `500` with the same `healthStatus` shape if the database is not
connected; `database` can be `Disconnected`, `Connecting`, `Disconnecting`, or
`Unknown`.

## Users

All `/users` routes require authentication.

### `GET /users` — admin

List all users. Passwords are omitted.

Success: `200`, an array of user objects with `_id`, `name`, `email`, `role`,
`accountStatus`, `createdAt`, and `updatedAt`.

Typical errors: `401` missing/invalid token; `403` not an admin; `500` server
error.

### `GET /users/:id` — own profile or admin

Get one user by MongoDB ID. Passwords are omitted.

Success: `200`, a user object. Typical errors: `400` malformed ID; `401`
unauthenticated; `403` not the requested user or an admin; `404` not found;
`500` server error.

### `PATCH /users/:id/role` — admin

Request:

```json
{ "role": "support_agent" }
```

Allowed roles: `customer`, `support_agent`, `admin`. Success: `200`:

```json
{
  "message": "User role updated successfully",
  "user": { "_id": "MongoDB ObjectId", "role": "support_agent" }
}
```

The returned `user` also includes the other non-password user fields. An admin
cannot change their own role. Typical errors: `400` invalid role/ID; `401`
unauthenticated; `403` not an admin or changing own role; `404` user not found;
`500` server error.

### `PATCH /users/:id/status` — admin

Request:

```json
{ "accountStatus": "inactive" }
```

Allowed statuses: `active`, `inactive`. Success: `200` with
`{ "message": "User status updated successfully", "user": <user> }`. An admin
cannot deactivate their own account. Typical errors: `400` invalid
status/ID; `401` unauthenticated; `403` not an admin or deactivating own
account; `404` user not found; `500` server error.

## Tickets

All `/tickets` routes require authentication. Ticket fields in responses
typically include `_id`, `customerId`, `title`, `description`, `priority`,
`category`, `status`, `assignedAgentId`, `resolvedAt`, `closedAt`, `isDeleted`,
`deletedAt`, `createdAt`, and `updatedAt`.

Allowed values:

- `priority`: `low`, `medium`, `high`, `urgent`
- `category`: `technical`, `billing`, `account`, `general`, `other`
- `status`: `open`, `in_progress`, `waiting_on_customer`, `resolved`, `closed`

Ticket list responses contain raw ticket records: customer and assigned-agent
details are IDs, not populated user objects.

### `GET /tickets` — support agent or admin

List non-archived tickets, newest first. Optional query parameters:

| Parameter | Meaning |
| --- | --- |
| `status` | Filter by a valid ticket status. |
| `priority` | Filter by a valid priority. |
| `category` | Filter by a valid category. |
| `assignedAgentId` | Filter by assigned agent's MongoDB ID. |
| `search` | Case-insensitive substring search of title and description. |

Example: `GET /tickets?status=open&priority=high&search=payment`.

Success: `200`, an array. Tickets with `isDeleted: true` are excluded. Typical
errors: `400` invalid filter; `401` unauthenticated; `403` customer role;
`500` server error.

### `GET /tickets/archived` — admin

List archived (soft-deleted) tickets, most recently updated first.

Success: `200`, an array. Typical errors: `401`, `403`, `500`.

### `GET /tickets/agent/:agentId` — support agent or admin

List non-archived tickets assigned to a support agent, newest first. An agent
can request only their own ID; an admin can request any support agent's ID.

Success: `200`, an array. Typical errors: `400` invalid ID; `401`
unauthenticated; `403` agent requesting another agent's tickets; `404` no
support agent found; `500` server error.

### `GET /tickets/:id` — ticket customer, assigned agent, or admin

Get one non-archived ticket.

Success: `200`, a ticket object. Typical errors: `400` invalid ID; `401`
unauthenticated; `403` no access; `404` not found or archived; `500` server
error.

### `POST /tickets` — customer

Create a ticket for the authenticated customer. All four fields are required.

```json
{
  "title": "Payment confirmation missing",
  "description": "My payment went through but I did not receive confirmation.",
  "priority": "high",
  "category": "billing"
}
```

Success: `201`, the created ticket object. New tickets have `status: "open"`,
no assigned agent, and are not archived. The title and description are trimmed.
An active ticket with the same title for the same customer is rejected.

Typical errors: `400` missing/empty/invalid field; `401` unauthenticated;
`403` non-customer role; `409` duplicate active title; `500` server error.

### `PUT /tickets/:ticketId` — admin or assigned support agent

Update one or more fields. This is a partial update despite using `PUT`; only
provided fields change.

```json
{
  "status": "in_progress",
  "priority": "urgent"
}
```

Updatable fields: `title`, `description`, `priority`, `category`, and `status`.
At least one must be supplied. An agent can update only tickets assigned to
them; admins can update any non-archived ticket. Setting status to `resolved`
sets `resolvedAt`; `closed` sets `closedAt` and sets `resolvedAt` if it was not
already set. Any other status clears both dates.

Success: `200`, the updated ticket object. Typical errors: `400` invalid ID,
empty update, or invalid field; `401` unauthenticated; `403` role/access
denied; `404` ticket not found or archived; `500` server error.

### `DELETE /tickets/:ticketId` — admin

Soft-delete (archive) a ticket; it is not permanently removed.

Success: `200`:

```json
{
  "message": "Ticket deleted successfully",
  "ticket": { "_id": "MongoDB ObjectId", "isDeleted": true }
}
```

Typical errors: `400` invalid ID; `401` unauthenticated; `403` not an admin;
`404` not found; `409` already archived; `500` server error.

### `PATCH /tickets/:ticketId/restore` — admin

Restore an archived ticket.

Success: `200` with
`{ "message": "Ticket restored successfully", "ticket": <ticket> }`. Typical
errors: `400` invalid ID; `401` unauthenticated; `403` not an admin; `404` not
found; `409` ticket is not archived; `500` server error.

### `PATCH /tickets/:ticketId/assign` — admin

Assign a ticket to an active support agent.

```json
{ "assignedAgentId": "MongoDB ObjectId of support agent" }
```

Success: `200`:

```json
{
  "message": "Ticket assigned successfully",
  "ticket": {
    "_id": "MongoDB ObjectId",
    "assignedAgentId": "MongoDB ObjectId"
  }
}
```

Typical errors: `400` invalid ticket or agent ID; `401` unauthenticated;
`403` not an admin or agent account inactive; `404` ticket/agent not found or
ticket archived; `500` server error.

### `PATCH /tickets/:ticketId/unassign` — admin

Remove the assigned agent.

Success: `200`:

```json
{
  "message": "Ticket unassigned successfully",
  "ticket": {
    "_id": "MongoDB ObjectId",
    "assignedAgentId": null
  }
}
```

Typical errors: `400` invalid ID; `401` unauthenticated; `403` not an admin;
`404` ticket not found or archived; `409` already unassigned; `500` server
error.

### `GET /tickets/:ticketId/comments` — ticket customer, assigned agent, or admin

List comments for an accessible, non-archived ticket in oldest-first order.
Each comment includes `ticketId`, `body`, timestamps, and a populated
`authorId` object containing `_id`, `name`, `email`, and `role`.

Success: `200`, an array. Typical errors: `400` invalid ID; `401`
unauthenticated; `403` no ticket access; `404` not found or archived; `500`
server error.

### `POST /tickets/:ticketId/comments` — ticket customer, assigned agent, or admin

Add a comment to an accessible, non-archived ticket. The author is taken from
the authenticated user, not from the request body.

```json
{ "body": "Could you share the latest update?" }
```

Success: `201`:

```json
{
  "message": "Comment created successfully.",
  "comment": {
    "_id": "MongoDB ObjectId",
    "ticketId": "MongoDB ObjectId",
    "authorId": {
      "_id": "MongoDB ObjectId",
      "name": "Alex Customer",
      "email": "alex@example.com",
      "role": "customer"
    },
    "body": "Could you share the latest update?",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

Typical errors: `400` invalid ID or empty body; `401` unauthenticated; `403`
no ticket access; `404` ticket not found or archived; `500` server error.

### Customer ticket-list limitation

There is currently no endpoint to list all tickets owned by a customer. A
customer can fetch a ticket by ID only if they own it, but `GET /tickets` is
restricted to support agents and admins. The frontend should not assume it can
retrieve a customer's full ticket history from the current API.

## Dashboard

### `GET /dashboard/stats` — admin

Success: `200`

```json
{
  "tickets": {
    "total": 0,
    "open": 0,
    "inProgress": 0,
    "waitingOnCustomer": 0,
    "resolved": 0,
    "closed": 0
  },
  "users": {
    "total": 0,
    "customers": 0,
    "supportAgents": 0,
    "admin": 0,
    "active": 0,
    "inactive": 0
  }
}
```

**Implementation caveat:** these counts currently come from the in-memory sample
data in `src/data/data.js`, not from MongoDB. They will not reflect accounts and
tickets created through the API. Treat the response as placeholder/demo data.
Typical errors: `401` unauthenticated; `403` not an admin.

## Demo accounts (optional)

If the backend database has been populated by `npm run seed`, the seed script
creates demo accounts with the same password:

```text
SupportHubDemo2026!
```

For example:

| Role | Email |
| --- | --- |
| Admin | `michael.tucker.admin1@supporthub.test` |
| Support agent | `abdul.aziz.sesay.agent1@supporthub.test` |
| Customer | `mariama.sesay.customer2@supporthub.test` |

The seed script creates fictional demo users, 180 tickets, and ticket comments.
It refuses to seed if tickets or comments already exist, so it is not a
reset/cleanup command. Use only in the intended development database.

## Example frontend request

```js
const API_BASE_URL = "http://localhost:5001/api";

async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? `Request failed (${response.status})`);
  }

  return data;
}
```

For authenticated requests, pass the login token, for example:

```js
const tickets = await apiRequest("/tickets?status=open", { token });
```
