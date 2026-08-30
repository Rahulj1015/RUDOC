# RUDOC API

Base URL for local development:

```text
http://127.0.0.1:4000
```

## Endpoints

### Health

```http
GET /api/health
```

Returns API status.

### Services

```http
GET /api/services
```

Returns available services and their required documents.

### User Documents

```http
GET /api/user/documents
```

Returns demo documents owned by the current MVP user.

### Requirement Match

```http
GET /api/match/:serviceId
```

Compares service requirements with the user document vault and returns available/missing documents with guide metadata where available.

### Create Tasks

```http
POST /api/tasks/:serviceId
```

Creates tasks for missing documents, including priority, reason, source, next step, and default status.
