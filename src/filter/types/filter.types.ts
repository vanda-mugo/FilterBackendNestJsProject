/**
 * This file implementes the core filter types and interfaces
 * used throughout the filter module.
 * It defines the structure for filter conditions, logical groups,
 * and entity schemas for validation.
 */
export type FilterOperator =
  | 'eq' // Equal
  | 'neq' // Not equal
  | 'gt' // Greater than
  | 'lt' // Less than
  | 'gte' // Greater than or equal
  | 'lte' // Less than or equal
  | 'in' // Value is in array
  | 'between' // Value is between two values
  | 'contains' // String contains substring
  | 'starts_with' // String starts with substring
  | 'ends_with' // String ends with substring
  | 'is_null' // Value is null
  | 'is_not_null'; // Value is not null

/**
 * Supported field types for validation
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'uuid';

/**
 * Basic filter condition
 * Example: { "field": "age", "operator": "gt", "value": 30 }
 * Note: The field type is determined by the entity schema, not by this interface.
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any; // Optional because operators like is_null don't need a value
}

/**
 * Logical group with AND operator
 * Example: { "and": [condition1, condition2, nestedGroup] }
 */
export interface AndGroup {
  and: (FilterCondition | AndGroup | OrGroup)[];
}

/**
 * Logical group with OR operator
 * Example: { "or": [condition1, condition2, nestedGroup] }
 */
export interface OrGroup {
  or: (FilterCondition | AndGroup | OrGroup)[];
}

/**
 * Complete filter definition - can be a condition, AND group, or OR group
 * This represents the root of any filter JSON
 */
export type FilterDefinition = FilterCondition | AndGroup | OrGroup;

/**
 * Field schema definition for validation
 * Used to define what fields are filterable and their constraints
 */
export interface FieldSchema {
  name: string;
  type: FieldType;
  filterable: boolean;
  allowedOperators?: FilterOperator[]; // If not provided, uses default based on type
  enumValues?: string[]; // For enum type fields
}

/**
 * Entity schema containing all filterable fields
 */
export interface EntitySchema {
  entityName: string;
  fields: FieldSchema[];
}

/**
 * Type guards to check filter definition types at runtime
 */
export function isFilterCondition(
  filter: FilterDefinition,
): filter is FilterCondition {
  return 'field' in filter && 'operator' in filter;
}

export function isAndGroup(filter: FilterDefinition): filter is AndGroup {
  return 'and' in filter;
}

export function isOrGroup(filter: FilterDefinition): filter is OrGroup {
  return 'or' in filter;
}
