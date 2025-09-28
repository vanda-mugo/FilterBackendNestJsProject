import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { FilterValidationService } from './filter-validation.service';
import { NestedFilterQueryBuilderService } from './nested-filter-query-builder.service';
import { FilterDefinition, EntitySchema } from '../types/filter.types';
import { extractEntitySchema } from '../decorators/filterable.decorator';

@Injectable()
export class FilterService {
  constructor(
    private readonly validationService: FilterValidationService,
    private readonly queryBuilderService: NestedFilterQueryBuilderService,
  ) {}

  /**
   * Apply filters to a TypeORM query builder using manual EntitySchema
   */
  applyFilter<T extends import('typeorm').ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: FilterDefinition,
    entitySchema: EntitySchema,
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    // Step 1: Validate the filter
    this.validationService.validateFilter(filter, entitySchema);

    // Step 2: Apply the filter to the query builder
    return this.queryBuilderService.applyFilter(queryBuilder, filter, alias);
  }

  /**
   * Apply filters using @Filterable decorator metadata from entity class
   *
   * @example
   * const filteredQuery = filterService.applyFilterFromEntity(
   *   userRepository.createQueryBuilder('user'),
   *   filterJson,
   *   User,
   *   'user'
   * );
   */
  applyFilterFromEntity<T extends import('typeorm').ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: FilterDefinition,
    entityClass: new () => T,
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    // Extract schema from @Filterable decorators
    const entitySchema = extractEntitySchema(entityClass);

    return this.applyFilter(queryBuilder, filter, entitySchema, alias);
  }

  /**
   * Validate a filter without applying it (using manual schema)
   */
  validateFilter(filter: FilterDefinition, entitySchema: EntitySchema): void {
    this.validationService.validateFilter(filter, entitySchema);
  }

  /**
   * Validate a filter using @Filterable decorator metadata
   */
  validateFilterFromEntity<T>(
    filter: FilterDefinition,
    entityClass: new () => T,
  ): void {
    const entitySchema = extractEntitySchema(entityClass);
    this.validationService.validateFilter(filter, entitySchema);
  }

  /**
   * Get the entity schema extracted from @Filterable decorators
   * Useful for debugging or API documentation
   */
  getEntitySchema<T>(entityClass: new () => T): EntitySchema {
    return extractEntitySchema(entityClass);
  }

  /**
   * Check if a field is filterable on an entity class
   */
  isFieldFilterable<T>(entityClass: new () => T, fieldName: string): boolean {
    const schema = extractEntitySchema(entityClass);
    return schema.fields.some((field) => field.name === fieldName);
  }
}
