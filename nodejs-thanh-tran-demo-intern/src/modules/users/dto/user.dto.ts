import { Exclude, Expose, plainToClass, Type } from 'class-transformer'
import {
    Length,
    IsEmail,
    IsString,
    isNotEmpty,
    IsNotEmpty,
} from 'class-validator'

export class UserDTO {
    @Expose()
    //@IsEmail()
    email!: string

    //@Exclude()
    @Exclude()
    @Length(6, 32)
    //@Length(10, 20)
    password!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    name!: string

    @Expose()
    role!: string

    @Expose()
    getfullname() {
        return this.email
    }
}
