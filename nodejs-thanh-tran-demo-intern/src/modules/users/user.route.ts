import express from 'express'
import { userService } from '../../service'
import { UserController } from './user.controller'
import { UserMiddleware } from './user.middleware'
import { AuthMiddleware } from '../auth/auth.middleware'
import { AuthService } from '../auth/auth.service'
import { upload } from '../../helpers/multer'
export const userRouter = express.Router()

const authService = new AuthService()
const userMiddleware = new UserMiddleware()
const authMiddleware = new AuthMiddleware(authService)
const userController = new UserController(userService, authService)

userRouter.get('/hello', userMiddleware.yolo, userController.sayHello)
userRouter.post('/register', userMiddleware.validateIp, userController.register)
userRouter.get('/verify', userController.verify)
userRouter.post('/login', userMiddleware.validateLogin, userController.login)
userRouter.put(
    '/updateprofile',
    authMiddleware.authorize,
    upload.single('avatar'),
    userController.updateProfile
)
userRouter.put(
    '/changepass',
    authMiddleware.authorize,
    userController.changePass
)
userRouter.post('/refreshtoken', userController.refreshToken)
userRouter.get('/logout', authMiddleware.authorize, userController.logout)
