import { createClient } from 'redis'

const url = 'redis://localhost:6379'
const redis_client = createClient({
    url,
})

redis_client.on('error', (err) => console.log('Redis Client Error', err))

redis_client.on('connect', () => console.log('Redis Client Connect'))

redis_client.on('ready', () => console.log('Redis Client Ready'))

export default redis_client

import { Queue, Worker } from 'bullmq'
import { senMailer } from './src/helpers/email'

export const emailQueue = new Queue('Mailer', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const worker = new Worker(
    'Mailer',
    async (job) => {
        senMailer(job.data.email)
    },
    {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    }
)
