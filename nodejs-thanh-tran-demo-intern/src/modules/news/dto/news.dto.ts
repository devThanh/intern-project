import { IsArray, IsDate, IsDateString, IsString, Length, Max, MaxLength, Min, isDateString, isString } from 'class-validator'
import { Exclude, Expose } from 'class-transformer'

export class NewsDTO{
    @Exclude()
    id!: string

    @Expose()
    @MaxLength(250)
    title: string

    @Expose()
    @MaxLength(20000)
    content: string

    @Expose()
    @MaxLength(2048)
    thumbnail: string

    @Expose()
    @MaxLength(2048)
    category: string

    @Expose()
    //@IsDateString()
    //@Column({type: 'timestamptz'})
    date: string

    @Expose()
    @MaxLength(125)
    //@IsString()
    author: string

    @Expose()
    @IsArray()
    tags: string[]

    @Expose()
    //@IsString()
    status: string

    @Expose()
    //@IsString()
    @MaxLength(500)
    //@Max(500)
    description: string
}

