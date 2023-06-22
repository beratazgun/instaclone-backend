import { GraphQLFormattedError } from 'graphql/error/GraphQLError'

export function ApolloFormatError(error: GraphQLFormattedError) {
	if (error?.extensions?.code === 'BAD_USER_INPUT') {
		const fieldName = error?.message?.match(/"\$([a-zA-Z0-9_]+)"/)?.[1]

		return {
			message: `${fieldName} variable was not provided.`,
		}
	}

	// if (error?.extensions?.code === 'INTERNAL_SERVER_ERROR') {
	// 	return {
	// 		message: 'Internal Server Error',
	// 	}
	// }

	return error
}
