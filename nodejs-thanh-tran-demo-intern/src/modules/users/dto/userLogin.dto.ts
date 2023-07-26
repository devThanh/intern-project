import { Exclude, Expose, plainToClass, Type } from 'class-transformer'
import {
    Length,
    IsEmail,
    IsString,
    isNotEmpty,
    IsNotEmpty,
  } from 'class-validator';

export class UserLoginDTO{
    @Expose()
    @IsEmail()
    email!: string

    //@Exclude()
    @Expose()
    @Length(6,32)
    //@Length(10, 20)
    password!: string

}