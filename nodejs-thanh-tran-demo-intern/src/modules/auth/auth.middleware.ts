import { NextFunction, Request, Response } from 'express'
import { Errors } from '../../helpers/error'
import { AuthService } from './auth.service'

export interface AuthRequest extends Request {
    name: string
    role: string
    email: string
    accessToken: string
    refreshToken: string
}

export class AuthMiddleware {
    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    authorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            console.log([, token])
            if (token == null) {
                return next(Errors.Unauthorized)
            }
            const payload = await this.authService.verifyToken(token)
            req.name = payload.name
            req.role = payload.role
            req.email = payload.email
            next()
        } catch (error) {
            //console.error(error)
            next(Errors.Unauthorized)
        }
    }

    checkLogin = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            if (token == null) {
                return next()
            }
            const payload = await this.authService.checkLogin(token)
            if (!payload) next()
            else {
                //console.log("first", payload)
                req.name = payload.name
                req.role = payload.role
                req.email = payload.email
                req.refreshToken = payload.refreshToken
                next()
            }
        } catch (error) {
            next()
            //console.error(error)
            //next(Errors.Unauthorized)
        }
    }
}
