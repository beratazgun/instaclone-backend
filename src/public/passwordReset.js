// import { gql } from 'graphql-tag'
// import { Server } from 'http'

// const newPassword = document.getElementById('newPassword')
// const newPasswordConfirmation = document.getElementById('newPasswordConfirm')
// const button = document.querySelector('.btn')

// const token = window.location.href.split('/')[5]

// button.addEventListener('click', async () => {
// 	if (newPassword.value !== newPasswordConfirmation.value) {
// 		alert('Passwords do not match')
// 	} else {
// 		const response = await req.app.locals.apolloServer.executeOperation({
// 			query: gql`
// 				mutation ResetPassword(
// 					$newPassword: String
// 					$newPasswordConfirmation: String
// 					$resetPasswordToken: String
// 				) {
// 					resetPassword(
// 						newPassword: newPassword.value
// 						newPasswordConfirmation: newPasswordConfirmation.value
// 						passwordResetToken: token
// 					) {
// 						isSuccess
// 						message
// 					}
// 				}
// 			`,
// 			variables: {
// 				confirmationToken: req.params.token,
// 			},
// 			context: { req, res },
// 		})
// 	}
// })

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
	uri: 'http://localhost:4000/graphql',
	cache: new InMemoryCache(),
})

client
	.mutate({
		mutation: gql`
			mutation ResetPassword(
				$newPassword: String!
				$newPasswordConfirmation: String!
				$resetPasswordToken: String!
			) {
				resetPassword(
					newPassword: $newPassword
					newPasswordConfirmation: $newPasswordConfirmation
					passwordResetToken: $resetPasswordToken
				) {
					isSuccess
					message
				}
			}
		`,
		variables: {
			newPassword: newPassword.value,
			newPasswordConfirmation: newPasswordConfirmation.value,
			resetPasswordToken: token,
		},
	})
	.then((data) => console.log(data))
	.catch((error) => console.error(error))
