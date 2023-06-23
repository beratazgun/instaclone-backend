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
}

export { likesResolver }
