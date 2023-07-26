import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm'
import { ConnectDB } from '../../../database/connection'
import { User } from '../../users/entities/user.model'


@Entity()
export class News extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    //@PrimaryColumn()
    id!: string

    @Column('text')
    title!: string

    @Column('text')
    content!: string

    @Column()
    thumbnail!: string

    @Column()
    category!: string

    //@CreateDateColumn()
    //@Column('datetime')
    //@Column({type: 'timestamptz'})
    // @Column({
    //     nullable: false,
    //     default: () => 'CURRENT_TIMESTAMP', 
    //     type: 'timestamp',
    //   })
    @Column({ type: "timestamp", default: () => "now()"})
    created_date: Date

    @Column({nullable:true})
    updated_date: string

    @Column()
    author!: string

    @Column('simple-array', { nullable: true })
    tags: string[]

    @Column()
    status!: string

    @Column()
    description!: string

    @Column({default: 0})
    viewer: number

    @Column({default: 0, select: false})
    like: number

    @Column({default:0})
    totalComment: number

    // @Column('simple-array',{nullable: true})
    // follow: string[]

}

