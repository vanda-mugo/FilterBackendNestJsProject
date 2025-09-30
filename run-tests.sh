#!/bin/bash

# Test runner script for filter system techo " To run with coverage:"
echo "   npm test -- --coverage --testPathPatterns=\"src/filter/tests\""ts

echo " Running Filter System Tests..."
echo "================================="

# Check if required dependencies are installed
if ! npm list jest > /dev/null 2>&1; then
    echo "  Jest not found. Installing test dependencies..."
    npm install --save-dev jest @nestjs/testing supertest @types/supertest
fi

echo " Available test suites:"
echo "1. Field Exposure Restriction"
echo "2. Filter Validation"  
echo "3. Query Builder (Filter → SQL)"
echo "4. Endpoint Integration"
echo "5. Query Execution"
echo "6. All tests"
echo ""

# Run specific test or all tests
case "${1:-all}" in
    "1"|"field-exposure")
        echo " Running Field Exposure Restriction Tests..."
        npm test -- --testPathPatterns=field-exposure.spec.ts
        ;;
    "2"|"filter-validation")
        echo " Running Filter Validation Tests..."
        npm test -- --testPathPatterns=filter-validation.spec.ts
        ;;
    "3"|"query-builder") 
        echo " Running Query Builder Tests..."
        npm test -- --testPathPatterns=query-builder.spec.ts
        ;;
    "4"|"endpoint-integration")
        echo " Running Endpoint Integration Tests..."
        npm test -- --testPathPatterns=endpoint-integration.spec.ts
        ;;
    "5"|"query-execution")
        echo " Running Query Execution Tests..."
        npm test -- --testPathPatterns=query-execution.spec.ts
        ;;
    "all"|""|*)
        echo " Running All Filter Tests..."
        npm test -- --testPathPatterns="src/filter/tests"
        ;;
esac

echo ""
echo " Test execution completed!"
echo ""
echo " To run with coverage:"
echo "   npm test -- --coverage --testPathPattern=\"src/filter/tests\""
echo ""
echo " To run specific test:"
echo "   ./run-tests.sh [1-6|field-exposure|filter-validation|query-builder|endpoint-integration|query-execution]"
