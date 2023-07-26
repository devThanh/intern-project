import {
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    BaseEntity,
} from 'typeorm'
import { ConnectDB } from '../../../database/connection'

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    email: string

    @Column({ select: false })
    password: string

    @Column()
    name: string

    @Column({ default: 'User' })
    role: string

    @Column()
    isActive: boolean
}
