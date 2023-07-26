const env = process.env

export interface Config {
    port: string
}

export const config: Config = {
    port: env.PORT,
}
