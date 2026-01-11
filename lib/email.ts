type ResendModule = { Resend: new (apiKey: string) => { emails: { send: (args: any) => Promise<any> } } };

const resendApiKey = process.env.RESEND_API_KEY;

export type SendEmailArgs = {
	to: string;
	subject: string;
	html: string;
	text?: string;
};

function getResendModule(): ResendModule {
	// Avoid TS/bundler module resolution errors in environments where `resend` isn't installed.
	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	const req = eval('require') as (id: string) => unknown;
	return req('resend') as ResendModule;
}

/**
 * Sends an email via Resend.
 *
 * If RESEND_API_KEY (or EMAIL_FROM) is missing, it falls back to logging
 * to the server console (so local/dev can still function).
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs) {
	const from = process.env.EMAIL_FROM;

	if (!resendApiKey || !from) {
		console.log('\n[email] Missing RESEND_API_KEY or EMAIL_FROM. Falling back to console output.');
		console.log(`To: ${to}`);
		console.log(`Subject: ${subject}`);
		if (text) console.log(text);
		console.log(html);
		console.log('[email] end\n');
		return;
	}

	let mod: ResendModule;
	try {
		mod = getResendModule();
	} catch (e) {
		console.log('\n[email] Resend is not installed. Falling back to console output.');
		console.log(`To: ${to}`);
		console.log(`Subject: ${subject}`);
		if (text) console.log(text);
		console.log(html);
		console.log('[email] end\n');
		return;
	}

	const resend = new mod.Resend(resendApiKey);
	await resend.emails.send({ from, to, subject, html, text });
}
