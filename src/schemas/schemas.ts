import { mergeTypeDefs } from '@graphql-tools/merge'
import { usersSchema } from './users.schema'
import { postsSchema } from './posts.schema'
import { commentsSchema } from './comments.schema'
import { likesSchema } from './likes.schema'
import { followersSchema } from './followers.schema'

export const typeDefs = mergeTypeDefs([
	usersSchema,
	postsSchema,
	commentsSchema,
	likesSchema,
	followersSchema,
])
