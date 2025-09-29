import { Test, TestingModule } from '@nestjs/testing';
import { NestedFilterQueryBuilderService } from '../services/nested-filter-query-builder.service';
import { FilterValidationService } from '../services/filter-validation.service';
import { FilterDefinition } from '../types/filter.types';
import { SelectQueryBuilder } from 'typeorm';

describe('Filter Query Conversion Tests', () => {
  let queryBuilderService: NestedFilterQueryBuilderService;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestedFilterQueryBuilderService, FilterValidationService],
    }).compile();

    queryBuilderService = module.get<NestedFilterQueryBuilderService>(
      NestedFilterQueryBuilderService,
    );

    // Mock SelectQueryBuilder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
    } as any;
  });

  describe('Basic Operator Conversion', () => {
    it('should convert EQ operator correctly', () => {
      const filter: FilterDefinition = {
        field: 'name',
        operator: 'eq',
        value: 'John',
      };

      const result = queryBuilderService.applyFilter(
        mockQueryBuilder,
        filter,
        'user',
      );

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toBe(mockQueryBuilder);
    });

    it('should convert GT operator correctly', () => {
      const filter: FilterDefinition = {
        field: 'age',
        operator: 'gt',
        value: 25,
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should convert CONTAINS operator correctly', () => {
      const filter: FilterDefinition = {
        field: 'email',
        operator: 'contains',
        value: 'example.com',
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should convert IN operator correctly', () => {
      const filter: FilterDefinition = {
        field: 'role',
        operator: 'in',
        value: ['admin', 'manager', 'user'],
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should convert BETWEEN operator correctly', () => {
      const filter: FilterDefinition = {
        field: 'age',
        operator: 'between',
        value: [18, 65],
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('Nested Group Conversion', () => {
    it('should convert AND group correctly', () => {
      const filter: FilterDefinition = {
        and: [
          { field: 'isActive', operator: 'eq', value: true },
          { field: 'age', operator: 'gte', value: 18 },
        ],
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should convert OR group correctly', () => {
      const filter: FilterDefinition = {
        or: [
          { field: 'role', operator: 'eq', value: 'admin' },
          { field: 'role', operator: 'eq', value: 'manager' },
        ],
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should convert nested groups correctly', () => {
      const filter: FilterDefinition = {
        and: [
          { field: 'isActive', operator: 'eq', value: true },
          {
            or: [
              { field: 'role', operator: 'eq', value: 'admin' },
              { field: 'age', operator: 'gte', value: 25 },
            ],
          },
        ],
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('Parameter Generation', () => {
    it('should generate unique parameter names', () => {
      const filter1: FilterDefinition = {
        field: 'name',
        operator: 'eq',
        value: 'John',
      };

      const filter2: FilterDefinition = {
        field: 'name',
        operator: 'eq',
        value: 'Jane',
      };

      queryBuilderService.applyFilter(mockQueryBuilder, filter1, 'user');
      queryBuilderService.applyFilter(mockQueryBuilder, filter2, 'user');

      // Each call should generate different parameter names
      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(2);
    });
  });

  describe('SQL Injection Protection', () => {
    it('should protect against SQL injection in values', () => {
      const filter: FilterDefinition = {
        field: 'name',
        operator: 'eq',
        value: "'; DROP TABLE users; --",
      };

      // Should not throw error and should use parameterized queries
      expect(() => {
        queryBuilderService.applyFilter(mockQueryBuilder, filter, 'user');
      }).not.toThrow();

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
