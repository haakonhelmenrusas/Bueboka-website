import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
	emailAndPassword: {
		enabled: true,
		// Password reset (dev): log reset link to the server console instead of sending an email.
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: 'Tilbakestill passord',
				html: `
					<p>Du ba om å tilbakestille passordet ditt.</p>
					<p><a href="${url}">Trykk her for å velge nytt passord</a></p>
					<p>Hvis du ikke ba om dette kan du ignorere denne e-posten.</p>
				`,
				text: `Tilbakestill passord: ${url}`,
			});
		},
		resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
		// You can enable this later if you want to sign out all devices after reset.
		revokeSessionsOnPasswordReset: false,
	},
	redirect: {
		signIn: '/min-side',
		signUp: '/min-side',
		signOut: '/',
	},
	emailVerification: {
		enabled: true,
		sendVerificationEmail: async ({ user, token }) => {
			const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
			const verifyUrl = `${baseURL}/verify-email?token=${token}`;

			await sendEmail({
				to: user.email,
				subject: 'Bekreft e-postadressen din',
				html: `
					<p>Velkommen! Bekreft e-postadressen din ved å trykke på lenken:</p>
					<p><a href="${verifyUrl}">Bekreft e-post</a></p>
				`,
				text: `Bekreft e-post: ${verifyUrl}`,
			});
		},
		autoSignInAfterVerification: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	advanced: {
		generateId: false,
		crossSubDomainCookies: {
			enabled: false,
		},
	},
	plugins: [],
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		},
		apple: {
			clientId: process.env.APPLE_CLIENT_ID || '',
			clientSecret: process.env.APPLE_CLIENT_SECRET || '',
		},
	},
	rateLimit: {
		enabled: true,
		maxRequests: 100,
		windowMs: 60,
		message: 'Too many requests from this IP, please try again after an hour',
	},
});

export type Session = typeof auth.$Infer.Session;
