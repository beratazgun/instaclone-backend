import gql from 'graphql-tag'

const commentsSchema = gql`
	type Query {
		"Get all comments"
		comments: [Comments!]!
	}

	type Mutation {
		"Create a new comment"
		createComment(
			"The contents of the comment"
			contents: String!
			"The post the comment belongs to"
			postReference: String
		): Response!
		"Delete a comment"
		deleteComment(id: ID!): Response!
		"Update a comment"
		updateComment(id: ID!, contents: String!): Response!
	}

	type Response {
		"Whether the request was successful or not"
		success: Boolean!
		"The message returned from the request"
		message: String
	}

	type Comments {
		id: ID!
		"The contents of the comment"
		contents: String!
		"The date and time the comment was created"
		createdAt: String!
		"The date and time the comment was last updated"
		updatedAt: String!
		"The user who created the comment"
		userId: ID!
		"The post the comment belongs to"
		postId: ID!
	}
`

export { commentsSchema }

// id
// contents
// createdAt
// updatedAt
// userId
// postId
