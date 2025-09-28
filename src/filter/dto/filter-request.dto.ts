import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { FilterOperator } from '../types';

export class FilterConditionDto {
  @IsString()
  field: string;

  @IsIn([
    'eq',
    'neq',
    'gt',
    'lt',
    'gte',
    'lte',
    'in',
    'between',
    'contains',
    'starts_with',
    'ends_with',
    'is_null',
    'is_not_null',
  ])
  operator: FilterOperator;

  @ValidateIf(
    (o: FilterConditionDto) => !['is_null', 'is_not_null'].includes(o.operator),
  )
  value?: any;
}

export class FilterGroupDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // This will handle both FilterConditionDto and FilterGroupDto
  and?: (FilterConditionDto | FilterGroupDto)[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // This will handle both FilterConditionDto and FilterGroupDto
  or?: (FilterConditionDto | FilterGroupDto)[];
}

export class SortOptionDto {
  @IsString()
  field: string;

  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}

export class FilterOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SortOptionDto)
  sort?: SortOptionDto;
}

// Main filter request DTO that matches the required JSON structure
export class FilterRequestDto extends FilterGroupDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterOptionsDto)
  options?: FilterOptionsDto;
}
