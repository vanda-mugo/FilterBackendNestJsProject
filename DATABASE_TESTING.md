# Database Setup and Testing Guide

## 🚀 Quick Start

### 1. Database Setup
```bash
# Run the automated setup script
./setup-database.sh
```

Or manually:
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start the application
npm run start:dev
```

### 2. Verify Setup
```bash
# Check if database is running
docker-compose ps

# Check application logs
docker-compose logs app
```

## 🔍 Testing the Filter System

### Sample Data Overview
The seed data includes 12 users with the following characteristics:
- **Roles**: developer (6), manager (3), designer (2), admin (1)
- **Ages**: 24-35 years
- **Status**: 10 active, 2 inactive users
- **Filterable fields**: name, email, age, role, isActive

### Basic Endpoints

#### 1. Get All Users
```bash
curl "http://localhost:3000/users"
```

#### 2. GET with URL-Encoded Filters
```bash
# Filter active developers
filter='{"field":"role","operator":"eq","value":"developer"}'
encoded=$(echo -n "$filter" | python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read()))")
curl "http://localhost:3000/users/filter?filter=$encoded"

# Filter users older than 30
filter='{"field":"age","operator":"gt","value":30}'
encoded=$(echo -n "$filter" | python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read()))")
curl "http://localhost:3000/users/filter?filter=$encoded&page=1&limit=5"
```

#### 3. POST with JSON Filters
```bash
# Simple condition
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "role",
      "operator": "eq",
      "value": "manager"
    },
    "page": 1,
    "limit": 10
  }'

# Complex nested filters (developers OR managers who are active)
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "field": "isActive",
          "operator": "eq",
          "value": true
        },
        {
          "or": [
            {
              "field": "role",
              "operator": "eq",
              "value": "developer"
            },
            {
              "field": "role",
              "operator": "eq",
              "value": "manager"
            }
          ]
        }
      ]
    }
  }'
```

## 🧪 Comprehensive Filter Tests

### String Operations
```bash
# Contains filter
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "name",
      "operator": "contains",
      "value": "John"
    }
  }'

# Starts with filter
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "email",
      "operator": "starts_with",
      "value": "alice"
    }
  }'
```

### Numeric Operations
```bash
# Between filter (ages 25-30)
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "age",
      "operator": "between",
      "value": [25, 30]
    }
  }'

# Greater than or equal
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "age",
      "operator": "gte",
      "value": 30
    }
  }'
```

### Array/Set Operations
```bash
# In filter (multiple roles)
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "role",
      "operator": "in",
      "value": ["developer", "designer"]
    }
  }'
```

### Complex Nested Filters
```bash
# Advanced: (Active developers over 25) OR (Managers regardless of age)
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "or": [
        {
          "and": [
            {
              "field": "role",
              "operator": "eq",
              "value": "developer"
            },
            {
              "field": "age",
              "operator": "gt",
              "value": 25
            },
            {
              "field": "isActive",
              "operator": "eq",
              "value": true
            }
          ]
        },
        {
          "field": "role",
          "operator": "eq",
          "value": "manager"
        }
      ]
    }
  }'
```

## 🛡️ Error Testing

### Invalid Field Names
```bash
# Should return validation error
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "invalidField",
      "operator": "eq",
      "value": "test"
    }
  }'
```

### Non-Filterable Fields
```bash
# Should return validation error (password is not filterable)
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "password",
      "operator": "eq",
      "value": "test"
    }
  }'
```

### Invalid Operators
```bash
# Should return validation error
curl -X POST "http://localhost:3000/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "age",
      "operator": "invalid_op",
      "value": 25
    }
  }'
```

## 📊 Expected Results

With the seed data, you should see:
- **Total users**: 12
- **Active developers**: 4 (John, Bob, Diana, Fiona)
- **Managers**: 3 (Jane, Edward, Julia)
- **Users over 30**: 4 (Jane, Charlie, Edward, George)
- **Inactive users**: 2 (Charlie, Ian)

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Migration Issues
```bash
# Reset database (WARNING: destroys all data)
docker-compose down -v
docker-compose up -d postgres
npm run migration:run
npm run seed
```

### Application Issues
```bash
# Check application logs
npm run start:dev

# Or with Docker
docker-compose logs app
```

## 🎯 Assignment Verification Checklist

- ✅ **Nested Filters**: Test complex AND/OR groups
- ✅ **Field Restrictions**: Non-filterable fields are rejected
- ✅ **Type Safety**: Invalid types are caught
- ✅ **Database Integration**: Filters convert to SQL queries
- ✅ **Multiple Endpoints**: Both GET and POST work
- ✅ **URL Encoding**: GET endpoint handles encoded JSON
- ✅ **Pagination**: Proper offset/limit handling
- ✅ **Error Handling**: Validation errors return proper responses
- ✅ **Reusable Library**: Filter system can be applied to any entity
