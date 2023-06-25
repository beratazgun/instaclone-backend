import gql from 'graphql-tag'

export const postsSchema = gql`
	type Mutation {
		"Creates a new post"
		createPost(caption: String, images: [String]): Response!
		"Update post"
		updatePost(postReference: String, caption: String): Response!
		"Delete post"
		deletePost(postReference: String): Response!
	}

	type Query {
		getPost(postReference: String): PQueryResponse
		getMyPosts: QueryResponseArrayResult
	}

	type Response {
		"Response message"
		message: String!
		"Response status"
		isSuccess: Boolean!
	}

	type PQueryResponse {
		"Response message"
		message: String!
		"Response status"
		isSuccess: Boolean!
		"Post result"
		result: Result
	}

	type QueryResponseArrayResult {
		"Response message"
		message: String!
		"Response status"
		isSuccess: Boolean!
		"Post result"
		result: [Result]
	}

	type Result {
		id: ID!
		"Post's caption"
		caption: String
		"Post's images"
		images: [String]
		"Post's reference"
		postReference: String!
		"Post's user id"
		userId: ID!
		"Post's created date"
		createdAt: String
		"Post's updated date"
		updatedAt: String
	}
`
