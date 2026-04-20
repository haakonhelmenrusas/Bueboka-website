import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { expo } from '@better-auth/expo';

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
		// Password reset (dev): log reset link to the server console instead of sending an email.
		sendResetPassword: async ({ user, url }) => {
			const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
			void sendEmail({
				to: user.email,
				subject: 'Tilbakestill passord - Bueboka',
				html: `
					<!DOCTYPE html>
					<html lang="no">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Tilbakestill passord</title>
					</head>
					<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2;">
						<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 40px 20px;">
							<tr>
								<td align="center">
									<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
										<!-- Header with logo -->
										<tr>
											<td style="background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); padding: 40px; text-align: center;">
												<img src="${baseUrl}/assets/logo.png" alt="Bueboka" style="max-width: 120px; height: auto; margin-bottom: 20px;">
												<h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Tilbakestill passord</h1>
											</td>
										</tr>
										<!-- Content -->
										<tr>
											<td style="padding: 40px 40px 30px;">
												<p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hei ${user.name || 'der'}!</p>
												<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
													Du ba om å tilbakestille passordet ditt for Bueboka-kontoen din. Klikk på knappen nedenfor for å velge et nytt passord:
												</p>
												<!-- Button -->
												<table width="100%" cellpadding="0" cellspacing="0">
													<tr>
														<td align="center" style="padding: 20px 0;">
															<a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(5, 53, 70, 0.3);">
																Velg nytt passord
															</a>
														</td>
													</tr>
												</table>
												<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
													Eller kopier og lim inn denne lenken i nettleseren din:
												</p>
												<p style="color: #0c82ac; font-size: 14px; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">
													${url}
												</p>
											</td>
										</tr>
										<!-- Footer -->
										<tr>
											<td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
												<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
													Hvis du ikke ba om å tilbakestille passordet, kan du trygt ignorere denne e-posten. Passordet ditt vil ikke bli endret.
												</p>
												<p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
													Denne lenken utløper om 30 minutter av sikkerhetsgrunner.
												</p>
											</td>
										</tr>
										<!-- Brand footer -->
										<tr>
											<td style="background-color: #053546; padding: 20px; text-align: center;">
												<p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0;">
													© ${new Date().getFullYear()} Bueboka. Din digitale bueskytter-treningsdagbok.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`,
				text: `Tilbakestill passord for Bueboka\n\nDu ba om å tilbakestille passordet ditt. Klikk på lenken for å velge et nytt passord: ${url}\n\nHvis du ikke ba om dette, kan du ignorere denne e-posten.\n\nLenken utløper om 30 minutter.\n\nMed vennlig hilsen,\nBueboka`,
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
			const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
			void sendEmail({
				to: user.email,
				subject: 'Bekreft e-postadressen din - Bueboka',
				html: `
					<!DOCTYPE html>
					<html lang="no">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Bekreft e-post</title>
					</head>
					<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2;">
						<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 40px 20px;">
							<tr>
								<td align="center">
									<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
										<!-- Header with logo -->
										<tr>
											<td style="background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); padding: 40px; text-align: center;">
												<img src="${baseUrl}/assets/logo.png" alt="Bueboka" style="max-width: 120px; height: auto; margin-bottom: 20px;">
												<h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Velkommen til Bueboka!</h1>
											</td>
										</tr>
										<!-- Content -->
										<tr>
											<td style="padding: 40px 40px 30px;">
												<p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hei ${user.name || 'der'}!</p>
												<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
													Takk for at du opprettet en konto hos Bueboka. For å komme i gang, vennligst bekreft e-postadressen din ved å klikke på knappen nedenfor:
												</p>
												<!-- Button -->
												<table width="100%" cellpadding="0" cellspacing="0">
													<tr>
														<td align="center" style="padding: 20px 0;">
															<a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(5, 53, 70, 0.3);">
																Bekreft e-postadresse
															</a>
														</td>
													</tr>
												</table>
												<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
													Eller kopier og lim inn denne lenken i nettleseren din:
												</p>
												<p style="color: #0c82ac; font-size: 14px; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">
													${url}
												</p>
											</td>
										</tr>
										<!-- Footer -->
										<tr>
											<td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
												<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
													Hvis du ikke opprettet en konto hos Bueboka, kan du trygt ignorere denne e-posten.
												</p>
												<p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
													Denne lenken utløper om 24 timer.
												</p>
											</td>
										</tr>
										<!-- Brand footer -->
										<tr>
											<td style="background-color: #053546; padding: 20px; text-align: center;">
												<p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0;">
													© ${new Date().getFullYear()} Bueboka. Din digitale bueskytter-treningsdagbok.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`,
				text: `Velkommen til Bueboka!\n\nBekreft e-postadressen din ved å klikke på lenken: ${url}\n\nHvis du ikke opprettet en konto hos oss, kan du ignorere denne e-posten.\n\nMed vennlig hilsen,\nBueboka`,
			});
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationOnSignIn: true,
		verificationTokenExpiresIn: 60 * 60 * 24, // 24 hours
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	account: {
		skipStateCookieCheck: true,
	},
	advanced: {
		generateId: false,
		useSecureCookies,
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
		maxRequests: 100,
		windowMs: 60000, // 1 minute (60000ms)
		message: 'Too many requests from this IP, please try again after a minute',
	},
});

export type Session = typeof auth.$Infer.Session;
