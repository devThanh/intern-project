import { BaseService, authService } from '../../service'
import { ConnectDB } from '../../database/connection'
import { AuthService } from '../auth/auth.service'
import { User } from './entities/user.model'
import bcrypt from '../../util/bcrypt'
import { Worker, Job } from 'bullmq'
import { emailQueue } from '../../../redis_connect'
import redis_client from '../../../redis_connect'
import { random } from '../../helpers/email'
import { Errors } from '../../helpers/error'
import { Profile } from './entities/profile.model'
import { profile } from 'winston'
//const multer = require('multer')
//const upload = multer({ dest: 'uploads/' })
import { AuthRequest } from '../auth/auth.middleware'
import fs from 'fs-extra'

let mail = ''
const dataSource = ConnectDB.AppDataSource

export class UserService implements BaseService {
    private authService: AuthService
    constructor(authService: AuthService) {
        this.authService = authService
    }
    sayHello = async () => {
        console.log('Hello world')
    }

    register = async (email: string, password: string, name: string) => {
        const checkEmailExist = await User.findOneBy({ email: email })
        if (checkEmailExist !== null) {
            return { message: 'Email already existed' }
        } else {
            let user = new User()
            const expression: RegExp =
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            user.email = email
            const result: boolean = expression.test(email) // true
            if (result == false) return { message: 'Email is invalid' }
            const passEncoding = await bcrypt.encode(password)
            user.name = name
            user.password = passEncoding
            user.isActive = false
            user.save()
            mail = email
            await emailQueue.add(
                'Mailer',
                { email: email },
                { removeOnComplete: true, removeOnFail: true }
            )
            let res = { email, name, isActive: user.isActive }
            res.email = user.email
            return {
                message: 'Please check your mail',
            }
        }
    }

    verify = async (code, email) => {
        console.log('random: ', random)
        console.log(code)
        const user = await User.findOneBy({ email: email })
        const checkCode = await redis_client.HKEYS(`${email}:${`verifyCode`}`)
        console.log(checkCode, email, `${`verifyCode`}:${email}`)
        if (user !== null) {
            if (user.isActive === false) {
                if (checkCode.includes(code)) {
                    user.isActive = true
                    user.save()
                    await redis_client.hDel(`${email}:${`verifyCode`}`, code)
                    return { message: 'Register Successfully!' }
                } else throw Errors.VerifyCodeIsWrong
            }
            return { message: 'Already verify your account' }
        } else throw Errors.NotFound
    }

    login = async (email: string, password: string) => {
        const users = await User.findOneBy({ email: email })
        if (users !== null) {
            if (users.isActive === false) {
                return {
                    message: `You're account not active. Check your mail to active`,
                }
            } else {
                //console.log(password, users.password)
                const decodePass = await bcrypt.decode(password, users.password)
                if (decodePass) {
                    const accessToken = await this.authService.signToken(
                        users.name,
                        users.role,
                        users.email
                    )
                    console.log('TOKEN: ', accessToken)
                    const refreshToken =
                        await this.authService.signRefreshToken(
                            users.name,
                            users.role,
                            users.email
                        )
                    console.log('REFRESH_TOKEN: ', refreshToken)
                    redis_client.hSet(
                        `${users.email}:${`access-token`}`,
                        accessToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`access-token`}`,
                        2592000
                    )
                    redis_client.hSet(
                        `${users.email}:${`refresh-token`}`,
                        refreshToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`refresh-token`}`,
                        2592000
                    )
                    return {
                        users,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    }
                } else {
                    throw Errors.WrongUsernameOrPassword
                }
            }
        } else {
            throw Errors.NotFound
        }
    }

    updateProfile = async (
        file: string,
        email: string,
        avatar: string,
        fullname: string,
        dateOfBirth: Date,
        sex: string,
        phone: string,
        address: string
    ) => {
        const user = await User.findOneBy({ email: email })
        console.log(user)
        if (user !== null) {
            let userProfile = await Profile.findOneBy({ email: email })
            console.log(userProfile)
            if (userProfile === null) {
                let profile = new Profile()
                profile.email = email
                profile.avatar = file
                profile.fullname = fullname
                const date = new Date(dateOfBirth)
                profile.dateOfBirth = date
                profile.sex = sex
                profile.phone = phone
                profile.address = address
                console.log(profile)
                profile.save()
                return { profile, message: 'Update profile successfully!!' }
            } else {
                //let userProfile = new Profile()
                //const userProfile = new Profile()
                userProfile.email = email
                if (
                    file !== null &&
                    userProfile.avatar !== null &&
                    userProfile !== null
                ) {
                    await fs.unlink(
                        'D:/nodejs-thanh-tran-demo-intern/nodejs-thanh-tran-demo-intern/uploads/' +
                            `${userProfile.avatar}`
                    )
                }
                userProfile.avatar = file
                userProfile.fullname = fullname
                const date = new Date(dateOfBirth)
                userProfile.dateOfBirth = date
                userProfile.sex = sex
                userProfile.phone = phone
                userProfile.address = address
                userProfile.save()
                return { userProfile, message: 'Update profile successfully!!' }
            }
        }
        throw Errors.NotFound
    }

    changePass = async (email: string, newPass: string, password: string) => {
        const users = await User.findOneBy({ email: email })
        if (users !== null) {
            const decodePass = await bcrypt.decode(password, users.password)
            if (decodePass == true) {
                const passEncoding = await bcrypt.encode(newPass)
                if (newPass !== password) {
                    users.password = passEncoding
                    console.log(users)
                    await users.save()
                    //delete all access-token and refresh-token user
                    redis_client.del(`${users.email}:${`access-token`}`)
                    redis_client.del(`${users.email}:${`refresh-token`}`)

                    //generate acess-token and refresh-token
                    const accessToken = await this.authService.signToken(
                        users.name,
                        users.role,
                        users.email
                    )
                    console.log('TOKEN: ', accessToken)
                    const refreshToken =
                        await this.authService.signRefreshToken(
                            users.name,
                            users.role,
                            users.email
                        )
                    console.log('ACCESS_TOKEN: ', accessToken)
                    redis_client.hSet(
                        `${users.email}:${`access-token`}`,
                        accessToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`access-token`}`,
                        2592000
                    )
                    console.log('REFRESH_TOKEN: ', refreshToken)
                    redis_client.hSet(
                        `${users.email}:${`refresh-token`}`,
                        refreshToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`refresh-token`}`,
                        2592000
                    )
                    return { message: 'PASSWORD CHANGED SUCCCESSFULLY!!' }
                }
                throw Errors.BadRequest
            } else {
                throw Errors.WrongUsernameOrPassword
            }
        }
        throw Errors.NotFound
    }

    refreshToken = async (token: string) => {
        const refreshToken = token
        if (refreshToken) {
            try {
                const data = await this.authService.verifyToken(refreshToken)
                const refresh_token = await this.authService.signRefreshToken(
                    data.name,
                    data.role,
                    data.email
                )
                const access_token = await this.authService.signToken(
                    data.name,
                    data.role,
                    data.email
                )
                redis_client.hSet(
                    `${data.email}:${`refresh-token`}`,
                    refresh_token,
                    1
                )
                redis_client.expire(`${data.email}:${`refresh-token`}`, 2592000)
                redis_client.hSet(
                    `${data.email}:${`refresh-token`}`,
                    access_token,
                    1
                )
                redis_client.expire(`${data.email}:${`refresh-token`}`, 2592000)
                return {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                }
            } catch (error) {
                console.error(error)
                throw Errors.InvalidRefreshToken
            }
        } else {
            throw Errors.InvalidRequest
        }
    }

    logout = async (
        email: string,
        access_token: string,
        refresh_token: string
    ) => {
        //console.log(email, access_token, refresh_token)
        await redis_client.hDel(`${email}:${`refresh-token`}`, refresh_token)
        await redis_client.hDel(`${email}:${`access-token`}`, access_token)
    }
}
