import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserFilterRequestDto } from './dto/filter.dto';
import { FilterDefinition } from './../filter/types/filter.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Define your endpoints here
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   * GET endpoint with URL-encoded filter query string
   * Example: GET /users/filter?filter=%7B%22field%22%3A%22age%22%2C%22operator%22%3A%22gt%22%2C%22value%22%3A30%7D&page=1&limit=10
   * Decoded filter: {"field":"age","operator":"gt","value":30}
   */
  @Get('filter')
  async filterUsersGet(
    @Query('filter') encodedFilter?: string, // this is a URL-encoded JSON string
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    try {
      let filterDefinition: FilterDefinition | undefined;

      // Parse URL-encoded filter if provided
      if (encodedFilter) {
        try {
          // Decode and parse the filter JSON
          // this turns '%7B%22field%22%3A%22age%22%2C%22operator%22%3A%22gt%22%2C%22value%22%3A30%7D'
          // into '{"field":"age","operator":"gt","value":30}'
          const decodedFilter = decodeURIComponent(encodedFilter);
          filterDefinition = JSON.parse(decodedFilter) as FilterDefinition;
        } catch {
          throw new BadRequestException(
            'Invalid filter format. Filter must be a valid URL-encoded JSON string.',
          );
        }
      }

      return await this.usersService.findFilteredUsers(filterDefinition, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : undefined;
      throw new BadRequestException(errorMessage || 'Filter validation failed');
    }
  }

  @Post('filter')
  async filterUsers(@Body() filterDto: UserFilterRequestDto) {
    try {
      return await this.usersService.findFilteredUsers(filterDto.filter, {
        page: filterDto.page,
        limit: filterDto.limit,
        sortBy: filterDto.sortBy,
        sortOrder: filterDto.sortOrder,
      });
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : undefined;
      throw new BadRequestException(errorMessage || 'Filter validation failed');
    }
  }
}
