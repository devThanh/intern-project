//import { plainToClass } from 'class-transformer'
//import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { User } from './entities/user.model'
import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { ResponseWrapper } from '../../helpers/response.wrapper';
import { UserDTO } from './dto/user.dto';
import { UserLoginDTO } from './dto/userLogin.dto';
// import { sanitize, Trim } from "class-sanitizer";
// import HttpException from "../exception/HttpException";

export class UserMiddleware {
    yolo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('yolo middleware...')
            next()
        } catch (error) {
            next(error)
        }
    }

    validateIp = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body)
        let user = new UserDTO();
        //user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.name = req.body.name
        validate(user).then(errors => {
          // errors is an array of validation errors
          if (errors.length > 0) {
            console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
          } else {
            console.log('validation succeed');
            next()
          }
        });
    }

    validateLogin = (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body)
      let user = new UserLoginDTO();
      //user.username = req.body.username;
      user.email = req.body.email;
      user.password = req.body.password;
      //user.name = req.body.name
      validate(user).then(errors => {
        // errors is an array of validation errors
        if (errors.length > 0) {
          console.log('validation failed. errors: ', errors);
          return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
        } else {
          console.log('validation succeed');
          next()
        }
      });
  }


}
