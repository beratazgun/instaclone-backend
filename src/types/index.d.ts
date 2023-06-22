declare global {
	declare module 'express-session' {
		interface SessionData {
			user: {
				id: string
				username: string
				bio: string
				avatar: string
				email: string
				phone: string
				createdAt: string
				updatedAt: string
			}
		}
	}
}
