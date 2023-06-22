import { mergeTypeDefs } from '@graphql-tools/merge'

import { usersSchema } from './users.schema'

export const typeDefs = mergeTypeDefs([usersSchema])
