import redis_client from '../../../redis_connect'
import { BaseService } from '../../service'
import { AuthService } from '../auth/auth.service'
import { News } from './entities/news.model'
import { ConnectDB } from '../../database/connection'
import { excuteProcedure } from '../../util/procedure'
import newsProcedure from './news.procedure'
import { Errors } from '../../helpers/error'
import { Pagination } from '../../helpers/response.wrapper'
import { User } from '../users/entities/user.model'
import { In, Like } from 'typeorm'
import moment from 'moment'
import fs from 'fs-extra'

const dataSource = ConnectDB.AppDataSource

export class NewsService implements BaseService {
    private authService: AuthService
    constructor(authService: AuthService) {
        this.authService = authService
    }

    createNews = async (
        file: string,
        email: string,
        title: string,
        content: string,
        thumbnail: string,
        category: string,
        author: string,
        tag: string[],
        status: string,
        desc: string
    ) => {
        const news = new News()
        news.title = title
        news.content = content
        news.thumbnail = file
        //const date = new Date()
        //const ab = date.toUTCString()
        //news.date = ab
        news.category = category
        news.author = author
        news.tags = tag
        news.status = status
        news.description = desc
        const res = await news.save()
        console.log(news)
        const a = JSON.stringify(res)
        redis_client.HSET(`${`news`}`, `${news.id}`, a)
        return { message: 'CREATED NEWS SUCCESSFULLY', res }
    }

    updateNews = async (
        file: string,
        id: string,
        email: string,
        title: string,
        content: string,
        thumbnail: string,
        category: string,
        author: string,
        tag: string[],
        status: string,
        desc: string
    ) => {
        const tmp = new News()
        //const searchResult = await redis_client.HGET(`${`news`}`,`${email}:${id}`)
        const searchResult = await redis_client.HGET(`${`news`}`, `${id}`)
        if (searchResult !== null) {
            const news: News = JSON.parse(searchResult)
            news.id = id
            news.title = title
            news.content = content
            // const date = new Date()
            // const ab = date.toUTCString()
            // news.date = ab
            if (file !== null) {
                await fs.unlink(
                    'D:/nodejs-thanh-tran-demo-intern/nodejs-thanh-tran-demo-intern/uploads/' +
                        `${news.thumbnail}`
                )
            }
            news.thumbnail = file
            news.category = category
            news.author = author
            news.tags = tag
            news.status = status
            news.description = desc
            news.viewer = tmp.viewer
            news.like = tmp.like
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            news.updated_date = date
            news.totalComment = tmp.totalComment
            const res = await news.save()
            //console.log(res)
            const a = JSON.stringify(res)
            await redis_client.HSET(`${`news`}`, `${id}`, a)
            return { message: 'UPDATED NEWS SUCCESSFULLY', res }
        }
        throw Errors.NotFound
    }

    newsDetail = async (id: string, email: string) => {
        const redisSearch = await redis_client.hGet(`${`news`}`, `${id}`)
        let res: News = JSON.parse(redisSearch)
        //console.log("first: ",redisSearch)

        if (res !== null && res.status === 'xuat ban') {
            await excuteProcedure(newsProcedure.IncreaseView, [id])
            //let res: News = JSON.parse(redisSearch)
            res.viewer += 1
            const obj = JSON.stringify(res)
            redis_client.HSET(`${`news`}`, `${id}`, obj)
            if (email !== undefined) {
                //luu cac tin nguoi dung da doc vao redis neu nguoi dung co dang nhap
                redis_client.hSet(`${email}:${`isSeen`}`, `${id}`, obj)
                //2592000 = 30days
                redis_client.expire(`${email}:${`isSeen`}`, 2592000)
            }
            const result = JSON.parse(obj)
            return { result }
        } else {
            const news = await News.findOneBy({ id: id })
            if (news !== null && news.status === 'xuat ban') {
                //Load du lieu tu databse sau do chuyen thanh chuoi va gan cho bien result de them vao redis
                const result = JSON.stringify(news)
                redis_client.hSet(`${`news`}`, `${id}`, result)
                if (email !== undefined) {
                    //luu cac tin nguoi dung da doc vao redis neu nguoi dung co dang nhap
                    redis_client.hSet(`${email}:${`isSeen`}`, `${id}`, result)
                    //2592000 = 30days
                    redis_client.expire(`${email}:${`isSeen`}`, 2592000)
                }
                //const data = await excuteProcedure(newsProcedure.IncreaseView, [id])
                return { news }
            }
            return Errors.NotFound
        }
    }

    getListNewsByCategory = async (
        page: number,
        limit: number,
        category: string
    ) => {
        //console.log(page, limit, category)
        const pagegination = new Pagination(page, limit)
        const res = await dataSource.getRepository(News).find({
            select: [
                'id',
                'title',
                'description',
                'thumbnail',
                'author',
                'viewer',
            ],
            where: {
                category: category,
                status: 'xuat ban',
            },
            take: pagegination.limit,
            skip: pagegination.getOffset(),
        })
        if (res.length === 0) throw Errors.NotFound
        return res
    }

    listNewsUserSeen = async (email: string, page: number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        //const listNews = await redis_client.hKeys(`${email}:${`isSeen`}`)
        const item = await redis_client.HVALS(`${email}:${`isSeen`}`)
        let output = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            output.push(JSON.parse(item[index]))
        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        return output
        // console.log(item)
        // const list = item.map((val) => JSON.parse(val))
        // if (list.length === 0) throw Errors.NotFound
        // return list
    }

    save = async (email: string, newsId: string) => {
        const redisSearch = await redis_client.hGet(
            `${email}:${`save`}`,
            `${newsId}`
        )
        if (redisSearch) {
            return { message: 'You are already save this news' }
        } else {
            const redisSearch = await redis_client.hGet(
                `${`news`}`,
                `${newsId}`
            )
            let news: News = JSON.parse(redisSearch)
            //const news = await News.findOneBy({ id: newsId })
            if (news !== null && news.status === 'xuat ban') {
                const a = JSON.stringify(news)
                redis_client.hSet(`${email}:${`save`}`, `${news.id}`, a)
                //30days = 2592000s
                redis_client.expire(`${email}:${`save`}`, 2592000)
                return { message: 'Save this news successfully!!!' }
            } else {
                throw Errors.NotFound
            }
        }
    }

    getNewsUserSaved = async (email: string, page: number, limit: number) => {
        // const listNewsSaved = await redis_client.HKEYS(`${email}:${`save`}`)
        // let output = []
        // console.log('first: ', email, listNewsSaved)
        // const item = await redis_client.HVALS(`${email}:${`save`}`)
        // const list = item.map((val) => JSON.parse(val))
        // return list
        const pagegination = new Pagination(page, limit)
        const item = await redis_client.HVALS(`${email}:${`save`}`)
        let output = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            output.push(JSON.parse(item[index]))
        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        return output
        // if(listNewsSaved){
    }

    search = async (search_query: string, page: number, limit: number) => {
        //let searchValue = new RegExp(search_query,'ig')
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const sql = `SELECT id, title, description, thumbnail, author, viewer FROM news WHERE title LIKE N'%${search_query}%' or tags LIKE ('%${search_query}%') LIMIT ${limit} OFFSET ${offset};`
        console.log(sql)
        const data = await dataSource.query(sql)
        console.log(data)
        if (data.length !== 0) return data
        throw Errors.NotFound
    }
    //{select: ['id','viewer','totalComment']}
    statistical = async () => {
        const news = await dataSource.getRepository(News).find({
            select: [
                'id',
                'title',
                'description',
                'author',
                'totalComment',
                'like',
                'viewer',
            ],
            where: { status: 'xuat ban' },
        })
        //const news = JSON.parse(newsa)
        if (news.length === 0) throw Errors.NotFound
        return news
    }
}
