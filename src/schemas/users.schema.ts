import gql from 'graphql-tag'

export const usersSchema = gql`
	type Mutation {
		"Creates a new user"
		signupUser(
			name: String
			username: String
			email: String
			avatar: String
			gender: String
			password: String
			passwordConfirmation: String
			phone: String
		): Response!
		"Sign in a user"
		signinUser(email: String, password: String): Response!
		"Verifies a user's account"
		verifyAccount(confirmationToken: String): Response!
		"Resends a verification email"
		resendVerifyEmail(email: String): Response!
		"Deletes a user's account"
		deleteAccount: Response!
		"Signs out a user"
		signoutUser: Response!
		"Forgets a user's password"
		sendForgotPasswordEmail(email: String): Response!
		"Resets a user's password if user has forgotten it"
		resetPasswordForForgot(
			newPassword: String
			newPasswordConfirmation: String
			passwordResetToken: String
		): Response!
		"Change a user's password if user wants to change it"
		ChangePassword(
			oldPassword: String
			newPassword: String
			newPasswordConfirmation: String
		): Response!
		"Updates a user's profile"
		updateProfile(
			name: String
			username: String
			avatar: String
			email: String
			bio: String
			phone: String
		): Response!
	}

	type Query {
		getUser(username: String!): Response!
		getMe: Response!
	}

	type Response {
		"Indicates the message of the mutation"
		message: String!
		"Indicates whether the mutation was successful"
		isSuccess: Boolean!
		"Indicates the validation error if any"
		validationError: validationErrorFields
		"Indicates the result of the mutation if any"
		result: Result
	}

	type validationErrorFields {
		name: String
		username: String
		email: String
		avatar: String
		bio: String
		phone: String
		gender: String
		password: String
		passwordConfirmation: String
		oldPassword: String
		newPassword: String
		newPasswordConfirmation: String
	}

	type Result {
		id: ID!
		"User's name"
		name: String
		"user's name"
		username: String
		"user's bio"
		bio: String
		"user's email"
		email: String
		"user's gender"
		gender: String
		"user's password"
		password: String
		"user's phone number"
		phone: String
		"user's profile picture"
		avatar: String
	}
`
