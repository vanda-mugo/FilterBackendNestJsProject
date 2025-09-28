import { Filterable } from '../../filter';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Filterable({ type: 'string' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Filterable({ type: 'string' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Filterable({ type: 'number' })
  @Column({ type: 'int' })
  age: number;

  @Filterable({ type: 'string' })
  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Filterable({ type: 'boolean' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Non-filterable fields
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'text', nullable: true, select: false })
  internalNotes: string;
}

/**
 * the filter system in this case is based on the @Filterable decorator
 * it shall use the default operators based on a field type as defined in filter.constants.ts
 */
