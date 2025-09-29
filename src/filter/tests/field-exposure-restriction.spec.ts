import { Test, TestingModule } from '@nestjs/testing';
import { FilterService } from '../services/filter.service';
import { FilterValidationService } from '../services/filter-validation.service';
import { NestedFilterQueryBuilderService } from '../services/nested-filter-query-builder.service';
import { User } from '../../users/entities/user.entity';
import { FilterDefinition } from '../types/filter.types';

describe('Field Exposure Restriction Tests', () => {
  let filterService: FilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterValidationService,
        FilterService,
        NestedFilterQueryBuilderService,
      ],
    }).compile();

    filterService = module.get<FilterService>(FilterService);
  });

  it('should extract filterable fields from User entity', () => {
    const schema = filterService.getEntitySchema(User);

    expect(schema).toBeDefined();
    expect(schema.entityName).toBe('User');
    expect(Array.isArray(schema.fields)).toBe(true);
    expect(schema.fields.length).toBeGreaterThan(0);
  });

  it('should validate correct filter', () => {
    const validFilter: FilterDefinition = {
      field: 'name',
      operator: 'eq',
      value: 'John Doe',
    };

    expect(() => {
      filterService.validateFilterFromEntity(validFilter, User);
    }).not.toThrow();
  });

  it('should reject invalid field filter', () => {
    const invalidFilter: FilterDefinition = {
      field: 'nonExistentField',
      operator: 'eq',
      value: 'test',
    };

    expect(() => {
      filterService.validateFilterFromEntity(invalidFilter, User);
    }).toThrow();
  });
});
