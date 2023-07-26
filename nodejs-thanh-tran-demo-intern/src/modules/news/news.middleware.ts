import { NextFunction, Request, Response } from 'express'
import { validate } from 'class-validator'
import { ResponseWrapper } from '../../helpers/response.wrapper'
import { NewsDTO } from './dto/news.dto'

export class NewsMiddleware{
    validateIp = (req: Request, res: Response, next: NextFunction)=>{
        console.log(req.body)
        let news = new NewsDTO()
        news.title = req.body.title
        news.content = req.body.content
        news.thumbnail = req.file.filename
        news.category = req.body.category
        news.author = req.body.author
        news.tags = req.body.tags
        news.status = req.body.status
        news.description = req.body.description
        //console.log(news)
        validate(news).then((errors)=>{
            if(errors.length > 0){
                console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            }else{
                console.log('validation succeed');
                next()  
            }
        })
    }
}