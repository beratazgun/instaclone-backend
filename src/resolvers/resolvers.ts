import { mergeResolvers } from '@graphql-tools/merge'
import { usersResolver } from './users.resolver'
import { postsResolver } from './posts.resolver'
import { commentsResolver } from './comments.resolver'
import { likesResolver } from './likes.resolver'
import { followersResolver } from './followers.resolver'

export const resolvers = mergeResolvers([
	usersResolver,
	postsResolver,
	commentsResolver,
	likesResolver,
	followersResolver,
])
