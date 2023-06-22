import Redis from 'ioredis'

// CLOUD REDIS
const client = new Redis({
	port: Number(process.env.REDIS_PORT),
	host: process.env.REDIS_HOST as string,
	password: process.env.REDIS_PW,
})

// LOCAL REDIS
// const client = new Redis({
// 	port: Number(process.env.REDIS_PORT_LOCAL),
// 	host: process.env.REDIS_HOST_LOCAL as string,
// })

client.on('connect', () =>
	console.log('      	 🚀 Redis client connected 📮📮📮')
)

export { client }
