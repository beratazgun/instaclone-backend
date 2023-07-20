import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const likesResolver = {
	Mutation: {
		likePost: async (_: any, args: any, context: any) => {
			const { postReference } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to like a post',
					isSuccess: false,
				}
			}

			const postId = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!postId) {
				return {
					message: 'The post you are trying to like does not exist',
					isSuccess: false,
				}
			}

			const checkIfLiked = await prisma.likes.findFirst({
				where: {
					postId: postId.id,
					userId: context.req.session.user.id,
				},
			})

			if (checkIfLiked) {
				return {
					message: 'You have already liked this post',
					isSuccess: false,
				}
			}

			const like = await prisma.likes.create({
				data: {
					postId: postId.id,
					userId: context.req.session.user.id,
				},
			})

			if (!like) {
				return {
					message: 'Something went wrong while liking the post',
					isSuccess: false,
				}
			}

			return {
				message: 'Post liked successfully',
				isSuccess: true,
			}
		},

		unlikePost: async (_: any, args: any, context: any) => {
			const { postReference } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to unlike a post',
					isSuccess: false,
				}
			}

			const postId = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!postId) {
				return {
					message: 'The post you are trying to unlike does not exist',
					isSuccess: false,
				}
			}

			const checkIfLiked = await prisma.likes.findFirst({
				where: {
					postId: postId.id,
					userId: context.req.session.user.id,
				},
			})

			if (!checkIfLiked) {
				return {
					message: 'You have not liked this post',
					isSuccess: false,
				}
			}

			const unlike = await prisma.likes.delete({
				where: {
					id: checkIfLiked.id,
				},
			})

			if (!unlike) {
				return {
					message: 'Something went wrong while unliking the post',
					isSuccess: false,
				}
			}

			return {
				message: 'Post unliked successfully',
				isSuccess: true,
			}
		},
	},
	Query: {
		getPostsLikes: async (_: any, args: any, context: any) => {
			const { postReference } = args

			const postId = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!postId) {
				return {
					message: 'The post you are trying to get likes for does not exist',
					isSuccess: false,
				}
			}

			const likes = await prisma.likes.findMany({
				where: {
					postId: postId.id,
				},
			})

			const likedBy: {
				name: string
				username: string
				avatar: string
			}[] = []

			const users = await prisma.users.findMany({
				where: {
					id: {
						in: likes.map((like: { userId: string }) => like.userId),
					},
				},
			})

			users.forEach((user: { name: any; username: any; avatar: any }) => {
				likedBy.push({
					name: user.name,
					username: user.username,
					avatar: user.avatar,
				})
			})

			if (!likes) {
				return {
					message: 'Something went wrong while getting likes for the post',
					isSuccess: false,
				}
			}

			return {
				message: 'Likes retrieved successfully',
				isSuccess: true,
				result: {
					likesCount: likes.length,
					likedBy,
				},
			}
		},
	},
}

export { likesResolver }
