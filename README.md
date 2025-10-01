# NestJS Filter Backend

A comprehensive, type-safe filtering system for NestJS applications with TypeORM integration. This library provides advanced filtering capabilities including nested AND/OR groups, field restrictions, and automatic query generation.

## Features

-  **13 Filter Operators**: eq, neq, gt, lt, gte, lte, in, between, contains, starts_with, ends_with, is_null, is_not_null
-  **Nested Filtering**: Support for complex AND/OR logical groups
-  **Field Security**: Control which fields can be filtered using `@Filterable` decorators
-  **Type Safety**: Full TypeScript support with runtime validation
-  **Database Integration**: Seamless TypeORM query generation
-  **Multiple Endpoints**: Both GET (query params) and POST (JSON body) support
-  **Pagination & Sorting**: Built-in pagination and sorting capabilities
-  **Comprehensive Testing**: 69 tests covering all functionality

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Docker (optional, for database)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/vanda-mugo/FilterBackendNestJsProject.git
cd nest-filter-backend
npm install
```

2. **Database Setup:**

Option A - Using Docker:
```bash
# Start PostgreSQL with Docker
docker run --name postgres-filter \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=filter_db \
  -p 5432:5432 \
  -d postgres:15
```

Option B - Local PostgreSQL:
```bash
# Create database
createdb filter_db
```

## Development Options

### Option 1: Database in Docker + App in Development Mode (Recommended)

```bash
# 1. Start PostgreSQL database in Docker
npm run docker:db

# 2. Run migrations and seed data
npm run migration:run
npm run seed

# 3. Start app in development mode
npm run start:dev
```

**Result**: 
- Database runs in Docker container on `localhost:5432`
- App runs locally on `localhost:3001` with hot reload
- Best for active development

### Option 2: Full Docker Setup

```bash
# Start both database and application in Docker
npm run docker:up
```

**Result**:
- Both app and database run in Docker containers
- App available on `localhost:3000`
- Good for testing production-like environment

### Docker Monitoring & Logs

Once you have Docker running (`docker-compose up`), you can monitor and debug using these commands:

```bash
# Check container status
docker-compose ps

# View real-time logs from all services
docker-compose logs -f

# View logs from application only
docker-compose logs -f app

# View logs from database only  
docker-compose logs -f postgres

# Check application health
curl http://localhost:3000

# Test filter endpoint
curl "http://localhost:3000/users/filter?filter=%7B%22field%22%3A%22role%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A%22developer%22%7D"

# Execute commands inside the running container
docker-compose exec app npm run migration:run
docker-compose exec app npm run seed

# Stop containers
docker-compose down

# Stop and remove all data
docker-compose down --volumes
```

**Troubleshooting Docker Issues:**
```bash
# Clean up Docker networks (if network conflicts)
docker network prune -f

# Rebuild containers from scratch
docker-compose down --volumes --remove-orphans
docker-compose up --build

# Check container resource usage
docker stats
```

### Option 3: Quick Development Setup

```bash
# One command to set up database and run migrations
npm run dev:setup

# Then start development
npm run start:dev
```

3. **Environment Configuration:**
```bash
# Copy environment template
cp .env.example .env

 ***Note the presence of three different .env files to signify production, test and dev***

# The .env file contains all necessary configuration:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=filter_db

# Application settings for development
PORT=3001
NODE_ENV=development
```

**Note**: The `.env.example` is pre-configured with the correct values that match your Docker setup. Just copy it and you're ready to go!

4. **Database Migration & Seeding:**
```bash
# Run migrations to create tables
npm run migration:run

# Seed sample data
npm run seed
```

5. **Start the Application:**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Port Configuration

- **Development mode** (`npm run start:dev`): Runs on port **3001** (configured in `.env`)
- **Docker mode** (`docker-compose up`): Runs on port **3000** (configured in docker-compose.yml)
- **Production mode**: Uses `PORT` environment variable or defaults to 3000

The application will be available at:
- Development: `http://localhost:3001`
- Docker: `http://localhost:3000`

### Running Tests

```bash
# All tests
npm test

# Filter tests only
npm test src/filter/tests/

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov
```

### Quick Docker Commands Reference

```bash
# Docker Setup
npm run docker:up              # Start app + database
npm run docker:db              # Start database only  
npm run docker:down            # Stop containers
docker-compose logs -f app     # View app logs
docker-compose exec app bash   # Access container shell

# Inside Container Commands
docker-compose exec app npm run migration:run  # Run migrations
docker-compose exec app npm run seed           # Seed sample data
docker-compose exec postgres psql -U postgres -d filter_db  # Access database
```

## Example Requests/Responses

### Basic Filter Examples

#### Simple Equality Filter (GET) - Example 1
```http
GET /users/filter?filter=%7B%22field%22%3A%22role%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A%22developer%22%7D
```

**Note**: The `filter` parameter must be a URL-encoded JSON string. The above URL decodes to:
```json
{"field":"role","operator":"eq","value":"developer"}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 28,
      "role": "developer",
      "isActive": true
    },
    {
      "id": "uuid-2",
      "name": "Diana Lee",
      "email": "diana.lee@tech.com",
      "age": 27,
      "role": "developer",
      "isActive": true
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Simple Equality Filter (GET) - Example 2
```http
GET /users/filter?filter=%7B%22field%22%3A%22isActive%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3Afalse%7D&page=1&limit=5
```

**Note**: The above URL decodes to:
```json
{"field":"isActive","operator":"eq","value":false}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-3",
      "name": "Bob Johnson",
      "email": "bob@startup.io",
      "age": 25,
      "role": "developer",
      "isActive": false
    },
    {
      "id": "uuid-4",
      "name": "Fiona Davis",
      "email": "fiona@creative.com",
      "age": 24,
      "role": "designer",
      "isActive": false
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

#### Complex Filter (POST) - Example 1
```http
POST /users/filter
Content-Type: application/json

{
  "filter": {
    "and": [
      { "field": "isActive", "operator": "eq", "value": true },
      {
        "or": [
          { "field": "role", "operator": "eq", "value": "admin" },
          {
            "and": [
              { "field": "role", "operator": "eq", "value": "developer" },
              { "field": "age", "operator": "gte", "value": 25 }
            ]
          }
        ]
      }
    ]
  },
  "page": 1,
  "limit": 5,
  "sort": {
    "field": "name",
    "order": "ASC"
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Alice Brown",
      "email": "alice@example.com", 
      "age": 29,
      "role": "admin",
      "isActive": true
    },
    {
      "id": "uuid-2", 
      "name": "John Doe",
      "email": "john@example.com",
      "age": 28,
      "role": "developer", 
      "isActive": true
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

#### Complex Filter (POST) - Example 2
```http
POST /users/filter
Content-Type: application/json

{
  "filter": {
    "or": [
      {
        "and": [
          { "field": "role", "operator": "in", "value": ["manager", "admin"] },
          { "field": "age", "operator": "gt", "value": 30 }
        ]
      },
      {
        "and": [
          { "field": "role", "operator": "eq", "value": "developer" },
          { "field": "name", "operator": "contains", "value": "John" },
          { "field": "isActive", "operator": "eq", "value": true }
        ]
      }
    ]
  },
  "page": 1,
  "limit": 10,
  "sort": {
    "field": "age",
    "order": "DESC"
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Edward Chen",
      "email": "edward@innovation.com",
      "age": 35,
      "role": "manager",
      "isActive": true
    },
    {
      "id": "uuid-2",
      "name": "George Miller",
      "email": "george@solutions.com",
      "age": 33,
      "role": "admin",
      "isActive": true
    },
    {
      "id": "uuid-3",
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "age": 32,
      "role": "manager",
      "isActive": true
    },
    {
      "id": "uuid-4",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "age": 28,
      "role": "developer",
      "isActive": true
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### All Supported Operators

```javascript
// Equality
{ "field": "role", "operator": "eq", "value": "admin" }
{ "field": "role", "operator": "neq", "value": "admin" }

// Numeric comparisons  
{ "field": "age", "operator": "gt", "value": 30 }
{ "field": "age", "operator": "lt", "value": 25 }
{ "field": "age", "operator": "gte", "value": 18 }
{ "field": "age", "operator": "lte", "value": 65 }

// Array operations
{ "field": "role", "operator": "in", "value": ["admin", "manager"] }
{ "field": "age", "operator": "between", "value": [25, 35] }

// String operations
{ "field": "name", "operator": "contains", "value": "john" }
{ "field": "name", "operator": "starts_with", "value": "J" }
{ "field": "email", "operator": "ends_with", "value": ".com" }

// Null checks
{ "field": "deletedAt", "operator": "is_null" }
{ "field": "updatedAt", "operator": "is_not_null" }
```

### Error Responses (Edge Cases To Handle)

#### Empty Filter Object (Returns All Results)
```http
POST /users/filter
{
  "filter": null
}
```

**Response (200):**
```json
{
  "data": [...],
  "total": 12,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

#### Non-Filterable Field (Security Restriction)
```http
POST /users/filter
{
  "filter": {
    "field": "password",
    "operator": "eq", 
    "value": "secret"
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Unknown field: password",
  "error": "Bad Request"
}
```

#### Invalid Field (Field Does Not Exist)
```http
POST /users/filter
{
  "filter": {
    "field": "nonExistentField",
    "operator": "eq", 
    "value": "someValue"
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Unknown field: nonExistentField",
  "error": "Bad Request"
}
```

#### Invalid Operator
```http
POST /users/filter  
{
  "filter": {
    "field": "age",
    "operator": "invalid_op",
    "value": 25
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request", 
  "details": ["operator must be one of: eq, neq, gt, lt, gte, lte, in, between, contains, starts_with, ends_with, is_null, is_not_null"]
}
```

#### Invalid JSON Structure
```http
POST /users/filter
{
  "filter": {
    "field": "age"
    // Missing operator and value
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": ["operator should not be empty", "operator must be one of: eq, neq, gt, lt, gte, lte, in, between, contains, starts_with, ends_with, is_null, is_not_null"]
}
```

#### Unsupported Operator for Field Type
```http
POST /users/filter
{
  "filter": {
    "field": "age",
    "operator": "contains",
    "value": "25"
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Operator 'contains' is not supported for field type 'number'",
  "error": "Bad Request"
}
```

#### Type Mismatch in Value
```http
POST /users/filter
{
  "filter": {
    "field": "age",
    "operator": "gt",
    "value": "not-a-number"
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid value type for field 'age'. Expected number, got string",
  "error": "Bad Request"
}
```

#### Between Operator with Wrong Number of Values
```http
POST /users/filter
{
  "filter": {
    "field": "age",
    "operator": "between",
    "value": [25]
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Between operator requires exactly 2 values in array format",
  "error": "Bad Request"
}
```

#### In Operator with Non-Array Value
```http
POST /users/filter
{
  "filter": {
    "field": "role",
    "operator": "in",
    "value": "developer"
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "In operator requires an array of values",
  "error": "Bad Request"
}
```

#### Deeply Nested Groups
```http
POST /users/filter
{
  "filter": {
    "and": [
      { "field": "isActive", "operator": "eq", "value": true },
      {
        "or": [
          { "field": "role", "operator": "eq", "value": "admin" },
          {
            "and": [
              { "field": "role", "operator": "eq", "value": "developer" },
              {
                "or": [
                  { "field": "age", "operator": "gte", "value": 25 },
                  { "field": "name", "operator": "contains", "value": "John" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Response (201):**  Valid - System supports unlimited nesting depth

#### Mixed Valid and Invalid Conditions
```http
POST /users/filter
{
  "filter": {
    "and": [
      { "field": "role", "operator": "eq", "value": "developer" },
      { "field": "password", "operator": "eq", "value": "secret" }
    ]
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Field 'password' is not filterable",
  "error": "Bad Request"
}
```

#### Malformed Nested Structure
```http
POST /users/filter
{
  "filter": {
    "and": [
      { "field": "role", "operator": "eq", "value": "developer" },
      {
        "invalid_logic": [
          { "field": "age", "operator": "gt", "value": 25 }
        ]
      }
    ]
  }
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid filter structure: must be condition, and_group, or or_group",
  "error": "Bad Request"
}
```

## Field Validation Overview

### Understanding Non-Filterable vs Invalid Fields

The filter system distinguishes between two types of field errors:

#### **Non-Filterable Fields** 
- **Definition**: Valid database fields that exist but are **intentionally restricted** from filtering
- **Purpose**: Security and privacy control
- **Configuration**: Fields **without** `@Filterable()` decorator

**Example in User Entity:**
```typescript
@Entity('users')
export class User {
  @Filterable({ type: 'string' })  // ✅ Filterable
  @Column()
  name: string;

  @Column()  //  Non-filterable (no @Filterable decorator)
  password: string;

  @Column()  //  Non-filterable (sensitive data)
  internalNotes: string;
}
```

**Error Message:** `"Field 'password' is not filterable"`

#### **Invalid Fields** 
- **Definition**: Field names that **don't exist** in the entity at all
- **Cause**: Typos, wrong field names, or non-existent properties
- **Validation**: Entity schema validation

**Examples:**
- `nonExistentField` → Field doesn't exist
- `nam` → Typo for `name`  
- `userRole` → Should be `role`

**Error Message:** `"Unknown field: [fieldname]"`

### Important Note
 **Both non-filterable and invalid fields return the same error message** (`"Unknown field: [fieldname]"`) because the system only recognizes fields marked with `@Filterable()` decorators. From a security perspective, this is **intentional** - it doesn't reveal which fields exist in the database.

### Security Benefits

```typescript
//  These fields are filterable (public queries allowed)
@Filterable({ type: 'string' }) name: string;
@Filterable({ type: 'string' }) email: string; 
@Filterable({ type: 'number' }) age: number;
@Filterable({ type: 'string' }) role: string;

//  These fields are non-filterable (security-sensitive)
password: string;           // Passwords should never be exposed
internalNotes: string;      // Internal company data
socialSecurityNumber: string; // PII data
```

**Security Advantage**: Attackers cannot distinguish between non-existent fields and restricted fields, preventing database schema discovery.

## Design Decisions

### Architecture Overview

The filter system follows a modular, layered architecture designed for maintainability and extensibility:

```
├── src/filter/
│   ├── services/          # Business logic layer  
│   ├── dto/               # Data transfer objects & validation
│   ├── types/             # TypeScript interfaces & types
│   ├── decorators/        # Custom decorators (@Filterable)
│   └── tests/             # Comprehensive test suite
```

### Database Structure & Migrations Explained

Understanding the project's database organization is crucial for maintenance and development:

#### Why We Need Migrations

**Migrations are version control for your database schema**. Here's why they're essential:

1. **Database Evolution**: As your app grows, you need to add/modify tables, columns, and indexes
2. **Team Collaboration**: Everyone gets the same database structure when they run `npm run migration:run`
3. **Production Safety**: Controlled, reversible changes to production databases
4. **History Tracking**: Every database change is documented and can be rolled back

**Example**: When you run `npm run migration:generate -- -n CreateUserTable`, TypeORM creates a timestamped file like `1727596741150-CreateUserTable.ts` that contains:
```typescript
// Up: Apply the change
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user" (...)`);
}

// Down: Reverse the change  
public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
}
```

#### The Database Folder Structure

```
src/database/
├── data-source.ts         # Main TypeORM configuration
├── test-data-source.ts    # Separate config for testing
├── migrations/            # All database schema changes
│   └── 1727596741150-CreateUserTable.ts
└── seeds/                 # Sample data for development
    └── user-seeder.ts
```

**Purpose of each file**:
- **`data-source.ts`**: Connects to PostgreSQL, loads entities, runs migrations
- **`test-data-source.ts`**: Isolated test database (won't affect your dev data)
- **`migrations/`**: Step-by-step database changes (like Git commits for your schema)
- **`seeds/`**: Creates sample users for testing the filter system

#### Why Two Entity Folders?

You noticed we have entities in two places - here's why:

```
src/entities/user.entity.ts           # ← Global entity (shared across modules)
src/users/entities/user.entity.ts     # ← Module-specific entity (NestJS convention)
```

**The Simple Explanation**:

1. **`src/entities/`** = **Global Database Models**
   - These are the "official" database table definitions
   - TypeORM uses these to generate migrations
   - Shared across the entire application

2. **`src/users/entities/`** = **Module-Specific Models** 
   - NestJS modules often have their own entity folder for organization
   - Usually imports/re-exports from the global entities
   - Keeps module code self-contained

**In practice**, both files typically contain the same entity or one imports the other:

```typescript
// src/users/entities/user.entity.ts might just be:
export { User } from '../../entities/user.entity';
```

**Why this pattern?**:
- **Team Development**: Different teams can work on different modules
- **Code Organization**: Each module contains everything it needs
- **Scalability**: Easy to find module-related code in one place
- **NestJS Convention**: Follows the framework's recommended structure

### Key Design Principles

#### 1. **Security First**
- **Field Access Control**: Only explicitly marked fields can be filtered using `@Filterable()` decorator
- **SQL Injection Prevention**: All queries use parameterized statements via TypeORM
- **Input Validation**: Comprehensive validation using class-validator

#### 2. **Type Safety**
- **Runtime Validation**: DTO classes with decorators validate all input
- **Compile-time Safety**: Strong TypeScript interfaces throughout
- **Type Guards**: Runtime type checking for filter definitions

#### 3. **Separation of Concerns**
- **FilterValidationService**: Handles field access control and validation
- **NestedFilterQueryBuilderService**: Converts filters to SQL queries  
- **FilterService**: Orchestrates the filtering process
- **Controllers**: Handle HTTP concerns only

#### 4. **Extensibility**
- **Operator System**: Easy to add new filter operators
- **Entity Agnostic**: Works with any TypeORM entity
- **Decorator-based Configuration**: Simple field exposure control

### Performance Considerations

#### 1. **Query Optimization**
```typescript
// Generated queries use proper indexes and joins
SELECT user.id, user.name, user.email, user.age, user.role, user.isActive 
FROM users user 
WHERE (user.isActive = $1 AND user.role = $2) 
ORDER BY user.name ASC 
LIMIT 10 OFFSET 0
```

#### 2. **Memory Efficiency**
- Pagination prevents memory bloat
- Selective field loading

### Database Integration

#### TypeORM Query Builder
The system leverages TypeORM's QueryBuilder for:
- **Type Safety**: Compile-time query validation
- **Cross-database Support**: PostgreSQL, MySQL, SQLite, etc.
- **Relationship Handling**: Automatic JOIN generation
- **Parameter Binding**: SQL injection prevention


## How to Extend the Filter Library

### Adding New Filter Operators

1. **Update the FilterOperator type:**
```typescript
// src/filter/types/filter.types.ts
export type FilterOperator =
  | 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
  | 'in' | 'between' | 'contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null'
  | 'regex' | 'not_contains'; // New operators
```

2. **Implement in Query Builder:**
```typescript
// src/filter/services/nested-filter-query-builder.service.ts
private applyCondition(qb: SelectQueryBuilder<any>, condition: FilterCondition, paramIndex: number): void {
  const { field, operator, value } = condition;
  const paramName = `param_${paramIndex}`;

  switch (operator) {
    // ... existing cases
    case 'regex':
      qb.andWhere(`${field} ~ :${paramName}`, { [paramName]: value });
      break;
    case 'not_contains':
      qb.andWhere(`${field} NOT ILIKE :${paramName}`, { [paramName]: `%${value}%` });
      break;
  }
}
```

3. **Update Validation:**
```typescript
// src/filter/dto/filter-request.dto.ts
@IsIn([
  'eq', 'neq', 'gt', 'lt', 'gte', 'lte',
  'in', 'between', 'contains', 'starts_with', 'ends_with',
  'is_null', 'is_not_null',
  'regex', 'not_contains' // Add new operators
])
operator: FilterOperator;
```

4. **Add Tests:**
```typescript
// src/filter/tests/filter-query-conversion.spec.ts
it('should handle regex operator correctly', async () => {
  const filter: FilterDefinition = {
    field: 'email',
    operator: 'regex',
    value: '^[a-z]+@.*\\.com$'
  };

  const result = await queryBuilderService.applyFilter(mockQueryBuilder, filter, mockSchema);
  
  expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
    'email ~ :param_0',
    { param_0: '^[a-z]+@.*\\.com$' }
  );
});
```

### Adding New Entities

1. **Create Entity with @Filterable decorators:**
```typescript
// src/products/entities/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Filterable } from '../../filter/decorators/filterable.decorator';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Filterable({ type: 'string' })
  @Column()
  name: string;

  @Filterable({ type: 'number' })
  @Column('decimal')
  price: number;

  @Filterable({ type: 'string' }) 
  @Column()
  category: string;

  @Filterable({ type: 'boolean' })
  @Column({ default: true })
  inStock: boolean;

  // Non-filterable fields
  @Column({ select: false })
  internalNotes: string;
}
```

2. **Create Controller:**
```typescript
// src/products/controllers/product-filter.controller.ts
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { FilterService } from '../../filter/services/filter.service';
import { FilterRequestDto } from '../../filter/dto/filter-request.dto';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductFilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get('filter')
  async getFilteredProducts(@Query() query: any) {
    return this.filterService.applyFilter(Product, query);
  }

  @Post('filter')
  async postFilteredProducts(@Body() filterRequest: FilterRequestDto) {
    return this.filterService.applyFilter(Product, filterRequest);
  }
}
```

3. **Register in Module:**
```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilterModule } from '../filter/filter.module';
import { Product } from './entities/product.entity';
import { ProductFilterController } from './controllers/product-filter.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    FilterModule
  ],
  controllers: [ProductFilterController],
})
export class ProductsModule {}
```

### Customizing Field Types

```typescript
// src/filter/types/filter.types.ts
export type FieldType =
  | 'string' | 'number' | 'boolean' | 'date'
  | 'enum' | 'uuid'
  | 'json' | 'array'; // New types

// Custom field configuration
@Filterable({ 
  type: 'enum',
  enumValues: ['pending', 'approved', 'rejected'],
  allowedOperators: ['eq', 'neq', 'in']
})
@Column()
status: string;

@Filterable({
  type: 'json',
  allowedOperators: ['contains'] // JSON field search
})
@Column('jsonb')
metadata: object;
```

### Advanced Filtering Features

#### Custom Validation Rules
```typescript
// src/filter/validators/custom-field.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'customFieldValidation' })
export class CustomFieldValidator implements ValidatorConstraintInterface {
  validate(field: string): boolean {
    // Custom validation logic
    return allowedCustomFields.includes(field);
  }

  defaultMessage(): string {
    return 'Field $value is not allowed for filtering';
  }
}
```

#### Relationship Filtering
```typescript
// Enable filtering on joined entities
@Filterable({ 
  type: 'string',
  relationPath: 'profile.department' // user.profile.department.name
})
@ManyToOne(() => Profile)
profile: Profile;
```

## Environment Configuration

This project uses environment files to manage configuration for different environments. You must create the following files in the project root:

### .env.development
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=filter_db
PORT=3001
NODE_ENV=development
ENVIRONMENT=development
```

### .env.test
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=filter_db
PORT=3001
NODE_ENV=development
ENVIRONMENT=test
```

- The `.env.development` file is used for local development.
- The `.env.test` file is used for running tests.
- You can adjust values as needed for your environment (e.g., database host, port, credentials).
- The app uses [@nestjs/config](https://docs.nestjs.com/techniques/configuration) to load these files automatically based on the environment.

this is to showcase the different environments each with different configurations that the app can be run in, for now the configurations are the same and is a matter of conceptual design and approach to building production applications ensuring security in credentials as well as robust separation of concern with regards to using config files and namespace config files. 

## Example Dataset

The application includes a comprehensive User dataset for testing and demonstration:

### Sample Users Dataset

```typescript
// 12 sample users with diverse data for comprehensive testing
const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com", 
    age: 28,
    role: "developer",
    isActive: true
  },
  {
    name: "Jane Smith", 
    email: "jane.smith@company.com",
    age: 32,
    role: "manager", 
    isActive: true
  },
  {
    name: "Bob Johnson",
    email: "bob@startup.io",
    age: 25, 
    role: "developer",
    isActive: false
  },
  {
    name: "Alice Brown",
    email: "alice.brown@corp.com",
    age: 29,
    role: "admin",
    isActive: true
  },
  {
    name: "Charlie Wilson",
    email: "charlie@design.com", 
    age: 31,
    role: "designer",
    isActive: true
  },
  {
    name: "Diana Lee",
    email: "diana.lee@tech.com",
    age: 27,
    role: "developer", 
    isActive: true
  },
  {
    name: "Edward Chen",
    email: "edward@innovation.com",
    age: 35,
    role: "manager",
    isActive: true
  },
  {
    name: "Fiona Davis", 
    email: "fiona@creative.com",
    age: 24,
    role: "designer",
    isActive: false
  },
  {
    name: "George Miller",
    email: "george@solutions.com", 
    age: 33,
    role: "admin",
    isActive: true
  },
  {
    name: "Helen Taylor",
    email: "helen@systems.com",
    age: 30,
    role: "developer",
    isActive: true
  },
  {
    name: "Ivan Rodriguez", 
    email: "ivan@platforms.com",
    age: 26,
    role: "developer",
    isActive: true
  },
  {
    name: "Julia Roberts",
    email: "julia@enterprises.com",
    age: 28, 
    role: "developer",
    isActive: true
  }
];
```

### Data Distribution
- **Total Users**: 12
- **Roles**: admin (2), manager (2), developer (6), designer (2)  
- **Age Range**: 24-35 years
- **Active Status**: 10 active, 2 inactive
- **Email Domains**: Various realistic domains

### Seeding the Database
```bash
# Run the seeder to populate sample data
npm run seed

# Or manually seed in development
npm run start:dev
# The application will auto-seed on first run
```

### Testing with Sample Data

Use the sample dataset to test various filtering scenarios:

```bash
# Test basic filtering
curl "http://localhost:3000/users/filter?field=role&operator=eq&value=developer"

# Test complex nested filters  
curl -X POST http://localhost:3000/users/filter \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"field": "isActive", "operator": "eq", "value": true},
        {"field": "age", "operator": "gte", "value": 25}
      ]
    }
  }'

# Test pagination and sorting
curl -X POST http://localhost:3000/users/filter \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"field": "role", "operator": "eq", "value": "developer"},
    "page": 1,
    "limit": 3,
    "sort": {"field": "age", "order": "DESC"}
  }'
```

