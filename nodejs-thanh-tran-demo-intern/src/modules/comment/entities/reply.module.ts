import { BaseEntity, Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Comment } from './comment.model'

@Entity()
export class Reply extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    //@PrimaryColumn()
    id!: string

    @Column('text')
    content!: string

    @Column('text')
    name!: string

    @Column()
    email!: string

    @Column()
    newsId!: string

    @Column()
    commentId!: string

    //@CreateDateColumn()
    //@Column('datetime')
    //@Column({type: 'timestamptz'})
    @Column({ type: "timestamp", default: () => "now()"})
    created_date: Date

    @Column({nullable:true})
    updated_date: string


    @DeleteDateColumn({ type: "timestamp", select: false })
    deletedDate?: Date;


    @Column({default: 0})
    like: number



}