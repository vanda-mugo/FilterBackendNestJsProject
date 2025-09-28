import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Filterable } from '../filter/decorators/filterable.decorator';

/**
 * Example User entity demonstrating @Filterable decorator usage
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Filterable({ type: 'string' })
  @Column()
  name: string;

  @Filterable({ type: 'string', operators: ['eq', 'contains', 'starts_with'] })
  @Column({ unique: true })
  email: string;

  @Filterable({
    type: 'number',
    operators: ['eq', 'gt', 'lt', 'gte', 'lte', 'between'],
  })
  @Column({ nullable: true })
  age: number;

  @Filterable({ type: 'boolean' })
  @Column({ default: true })
  isActive: boolean;

  @Filterable({ type: 'enum', enumValues: ['admin', 'user', 'guest'] })
  @Column({ type: 'enum', enum: ['admin', 'user', 'guest'], default: 'user' })
  role: 'admin' | 'user' | 'guest';

  @Filterable({ type: 'date' })
  @CreateDateColumn()
  createdAt: Date;

  @Filterable({ type: 'date' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Non-filterable fields (no @Filterable decorator)
  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  lastLoginIp: string;
}
