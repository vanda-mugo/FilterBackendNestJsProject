import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TEST_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.TEST_DATABASE_PORT || '5432'),
  username: process.env.TEST_DATABASE_USER || 'postgres',
  password: process.env.TEST_DATABASE_PASSWORD || 'postgres',
  database: process.env.TEST_DATABASE_NAME || 'filter_db_test',
  entities: [User],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: true, // OK for tests
  logging: false, // Reduce noise in test output
  dropSchema: true, // Clean slate for each test run
});
