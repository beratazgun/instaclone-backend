import gql from 'graphql-tag'

const likesSchema = gql`
	type Mutation {
		"Like a post"
		likePost(postReference: String!): Response!
		"Unlike a post"
		unlikePost(postReference: String!): Response!
	}

	type Query {
		"Get all likes"
		likes: [Like]
	}

	type Response {
		"Message  describing the result of the request"
		message: String!
		"Whether the request was successful"
		isSuccess: Boolean!
	}

	type Like {
		id: ID!
		"User who liked the post"
		userId: ID!
		"Which post was liked"
		postId: ID
	}
`

export { likesSchema }
