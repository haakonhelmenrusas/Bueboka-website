import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { expo } from '@better-auth/expo';

// -- Base URL + cookie-security -----------------------------------------------
// baseURL must be the canonical server URL that Google (and other OAuth
// providers) can redirect to.  Only loopback addresses (localhost/127.0.0.1)
// receive special dev treatment from Google — all other private IPs
// (192.168.x.x, 10.x.x.x …) are rejected with:
//   "device_id and device_name are required for private IP"
//
// BETTER_AUTH_URL_MOBILE is the LAN IP of the dev machine
// (e.g. http://192.168.x.x:3000).  It is added to trustedOrigins so the
// Expo app can call server APIs from a physical device, but it MUST NOT
// become the baseURL because that puts the private IP into the OAuth
// redirect_uri, which Google refuses.
//
// OAuth on physical devices — options:
//   A) Test on iOS Simulator  (can reach the host's localhost:3000 directly)
//   B) Test on Android Emulator  →  BETTER_AUTH_URL=http://10.0.2.2:3000
//      (Android's special alias for the host machine)
//   C) Use a public HTTPS tunnel for physical-device + Google OAuth:
//        1.  npx ngrok http 3000          (or: cloudflare tunnel, ssh -R …)
//        2.  BETTER_AUTH_URL=https://<tunnel>.ngrok.io  (restart dev server)
//        3.  Add https://<tunnel>.ngrok.io/api/auth/callback/google
//            to Google Console → Authorised Redirect URIs
//        4.  Add https://<tunnel>.ngrok.io
//            to Google Console → Authorised JavaScript Origins
//        Keep BETTER_AUTH_URL_MOBILE=http://192.168.x.x:3000 so non-OAuth
//        API calls from the device continue to be trusted.

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

// The Next.js server ALWAYS listens on plain HTTP (localhost:3000).
// The HTTPS layer lives in the reverse proxy (ngrok, nginx, Netlify edge …).
// useSecureCookies must reflect the server's own transport, NOT the public
// baseURL protocol — if we derive it from baseURL we get __Secure- cookies
// that the server tries to set over HTTP, which browsers silently drop,
// breaking every downstream cookie read (state, session, etc.).
//
// Rule of thumb:
//   development → HTTP server  → false  (works for localhost, LAN IP, ngrok)
//   production  → HTTPS server → true   (Netlify / any properly TLS-terminated host)
const useSecureCookies = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	trustedOrigins: [
		// The Expo app's deep-link scheme must ALWAYS be trusted (dev + prod).
		// The expo plugin's after-hook checks isTrustedOrigin(callbackURL) before
		// it appends the session cookie to the post-OAuth redirect URL.
		// Without this, openAuthSessionAsync receives a bare bueboka:// link,
		// the cookie is never transferred, and the user appears logged-out.
		'bueboka://',
		...(process.env.NODE_ENV === 'production'
			? // Production: explicit allow-list only
			  process.env.BETTER_AUTH_TRUSTED_ORIGINS_PROD?.split(',')
					.map((origin) => origin.trim())
					.filter(Boolean) || []
			: [
					// Always trust the standard web URL for browser-based dev.
					process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
					// Trust the LAN/device URL so the Expo app can call server APIs
					// from a physical device (non-OAuth calls: practices, profile, etc.)
					...(process.env.BETTER_AUTH_URL_MOBILE
						? [process.env.BETTER_AUTH_URL_MOBILE]
						: []),
					// Any additional origins from .env (Expo dev server, deep-link scheme, etc.)
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
		sendVerificationOnSignIn: true, // Send verification email when unverified user tries to sign in
		// Longer token expiry for mobile users who might check email later
		verificationTokenExpiresIn: 60 * 60 * 24, // 24 hours
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes: session data cached in a signed cookie, no DB hit
		},
	},
	account: {
		// The signed state-cookie is a secondary CSRF guard on top of the primary
		// DB-stored state verification.  In the Expo OAuth flow the proxy endpoint
		// is called from the LAN IP (http://192.168.x.x:3000) while the callback
		// arrives at the public URL (https://ngrok / production domain) — a
		// different cookie domain, so the browser never sends the cookie back.
		// Disabling the check is safe because:
		//   1. State is still stored in and looked up from the DB (primary check).
		//   2. PKCE (code_challenge / code_verifier) prevents code-injection attacks.
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
