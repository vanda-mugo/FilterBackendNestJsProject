import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FilterDefinition,
  FilterCondition,
  AndGroup,
  OrGroup,
  isFilterCondition,
  isAndGroup,
  isOrGroup,
  FilterOperator,
  EntitySchema,
  FieldSchema,
} from '../types/filter.types';
import {
  DEFAULT_OPERATORS_BY_TYPE,
  NO_VALUE_OPERATORS,
  ARRAY_VALUE_OPERATORS,
  DUAL_VALUE_OPERATORS,
} from '../types/filter.constants';

/**
 * Entity schema definition interface that makes the library reusable across different entities
 *
 * This interface allows for the definition of entity fields and their types, enabling dynamic filtering capabilities.
 * Example Usage:
 * ```typescript
 * const userSchema: EntitySchema = {
 *   name: { type: 'string', operators: ['eq', 'contains'] },
 *   age: { type: 'number', operators: ['gt', 'lt', 'between'] },
 *   isActive: { type: 'boolean', operators: ['eq'] }
 * };
 */

@Injectable()
export class FilterValidationService {
  /**
   * Main validation method for filter definitions
   * this is the primary entry point that makes the library reusable across different modules
   * any module can define its own entity schema and use this service to validate incoming filters against it
   * @param filter - The filter definition from client request
   * @param entitySchema - Schema defining allowed fields and operators
   * @throws BadRequestException for any validation failure
   */
  validateFilter(filter: FilterDefinition, entitySchema: EntitySchema): void {
    if (!filter || typeof filter !== 'object') {
      throw new BadRequestException('Invalid filter format');
    }

    this.validateFilterDefinition(filter, entitySchema);
  }

  /**
   * Validates the root filter definition (and/or groups or conditions)
   */
  private validateFilterDefinition(
    filter: FilterDefinition,
    entitySchema: EntitySchema,
  ): void {
    if (isFilterCondition(filter)) {
      this.validateCondition(filter, entitySchema);
    } else if (isAndGroup(filter)) {
      this.validateAndGroup(filter, entitySchema);
    } else if (isOrGroup(filter)) {
      this.validateOrGroup(filter, entitySchema);
    } else {
      throw new BadRequestException(
        'Invalid filter structure: must be condition, and_group, or or_group',
      );
    }
  }

  /**
   * Validates and group structure
   *
   * NESTED GROUP SUPPORT:
   * Recursively validates each filter in the group, supporting
   * unlimited nesting as required by the assignment.
   */
  private validateAndGroup(group: AndGroup, entitySchema: EntitySchema): void {
    if (!group.and || !Array.isArray(group.and) || group.and.length === 0) {
      throw new BadRequestException(
        'And group must have non-empty "and" array',
      );
    }

    // Recursively validate each filter in the group
    group.and.forEach((filter, index) => {
      try {
        this.validateFilterDefinition(filter, entitySchema);
      } catch (error) {
        throw new BadRequestException(
          `Invalid filter at and[${index}]: ${
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : String(error)
          }`,
        );
      }
    });
  }

  /**
   * Validates or group structure
   *
   * NESTED GROUP SUPPORT:
   * Recursively validates each filter in the group, supporting
   * unlimited nesting as required by the assignment.
   */
  private validateOrGroup(group: OrGroup, entitySchema: EntitySchema): void {
    if (!group.or || !Array.isArray(group.or) || group.or.length === 0) {
      throw new BadRequestException('Or group must have non-empty "or" array');
    }

    // Recursively validate each filter in the group
    group.or.forEach((filter, index) => {
      try {
        this.validateFilterDefinition(filter, entitySchema);
      } catch (error) {
        throw new BadRequestException(
          `Invalid filter at or[${index}]: ${
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : String(error)
          }`,
        );
      }
    });
  }

  /**
   * Validates individual filter conditions
   *
   * FIELD RESTRICTION IMPLEMENTATION:
   * This method enforces the assignment requirement: "Only certain fields
   * should be filterable." Fields must exist in the EntitySchema to be filtered.
   *
   * OPERATOR VALIDATION:
   * Ensures only allowed operators are used for each field type, preventing
   * nonsensical operations like using 'contains' on numeric fields.
   */
  private validateCondition(
    condition: FilterCondition,
    entitySchema: EntitySchema,
  ): void {
    // Validate required fields
    if (!condition.field || typeof condition.field !== 'string') {
      throw new BadRequestException('Condition must have a valid field name');
    }

    if (!condition.operator || typeof condition.operator !== 'string') {
      throw new BadRequestException('Condition must have a valid operator');
    }

    // Validate field exists in schema
    const fieldSchema = entitySchema.fields.find(
      (f) => f.name === condition.field,
    );
    if (!fieldSchema) {
      throw new BadRequestException(`Unknown field: ${condition.field}`);
    }

    // Validate operator is allowed for this field type
    const allowedOperators =
      fieldSchema.allowedOperators ||
      DEFAULT_OPERATORS_BY_TYPE[fieldSchema.type];
    if (!allowedOperators.includes(condition.operator)) {
      throw new BadRequestException(
        `Operator "${condition.operator}" is not allowed for field "${condition.field}" of type "${fieldSchema.type}". ` +
          `Allowed operators: ${allowedOperators.join(', ')}`,
      );
    }

    // Validate value based on operator requirements
    this.validateConditionValue(condition, fieldSchema);
  }

  /**
   * Validates condition values based on operator requirements
   * SPECIAL OPERATOR RULES IMPLEMENTATION:
   * This method implements the assignment's special validation rules:
   * - between → exactly two values
   * - in → array of values
   * - is_null / is_not_null → no value
   *
   * TYPE VALIDATION:
   * Ensures values match the expected field type, preventing type
   * mismatches that could cause runtime errors.
   */
  private validateConditionValue(
    condition: FilterCondition,
    fieldSchema: FieldSchema,
  ): void {
    const operator: FilterOperator = condition.operator;
    const value: unknown = condition.value;

    // Operators that don't require values
    if (NO_VALUE_OPERATORS.includes(operator)) {
      if (value !== undefined && value !== null) {
        throw new BadRequestException(
          `Operator "${operator}" should not have a value`,
        );
      }
      return;
    }

    // Operators that require array values
    if (ARRAY_VALUE_OPERATORS.includes(operator)) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new BadRequestException(
          `Operator "${operator}" requires a non-empty array value`,
        );
      }
      // Validate each array element
      value.forEach((val: unknown, index: number) => {
        if (
          !this.isValidValueForType(
            val,
            fieldSchema.type,
            fieldSchema.enumValues,
          )
        ) {
          throw new BadRequestException(
            `Invalid value at index ${index} for field type "${fieldSchema.type}"`,
          );
        }
      });
      return;
    }

    // Operators that require exactly two values (between)
    if (DUAL_VALUE_OPERATORS.includes(operator)) {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new BadRequestException(
          `Operator "${operator}" requires exactly 2 values`,
        );
      }
      // Validate both values
      value.forEach((val: unknown, index: number) => {
        if (
          !this.isValidValueForType(
            val,
            fieldSchema.type,
            fieldSchema.enumValues,
          )
        ) {
          throw new BadRequestException(
            `Invalid value at index ${index} for field type "${fieldSchema.type}"`,
          );
        }
      });
      return;
    }

    // All other operators require a single value
    if (value === undefined || value === null) {
      throw new BadRequestException(`Operator "${operator}" requires a value`);
    }

    if (
      !this.isValidValueForType(value, fieldSchema.type, fieldSchema.enumValues)
    ) {
      throw new BadRequestException(
        `Invalid value for field type "${fieldSchema.type}"`,
      );
    }
  }

  /**
   * Type validation helper
   *
   * TYPE-SAFE VALUE VALIDATION:
   * This method implements comprehensive type checking for all supported
   * field types, ensuring runtime type safety even with dynamic input.
   *
   * Supported Types:
   * - string: Basic string validation
   * - number: Numeric validation with NaN checking
   * - boolean: Boolean type validation
   * - date: ISO string or Date object validation
   */
  private isValidValueForType(
    value: unknown,
    fieldType: string,
    enumValues?: string[],
  ): boolean {
    switch (fieldType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        // Accept ISO string dates or Date objects
        return (
          (typeof value === 'string' && !isNaN(Date.parse(value))) ||
          value instanceof Date
        );
      case 'enum':
        return typeof value === 'string' && enumValues
          ? enumValues.includes(value)
          : false;
      default:
        return false;
    }
  }
}
