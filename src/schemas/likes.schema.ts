import gql from 'graphql-tag'

const likesSchema = gql`
	type Mutation {
		"Like a post"
		likePost(postReference: String!): MutationResponse!
		"Unlike a post"
		unlikePost(postReference: String!): MutationResponse!
	}

	type Query {
		"Get all likes"
		getPostsLikes(postReference: String!): LQueryResponse!
	}

	type MutationResponse {
		"Message  describing the result of the request"
		message: String!
		"Whether the request was successful"
		isSuccess: Boolean!
	}

	type LQueryResponse {
		"Message  describing the result of the request"
		message: String!
		"Whether the request was successful"
		isSuccess: Boolean!
		"Likes"
		result: Result
	}

	type Result {
		"Likes"
		likesCount: Int!
		"who liked the post"
		likedBy: [User!]!
	}

	type User {
		"User's username"
		username: String!
		"User's name"
		name: String!
		"User's avatar"
		avatar: String!
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
