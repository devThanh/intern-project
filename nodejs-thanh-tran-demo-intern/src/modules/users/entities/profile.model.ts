import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm'
import { ConnectDB } from '../../../database/connection'

@Entity()
export class Profile extends BaseEntity{
    @PrimaryColumn()
    email!: string 

    @Column({nullable:true})
    avatar!: string | null

    @Column({nullable:true})
    fullname!: string | null

    @Column({nullable:true})
    dateOfBirth!: Date | null

    @Column({nullable:true})
    sex!: string | null

    @Column({nullable:true})
    phone: string | null

    @Column({nullable:true})
    address!: string | null

}