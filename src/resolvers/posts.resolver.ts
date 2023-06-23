import { PrismaClient } from '@prisma/client'
import { userKey } from '../services/redis/keys'
import { client } from '../services/redis/client'
import { nanoIdGenerator } from '../utils/Generator'
import { omit } from 'lodash'

const prisma = new PrismaClient()

const postsResolver = {
	Mutation: {
		createPost: async (_: any, args: any, context: any) => {
			const { caption, images } = args

			if (!context.req.session.user) {
				return {
					message: 'You are not logged in',
					isSuccess: false,
				}
			}

			const postReference = nanoIdGenerator('1234567890abcdef', 16)

			const post = await prisma.posts.create({
				data: {
					caption,
					images,
					userId: context.req.session.user.id,
					postReference,
				},
			})

			if (!post) {
				return {
					message: 'Failed to create post',
					isSuccess: false,
				}
			}

			return {
				message: 'Post created',
				isSuccess: true,
			}
		},

		updatePost: async (_: any, args: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged in',
					isSuccess: false,
				}
			}

			const isThePostTheUser = await prisma.posts.findFirst({
				where: {
					postReference: args.postReference,
					userId: context.req.session.user.id,
				},
			})

			if (!isThePostTheUser) {
				return {
					message: 'You are not the owner of the post',
					isSuccess: false,
				}
			}

			await prisma.posts.update({
				where: {
					postReference: args.postReference,
				},
				data: {
					...omit(args, ['postReference']),
				},
			})

			return {
				message: 'Post updated',
				isSuccess: true,
			}
		},

		deletePost: async (_: any, args: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged in',
					isSuccess: false,
				}
			}

			const isThePostTheUser = await prisma.posts.findFirst({
				where: {
					postReference: args.postReference,
					userId: context.req.session.user.id,
				},
			})

			if (!isThePostTheUser) {
				return {
					message: 'You are not the owner of the post',
					isSuccess: false,
				}
			}

			await prisma.posts.delete({
				where: {
					postReference: args.postReference,
				},
			})

			return {
				message: 'Post deleted',
				isSuccess: true,
			}
		},
	},

	Query: {
		getPost: async (_: any, args: any, context: any) => {
			const { postReference } = args

			const post = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!post) {
				return {
					message: 'Post not found',
					isSuccess: false,
				}
			}

			return {
				message: 'Post found',
				isSuccess: true,
				result: post,
			}
		},

		getMyPosts: async (_: any, args: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged in',
					isSuccess: false,
				}
			}

			const posts = await prisma.posts.findMany({
				where: {
					userId: context.req.session.user.id,
				},
			})

			if (!posts) {
				return {
					message: 'You have no posts',
					isSuccess: false,
				}
			}

			return {
				message: 'Posts found',
				isSuccess: true,
				result: posts,
			}
		},
	},
}

export { postsResolver }
