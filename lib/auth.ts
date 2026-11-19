import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { expo } from '@better-auth/expo';
import { resolveEmailLocale } from './emails/locale';
import { resetPasswordEmail } from './emails/reset-password';
import { verifyEmailEmail } from './emails/verify-email';

// -- Base URL + cookie-security -----------------------------------------------
// baseURL must be the canonical server URL. In development this is localhost.
// In production it is the deployed URL set via BETTER_AUTH_URL.

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

// useSecureCookies must reflect the server's own transport layer, not the
// public-facing URL. The Next.js dev server always uses plain HTTP, so
// __Secure- cookies would be silently dropped by the browser.
//
//   development → HTTP  → false
//   production  → HTTPS → true
const useSecureCookies = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	trustedOrigins: [
		// The Expo app's deep-link scheme must always be trusted so the
		// post-OAuth redirect carries the session cookie correctly.
		'bueboka://',
		...(process.env.NODE_ENV === 'production'
			? process.env.BETTER_AUTH_TRUSTED_ORIGINS_PROD?.split(',')
					.map((origin) => origin.trim())
					.filter(Boolean) || []
			: [
					process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
					...(process.env.BETTER_AUTH_TRUSTED_ORIGINS_DEV?.split(',')
						.map((origin) => origin.trim())
						.filter(Boolean) ?? ['exp://', 'http://localhost:8081', 'http://localhost:3000']),
				]),
	],
	baseURL: baseURL,
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
			const locale = resolveEmailLocale((user as { locale?: string | null }).locale);
			const email = resetPasswordEmail({ name: user.name || '', url, locale, baseUrl });
			void sendEmail({ to: user.email, ...email });
		},
		resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
		revokeSessionsOnPasswordReset: true,
		requireEmailVerification: true,
	},
	redirect: {
		signIn: '/min-side',
		signUp: '/min-side',
		signOut: '/',
	},
	emailVerification: {
		enabled: true,
		sendVerificationEmail: async ({ user, url }, request) => {
			const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
			const locale = resolveEmailLocale(
				(user as { locale?: string | null }).locale,
				request as Request | undefined
			);
			const email = verifyEmailEmail({ name: user.name || '', url, locale, baseUrl });
			void sendEmail({ to: user.email, ...email });
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationOnSignIn: true,
		verificationTokenExpiresIn: 60 * 60 * 24, // 24 hours
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24 * 7,
	},
	advanced: {
		generateId: false,
		useSecureCookies,
		ipAddress: {
			// On Netlify the edge sets x-nf-client-connection-ip to the single
			// client IP (client-supplied values are replaced). The default
			// x-forwarded-for carries multiple hops there and is then rejected,
			// which made the rate limiter fall back to one shared per-path
			// bucket for ALL users. List the Netlify header first so the
			// client IP resolves and buckets are per-IP.
			ipAddressHeaders: ['x-nf-client-connection-ip', 'x-forwarded-for'],
		},
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
	},
	rateLimit: {
		enabled: true,
		maxRequests: 10,
		windowMs: 900000, // 15 minutes
		message: 'Too many requests from this IP, please try again later',
		customRules: {
			// get-session is a read-only, auth-checked endpoint that every API
			// route invokes internally via getCurrentUser. Rate limiting it
			// (10x/15min per bucket) made app launches that fan out several API
			// calls fail with 429/401 under the shared fallback bucket.
			'/get-session': false,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
