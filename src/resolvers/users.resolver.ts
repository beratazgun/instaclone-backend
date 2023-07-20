import { PrismaClient } from '@prisma/client'
import HashOperations from '../utils/HashOperations'
import Joi from 'joi'
import crypto from 'crypto'
import EmailService from '../utils/EmailService'
import { userKey } from '../services/redis/keys'
import { client } from '../services/redis/client'

const prisma = new PrismaClient()

const usersResolver = {
	Mutation: {
		signupUser: async (_: any, args: any, context: any) => {
			const { hashPassword } = new HashOperations()

			const {
				name,
				username,
				email,
				gender,
				password,
				passwordConfirmation,
				phone,
				avatar,
			} = args

			let notUnique: string[] = []
			for (const el of ['username', 'email', 'phone']) {
				const check = await prisma.users.findUnique({
					where: {
						[el]: args[el],
					},
				})

				if (check) {
					notUnique.push(el)
				}
			}

			if (notUnique.length > 0) {
				let validationError: { [key: string]: string } = {}

				notUnique.forEach((el) => {
					validationError[el] = `This ${el} is already taken.`
				})

				return {
					message: 'User could not be created.',
					isSuccess: false,
					validationError,
				}
			}

			// Args validation
			const schema = Joi.object({
				name: Joi.string().min(3).max(30).required().messages({
					'string.pattern.base':
						'Name must be at least 3 characters long and contain only letters',
					'string.empty': 'Name is required',
					'any.required': 'Name is required',
					'string.min': 'Name must be at least 3 characters long',
					'string.max': 'Name must be at most 30 characters long',
				}),
				username: Joi.string().alphanum().min(3).max(30).required().messages({
					'string.pattern.base':
						'Username must be at least 3 characters long and contain only letters and numbers',
					'string.empty': 'Username is required',
					'any.required': 'Username is required',
					'string.min': 'Username must be at least 3 characters long',
					'string.max': 'Username must be at most 30 characters long',
				}),
				email: Joi.string().email().required().messages({
					'string.pattern.base': 'Email must be a valid email',
					'string.empty': 'Email is required',
					'any.required': 'Email is required',
					'string.email': 'Email must be a valid email',
				}),
				password: Joi.string()
					.required()
					.pattern(new RegExp('^[a-zA-Z0-9!_*-.]{8,30}$'))
					.messages({
						'string.pattern.base':
							'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
					}),
				passwordConfirmation: Joi.string()
					.valid(Joi.ref('password'))
					.required()
					.strict()
					.messages({
						'any.only': 'Password and password confirmation must be the same',
					}),
				phone: Joi.string().min(11).max(11).required().messages({
					'string.pattern.base': 'Phone number must be a valid phone number',
					'string.empty': 'Phone number is required',
					'any.required': 'Phone number is required',
					'string.min': 'Phone number must be at least 11 characters long',
					'string.max': 'Phone number must be at most 11 characters long',
				}),
				gender: Joi.string().valid('male', 'famele', 'other'),
				avatar: Joi.string(),
			})

			const { error } = schema.validate(
				{
					name,
					username,
					gender,
					email,
					password,
					passwordConfirmation,
					phone,
				},
				{ abortEarly: false }
			)

			if (error) {
				let validationError: { [key: string]: string } = {}

				error.details.forEach((el: any) => {
					validationError[el.context.key] = el.message
				})

				return {
					message: 'User could not be created.',
					isSuccess: false,
					validationError,
				}
			}

			const confirmationTokenExpires = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now
			const confirmationToken = crypto.randomBytes(20).toString('hex')
			const hashconfirmationToken = crypto
				.createHash('sha256')
				.update(confirmationToken)
				.digest('hex')

			const user = await prisma.users.create({
				data: {
					name,
					username,
					email,
					gender,
					password: hashPassword(password),
					confirmationToken: hashconfirmationToken,
					confirmationTokenExpires, // 20 minutes from now
					phone,
					...(avatar === '' ? null : avatar),
				},
			})

			const { sendConfirmationEmail } = new EmailService({
				userData: {
					username,
					email,
				},
				confirmationToken: hashconfirmationToken,
			})

			sendConfirmationEmail()

			return {
				message: 'User created successfully.',
				isSuccess: true,
				result: user,
			}
		},

		signinUser: async (_: any, args: any, context: any) => {
			const { email, password } = args
			const { comparePassword } = new HashOperations()

			const user = await prisma.users.findUnique({
				where: {
					email,
				},
			})

			if (user && (await comparePassword(password, user?.password))) {
				if (!user?.isAccountActive) {
					return {
						message: 'Account is not active. Please confirm your account.',
						isSuccess: false,
					}
				}

				const posts = await prisma.posts.findMany({
					where: {
						userId: user.id,
					},
				})

				const followers = await prisma.followers.findMany({
					where: {
						followerId: user.id,
					},
				})

				const following = await prisma.followers.findMany({
					where: {
						leaderId: user.id,
					},
				})

				context.req.session.user = {
					id: user.id,
					name: user.name,
					username: user.username,
					bio: user.bio,
					avatar: user.avatar,
					gender: user.gender,
					email: user.email,
					phone: user.phone,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					passwordChangedAt: user.passwordChangedAt,
					postsCount: posts.length,
					followersCount: followers.length,
					followingCount: following.length,
					posts,
				}

				// user data's will be stored in redis for caching
				await client.set(
					userKey(user.username),
					JSON.stringify({
						...context.req.session.user,
					})
				)

				return {
					message: 'User signed in successfully.',
					isSuccess: true,
				}
			} else {
				return {
					message: 'Email or password is incorrect.',
					isSuccess: false,
				}
			}
		},

		verifyAccount: async (_: any, args: any, context: any) => {
			const {
				confirmationToken,
			}: {
				confirmationToken: string
			} = args

			const user = await prisma.users.findFirst({
				where: {
					OR: [
						{
							confirmationToken,
						},
						{
							confirmationTokenExpires: {
								gte: new Date(Date.now()),
							},
						},
					],
				},
			})

			if (!user) {
				return {
					message: 'Invalid or expired token.',
					isSuccess: false,
				}
			} else {
				await prisma.users.update({
					where: {
						id: user.id,
					},
					data: {
						isAccountActive: true,
						confirmationToken: null,
						confirmationTokenExpires: null,
					},
				})

				return {
					message: 'Email verified successfully.',
					isSuccess: true,
				}
			}
		},

		resendVerifyEmail: async (_: any, args: any, context: any) => {
			const { email } = args

			const user = await prisma.users.findUnique({
				where: {
					email,
				},
			})

			if (!user) {
				return {
					message: 'User not found.',
					isSuccess: false,
				}
			}

			if (user.isAccountActive) {
				return {
					message: 'Account is already active.',
					isSuccess: false,
				}
			}

			const confirmationTokenExpires = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now
			const confirmationToken = crypto.randomBytes(20).toString('hex')
			const hashConfirmationToken = crypto
				.createHash('sha256')
				.update(confirmationToken)
				.digest('hex')

			await prisma.users.update({
				where: {
					id: user.id,
				},
				data: {
					confirmationToken: hashConfirmationToken,
					confirmationTokenExpires,
				},
			})

			const { sendConfirmationEmail } = new EmailService({
				userData: {
					username: user.username,
					email: user.email,
				},
				confirmationToken: hashConfirmationToken,
			})

			sendConfirmationEmail()

			return {
				message: 'Email sent successfully.',
				isSuccess: true,
			}
		},

		deleteAccount: async (_: any, __: any, context: any) => {
			const { email }: { email: string } = context.req.session.user ?? {
				email: '',
			}
			if (!context.req.session.user) {
				return {
					message: 'You are not logged ın.',
					isSuccess: false,
				}
			}

			// deleting user in db
			const isDeleted = await prisma.users.delete({
				where: {
					email,
				},
			})

			// if there is an error while deleting user
			if (!isDeleted) {
				return {
					message: 'Something went wrong. Please try again.',
					isSuccess: false,
				}
			}

			// session deleted after user deleted
			context.req.session.destroy((err: any) => {
				if (err) {
					return {
						message: 'Something went wrong.',
						isSuccess: false,
					}
				}
			})

			return {
				message: 'Account deleted successfully.',
				isSuccess: true,
			}
		},

		signoutUser: async (_: any, __: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged ın.',
					isSuccess: false,
				}
			}

			context.req.session.destroy((err: any) => {
				if (err) {
					return {
						message: 'Something went wrong.',
						isSuccess: false,
					}
				}
			})

			return {
				message: 'User signed out successfully.',
				isSuccess: true,
			}
		},

		sendForgotPasswordEmail: async (_: any, args: any, context: any) => {
			const passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 60 minutes from now
			const passwordResetToken = crypto.randomBytes(20).toString('hex')
			const hashPasswordResetToken = crypto
				.createHash('sha256')
				.update(passwordResetToken)
				.digest('hex')

			const user = await prisma.users.findUnique({
				where: {
					email: args.email,
				},
			})

			if (!user) {
				return {
					message: 'User not found.',
					isSuccess: false,
				}
			}

			const { sendForgotPasswordEmail } = new EmailService({
				userData: {
					email: user.email,
					username: user.username,
				},
				passwordResetToken,
			})

			const updatedUser = await prisma.users.update({
				where: {
					id: user.id,
				},
				data: {
					passwordResetToken: hashPasswordResetToken,
					passwordResetTokenExpires,
				},
			})

			if (!updatedUser) {
				return {
					message: 'Something went wrong.',
					isSuccess: false,
				}
			}
			sendForgotPasswordEmail()

			return {
				message: 'Forgot password email sent successfully.',
				isSuccess: true,
			}
		},

		resetPasswordForForgot: async (_: any, args: any, context: any) => {
			const { newPassword, newPasswordConfirmation, passwordResetToken } = args
			const { hashPassword, comparePassword } = new HashOperations()

			const user = await prisma.users.findFirst({
				where: {
					OR: [
						{
							passwordResetToken,
						},
						{
							passwordResetTokenExpires: {
								gte: new Date(Date.now()),
							},
						},
					],
				},
			})

			if (!user) {
				return {
					message: 'Invalid or expired token.',
					isSuccess: false,
				}
			}

			if (await comparePassword(newPassword, user.password)) {
				return {
					message: 'New password cannot be the same as the old password.',
					isSuccess: false,
				}
			}

			if (newPassword !== newPasswordConfirmation) {
				return {
					message: 'Passwords do not match.',
					isSuccess: false,
				}
			}

			const updatePassword = await prisma.users.update({
				where: {
					id: user.id,
				},
				data: {
					password: hashPassword(newPassword),
					passwordResetToken: null,
					passwordResetTokenExpires: null,
					passwordChangedAt: new Date(Date.now()),
				},
			})

			if (!updatePassword) {
				return {
					message: 'Something went wrong.',
					isSuccess: false,
				}
			}

			return {
				message: 'Password reset successfully.',
				isSuccess: true,
			}
		},

		ChangePassword: async (_: any, args: any, context: any) => {
			const { oldPassword, newPassword, newPasswordConfirmation } = args
			const { hashPassword, comparePassword } = new HashOperations()

			// Check if user logged in
			if (!context.req.session.user) {
				return {
					message: 'You are not logged ın.',
					isSuccess: false,
				}
			}

			// Args validation
			const schema = Joi.object({
				oldPassword: Joi.string().min(6).max(30).required().messages({
					'string.base': 'Old password should be a string.',
					'string.empty': 'Old password cannot be empty.',
					'string.min': 'Old password should have a minimum length of 6.',
					'string.max': 'Old password should have a maximum length of 30.',
					'any.required': 'Old password is required.',
				}),

				newPassword: Joi.string()
					.min(6)
					.max(30)
					.required()
					.pattern(new RegExp('^[a-zA-Z0-9!_*-.]{8,30}$'))
					.messages({
						'string.base': 'New password should be a string.',
						'string.empty': 'New password cannot be empty.',
						'string.min': 'New password should have a minimum length of 6.',
						'string.max': 'New password should have a maximum length of 30.',
						'any.required': 'New password is required.',
						'string.pattern.base':
							'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
					}),
				newPasswordConfirmation: Joi.string()
					.valid(Joi.ref('newPassword'))
					.required()
					.strict()
					.messages({
						'string.base': 'New password confirmation should be a string.',
						'string.empty': 'New password confirmation cannot be empty.',
						'any.required': 'New password confirmation is required.',
						'any.only':
							'New password and new password confirmation must be the same',
					}),
			})

			const { error } = schema.validate(
				{
					oldPassword,
					newPassword,
					newPasswordConfirmation,
				},
				{ abortEarly: false }
			)

			let validationError: { [key: string]: string } = {}
			if (error) {
				error.details.forEach((err: any) => {
					validationError[err.context.key] = err.message
				})

				return {
					message: 'Password could not be changed.',
					isSuccess: false,
					validationError,
				}
			}

			const user = await prisma.users.findUnique({
				where: {
					email: context.req.session.user.email,
				},
			})

			if (!(await comparePassword(oldPassword, user?.password ?? ''))) {
				return {
					message: 'Password could not be changed.',
					isSuccess: false,
					validationError: {
						oldPassword: 'Old password is incorrect.',
					},
				}
			}

			if (await comparePassword(newPassword, user?.password ?? '')) {
				return {
					message: 'Password could not be changed.',
					isSuccess: false,
					validationError: {
						newPassword: 'New password cannot be the same as the old password.',
					},
				}
			}

			const updatePassword = await prisma.users.update({
				where: {
					id: user?.id,
				},
				data: {
					password: hashPassword(newPassword),
					passwordChangedAt: new Date(Date.now()),
				},
			})

			if (!updatePassword) {
				return {
					message: 'Something went wrong.',
					isSuccess: false,
				}
			}

			return {
				message: 'Password reset successfully.',
				isSuccess: true,
			}
		},

		updateProfile: async (_: any, args: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged ın.',
					isSuccess: false,
				}
			}

			const updateUser = await prisma.users.update({
				where: {
					email: context.req.session.user.email,
				},
				data: {
					...args,
				},
			})

			if (!updateUser) {
				return {
					message: 'Something went wrong.',
					isSuccess: false,
				}
			}

			return {
				message: 'Profile updated successfully.',
				isSuccess: true,
			}
		},
	},
	Query: {
		getUser: async (_: any, args: any, context: any) => {
			const { username } = args
			const checkRedis = await client.get(userKey(username))

			if (checkRedis) {
				return {
					message: 'User found.',
					isSuccess: true,
					result: JSON.parse(checkRedis), // Parse string to JSON. This data comes from redis as a string.
				}
			} else {
				const user = await prisma.users.findFirst({
					where: {
						username,
					},
				})

				if (!user) {
					return {
						message: 'User not found.',
						isSuccess: false,
						result: null,
					}
				}

				// Set data to redis
				await client.set(userKey(username), JSON.stringify(user))

				return {
					message: 'User found.',
					isSuccess: true,
					result: user, // this data comes from POSTGRESQL DB
				}
			}
		},

		getMe: async (_: any, args: any, context: any) => {
			if (!context.req.session.user) {
				return {
					message: 'You are not logged ın.',
					isSuccess: false,
				}
			}

			return {
				message: 'User found.',
				isSuccess: true,
				result: {
					...context.req.session.user,
				},
			}
		},
	},
}

export { usersResolver }
