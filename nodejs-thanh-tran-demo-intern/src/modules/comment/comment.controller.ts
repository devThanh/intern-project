import { NextFunction, Response, Request } from 'express'
import { AuthRequest } from '../auth/auth.middleware'
import { AuthService } from '../auth/auth.service'
import { CommentService } from './comment.service'
import moment from 'moment'
import { Pagination, ResponseWrapper } from '../../helpers/response.wrapper'

export class CommentController {
    commentService: CommentService
    authService: AuthService
    constructor(commentService: CommentService, authService: AuthService) {
        this.commentService = commentService
        this.authService = authService
    }

    getComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.getComment(
                req.params.commentId
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    createComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.createComment(
                req.params.newsId,
                req.email,
                req.name,
                req.body.content
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.editComment(
                req.params.commentId,
                req.body.content,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.deleteComment(
                req.params.commentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    hiddenComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.hiddenComment(
                req.params.commentId,
                req.email,
                req.role
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
        // if (req.role === 'Admin' || req.role === 'Mode') {

        // } else {
        //     res.send(
        //         new ResponseWrapper({ message: 'You are not Admin or Mode' })
        //     )
        // }
    }

    replyComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.replyComment(
                req.params.newsId,
                req.params.commentId,
                req.email,
                req.name,
                req.body.content
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getReplyComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.getReplyComment(
                req.params.replyCommentId
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editReplyComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.editReplyComment(
                req.params.replycommentId,
                req.body.content,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteReplyComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.deleteReplyComment(
                req.params.replycommentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    hiddenReplyComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.commentService.hiddenReplyComment(
                req.params.replycommentId,
                req.email,
                req.role
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
        // if (req.role === 'Admin' || req.role === 'Mode') {
        //     const result = await this.commentService.hiddenReplyComment(
        //         req.params.commentId
        //     )
        //     res.send(new ResponseWrapper(result))
        // } else {
        //     res.send(
        //         new ResponseWrapper({ message: 'You are not Admin or Mode' })
        //     )
        // }
    }

    like = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.like(
                req.params.commentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    unlike = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.unlike(
                req.params.commentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    likeReply = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.likeReply(
                req.params.replycommentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    unlikeReply = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        // const result = await this.commentService.unlikeReply(
        //     req.params.replycommentId,
        //     req.email
        // )
        try {
            const result = await this.commentService.unlikeReply(
                req.params.replycommentId,
                req.email
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    listCommentByNews = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.commentService.listCommentByNews(
                page.page,
                page.limit,
                req.query.column as any,
                req.params.newsId
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    listReplyByComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        //const pagegination = new Pagination
        try {
            const result = await this.commentService.listReplyByComment(
                req.params.newsId,
                page.page,
                page.limit,
                req.params.commentId
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    listCommentByUser = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.commentService.listCommentByUser(
                req.email,
                page.page,
                page.limit
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}
