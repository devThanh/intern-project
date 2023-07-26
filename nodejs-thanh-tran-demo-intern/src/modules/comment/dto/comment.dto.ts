import { Exclude, Expose } from 'class-transformer'
import { IsString, Length } from 'class-validator'

export class CommentDTO{
    @Exclude()
    id!: string

    @Expose()
    @IsString()
    @Length(1,250)
    content!: string

    @Expose()
    name!: string

    @Expose()
    email!: string

    @Expose()
    newsId!: string


    //@CreateDateColumn()
    //@Column('datetime')
    //@Column({type: 'timestamptz'})
    @Expose()
    date: string

}