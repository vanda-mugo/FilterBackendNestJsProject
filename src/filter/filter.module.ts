import { Module } from '@nestjs/common';
import { FilterValidationService } from './services/filter-validation.service';
import { NestedFilterQueryBuilderService } from './services/nested-filter-query-builder.service';
import { FilterService } from './services/filter.service';

@Module({
  providers: [
    FilterValidationService,
    NestedFilterQueryBuilderService,
    FilterService,
  ],
  exports: [
    FilterValidationService,
    NestedFilterQueryBuilderService,
    FilterService,
  ],
})
export class FilterModule {}
