import { DataSource } from 'typeorm'
import 'reflect-metadata'
import { User } from '../modules/users/entities/user.model'
import { Profile } from '../modules/users/entities/profile.model'
import { News } from '../modules/news/entities/news.model'
import { Comment } from '../modules/comment/entities/comment.model'
import { Liked } from '../modules/comment/entities/like.model'
import { Reply } from '../modules/comment/entities/reply.module'

export class ConnectDB {
    // static AppDataSource = new DataSource({
    //     type: 'mysql',
    //     host: 'localhost',
    //     port: 3306,
    //     username: 'root',
    //     password: '',
    //     database: 'demo_intern',
    //     entities: [User, Profile, News, Comment, Liked, Reply],
    //     logging: false,
    //     synchronize: true,
    //     subscribers: [],
    // })
    static AppDataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'thanh',
        database: 'postgres',
        entities: [User, Profile, News, Comment, Liked, Reply],
        logging: true,
        synchronize: true,
        subscribers: [],
    })
}
