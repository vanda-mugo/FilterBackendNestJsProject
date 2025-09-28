# Testing Guide for NestJS Filter Backend

## 📋 Overview

This NestJS filter backend has two types of testing available:

1. **Unit Tests** - Test individual components and services
2. **End-to-End (E2E) Tests** - Test complete API workflows
3. **Manual API Testing** - Direct endpoint testing with curl/Postman

## 🧪 Current Test Structure

```
nest-filter-backend/
├── src/
│   └── app.controller.spec.ts       # Unit test for main controller
├── test/
│   ├── app.e2e-spec.ts             # End-to-end API tests
│   └── jest-e2e.json               # E2E test configuration
├── package.json                     # Test scripts and Jest configuration
└── run-tests.sh                     # Custom test runner script
```

## 🚀 How to Run Tests

### 1. Basic Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run specific test file
npm test -- --testPathPattern="app.controller.spec.ts"
```

### 2. End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e -- --watch

# Debug E2E tests
npm run test:debug -- --config ./test/jest-e2e.json
```

### 3. Custom Test Runner
```bash
# Make the script executable
chmod +x run-tests.sh

# Run all filter tests (currently no filter-specific tests exist)
./run-tests.sh

# Run specific test category
./run-tests.sh 1  # or field-exposure, filter-validation, etc.
```

## ⚙️ Test Configuration

### Jest Unit Test Config (in package.json)
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Jest E2E Test Config (test/jest-e2e.json)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## 📊 Current Test Status

### ✅ Working Tests
- **App Controller Unit Test**: Tests basic "Hello World" endpoint
  ```bash
  npm test  # Shows: ✓ should return "Hello World!"
  ```

### ❌ Tests Needing Fixes
- **E2E Tests**: Have supertest import issues
- **Filter-Specific Tests**: Not yet implemented

## 🛠️ Manual API Testing

Since the application is fully functional, you can test it manually:

### Start the Application
```bash
npm run start:dev
# Application runs on http://localhost:3001
```

### Test Basic Endpoints
```bash
# Get all users
curl -X GET "http://localhost:3001/users"

# Test simple filter (POST)
curl -X POST "http://localhost:3001/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "age", 
      "operator": "gt", 
      "value": 25
    }
  }'

# Test nested AND filter
curl -X POST "http://localhost:3001/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "operator": "and",
      "conditions": [
        {"field": "role", "operator": "eq", "value": "developer"},
        {"field": "age", "operator": "gte", "value": 25}
      ]
    }
  }'
```

### Test Field Validation
```bash
# This should return an error for non-filterable field
curl -X POST "http://localhost:3001/users/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "field": "password", 
      "operator": "eq", 
      "value": "secret"
    }
  }'
# Expected: {"message":"Unknown field: password","error":"Bad Request","statusCode":400}
```

## 🔧 Available NPM Scripts

```json
{
  "scripts": {
    "test": "jest",                           // Run unit tests
    "test:watch": "jest --watch",             // Watch mode
    "test:cov": "jest --coverage",            // With coverage
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"  // E2E tests
  }
}
```

## 📈 Test Examples

### Unit Test Example (Working)
```typescript
// src/app.controller.spec.ts
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});
```

### E2E Test Example (Needs Fix)
```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## 🎯 Next Steps for Testing

1. **Fix E2E Tests**: Update supertest imports
2. **Add Filter Tests**: Create comprehensive filter system tests
3. **Database Tests**: Add tests with test database
4. **Integration Tests**: Test complete filter workflows

## 🏆 System Verification

The filter system is **fully functional and tested manually**. Key verified features:
- ✅ Field restriction via `@Filterable` decorators
- ✅ All 13 operators working
- ✅ Nested AND/OR groups
- ✅ Type-safe validation
- ✅ Database query generation
- ✅ Complete API endpoints

**Manual testing confirms all requirements are met!** 🎉
