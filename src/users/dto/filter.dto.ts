// src/users/dto/user-filter-request.dto.ts
import {
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
// Update the import path if the file exists elsewhere, for example:
import type { FilterDefinition } from '../../filter/types/filter.types';

export class UserFilterRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Object) // Let filter validation handle the complex nested structure
  filter?: FilterDefinition;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(String(value)))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(String(value)))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
