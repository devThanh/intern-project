import { NextFunction, Request, Response } from 'express'
import { Errors } from '../../helpers/error'
import { ResponseWrapper } from '../../helpers/response.wrapper'
import { UserService } from './user.service'
import { AuthService } from '../auth/auth.service'
import { authService } from '../../service'
import { AuthRequest } from '../auth/auth.middleware'
//import { upload } from '../../helpers/multer'

export class UserController {
    userService: UserService
    authService: AuthService
    constructor(userService: UserService, authService: AuthService) {
        this.userService = userService
        this.authService = authService
    }
    sayHello = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.sayHello()
            throw Errors.BadRequest // uncomment to check error handling
            res.send(new ResponseWrapper({ name: 'Intern' }))
        } catch (error) {
            next(error)
        }
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userService.register(
                req.body.email,
                req.body.password,
                req.body.name
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    verify = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userService.verify(
                req.query.code,
                req.query.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userService.login(
                req.body.email,
                req.body.password
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    updateProfile = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        let file = null
        if (req.file !== undefined) file = req.file.filename
        try {
            const result = await this.userService.updateProfile(
                file,
                req.email,
                req.body.avatar,
                req.body.fullname,
                req.body.dateOfBirth,
                req.body.sex,
                req.body.phone,
                req.body.address
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    changePass = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.userService.changePass(
                req.email,
                req.body.newPass,
                req.body.oldPass
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userService.refreshToken(
                req.body.refresh_token
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const result = await this.userService.logout(
            req.email,
            req.body.accessToken,
            req.body.refreshToken
        )
        res.send(new ResponseWrapper(result))
    }
}
