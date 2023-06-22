import bcrypt from 'bcryptjs'

export default class HashOperations {
	hashPassword(password: string) {
		return bcrypt.hashSync(password, 12)
	}

	comparePassword(password: string, hashedPassword: string) {
		return bcrypt.compare(password, hashedPassword)
	}
}
