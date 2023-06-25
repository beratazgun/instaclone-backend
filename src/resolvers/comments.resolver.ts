import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const commentsResolver = {
	Mutation: {
		createComment: async (_: any, args: any, context: any) => {
			const { contents, postReference } = args

			const postId = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!postId) {
				return {
					message: 'The post you are trying to comment on does not exist',
					isSuccess: false,
				}
			}

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to create a comment',
					isSuccess: false,
				}
			}

			const comment = await prisma.comments.create({
				data: {
					contents,
					postId: postId.id,
					userId: context.req.session.user.id,
				},
			})

			if (!comment) {
				return {
					message: 'Something went wrong while creating your comment',
					isSuccess: false,
				}
			}

			return {
				message: 'Comment created successfully',
				isSuccess: true,
			}
		},

		deleteComment: async (_: any, args: any, context: any) => {
			const { id } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to delete a comment',
					isSuccess: false,
				}
			}

			const comment = await prisma.comments.findUnique({
				where: {
					id,
				},
			})

			if (!comment) {
				return {
					message: 'The comment you are trying to delete does not exist',
					isSuccess: false,
				}
			}

			if (comment.userId !== context.req.session.user.id) {
				return {
					message: 'You do not have permission to delete this comment',
					isSuccess: false,
				}
			}

			await prisma.comments.delete({
				where: {
					id,
				},
			})

			return {
				message: 'Comment deleted successfully',
				isSuccess: true,
			}
		},

		updateComment: async (_: any, args: any, context: any) => {
			const { id, contents } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to update a comment',
					isSuccess: false,
				}
			}

			const comment = await prisma.comments.findUnique({
				where: {
					id,
				},
			})

			if (!comment) {
				return {
					message: 'The comment you are trying to update does not exist',
					isSuccess: false,
				}
			}

			if (comment.userId !== context.req.session.user.id) {
				return {
					message: 'You do not have permission to update this comment',
					isSuccess: false,
				}
			}

			await prisma.comments.update({
				where: {
					id,
				},
				data: {
					contents,
				},
			})

			return {
				message: 'Comment updated successfully',
				isSuccess: true,
			}
		},
	},
	Query: {
		getPostsComments: async (_: any, args: any) => {
			const { postReference } = args

			const postId = await prisma.posts.findUnique({
				where: {
					postReference,
				},
			})

			if (!postId) {
				return {
					message: 'The post you are trying to get comments for does not exist',
					isSuccess: false,
				}
			}

			const comments = await prisma.comments.findMany({
				where: {
					postId: postId.id,
				},
			})

			if (!comments) {
				return {
					message: 'Something went wrong while getting comments',
					isSuccess: false,
				}
			}

			return {
				message: 'Comments retrieved successfully',
				isSuccess: true,
				result: comments,
			}
		},
	},
}

export { commentsResolver }
