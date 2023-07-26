import { Exclude, Expose, plainToClass, Type } from 'class-transformer'
import {
    Length,
    IsEmail,
    IsString,
    IsDate,
  } from 'class-validator';

export class ProfileDTO{
    email!: string | null

    @Exclude()
    @IsString()
    avatar!: string | null

    @Expose()
    @IsString()
    fullname!: string | null

    @Expose()
    @IsDate()
    dateOfBith!:  | null

    @Expose()
    sex!: string | null

    @Expose()
    @IsString()
    phone: string | null

    @Expose()
    @IsString()
    address!: string | null

}