import gql from 'graphql-tag'

const commentsSchema = gql`
	type Query {
		"Get all comments"
		getPostsComments(postReference: String): CQueryResponse!
	}

	type Mutation {
		"Create a new comment"
		createComment(
			"The contents of the comment"
			contents: String!
			"The post the comment belongs to"
			postReference: String
		): MutationResponse!
		"Delete a comment"
		deleteComment(id: ID!): MutationResponse!
		"Update a comment"
		updateComment(id: ID!, contents: String!): MutationResponse!
	}

	type MutationResponse {
		"The message returned from the request"
		message: String
		"Whether the request was successful or not"
		isSuccess: Boolean!
	}

	type CQueryResponse {
		"The message returned from the request"
		message: String
		"Whether the request was successful or not"
		isSuccess: Boolean!
		"The data returned from the request"
		result: [Comments]
	}

	type Comments {
		id: ID!
		"The contents of the comment"
		contents: String
		"The date and time the comment was created"
		createdAt: String
		"The date and time the comment was last updated"
		updatedAt: String
		"The user who created the comment"
		userId: ID
		"The post the comment belongs to"
		postId: ID
	}
`

export { commentsSchema }
