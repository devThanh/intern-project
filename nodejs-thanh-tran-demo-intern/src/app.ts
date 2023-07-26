import express, { NextFunction, Request, Response } from 'express'
import { config } from './config'
import { handleError } from './helpers/error'
import { logger } from './helpers/logger'
import { userRouter } from './modules/users/user.route'
import { ConnectDB } from './database/connection'
import redis_client from '../redis_connect'
import { newsRouter } from './modules/news/news.route'
import { commentRouter } from './modules/comment/comment.route'

const app = express()
const port = config.port
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Connect Database
async function bootstrap() {
    await ConnectDB.AppDataSource.initialize()
        .then(() => {
            console.log('CONNECT SUCCESSFULLY!!!')
        })
        .catch((err) => {
            console.error(err)
        })
}
bootstrap()
ConnectDB.AppDataSource.initialize()
        .then(() => {
            console.log('CONNECT SUCCESSFULLY!!!')
        })
        .catch((err) => {
            console.error(err)
        })

//Connect Redis
async function connect() {
    await redis_client.connect()
}

connect()

app.use('/user', userRouter)
app.use('/news', newsRouter)
app.use('/comment', commentRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handleError(err, res)
})

app.listen(port, async () => {
    return logger.info(`Server is listening at port ${port}`)
})
