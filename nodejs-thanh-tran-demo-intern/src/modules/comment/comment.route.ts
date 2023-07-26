import express from 'express'
import { AuthService } from '../auth/auth.service'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { CommentMiddleware } from './comment.middleware'

export const commentRouter = express.Router()

const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const commentService = new CommentService()
const commentMiddleware = new CommentMiddleware()
const commentController = new CommentController(commentService, authService)

commentRouter.get('/listusercomment', authMiddleware.authorize, commentController.listCommentByUser)
commentRouter.get('/listcomment/:newsId', commentController.listCommentByNews)
commentRouter.get('/listreply/:commentId', commentController.listReplyByComment)

commentRouter.get('/:replyCommentId', commentController.getReplyComment )
commentRouter.delete('/deletereply/:replycommentId',authMiddleware.authorize, commentController.deleteReplyComment)
commentRouter.put('/editreply/:replycommentId',authMiddleware.authorize, commentController.editReplyComment)
commentRouter.post('/reply/:newsId/:commentId',authMiddleware.authorize, commentController.replyComment)
commentRouter.delete('/hiddenreply/:replycommentId', authMiddleware.authorize, commentController.hiddenReplyComment)
commentRouter.post('/likereply/:replycommentId', authMiddleware.authorize, commentController.likeReply)
commentRouter.delete('/unlikereply/:replycommentId', authMiddleware.authorize, commentController.unlikeReply)


commentRouter.get('/:commentId', commentController.getComment)
commentRouter.post('/create/:newsId', commentMiddleware.validateIp ,authMiddleware.authorize, commentController.createComment)
commentRouter.put('/edit/:commentId',commentMiddleware.validateIp,authMiddleware.authorize, commentController.editComment)
commentRouter.delete('/delete/:commentId', authMiddleware.authorize, commentController.deleteComment)
commentRouter.delete('/hidden/:commentId', authMiddleware.authorize, commentController.hiddenComment)
commentRouter.post('/like/:commentId', authMiddleware.authorize, commentController.like)
commentRouter.delete('/unlike/:commentId', authMiddleware.authorize, commentController.unlike)




