# Filter Types Documentation

##  **Overview**

The filter types system provides a complete solution for handling the nested and/or filter JSON structure 
##  **Core Types**

### **1. FilterOperator**
Defines all supported operators:
- **Comparison**: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`
- **Collection**: `in`, `between`
- **String**: `contains`, `starts_with`, `ends_with`  
- **Null checks**: `is_null`, `is_not_null`

### **2. FieldType**
Supported data types for validation:
- `string`, `number`, `boolean`, `date`, `enum`, `uuid`

### **3. FilterCondition**
Basic filter condition:
```typescript
{
  field: string;      // Field name (e.g., "age")
  operator: FilterOperator; // Operator (e.g., "gt")
  value?: any;        // Value (optional for is_null/is_not_null)
}
```

### **4. AndGroup & OrGroup**
Logical groupings that can contain conditions or nested groups:
```typescript
{ and: [condition1, condition2, nestedOrGroup] }
{ or: [condition1, condition2, nestedAndGroup] }
```

### **5. FilterDefinition**
Root type that can be any of the above - this is what endpoints receive.

##  **Key Features**

### **Type Safety**
- **Runtime Type Guards**: `isFilterCondition()`, `isAndGroup()`, `isOrGroup()`
- **Compile-time Validation**: Full TypeScript support
- **Operator Validation**: Each field type has allowed operators

### **Field Schema System**
```typescript
interface FieldSchema {
  name: string;               // Field name
  type: FieldType;           // Data type
  filterable: boolean;       // Can this field be filtered?
  allowedOperators?: FilterOperator[]; // Custom operator restrictions
  enumValues?: string[];     // For enum types
}
```

### **Default Operator Mappings**
- **String fields**: eq, neq, in, contains, starts_with, ends_with, is_null, is_not_null
- **Number fields**: eq, neq, gt, lt, gte, lte, in, between, is_null, is_not_null  
- **Boolean fields**: eq, neq, is_null, is_not_null
- **Date fields**: eq, neq, gt, lt, gte, lte, between, is_null, is_not_null
- **Enum fields**: eq, neq, in, is_null, is_not_null
- **UUID fields**: eq, neq, in, is_null, is_not_null

##  **Usage Examples**

### **Assignment Example**
```json
{
  "and": [
    { "field": "age", "operator": "gt", "value": 30 },
    {
      "or": [
        { "field": "role", "operator": "eq", "value": "admin" },
        { "field": "isActive", "operator": "eq", "value": true }
      ]
    }
  ]
}
```

### **Complex Nested Example**
```json
{
  "or": [
    {
      "and": [
        { "field": "isActive", "operator": "eq", "value": true },
        { "field": "role", "operator": "in", "value": ["admin", "moderator"] }
      ]
    },
    {
      "and": [
        { "field": "age", "operator": "between", "value": [25, 65] },
        { "field": "name", "operator": "contains", "value": "smith" }
      ]
    }
  ]
}
```

##  **Validation Rules**

### **Operator-Specific Validation**
- **`between`**: Must have exactly 2 values `[min, max]`
- **`in`**: Must have array of values `["val1", "val2"]`
- **`is_null/is_not_null`**: Must have no value
- **String operators**: Only work with string fields
- **Numeric operators**: Only work with number/date fields

### **Security Features**
- **Field Restriction**: Only `filterable: true` fields can be filtered
- **Type Validation**: Values must match field types
- **Operator Restriction**: Only allowed operators per field type
- **Custom Constraints**: Per-field operator restrictions

##  **How It Works**

### **1. Request Processing**
```typescript
// Client sends FilterDefinition
POST /users/filter
Body: { "and": [...] }

// Controller receives typed input
@Body() filter: FilterDefinition
```

### **2. Validation**
```typescript
// Validate against entity schema
const schema = getUserEntitySchema();
validateFilter(filter, schema);
```

### **3. Query Building**
```typescript
// Convert to database query
const queryBuilder = convertToQuery(filter);
// Results in: WHERE age > 30 AND (role = 'admin' OR isActive = true)
```

##  **Next Steps**

With these types in place, we can now build:
1. **@Filterable Decorator** - Mark entity fields as filterable
2. **Validation Service** - Validate incoming filters
3. **Query Builder** - Convert filters to SQL
4. **Filter Module** - Tie everything together

The types provide the foundation for a complete, type-safe, and secure filtering system.