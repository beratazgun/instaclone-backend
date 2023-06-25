import gql from 'graphql-tag'

const followersSchema = gql`
	type Mutation {
		"Follow a user"
		followUser(leaderId: ID!): MutateResponse!
		"Unfollow a user"
		unfollowUser(leaderId: ID!): MutateResponse!
	}

	type Query {
		"get all followers data"
		getAllFollowers(leaderId: String): FQueryResponse
		"get all following data"
		getAllFollowing(followingId: String): FQueryResponse
	}

	type MutateResponse {
		"A message to the user"
		message: String!
		"Whether the request was successful or not"
		isSuccess: Boolean!
	}

	type FQueryResponse {
		"A message to the user"
		message: String!
		"Whether the request was successful or not"
		isSuccess: Boolean!
		"The user's followers"
		result: Result
	}

	type Result {
		"The user's followers"
		followers: [Data!]
		"The user's following"
		following: [Data!]
		"The user's followers count"
		followersCount: Int
		"The user's following count"
		followingCount: Int
	}

	type Data {
		"the user's username"
		username: String!
		"the user's profile picture"
		avatar: String!
		"the user's name"
		name: String!
	}

	type Followers {
		id: ID!
		"The user who is following"
		followerId: ID!
		"The user who is being followed"
		leaderId: ID!
		"The date the follower followed the leader"
		createdAt: String!
		"The date the follower unfollowed the leader"
		updatedAt: String!
	}
`

export { followersSchema }
