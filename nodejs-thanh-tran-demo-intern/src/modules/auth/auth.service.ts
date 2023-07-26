import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { Errors } from '../../helpers/error'
import { BaseService } from '../../service'
import { AuthMiddleware } from './auth.middleware'
import dotenv from 'dotenv'
dotenv.config()



export class AuthService implements BaseService {
    signToken = async(name: string, role: string, email: string) => {
        const token = jwt.sign(
            {
                name,
                email,
                role
            },
            process.env.JWT_ACCESS_SECRECT,
            {expiresIn:  process.env.JWT_ACCESS_TIME},
            
        )

        return token
    }

    signRefreshToken = async(name: string, role: string, email: string)=>{
        const refreshToken = jwt.sign(
            {
                name,
                email,
                role
            },
            process.env.JWT_REFRESH_SECRECT,
            {expiresIn:  process.env.JWT_REFRESH_TIME},
        )
        return refreshToken
    }

    verifyToken = async (token: string) => {
        const { payload } = jwt.verify(token, process.env.JWT_REFRESH_SECRECT, {
            complete: true,
        })
        
        if (payload && payload['name'] && payload['role'] && payload['email']) {
            return {
                name: payload['name'] as string,
                role: payload['role'] as string,
                email: payload['email'] as string,
            }
            //console.log(userId)
        }
        throw Errors.Unauthorized

    }

    checkLogin = async (token: string) => {
        const { payload } = jwt.verify(token, process.env.JWT_REFRESH_SECRECT, {
            complete: true,
        })
        
        if (payload && payload['name'] && payload['role'] && payload['email']) {
            return {
                name: payload['name'] as string,
                role: payload['role'] as string,
                email: payload['email'] as string,
                accessToken: payload['access-token'] as string,
                refreshToken: payload['refresh-token'] as string
            }
            //console.log(userId)
        }return 
        //throw Errors.Unauthorized

    }
}
