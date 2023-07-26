import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../auth/auth.service'
import { NewsService } from './news.service'
import { Pagination, ResponseWrapper } from '../../helpers/response.wrapper'
import { AuthRequest } from '../auth/auth.middleware'

export class NewsController {
    newsService: NewsService
    authService: AuthService
    constructor(newsService: NewsService, authService: AuthService) {
        this.newsService = newsService
        this.authService = authService
    }

    createNews = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        console.log(req.role, req.email)
        const file = req.file.filename
        //console.log(file)
        if (req.role === 'Admin' || req.role === 'Moderator') {
            const result = await this.newsService.createNews(
                req.file.filename,
                req.email,
                req.body.title,
                req.body.content,
                req.body.thumbnail,
                req.body.category,
                req.body.author,
                req.body.tags,
                req.body.status,
                req.body.description
            )
            res.send(new ResponseWrapper(result))
        } else {
            res.send(
                new ResponseWrapper({
                    message: 'You are not Admin or Moderator',
                })
            )
        }
    }

    updateNews = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        let file = null
        if (req.file !== undefined) file = req.file.filename
        try {
            if (req.role === 'Admin' || req.role === 'Moderator') {
                const result = await this.newsService.updateNews(
                    file,
                    req.params.id,
                    req.email,
                    req.body.title,
                    req.body.content,
                    req.body.thumbnail,
                    req.body.category,
                    req.body.author,
                    req.body.tags,
                    req.body.status,
                    req.body.description
                )
                res.send(new ResponseWrapper(result))
            } else {
                res.send(
                    new ResponseWrapper({
                        message: 'You are not Admin or Moderator',
                    })
                )
            }
        } catch (error) {
            next(error)
        }
    }

    newsDetail = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        const result = await this.newsService.newsDetail(
            req.params.id,
            req.email
        )
        console.log(req.email)
        try {
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    newsListByCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.getListNewsByCategory(
                page.page,
                page.limit,
                req.params.tags
            )
            res.send(new ResponseWrapper(result, null, page))
        } catch (error) {
            next(error)
        }
    }

    newsListUserSeen = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.listNewsUserSeen(
                req.email,
                page.page,
                page.limit
            )
            res.send(new ResponseWrapper(result, null, page))
        } catch (error) {
            next(error)
        }
    }

    save = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.save(
                req.email,
                req.params.newsId
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getNewsUserSaved = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.getNewsUserSaved(
                req.email,
                page.page,
                page.limit
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.search(
                req.query.q as any,
                page.page,
                page.limit
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    statistical = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.statistical()
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}
