import { BaseService } from '../../service'
import { AuthService } from '../auth/auth.service'
import { Comment } from './entities/comment.model'
import { options } from '../../util/formatDate'
import moment from 'moment'
import redis_client from '../../../redis_connect'
import { Errors } from '../../helpers/error'
import { News } from '../news/entities/news.model'
import { ConnectDB } from '../../database/connection'
import { Liked } from './entities/like.model'
import { Pagination } from '../../helpers/response.wrapper'
import { excuteProcedure } from '../../util/procedure'
import procedure from './comment.procedure'
import { Reply } from './entities/reply.module'
import { User } from '../users/entities/user.model'
moment.locale('vn')
const dataSource = ConnectDB.AppDataSource

export class CommentService implements BaseService {
    getComment = async (commentId: string) => {
        const listComment = await Comment.find({
            where: { id: commentId },
        })
        return listComment
    }

    createComment = async (
        newsId: string,
        email: string,
        name: string,
        content: string
    ) => {
        const countComment = await Comment.find({
            where: {
                email: email,
                newsId: newsId,
            },
        })
        const redisSearch = await redis_client.hGet(`${`news`}`, `${newsId}`)
        let res: News = JSON.parse(redisSearch)
        console.log(res.status)
        if (res === null || res.status !== 'xuat ban') throw Errors.BadRequest
        if (countComment.length === 0) {
            const comment = new Comment()
            comment.newsId = newsId
            comment.email = email
            comment.name = name
            comment.content = content
            res.totalComment += 1
            //comment.date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            comment.save()
            excuteProcedure(procedure.IncreaseTotalComment, [newsId])
            const news = await News.findOneBy({ id: newsId })
            redis_client.HSET(`${`news`}`, `${newsId}`, JSON.stringify(res))
            redis_client.hSet(
                `${email}:${`isSeen`}`,
                `${newsId}`,
                JSON.stringify(JSON.parse(JSON.stringify(news)))
            )
            return comment
        } else {
            return { message: 'Chi binh luan duoc 1 lan' }
        }

        // const search = await redis_client.HGET(`${email}:${`isSeen`}`,`${newsId}`)
        // console.log("dsad:  ",search)
        // if(search !== null){
        //     const comment = new Comment
        //     comment.newsId = newsId
        //     comment.email = email
        //     comment.name = name
        //     comment.content = content
        //     comment.date = moment(Date.now()).format('ddd DD/MM/YYYY HH:mm:ss a')
        //     comment.level = 'comment'
        //     comment.save()
        //     return {comment}
    }

    editComment = async (commentId: string, content: string, email: string) => {
        const comment = await Comment.findOneBy({ id: commentId, email: email })
        if (comment !== null) {
            comment.content = content
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            comment.updated_date = date
            comment.save()
            return { comment, message: 'Edit comment successfully' }
        }
        throw Errors.BadRequest
    }

    deleteComment = async (commentId: string, email: string) => {
        const comment = await Comment.findOneBy({ id: commentId })
        if (comment !== null && comment.deletedDate !== null) {
            const redisSearch = await redis_client.hGet(
                `${`news`}`,
                `${comment.newsId}`
            )
            let res: News = JSON.parse(redisSearch)
            if (comment.email === email) {
                excuteProcedure(procedure.DescreaseTotalReply, [commentId])
                excuteProcedure(procedure.DescreaseTotalComment, [
                    comment.newsId,
                ])
                res.totalComment -= 1
                //const news = await News.findOneBy({ id: comment.newsId })
                redis_client.HSET(
                    `${`news`}`,
                    `${comment.newsId}`,
                    JSON.stringify(res)
                )
                redis_client.hSet(
                    `${email}:${`isSeen`}`,
                    `${comment.newsId}`,
                    JSON.stringify(res)
                )
                await Comment.remove(comment)
                return { message: 'Delete comment successfully' }
            } else throw Errors.Unauthorized
        } else {
            throw Errors.NotFound
        }
    }

    hiddenComment = async (commentId: string, email: string, role: string) => {
        try {
            const comment = await Comment.findOneBy({ id: commentId })
            if (
                (comment !== null && comment.email === email) ||
                role === 'Admin' ||
                role === 'Moderator'
            ) {
                await Comment.softRemove(comment)
                return { message: 'Hidden comment successfully' }
            } else {
                return { message: 'Hidden comment failure' }
            }
        } catch (error) {
            throw Errors.BadRequest
        }
    }

    replyComment = async (
        newsId: string,
        commentId: string,
        email: string,
        name: string,
        content: string
    ) => {
        const comment = await Comment.findOneBy({ id: commentId })
        if (comment !== null) {
            const redisSearch = await redis_client.hGet(
                `${`news`}`,
                `${newsId}`
            )
            let res: News = JSON.parse(redisSearch)
            if (res !== null) {
                const reply = new Reply()
                reply.content = content
                reply.commentId = commentId
                reply.name = name
                reply.email = email
                reply.newsId = newsId
                //reply.date = moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')
                reply.save()
                res.totalComment += 1
                await excuteProcedure(procedure.IncreaseTotalReply, [commentId])
                await excuteProcedure(procedure.IncreaseTotalComment, [newsId])
                //const news = await News.findOneBy({ id: comment.newsId })
                redis_client.HSET(
                    `${`news`}`,
                    `${comment.newsId}`,
                    JSON.stringify(res)
                )
                redis_client.hSet(
                    `${email}:${`isSeen`}`,
                    `${comment.newsId}`,
                    JSON.stringify(res)
                )
                return reply
            }
            throw Errors.NotFound
        }
        throw Errors.NotFound
    }

    getReplyComment = async (replyCommentId: string) => {
        const listReplyComment = await Reply.find({
            where: { id: replyCommentId },
        })
        if (listReplyComment.length === 0) throw Errors.NotFound
        return listReplyComment
    }

    editReplyComment = async (
        replycommentId: string,
        content: string,
        email: string
    ) => {
        const reply = await Reply.findOneBy({
            id: replycommentId,
            email: email,
        })
        if (reply !== null) {
            reply.content = content
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            reply.updated_date = date
            reply.save()
            return { reply, message: 'Edit reply comment successfully' }
        }
        throw Errors.BadRequest
    }

    deleteReplyComment = async (replycommentId: string, email: string) => {
        const reply = await Reply.findOneBy({ id: replycommentId })
        console.log(reply)
        if (reply !== null) {
            const redisSearch = await redis_client.hGet(
                `${`news`}`,
                `${reply.newsId}`
            )
            console.log(redisSearch)
            let res: News = JSON.parse(redisSearch)
            if (reply.email === email) {
                excuteProcedure(procedure.DescreaseTotalReply, [
                    reply.commentId,
                ])
                excuteProcedure(procedure.DescreaseTotalComment, [reply.newsId])
                res.totalComment -= 1
                const news = await News.findOneBy({ id: reply.newsId })
                redis_client.HSET(
                    `${`news`}`,
                    `${reply.newsId}`,
                    JSON.stringify(res)
                )
                redis_client.hSet(
                    `${email}:${`isSeen`}`,
                    `${reply.newsId}`,
                    JSON.stringify(res)
                )
                await Reply.remove(reply)
                return { message: 'Delete reply comment successfully' }
            } else {
                throw Errors.Unauthorized
            }
        } else {
            throw Errors.NotFound
        }
    }

    hiddenReplyComment = async (
        replycommentId: string,
        email: string,
        role: string
    ) => {
        try {
            const reply = await Reply.findOneBy({ id: replycommentId })
            console.log(reply, replycommentId)
            if (
                reply.email === email ||
                role === 'Admin' ||
                role === 'Moderator'
            ) {
                if (reply !== null) {
                    await Reply.softRemove(reply)
                    return { message: 'Hidden reply comment successfully' }
                } else {
                    return { message: 'Hidden reply comment failure' }
                }
            } else {
                throw Errors.Unauthorized
            }
        } catch (error) {
            throw Errors.BadRequest
        }
    }

    like = async (commentId: string, email: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const comment = await Comment.findOneBy({ id: commentId })
        await queryRunner.startTransaction()
        try {
            //if(comment.deletedDate !== null)return {message:'Your comment is hidden. Can not like'}
            const checkUserLiked = await Liked.find({
                where: { email: email, commentId: commentId },
            })
            if (checkUserLiked.length === 0) {
                queryRunner.query(
                    `UPDATE comment SET comment.like = comment.like + 1 WHERE id = ?`,
                    [commentId]
                )
                const like = new Liked()
                like.email = email
                like.commentId = comment.id
                like.save()
                await queryRunner.commitTransaction()
                return { message: 'Like comment successfully' }
            } else {
                await queryRunner.commitTransaction()
                return { message: 'You already like this comment' }
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    unlike = async (commentId: string, email: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        //const comment = await Comment.findOneBy({ id: commentId })
        await queryRunner.startTransaction()
        try {
            const checkUserLiked = await Liked.find({
                where: { email: email, commentId: commentId },
            })
            console.log(checkUserLiked.length)
            if (checkUserLiked.length !== 0) {
                queryRunner.query(
                    `UPDATE comment SET comment.like = comment.like - 1 WHERE id = ?`,
                    [commentId]
                )
                queryRunner.query(
                    'DELETE FROM liked WHERE email=? and commentId=?',
                    [email, commentId]
                )
                await queryRunner.commitTransaction()
                return { message: 'Unlike comment successfully' }
            } else {
                //await queryRunner.commitTransaction()
                throw Errors.NotFound
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            return Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    likeReply = async (replyCommentId: string, email: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const reply = await Reply.findOneBy({ id: replyCommentId })
        await queryRunner.startTransaction()
        try {
            const checkUserLiked = await Liked.find({
                where: { email: email, commentId: replyCommentId },
            })
            if (checkUserLiked.length === 0) {
                queryRunner.query(
                    `UPDATE reply SET reply.like = reply.like + 1 WHERE id = ?`,
                    [replyCommentId]
                )
                const like = new Liked()
                like.email = email
                like.commentId = reply.id
                like.save()
                await queryRunner.commitTransaction()
                return { message: 'Like reply comment successfully' }
            } else {
                await queryRunner.commitTransaction()
                return { message: 'You already like this reply comment' }
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    unlikeReply = async (replycommentId: string, email: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        //const reply = await Reply.findOneBy({ id: commentId })
        await queryRunner.startTransaction()
        try {
            const checkUserLiked = await Liked.find({
                where: { email: email, commentId: replycommentId },
            })
            console.log(checkUserLiked.length)
            if (checkUserLiked.length !== 0) {
                queryRunner.query(
                    `UPDATE reply SET reply.like = reply.like - 1 WHERE id = ?`,
                    [replycommentId]
                )
                queryRunner.query(
                    'DELETE FROM liked WHERE email=? and commentId=?',
                    [email, replycommentId]
                )
                await queryRunner.commitTransaction()
                return { message: 'Unlike reply comment successfully' }
            } else {
                await queryRunner.commitTransaction()
                return { message: 'You not like this reply comment' }
            }

            //await queryRunner.commitTransaction()
            //throw Errors.NotFound
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    listCommentByNews = async (
        page: number,
        limit: number,
        column: string,
        newsId: string
    ) => {
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const orderExp = `comment.${column}`
        //const listNews = await News.find({ take: limit, skip: offset })
        const commentRepository = dataSource.getRepository(Comment)
        const commentList = await commentRepository
            .createQueryBuilder('comment')
            .where('comment.newsId = :newsId', { newsId })
            //.select(['id','title','content'])
            //.groupBy('')
            .orderBy(`${orderExp}`, 'DESC')
            .take(limit)
            .offset(offset)
            .getMany()
        if (commentList.length !== 0) {
            return commentList
        }
        throw Errors.NotFound
    }

    listReplyByComment = async (
        newsId: string,
        page: number,
        limit: number,
        commentId: string
    ) => {
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const commentRepository = dataSource.getRepository(Reply)
        const commentList = await commentRepository
            .createQueryBuilder('reply')
            .where('reply.commentId = :commentId', { commentId })
            .take(limit)
            .offset(offset)
            .getManyAndCount()

        if (commentList[1] !== 0) return commentList[0]
        throw Errors.NotFound
    }

    listCommentByUser = async (email: string, page, limit) => {
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const userList = await User.find({
            where: { email: email },
            take: limit,
            skip: offset,
        })
        const arr: Array<Object> = []
        const data = await Promise.all(
            userList.map(async (user) => {
                const commentList = await Comment.find({
                    where: { email: user.email },
                    take: limit,
                    skip: offset,
                })
                const replyList = await Reply.find({
                    where: { email: user.email },
                    take: limit,
                    skip: offset,
                })
                const obj = {
                    // User: user,
                    Comment: commentList,
                    ReplyComment: replyList,
                }
                arr.push(obj)
            })
        )
        return arr
    }
}
