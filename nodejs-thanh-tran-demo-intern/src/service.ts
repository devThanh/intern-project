import { UserService } from './modules/users/user.service'
import { AuthService } from './modules/auth/auth.service'
import { NewsService } from './modules/news/news.service'
import { CommentService } from './modules/comment/comment.service'


export interface BaseService {}


export const authService = new AuthService()
export const userService = new UserService(authService)
export const newsService = new NewsService(authService)
export const commentService = new CommentService()