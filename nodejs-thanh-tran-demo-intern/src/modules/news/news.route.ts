import express from 'express'
import { AuthService } from '../auth/auth.service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { NewsMiddleware } from './news.middleware'
import { newsService } from '../../service'
import { NewsController } from './news.controller'
import  {upload}  from '../../helpers/multer'


const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const newsMiddleware = new NewsMiddleware()
const newsController = new NewsController(newsService ,authService)

export const newsRouter = express.Router()

newsRouter.get('/statistical', newsController.statistical)
newsRouter.get('/search', newsController.search)
newsRouter.post('/create', authMiddleware.authorize,  upload.single('thumbnail') , newsMiddleware.validateIp,  newsController.createNews)
newsRouter.put('/edit/:id', authMiddleware.authorize, upload.single('thumbnail'), newsMiddleware.validateIp, newsController.updateNews)
newsRouter.get('/detail/:id',authMiddleware.checkLogin, newsController.newsDetail)
newsRouter.get('/watch', authMiddleware.authorize, newsController.newsListUserSeen)
newsRouter.post('/save/:newsId', authMiddleware.authorize, newsController.save)
newsRouter.get('/getsave', authMiddleware.authorize, newsController.getNewsUserSaved)
newsRouter.get('/:tags', newsController.newsListByCategory)