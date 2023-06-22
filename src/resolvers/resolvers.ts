import { mergeResolvers } from '@graphql-tools/merge'
import { usersResolvers } from './users.resolver'

export const resolvers = mergeResolvers([usersResolvers])
