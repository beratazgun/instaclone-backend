import { Router } from 'express'
import { gql } from 'graphql-tag'
import pug from 'pug'
import path from 'path'

const router = Router()

router.get('/confirm/:token', async (req, res) => {
	const response = await req.app.locals.apolloServer.executeOperation({
		query: gql`
			mutation verifyAccount($confirmationToken: String!) {
				verifyAccount(confirmationToken: $confirmationToken) {
					message
				}
			}
		`,
		variables: {
			confirmationToken: req.params.token,
		},
		context: { req, res },
	})

	res.send(`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body>
				<style>
					body {
						background-color: #000;
						color: #fff;
						font-family: sans-serif;
						text-align: center;
					}

					h1 {
						font-size: 2rem;
						margin-top: 18rem;
					}
				</style>

				<h1>${response.body.singleResult.data.verifyAccount.message}</h1>
			</body>
		</html>
	`)
})

export default router
