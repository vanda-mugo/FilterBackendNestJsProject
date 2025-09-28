import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import {
  FilterDefinition,
  FilterCondition,
  AndGroup,
  OrGroup,
  isFilterCondition,
  isAndGroup,
  isOrGroup,
} from '../types';

@Injectable()
export class NestedFilterQueryBuilderService {
  /**
   * Apply nested filter definition to a TypeORM query builder
   * This is the main entry point for converting filters to SQL
   */
  applyFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: FilterDefinition,
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    const whereResult = this.buildWhereClause(filter, alias, {}, { count: 0 });

    if (whereResult.clause) {
      queryBuilder.where(whereResult.clause, whereResult.parameters);
    }

    return queryBuilder;
  }

  /**
   * Build WHERE clause recursively for nested filters
   * Handles FilterCondition, AndGroup, and OrGroup
   */
  private buildWhereClause(
    filter: FilterDefinition,
    alias: string,
    parameters: Record<string, any>,
    paramCounter: { count: number },
  ): { clause: string; parameters: Record<string, any> } {
    if (isFilterCondition(filter)) {
      return this.buildConditionClause(filter, alias, parameters, paramCounter);
    } else if (isAndGroup(filter)) {
      return this.buildAndGroupClause(filter, alias, parameters, paramCounter);
    } else if (isOrGroup(filter)) {
      return this.buildOrGroupClause(filter, alias, parameters, paramCounter);
    }

    return { clause: '', parameters };
  }

  /**
   * Build AND group clause: (condition1 AND condition2 AND ...)
   */
  private buildAndGroupClause(
    group: AndGroup,
    alias: string,
    parameters: Record<string, any>,
    paramCounter: { count: number },
  ): { clause: string; parameters: Record<string, any> } {
    const clauses: string[] = [];

    group.and.forEach((item) => {
      const result = this.buildWhereClause(
        item,
        alias,
        parameters,
        paramCounter,
      );
      if (result.clause) {
        clauses.push(result.clause);
      }
    });

    const clause = clauses.length > 0 ? `(${clauses.join(' AND ')})` : '';
    return { clause, parameters };
  }

  /**
   * Build OR group clause: (condition1 OR condition2 OR ...)
   */
  private buildOrGroupClause(
    group: OrGroup,
    alias: string,
    parameters: Record<string, any>,
    paramCounter: { count: number },
  ): { clause: string; parameters: Record<string, any> } {
    const clauses: string[] = [];

    group.or.forEach((item) => {
      const result = this.buildWhereClause(
        item,
        alias,
        parameters,
        paramCounter,
      );
      if (result.clause) {
        clauses.push(result.clause);
      }
    });

    const clause = clauses.length > 0 ? `(${clauses.join(' OR ')})` : '';
    return { clause, parameters };
  }

  /**
   * Build single condition clause with parameterized values
   * Converts each operator to appropriate SQL syntax
   */
  private buildConditionClause(
    condition: FilterCondition,
    alias: string,
    parameters: Record<string, any>,
    paramCounter: { count: number },
  ): { clause: string; parameters: Record<string, any> } {
    // Type-safe destructuring with validation
    const field: string = condition.field;
    const operator: string = condition.operator;
    const value:
      | string
      | number
      | boolean
      | Array<string | number | boolean>
      | null
      | undefined = condition.value as
      | string
      | number
      | boolean
      | Array<string | number | boolean>
      | null
      | undefined;

    if (!field || !operator) {
      throw new Error('Invalid condition: field and operator are required');
    }

    const paramKey = `param_${paramCounter.count++}`;
    const fieldPath = `${alias}.${field}`;

    let clause = '';

    switch (operator) {
      case 'eq':
        clause = `${fieldPath} = :${paramKey}`;
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value === null
        ) {
          parameters[paramKey] = value;
        } else {
          throw new Error('Invalid value type for eq operator');
        }
        break;

      case 'neq':
        clause = `${fieldPath} != :${paramKey}`;
        parameters[paramKey] = value ?? null;
        break;

      case 'gt':
        clause = `${fieldPath} > :${paramKey}`;
        parameters[paramKey] = value ?? null;
        break;

      case 'lt':
        clause = `${fieldPath} < :${paramKey}`;
        parameters[paramKey] = value ?? null;
        break;

      case 'gte':
        clause = `${fieldPath} >= :${paramKey}`;
        parameters[paramKey] = value ?? null;
        break;

      case 'lte':
        clause = `${fieldPath} <= :${paramKey}`;
        parameters[paramKey] = value ?? null;
        break;

      case 'in':
        clause = `${fieldPath} IN (:...${paramKey})`;
        parameters[paramKey] = value ?? [];
        break;

      case 'between': {
        // Safe array destructuring with validation
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            'Between operator requires an array with exactly 2 values',
          );
        }
        const [minRaw, maxRaw] = value as [
          string | number | boolean | null | undefined,
          string | number | boolean | null | undefined,
        ];
        const min: string | number | boolean | null = minRaw ?? null;
        const max: string | number | boolean | null = maxRaw ?? null;
        const minKey = `${paramKey}_min`;
        const maxKey = `${paramKey}_max`;
        clause = `${fieldPath} BETWEEN :${minKey} AND :${maxKey}`;
        parameters[minKey] = min;
        parameters[maxKey] = max;
        break;
      }

      case 'contains': {
        clause = `${fieldPath} LIKE :${paramKey}`;
        parameters[paramKey] = `%${String(value)}%`;
        break;
      }

      case 'starts_with': {
        clause = `${fieldPath} LIKE :${paramKey}`;
        parameters[paramKey] = `${String(value)}%`;
        break;
      }

      case 'ends_with': {
        clause = `${fieldPath} LIKE :${paramKey}`;
        parameters[paramKey] = `%${String(value)}`;
        break;
      }

      case 'is_null':
        clause = `${fieldPath} IS NULL`;
        // No parameters needed for null checks
        break;

      case 'is_not_null':
        clause = `${fieldPath} IS NOT NULL`;
        // No parameters needed for null checks
        break;

      default:
        // This should never happen due to validation, but TypeScript needs it
        throw new Error(`Unsupported operator: ${String(operator)}`);
    }

    return { clause, parameters };
  }

  /**
   * Apply pagination to query builder
   * Converts page/limit to OFFSET/LIMIT
   */
  applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10,
  ): SelectQueryBuilder<T> {
    const offset = (page - 1) * limit;
    return queryBuilder.skip(offset).take(limit);
  }

  /**
   * Apply sorting to query builder
   * Supports both ASC and DESC ordering
   */
  applySort<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    field: string,
    order: 'ASC' | 'DESC' = 'ASC',
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    return queryBuilder.orderBy(`${alias}.${field}`, order);
  }

  /**
   * Apply multiple sorts (bonus feature)
   * Useful for secondary sorting criteria
   */
  applyMultipleSort<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    sorts: Array<{ field: string; order: 'ASC' | 'DESC' }>,
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    sorts.forEach((sort, index) => {
      if (index === 0) {
        queryBuilder.orderBy(`${alias}.${sort.field}`, sort.order);
      } else {
        queryBuilder.addOrderBy(`${alias}.${sort.field}`, sort.order);
      }
    });
    return queryBuilder;
  }

  /**
   * Get count query for pagination metadata
   * Applies filters but removes ordering and pagination
   */
  buildCountQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: FilterDefinition,
    alias: string = 'entity',
  ): SelectQueryBuilder<T> {
    // Clone the base query and apply filters
    const countQuery = queryBuilder.clone();

    // Apply filters
    this.applyFilter(countQuery, filter, alias);

    // Remove any existing order by and pagination
    countQuery.skip(undefined).take(undefined);

    return countQuery;
  }
}
