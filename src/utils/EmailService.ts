import * as nodemailer from 'nodemailer'
import * as pug from 'pug'
import * as path from 'path'

interface EmailServiceOptions {
	userData: {
		username?: string
		email?: string
	}
	confirmationToken?: string
	passwordResetToken?: string
}

export default class EmailService {
	public transporter: nodemailer.Transporter

	constructor(public options: EmailServiceOptions) {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT as number | undefined,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		})
	}

	send = async (templateName: string, subject: string, userData: any) => {
		const html = pug.renderFile(
			path.join(__dirname, `../views/email/${templateName}.pug`),
			userData
		)

		const mailOptions = {
			from: 'instacloneAI <instacloneAI@instaclone.io>',
			to: this.options.userData.email,
			subject: subject,
			html: html,
		}
		await this.transporter.sendMail(mailOptions)
	}

	sendConfirmationEmail = async () => {
		this.send('emailConfirm', 'Confirm your email', {
			username: this.options.userData.username,
			confirmationToken: this.options.confirmationToken,
			url: `${process.env.APP_URL}/confirm/${this.options.confirmationToken}`,
		})
	}

	sendForgotPasswordEmail = async () => {
		this.send('forgotPasswordEmail', 'Reset your password', {
			username: this.options.userData.username,
			passwordResetToken: this.options.passwordResetToken,
			url: `${process.env.APP_URL}/password-reset/${this.options.passwordResetToken}`,
		})
	}
}
