export const dynamic = 'error'; // ensure static prerender so Netlify can scan it

export default function NetlifyFormsDetectionPage() {
	// This page is intentionally minimal and unstyled.
	// It mirrors your "contact" form so Netlify detects it at build time.
	return (
		<html>
			<head>
				<meta name="robots" content="noindex, nofollow" />
				<title>Netlify Forms Detection</title>
			</head>
			<body>
				<form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
					<input type="hidden" name="form-name" value="contact" />
					<p hidden aria-hidden="true">
						<label>
							Don’t fill this out: <input name="bot-field" />
						</label>
					</p>

					<p>
						<label>
							Navn: <input type="text" name="name" required />
						</label>
					</p>
					<p>
						<label>
							E‑post: <input type="email" name="email" required />
						</label>
					</p>
					<p>
						<label>
							Melding: <textarea name="content" rows={4} required />
						</label>
					</p>
					<p>
						<button type="submit">Send</button>
					</p>
				</form>
			</body>
		</html>
	);
}
