import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import {
  FilterOperator,
  FieldType,
  FieldSchema,
  EntitySchema,
} from '../types/filter.types';
import { DEFAULT_OPERATORS_BY_TYPE } from '../types/filter.constants';

export const FILTERABLE_METADATA_KEY = 'filterable';

export interface FilterableOptions {
  /** Field type for validation */
  type: FieldType;
  /** Allowed operators (optional - defaults to type-based operators) */
  operators?: FilterOperator[];
  /** For enum types, specify allowed values */
  enumValues?: string[];
  /** Whether this field is filterable (default: true) */
  filterable?: boolean;
}

/**
 * Decorator to mark entity properties as filterable
 *
 * @example
 * class User {
 *   @Filterable({ type: 'string' })
 *   name: string;
 *
 *   @Filterable({ type: 'number', operators: ['eq', 'gt', 'lt'] })
 *   age: number;
 *
 *   @Filterable({ type: 'enum', enumValues: ['admin', 'user', 'guest'] })
 *   role: string;
 * }
 */
export const Filterable = (options: FilterableOptions): PropertyDecorator =>
  SetMetadata(FILTERABLE_METADATA_KEY, options);

/**
 * Utility to extract EntitySchema from a class decorated with @Filterable
 */
export function extractEntitySchema<T>(
  entityClass: new () => T,
  entityName?: string,
): EntitySchema {
  const instance = new entityClass();
  const fields: FieldSchema[] = [];

  // Get all property names from the class
  const propertyNames = Object.getOwnPropertyNames(instance);

  for (const propertyName of propertyNames) {
    // Get metadata for this property
    const metadata = Reflect.getMetadata(
      FILTERABLE_METADATA_KEY,
      instance as object,
      propertyName,
    ) as FilterableOptions | undefined;

    if (metadata && metadata.filterable !== false) {
      const fieldSchema: FieldSchema = {
        name: propertyName,
        type: metadata.type,
        filterable: true,
        allowedOperators:
          metadata.operators || DEFAULT_OPERATORS_BY_TYPE[metadata.type],
        enumValues: metadata.enumValues,
      };

      fields.push(fieldSchema);
    }
  }

  return {
    entityName: entityName || entityClass.name,
    fields,
  };
}

/**
 * Utility to get filterable fields from an entity class
 */
export function getFilterableFields<T>(entityClass: new () => T): string[] {
  const schema = extractEntitySchema(entityClass);
  return schema.fields.map((field) => field.name);
}

/**
 * Utility to check if a field is filterable on an entity
 */
export function isFieldFilterable<T>(
  entityClass: new () => T,
  fieldName: string,
): boolean {
  const fields = getFilterableFields(entityClass);
  return fields.includes(fieldName);
}
