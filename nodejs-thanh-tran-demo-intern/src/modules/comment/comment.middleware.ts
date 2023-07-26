import { NextFunction, Request, Response } from 'express'
import { validate } from 'class-validator'
import { ResponseWrapper } from '../../helpers/response.wrapper'
import { CommentDTO } from './dto/comment.dto'

export class CommentMiddleware{
    validateIp = (req: Request, res: Response, next: NextFunction)=>{
        let comment = new CommentDTO()
        comment.content = req.body.content
        validate(comment).then((errors)=>{
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