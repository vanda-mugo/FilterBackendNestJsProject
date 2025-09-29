/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../../users/entities/user.entity';

describe('Query Execution Against Sample Data (Integration Tests)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Data Verification Tests', () => {
    it('should have sample data in the database', async () => {
      const totalUsers = await userRepository.count();

      expect(totalUsers).toBeGreaterThan(0);
      console.log(`✓ Database contains ${totalUsers} users for testing`);

      // Get a sample of users to verify structure
      const sampleUsers = await userRepository.find({ take: 3 });

      expect(sampleUsers.length).toBeGreaterThan(0);

      // Verify user structure
      const firstUser = sampleUsers[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('age');
      expect(firstUser).toHaveProperty('role');
      expect(firstUser).toHaveProperty('isActive');

      console.log('✓ Sample user structure verified:', {
        id: firstUser.id,
        name: firstUser.name,
        role: firstUser.role,
        age: firstUser.age,
        isActive: firstUser.isActive,
      });
    });

    it('should have users with diverse data for comprehensive testing', async () => {
      // Check for data diversity
      const roles = await userRepository
        .createQueryBuilder('user')
        .select('DISTINCT user.role', 'role')
        .getRawMany();

      const ageRange = await userRepository
        .createQueryBuilder('user')
        .select('MIN(user.age)', 'minAge')
        .addSelect('MAX(user.age)', 'maxAge')
        .getRawOne();

      const activeStatus = await userRepository
        .createQueryBuilder('user')
        .select('user.isActive', 'isActive')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.isActive')
        .getRawMany();

      expect(roles.length).toBeGreaterThan(1);
      expect(Number(ageRange.maxAge) - Number(ageRange.minAge)).toBeGreaterThan(
        5,
      );
      expect(activeStatus.length).toBeGreaterThan(1);

      console.log('✓ Data diversity verified:');
      console.log(`  - Roles: ${roles.map((r: any) => r.role).join(', ')}`);
      console.log(`  - Age range: ${ageRange.minAge} - ${ageRange.maxAge}`);
      console.log(`  - Active status distribution:`, activeStatus);
    });
  });

  describe('Basic Filter Query Execution', () => {
    it('should filter users by active status', async () => {
      const filter = {
        filter: { field: 'isActive', operator: 'eq', value: true },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify all returned users are active
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true);
      });

      // Compare with direct database query
      const directQuery = await userRepository.find({
        where: { isActive: true },
      });
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Active users filter: ${response.body.total} active users found`,
      );
    });

    it('should filter users by role', async () => {
      const filter = {
        filter: { field: 'role', operator: 'eq', value: 'developer' },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify all returned users have the specified role
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe('developer');
      });

      // Compare with direct database query
      const directQuery = await userRepository.find({
        where: { role: 'developer' },
      });
      expect(response.body.total).toBe(directQuery.length);

      console.log(`✓ Role filter: ${response.body.total} developers found`);
    });

    it('should filter users by age range', async () => {
      const filter = {
        filter: { field: 'age', operator: 'between', value: [25, 35] },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify all returned users are within the age range
      response.body.data.forEach((user: any) => {
        expect(user.age).toBeGreaterThanOrEqual(25);
        expect(user.age).toBeLessThanOrEqual(35);
      });

      // Compare with direct database query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.age BETWEEN :minAge AND :maxAge', {
          minAge: 25,
          maxAge: 35,
        })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Age range filter: ${response.body.total} users aged 25-35 found`,
      );
    });

    it('should filter users by name pattern', async () => {
      const filter = {
        filter: { field: 'name', operator: 'contains', value: 'o' },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify all returned users have names containing 'o'
      response.body.data.forEach((user: any) => {
        expect(user.name.toLowerCase()).toContain('o');
      });

      // Compare with direct database query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.name LIKE :pattern', { pattern: '%o%' })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Name pattern filter: ${response.body.total} users with 'o' in name found`,
      );
    });
  });

  describe('Advanced Filter Query Execution', () => {
    it('should execute AND group filters correctly', async () => {
      const filter = {
        filter: {
          and: [
            { field: 'isActive', operator: 'eq', value: true },
            { field: 'role', operator: 'eq', value: 'developer' },
          ],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify all returned users meet BOTH conditions
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true);
        expect(user.role).toBe('developer');
      });

      // Compare with direct database query
      const directQuery = await userRepository.find({
        where: {
          isActive: true,
          role: 'developer',
        },
      });
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ AND group filter: ${response.body.total} active developers found`,
      );
    });

    it('should execute OR group filters correctly', async () => {
      const filter = {
        filter: {
          or: [
            { field: 'role', operator: 'eq', value: 'admin' },
            { field: 'role', operator: 'eq', value: 'manager' },
          ],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify all returned users meet at least ONE condition
      response.body.data.forEach((user: any) => {
        expect(['admin', 'manager']).toContain(user.role);
      });

      // Compare with direct database query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.role = :role1 OR user.role = :role2', {
          role1: 'admin',
          role2: 'manager',
        })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ OR group filter: ${response.body.total} admins or managers found`,
      );
    });

    it('should execute complex nested filters correctly', async () => {
      const filter = {
        filter: {
          and: [
            { field: 'isActive', operator: 'eq', value: true },
            {
              or: [
                { field: 'role', operator: 'eq', value: 'admin' },
                {
                  and: [
                    { field: 'role', operator: 'eq', value: 'developer' },
                    { field: 'age', operator: 'gte', value: 25 },
                  ],
                },
              ],
            },
          ],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toBeDefined();

      // Verify complex logic: active AND (admin OR (developer AND age >= 25))
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true);
        const isAdmin = user.role === 'admin';
        const isSeniorDev = user.role === 'developer' && user.age >= 25;
        expect(isAdmin || isSeniorDev).toBe(true);
      });

      // Compare with direct database query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.isActive = :isActive', { isActive: true })
        .andWhere(
          '(user.role = :adminRole OR (user.role = :devRole AND user.age >= :minAge))',
          { adminRole: 'admin', devRole: 'developer', minAge: 25 },
        )
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Complex nested filter: ${response.body.total} matching users found`,
      );
    });
  });

  describe('Comparison Operators Query Execution', () => {
    it('should execute greater than operator correctly', async () => {
      const testAge = 30;
      const filter = {
        filter: { field: 'age', operator: 'gt', value: testAge },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify all users are older than testAge
      response.body.data.forEach((user: any) => {
        expect(user.age).toBeGreaterThan(testAge);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.age > :age', { age: testAge })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Greater than filter: ${response.body.total} users older than ${testAge}`,
      );
    });

    it('should execute less than or equal operator correctly', async () => {
      const testAge = 25;
      const filter = {
        filter: { field: 'age', operator: 'lte', value: testAge },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify all users are 25 or younger
      response.body.data.forEach((user: any) => {
        expect(user.age).toBeLessThanOrEqual(testAge);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.age <= :age', { age: testAge })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Less than or equal filter: ${response.body.total} users ${testAge} or younger`,
      );
    });

    it('should execute not equal operator correctly', async () => {
      const excludeRole = 'admin';
      const filter = {
        filter: { field: 'role', operator: 'neq', value: excludeRole },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify no users have the excluded role
      response.body.data.forEach((user: any) => {
        expect(user.role).not.toBe(excludeRole);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.role != :role', { role: excludeRole })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Not equal filter: ${response.body.total} non-${excludeRole} users`,
      );
    });
  });

  describe('String Pattern Operators Query Execution', () => {
    it('should execute starts_with operator correctly', async () => {
      const filter = {
        filter: { field: 'name', operator: 'starts_with', value: 'J' },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify all names start with 'J'
      response.body.data.forEach((user: any) => {
        expect(user.name).toMatch(/^J/);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.name LIKE :pattern', { pattern: 'J%' })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Starts with filter: ${response.body.total} names starting with 'J'`,
      );
    });

    it('should execute ends_with operator correctly', async () => {
      const filter = {
        filter: { field: 'email', operator: 'ends_with', value: '.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify all emails end with '.com'
      response.body.data.forEach((user: any) => {
        expect(user.email).toMatch(/\.com$/);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.email LIKE :pattern', { pattern: '%.com' })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ Ends with filter: ${response.body.total} emails ending with '.com'`,
      );
    });
  });

  describe('Array Operators Query Execution', () => {
    it('should execute IN operator correctly', async () => {
      const targetRoles = ['admin', 'manager'];
      const filter = {
        filter: { field: 'role', operator: 'in', value: targetRoles },
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify all users have one of the target roles
      response.body.data.forEach((user: any) => {
        expect(targetRoles).toContain(user.role);
      });

      // Compare with direct query
      const directQuery = await userRepository
        .createQueryBuilder('user')
        .where('user.role IN (:...roles)', { roles: targetRoles })
        .getMany();
      expect(response.body.total).toBe(directQuery.length);

      console.log(
        `✓ IN operator filter: ${response.body.total} users with roles ${targetRoles.join(' or ')}`,
      );
    });
  });

  describe('Pagination and Sorting Query Execution', () => {
    it('should execute pagination correctly', async () => {
      const pageSize = 3;
      const filter = {
        filter: { field: 'isActive', operator: 'eq', value: true },
        page: 1,
        limit: pageSize,
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data.length).toBeLessThanOrEqual(pageSize);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(pageSize);
      expect(response.body.totalPages).toBe(
        Math.ceil(response.body.total / pageSize),
      );

      console.log(
        `✓ Pagination: Page 1 of ${response.body.totalPages}, showing ${response.body.data.length}/${response.body.total} users`,
      );
    });

    it('should execute sorting correctly', async () => {
      const filter = {
        filter: { field: 'isActive', operator: 'eq', value: true },
        sortBy: 'age',
        sortOrder: 'DESC' as const,
        limit: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      // Verify sorting - ages should be in descending order
      for (let i = 1; i < response.body.data.length; i++) {
        expect(response.body.data[i - 1].age).toBeGreaterThanOrEqual(
          response.body.data[i].age,
        );
      }

      console.log(
        `✓ Sorting: Users sorted by age DESC`,
        response.body.data.map((u: any) => `${u.name}(${u.age})`),
      );
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const filter = {
        filter: { field: 'isActive', operator: 'eq', value: true },
        limit: 100, // Request more results than typical
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(response.body.data).toBeDefined();
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(
        `✓ Performance: Query executed in ${executionTime}ms for ${response.body.total} total results`,
      );
    });

    it('should handle filters with no matching results', async () => {
      const filter = {
        filter: { field: 'age', operator: 'gt', value: 150 }, // Impossible age
      };

      const response = await request(app.getHttpServer())
        .post('/users/filter')
        .send(filter)
        .expect(201);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.totalPages).toBe(0);

      console.log('✓ Empty result set handled correctly');
    });

    it('should maintain data consistency across multiple requests', async () => {
      const filter = {
        filter: { field: 'role', operator: 'eq', value: 'developer' },
      };

      // Make multiple identical requests
      const responses = await Promise.all([
        request(app.getHttpServer())
          .post('/users/filter')
          .send(filter)
          .expect(201),
        request(app.getHttpServer())
          .post('/users/filter')
          .send(filter)
          .expect(201),
        request(app.getHttpServer())
          .post('/users/filter')
          .send(filter)
          .expect(201),
      ]);

      // All responses should be identical
      const firstTotal = responses[0].body.total;
      expect(responses[1].body.total).toBe(firstTotal);
      expect(responses[2].body.total).toBe(firstTotal);

      console.log(
        `✓ Data consistency: All requests returned ${firstTotal} developers`,
      );
    });
  });
});
