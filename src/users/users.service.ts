// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterService } from '../filter/services/filter.service';
import { FilterDefinition } from '../filter/types/filter.types';
import { User } from './entities/user.entity';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface FilteredUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filterService: FilterService,
  ) {}

  /**
   * Find users with filters and pagination
   */
  async findFilteredUsers(
    filterJson?: FilterDefinition,
    pagination?: PaginationOptions,
  ): Promise<FilteredUsersResponse> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Create base query
    let queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters if provided
    // this basically combines schema extraction from decorators with the filter application
    // validation and query building for filtering db quieries based on entity class metadata
    if (filterJson) {
      queryBuilder = this.filterService.applyFilterFromEntity(
        queryBuilder,
        filterJson,
        User,
        'user',
      );
    }

    // Apply sorting
    if (pagination?.sortBy) {
      queryBuilder.orderBy(
        `user.${pagination.sortBy}`,
        pagination.sortOrder || 'ASC',
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Get results
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all users (without filters)
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
