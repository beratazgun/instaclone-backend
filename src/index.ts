import dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express, { Express, Request } from 'express'
import http from 'http'
import cors from 'cors'
import bodyParser from 'body-parser'
import { typeDefs } from './schemas/schemas'
import { resolvers } from './resolvers/resolvers'
import { makeExecutableSchema } from '@graphql-tools/schema'
import sessions from 'express-session'
import RedisStore from 'connect-redis'
import { client } from './services/redis/client'
import { ApolloFormatError } from './utils/ApolloFormatError'
import helmet from 'helmet'
import path from 'path'

import viewRoute from './routes/view.routes'

// This function creates a GraphQL schema by combining a GraphQL schema and the parser functions defined on the schema.
const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
})

const app: Express = express()
const PORT: number = Number(process.env.PORT as string) || 3000

// This creates an instance of an HTTP server to listen for requests.
const httpServer = http.createServer(app)

// This function starts the ApolloServer.
async function startApolloServer() {
	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		formatError: (err) => {
			return ApolloFormatError(err)
		},
	})

	app.locals.apolloServer = server
	await server.start()

	app.use(
		sessions({
			store: new RedisStore({
				client: client,
				prefix: 'sesID#',
			}),
			name: 'sesID',
			secret: 'instaclone',
			cookie: {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
				secure: false,
			},
			resave: false,
			saveUninitialized: false,
		})
	)

	app.use(
		'/api/v1/graphql',
		cors<cors.CorsRequest>(),
		bodyParser.json(),
		expressMiddleware(server, {
			context: async ({ req, res }) => {
				return {
					req,
					res,
				}
			},
		})
	)

	await new Promise<void>((resolve) =>
		httpServer.listen({ port: PORT }, resolve)
	)
	console.log(`    
	🚀 Server ready at http://localhost:${PORT}/`)
}

startApolloServer()

// This sets the view engine to Pug and sets the views directory to the views folder.
app.set('view engine', 'pug')

// This sets the views directory to the views folder.
app.set('views', path.join(__dirname, 'views'))

// This sets the public directory to the public folder.
app.use(express.static(path.join(__dirname, 'public')))

app.use(
	helmet({
		xssFilter: true, // XSS attack
		frameguard: true, // Clickjacking
		hsts: true, // HTTP Strict Transport Security
		noSniff: true, // MIME sniffing
		hidePoweredBy: true, // Hide X-Powered-By
		crossOriginEmbedderPolicy: false, // Cross-Origin-Embedder-Policy
		contentSecurityPolicy: false, // Content-Security-Policy
	})
)

app.use(viewRoute)
