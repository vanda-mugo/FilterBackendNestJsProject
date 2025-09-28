import { User } from '../../users/entities/user.entity';
import { AppDataSource } from '../data-source';

export const seedUsers = async () => {
  console.log('🌱 Seeding users...');

  const userRepository = AppDataSource.getRepository(User);

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already exist, skipping seed...');
    return;
  }

  const sampleUsers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 28,
      role: 'developer',
      isActive: true,
      password: 'hashed_password_1',
      internalNotes: 'Senior developer with 5 years experience',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 32,
      role: 'manager',
      isActive: true,
      password: 'hashed_password_2',
      internalNotes: 'Team lead for frontend development',
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      age: 25,
      role: 'developer',
      isActive: true,
      password: 'hashed_password_3',
      internalNotes: 'Junior developer, recently graduated',
    },
    {
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      age: 29,
      role: 'designer',
      isActive: true,
      password: 'hashed_password_4',
      internalNotes: 'UX/UI designer with great attention to detail',
    },
    {
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      age: 35,
      role: 'developer',
      isActive: false,
      password: 'hashed_password_5',
      internalNotes: 'Former employee, account deactivated',
    },
    {
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      age: 27,
      role: 'developer',
      isActive: true,
      password: 'hashed_password_6',
      internalNotes: 'Full-stack developer specializing in React and Node.js',
    },
    {
      name: 'Edward Chen',
      email: 'edward.chen@example.com',
      age: 31,
      role: 'manager',
      isActive: true,
      password: 'hashed_password_7',
      internalNotes: 'Product manager for mobile applications',
    },
    {
      name: 'Fiona Green',
      email: 'fiona.green@example.com',
      age: 26,
      role: 'developer',
      isActive: true,
      password: 'hashed_password_8',
      internalNotes: 'Backend developer with expertise in microservices',
    },
    {
      name: 'George Miller',
      email: 'george.miller@example.com',
      age: 33,
      role: 'admin',
      isActive: true,
      password: 'hashed_password_9',
      internalNotes: 'System administrator, handles DevOps tasks',
    },
    {
      name: 'Hannah Davis',
      email: 'hannah.davis@example.com',
      age: 24,
      role: 'designer',
      isActive: true,
      password: 'hashed_password_10',
      internalNotes: 'Graphic designer, creates marketing materials',
    },
    {
      name: 'Ian Foster',
      email: 'ian.foster@example.com',
      age: 30,
      role: 'developer',
      isActive: false,
      password: 'hashed_password_11',
      internalNotes: 'On extended leave',
    },
    {
      name: 'Julia Roberts',
      email: 'julia.roberts@example.com',
      age: 28,
      role: 'manager',
      isActive: true,
      password: 'hashed_password_12',
      internalNotes: 'QA manager, ensures product quality',
    },
  ];

  const users = userRepository.create(sampleUsers);
  await userRepository.save(users);

  console.log(` Successfully seeded ${users.length} users`);

  // Log some statistics for testing
  const activeCount = await userRepository.count({
    where: { isActive: true },
  });
  const inactiveCount = await userRepository.count({
    where: { isActive: false },
  });

  console.log('User statistics:');
  console.log(`  Active users: ${activeCount}`);
  console.log(`  Inactive users: ${inactiveCount}`);
  console.log(`  Total users: ${activeCount + inactiveCount}`);
};
