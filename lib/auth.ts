import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { expo } from '@better-auth/expo';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	trustedOrigins: [
		// Use environment-specific trusted origins
		// In production: use BETTER_AUTH_TRUSTED_ORIGINS_PROD
		// In development: use BETTER_AUTH_TRUSTED_ORIGINS_DEV
		...(process.env.NODE_ENV === 'production'
			? (process.env.BETTER_AUTH_TRUSTED_ORIGINS_PROD?.split(',')
					.map((origin) => origin.trim())
					.filter(Boolean) ?? ['https://appleid.apple.com'])
			: (process.env.BETTER_AUTH_TRUSTED_ORIGINS_DEV?.split(',')
					.map((origin) => origin.trim())
					.filter(Boolean) ?? ['https://appleid.apple.com', 'exp://', 'http://localhost:8081', 'http://localhost:3000'])),
	],
	baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
	emailAndPassword: {
		enabled: true,
		// Password reset (dev): log reset link to the server console instead of sending an email.
		sendResetPassword: async ({ user, url }) => {
			void sendEmail({
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
		requireEmailVerification: false,
	},
	redirect: {
		signIn: '/min-side',
		signUp: '/min-side',
		signOut: '/',
	},
	emailVerification: {
		enabled: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			void sendEmail({
				to: user.email,
				subject: 'Bekreft e-postadressen din',
				html: `
					<p>Velkommen! Bekreft e-postadressen din ved å trykke på lenken:</p>
					<p><a href="${url}">Bekreft e-post</a></p>
					<p>Hvis du ikke opprettet en konto hos oss, kan du ignorere denne e-posten.</p>
				`,
				text: `Bekreft e-post: ${url}`,
			});
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationOnSignIn: true, // Send verification email when unverified user tries to sign in
		// Longer token expiry for mobile users who might check email later
		verificationTokenExpiresIn: 60 * 60 * 24, // 24 hours
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
	plugins: [expo()],
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
		windowMs: 60000, // 1 minute (60000ms)
		message: 'Too many requests from this IP, please try again after a minute',
	},
});

export type Session = typeof auth.$Infer.Session;
