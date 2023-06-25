import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const followersResolver = {
	Mutation: {
		followUser: async (_: any, args: any, context: any) => {
			const { leaderId } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to follow a user',
					isSuccess: false,
				}
			}

			if (context.req.session.user.id === leaderId) {
				return {
					message: 'You cannot follow yourself',
					isSuccess: false,
				}
			}

			const alreadyFollowing = await prisma.followers.findFirst({
				where: {
					leaderId,
					followerId: context.req.session.user.id,
				},
			})

			if (alreadyFollowing) {
				return {
					message: 'You are already following this user',
					isSuccess: false,
				}
			}

			const follow = await prisma.followers.create({
				data: {
					leaderId,
					followerId: context.req.session.user.id,
				},
			})

			if (!follow) {
				return {
					message: 'Failed to follow user',
					isSuccess: false,
				}
			}

			return {
				message: 'Successfully followed user',
				isSuccess: true,
			}
		},

		unfollowUser: async (_: any, args: any, context: any) => {
			const { leaderId } = args

			if (!context.req.session.user) {
				return {
					message: 'You must be logged in to unfollow a user',
					isSuccess: false,
				}
			}

			if (context.req.session.user.id === leaderId) {
				return {
					message: 'You cannot unfollow yourself',
					isSuccess: false,
				}
			}

			const notFollowing = await prisma.followers.findFirst({
				where: {
					leaderId,
					followerId: context.req.session.user.id,
				},
			})

			if (!notFollowing) {
				return {
					message: 'You are not following this user',
					isSuccess: false,
				}
			}

			const unfollow = await prisma.followers.delete({
				where: {
					leaderId_followerId: {
						leaderId,
						followerId: context.req.session.user.id,
					},
				},
			})

			if (!unfollow) {
				return {
					message: 'Failed to unfollow user',
					isSuccess: false,
				}
			}

			return {
				message: 'Successfully unfollowed user',
				isSuccess: true,
			}
		},
	},
	Query: {
		getAllFollowers: async (_: any, args: any, context: any) => {
			const { leaderId } = args
			let followersData: object[] = []

			const followers = await prisma.followers.findMany({
				where: {
					leaderId,
				},
				include: {
					follower: true,
				},
			})

			followers.forEach((follower) => {
				followersData.push({
					username: follower.follower.username,
					name: follower.follower.name,
					avatar: follower.follower.avatar,
				})
			})

			if (!followers) {
				return {
					message: 'Failed to get followers',
					isSuccess: false,
				}
			}

			return {
				message: 'Successfully got followers',
				isSuccess: true,
				result: {
					followers: followersData,
					followersCount: followers.length,
				},
			}
		},

		getAllFollowing: async (_: any, args: any, context: any) => {
			const { followingId } = args

			let followingData: object[] = []

			const following = await prisma.followers.findMany({
				where: {
					followerId: followingId,
				},
				include: {
					leader: true,
				},
			})

			following.forEach((follower) => {
				followingData.push({
					username: follower.leader.username,
					name: follower.leader.name,
					avatar: follower.leader.avatar,
				})
			})

			if (!following) {
				return {
					message: 'Failed to get following',
					isSuccess: false,
				}
			}

			return {
				message: 'Successfully got following',
				isSuccess: true,
				result: {
					following: followingData,
					followingCount: following.length,
				},
			}
		},
	},
}

export { followersResolver }
