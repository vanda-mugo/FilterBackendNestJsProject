# Filter Endpoints Documentation

## Overview
The Users module provides two endpoints for filtering users with the same filtering capabilities:

1. **GET `/users/filter`** - URL-encoded filter queries (good for simple filters)
2. **POST `/users/filter`** - JSON body filters (recommended for complex filters)

## GET Endpoint: URL-Encoded Filters

### Format
```
GET /users/filter?filter=<URL_encoded_JSON>&page=1&limit=10&sortBy=name&sortOrder=ASC
```

### Parameters
- `filter` (optional): URL-encoded JSON filter definition
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): 'ASC' or 'DESC' (default: 'ASC')

### Examples

#### Simple Filter: Age > 30
```bash
# Filter JSON: {"field":"age","operator":"gt","value":30}
# URL-encoded: %7B%22field%22%3A%22age%22%2C%22operator%22%3A%22gt%22%2C%22value%22%3A30%7D

curl "http://localhost:3000/users/filter?filter=%7B%22field%22%3A%22age%22%2C%22operator%22%3A%22gt%22%2C%22value%22%3A30%7D&page=1&limit=10"
```

#### String Filter: Name contains "john"
```bash
# Filter JSON: {"field":"name","operator":"contains","value":"john"}

curl "http://localhost:3000/users/filter?filter=%7B%22field%22%3A%22name%22%2C%22operator%22%3A%22contains%22%2C%22value%22%3A%22john%22%7D"
```

## POST Endpoint: JSON Body Filters

### Format
```
POST /users/filter
Content-Type: application/json

{
  "filter": { /* filter definition */ },
  "page": 1,
  "limit": 10,
  "sortBy": "name",
  "sortOrder": "ASC"
}
```

### Examples

#### Simple Filter
```bash
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": { "field": "age", "operator": "gt", "value": 30 },
    "page": 1,
    "limit": 10
  }'
```

#### Complex Nested Filter
```bash
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        { "field": "age", "operator": "gt", "value": 25 },
        { "field": "isActive", "operator": "eq", "value": true },
        {
          "or": [
            { "field": "role", "operator": "eq", "value": "admin" },
            { "field": "name", "operator": "in", "value": ["Alice", "Bob"] }
          ]
        }
      ]
    },
    "page": 1,
    "limit": 10,
    "sortBy": "name",
    "sortOrder": "ASC"
  }'
```

## Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `{ "field": "name", "operator": "eq", "value": "Alice" }` |
| `neq` | Not equal | `{ "field": "age", "operator": "neq", "value": 25 }` |
| `gt` | Greater than | `{ "field": "age", "operator": "gt", "value": 18 }` |
| `lt` | Less than | `{ "field": "age", "operator": "lt", "value": 65 }` |
| `gte` | Greater than or equal | `{ "field": "age", "operator": "gte", "value": 21 }` |
| `lte` | Less than or equal | `{ "field": "age", "operator": "lte", "value": 60 }` |
| `in` | Value in array | `{ "field": "role", "operator": "in", "value": ["admin", "user"] }` |
| `between` | Between two values | `{ "field": "age", "operator": "between", "value": [25, 55] }` |
| `contains` | String contains | `{ "field": "email", "operator": "contains", "value": "gmail" }` |
| `starts_with` | String starts with | `{ "field": "name", "operator": "starts_with", "value": "Al" }` |
| `ends_with` | String ends with | `{ "field": "email", "operator": "ends_with", "value": ".com" }` |
| `is_null` | Field is null | `{ "field": "deletedAt", "operator": "is_null" }` |
| `is_not_null` | Field is not null | `{ "field": "email", "operator": "is_not_null" }` |

## Response Format

Both endpoints return the same response format:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Alice",
      "email": "alice@example.com",
      "age": 30,
      "role": "admin",
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## Error Handling

### 400 Bad Request Examples

#### Invalid Field
```json
{
  "message": "Unknown field: password",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Invalid Operator
```json
{
  "message": "Operator \"contains\" is not allowed for field \"age\" of type \"number\". Allowed operators: eq, neq, gt, lt, gte, lte, between, in, is_null, is_not_null",
  "error": "Bad Request", 
  "statusCode": 400
}
```

#### Invalid Value
```json
{
  "message": "Operator \"between\" requires exactly 2 values",
  "error": "Bad Request",
  "statusCode": 400
}
```

## When to Use Which Endpoint

### Use GET `/users/filter` when:
- Simple filters with 1-3 conditions
- Bookmarkable URLs needed
- Caching is important
- Filter is used in URL sharing

### Use POST `/users/filter` when:
- Complex nested filters with many conditions
- Filter JSON is large (>2000 characters)
- Security is important (filters not visible in logs)
- Building programmatic queries

## JavaScript Helper Functions

```javascript
// Encode filter for GET request
function encodeFilter(filter) {
  return encodeURIComponent(JSON.stringify(filter));
}

// Build complete GET URL
function buildFilterUrl(baseUrl, filter, options = {}) {
  const url = new URL(`${baseUrl}/users/filter`);
  
  if (filter) {
    url.searchParams.set('filter', encodeFilter(filter));
  }
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}
```
