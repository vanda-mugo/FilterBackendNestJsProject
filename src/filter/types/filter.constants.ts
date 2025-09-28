import { FilterOperator, FieldType } from './filter.types';

/**
 * Default allowed operators for each field type
 */
export const DEFAULT_OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[]> = {
  string: [
    'eq',
    'neq',
    'in',
    'contains',
    'starts_with',
    'ends_with',
    'is_null',
    'is_not_null',
  ],
  number: [
    'eq',
    'neq',
    'gt',
    'lt',
    'gte',
    'lte',
    'in',
    'between',
    'is_null',
    'is_not_null',
  ],
  boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
  date: [
    'eq',
    'neq',
    'gt',
    'lt',
    'gte',
    'lte',
    'between',
    'is_null',
    'is_not_null',
  ],
  enum: ['eq', 'neq', 'in', 'is_null', 'is_not_null'],
  uuid: ['eq', 'neq', 'in', 'is_null', 'is_not_null'],
};

/**
 * Operators that require no value
 */
export const NO_VALUE_OPERATORS: FilterOperator[] = ['is_null', 'is_not_null'];

/**
 * Operators that require array values
 */
export const ARRAY_VALUE_OPERATORS: FilterOperator[] = ['in'];

/**
 * Operators that require exactly two values
 */
export const DUAL_VALUE_OPERATORS: FilterOperator[] = ['between'];

/**
 * Operators that only work with string fields
 */
export const STRING_ONLY_OPERATORS: FilterOperator[] = [
  'contains',
  'starts_with',
  'ends_with',
];
