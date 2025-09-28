import { AppDataSource } from '../data-source';
import { seedUsers } from './user-seed';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log(' Database connection established');

    console.log(' Creating database schema...');
    await AppDataSource.synchronize(true); // This will create the schema
    console.log(' Schema created successfully');

    console.log(' Starting seed process...');
    await seedUsers();
    console.log(' All seeds completed successfully!');
  } catch (error) {
    console.error(' Error running seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log(' Database connection closed');
  }
}

// Run seeds
void runSeeds();
