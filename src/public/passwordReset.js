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
