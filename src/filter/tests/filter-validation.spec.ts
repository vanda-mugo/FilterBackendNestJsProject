import { Test, TestingModule } from '@nestjs/testing';
import { FilterValidationService } from '../services/filter-validation.service';
import { NestedFilterQueryBuilderService } from '../services/nested-filter-query-builder.service';
import {
  FilterDefinition,
  EntitySchema,
  FilterOperator,
} from '../types/filter.types';
import { BadRequestException } from '@nestjs/common';

describe('Filter Validation Tests', () => {
  let filterValidationService: FilterValidationService;

  // Mock entity schema for testing
  const mockEntitySchema: EntitySchema = {
    entityName: 'TestEntity',
    fields: [
      { name: 'stringField', type: 'string', filterable: true },
      { name: 'numberField', type: 'number', filterable: true },
      { name: 'booleanField', type: 'boolean', filterable: true },
      { name: 'dateField', type: 'date', filterable: true },
      {
        name: 'enumField',
        type: 'enum',
        filterable: true,
        enumValues: ['option1', 'option2', 'option3'],
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilterValidationService, NestedFilterQueryBuilderService],
    }).compile();

    filterValidationService = module.get<FilterValidationService>(
      FilterValidationService,
    );
  });

  describe('Basic Filter Validation', () => {
    it('should validate a simple valid filter condition', () => {
      const validFilter: FilterDefinition = {
        field: 'stringField',
        operator: 'eq',
        value: 'test',
      };

      expect(() => {
        filterValidationService.validateFilter(validFilter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should reject filter with unknown field', () => {
      const invalidFilter: FilterDefinition = {
        field: 'unknownField',
        operator: 'eq',
        value: 'test',
      };

      expect(() => {
        filterValidationService.validateFilter(invalidFilter, mockEntitySchema);
      }).toThrow(BadRequestException);
    });

    it('should reject filter with invalid operator', () => {
      const invalidFilter: FilterDefinition = {
        field: 'stringField',
        operator: 'invalidOperator' as any,
        value: 'test',
      };

      expect(() => {
        filterValidationService.validateFilter(invalidFilter, mockEntitySchema);
      }).toThrow(BadRequestException);
    });
  });

  describe('Operator Validation for Field Types', () => {
    it('should validate string operators', () => {
      const stringOperators: FilterOperator[] = [
        'eq',
        'neq',
        'contains',
        'starts_with',
        'ends_with',
        'in',
      ];

      stringOperators.forEach((operator) => {
        const filter: FilterDefinition = {
          field: 'stringField',
          operator: operator,
          value: operator === 'in' ? ['value1', 'value2'] : 'test',
        };

        expect(() => {
          filterValidationService.validateFilter(filter, mockEntitySchema);
        }).not.toThrow();
      });
    });

    it('should validate number operators', () => {
      const numberOperators: FilterOperator[] = [
        'eq',
        'neq',
        'gt',
        'lt',
        'gte',
        'lte',
        'between',
        'in',
      ];

      numberOperators.forEach((operator) => {
        const filter: FilterDefinition = {
          field: 'numberField',
          operator: operator,
          value:
            operator === 'between'
              ? [10, 20]
              : operator === 'in'
                ? [1, 2, 3]
                : 15,
        };

        expect(() => {
          filterValidationService.validateFilter(filter, mockEntitySchema);
        }).not.toThrow();
      });
    });

    it('should validate boolean operators', () => {
      const booleanOperators: FilterOperator[] = ['eq', 'neq'];

      booleanOperators.forEach((operator) => {
        const filter: FilterDefinition = {
          field: 'booleanField',
          operator: operator,
          value: true,
        };

        expect(() => {
          filterValidationService.validateFilter(filter, mockEntitySchema);
        }).not.toThrow();
      });
    });

    it('should reject invalid operators for field types', () => {
      // String operators on number field should fail
      const invalidFilter1: FilterDefinition = {
        field: 'numberField',
        operator: 'contains',
        value: 'text',
      };

      expect(() => {
        filterValidationService.validateFilter(
          invalidFilter1,
          mockEntitySchema,
        );
      }).toThrow(BadRequestException);

      // Number operators on string field should fail
      const invalidFilter2: FilterDefinition = {
        field: 'stringField',
        operator: 'gt',
        value: 10,
      };

      expect(() => {
        filterValidationService.validateFilter(
          invalidFilter2,
          mockEntitySchema,
        );
      }).toThrow(BadRequestException);
    });
  });

  describe('Value Type Validation', () => {
    it('should validate correct value types', () => {
      const testCases: FilterDefinition[] = [
        { field: 'stringField', operator: 'eq', value: 'string' },
        { field: 'numberField', operator: 'eq', value: 42 },
        { field: 'booleanField', operator: 'eq', value: true },
        { field: 'enumField', operator: 'eq', value: 'option1' },
      ];

      testCases.forEach((testCase) => {
        const filter: FilterDefinition = testCase;
        expect(() => {
          filterValidationService.validateFilter(filter, mockEntitySchema);
        }).not.toThrow();
      });
    });

    it('should validate array values for IN operator', () => {
      const filter: FilterDefinition = {
        field: 'stringField',
        operator: 'in',
        value: ['value1', 'value2', 'value3'],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should validate array values for BETWEEN operator', () => {
      const filter: FilterDefinition = {
        field: 'numberField',
        operator: 'between',
        value: [10, 20],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should reject invalid enum values', () => {
      const filter: FilterDefinition = {
        field: 'enumField',
        operator: 'eq',
        value: 'invalidOption',
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).toThrow(BadRequestException);
    });
  });

  describe('Nested Group Validation', () => {
    it('should validate simple AND group', () => {
      const filter: FilterDefinition = {
        and: [
          { field: 'stringField', operator: 'eq', value: 'test' },
          { field: 'numberField', operator: 'gt', value: 10 },
        ],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should validate simple OR group', () => {
      const filter: FilterDefinition = {
        or: [
          { field: 'stringField', operator: 'eq', value: 'test' },
          { field: 'numberField', operator: 'gt', value: 10 },
        ],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should validate deeply nested groups', () => {
      const filter: FilterDefinition = {
        and: [
          { field: 'booleanField', operator: 'eq', value: true },
          {
            or: [
              { field: 'stringField', operator: 'contains', value: 'test' },
              {
                and: [
                  { field: 'numberField', operator: 'gte', value: 0 },
                  { field: 'numberField', operator: 'lte', value: 100 },
                ],
              },
            ],
          },
        ],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should reject invalid conditions within groups', () => {
      const filter: FilterDefinition = {
        and: [
          { field: 'stringField', operator: 'eq', value: 'test' },
          { field: 'unknownField', operator: 'eq', value: 'invalid' }, // This should fail
        ],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).toThrow(BadRequestException);
    });

    it('should reject empty groups', () => {
      const filter1: FilterDefinition = {
        and: [],
      };

      const filter2: FilterDefinition = {
        or: [],
      };

      expect(() => {
        filterValidationService.validateFilter(filter1, mockEntitySchema);
      }).toThrow(BadRequestException);

      expect(() => {
        filterValidationService.validateFilter(filter2, mockEntitySchema);
      }).toThrow(BadRequestException);
    });
  });

  describe('Null Value Operators', () => {
    it('should validate is_null operator', () => {
      const filter: FilterDefinition = {
        field: 'stringField',
        operator: 'is_null',
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should validate is_not_null operator', () => {
      const filter: FilterDefinition = {
        field: 'stringField',
        operator: 'is_not_null',
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should reject value for null operators', () => {
      const filter: FilterDefinition = {
        field: 'stringField',
        operator: 'is_null',
        value: 'shouldNotHaveValue',
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).toThrow(BadRequestException);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should reject malformed filter objects', () => {
      const malformedFilters: any[] = [
        {}, // Empty object
        { field: 'stringField' }, // Missing operator
        { operator: 'eq' }, // Missing field
        null, // Null filter
        undefined, // Undefined filter
      ];

      malformedFilters.forEach((filter) => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          filterValidationService.validateFilter(filter, mockEntitySchema);
        }).toThrow(BadRequestException);
      });
    });

    it('should handle extremely nested structures', () => {
      // Create a deeply nested filter (5 levels deep)
      let nestedFilter: FilterDefinition = {
        field: 'stringField',
        operator: 'eq',
        value: 'deep',
      };

      for (let i = 0; i < 5; i++) {
        nestedFilter = {
          and: [
            { field: 'booleanField', operator: 'eq', value: true },
            nestedFilter,
          ],
        };
      }

      expect(() => {
        filterValidationService.validateFilter(nestedFilter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should validate mixed group types', () => {
      const filter: FilterDefinition = {
        and: [
          {
            or: [
              { field: 'stringField', operator: 'eq', value: 'option1' },
              { field: 'stringField', operator: 'eq', value: 'option2' },
            ],
          },
          {
            and: [
              { field: 'numberField', operator: 'gte', value: 10 },
              { field: 'numberField', operator: 'lte', value: 50 },
            ],
          },
        ],
      };

      expect(() => {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      }).not.toThrow();
    });

    it('should provide helpful error messages', () => {
      const filter: FilterDefinition = {
        field: 'nonExistentField',
        operator: 'eq',
        value: 'test',
      };

      try {
        filterValidationService.validateFilter(filter, mockEntitySchema);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        if (error instanceof BadRequestException) {
          expect(error.message).toContain('Unknown field: nonExistentField');
        }
      }
    });
  });
});
