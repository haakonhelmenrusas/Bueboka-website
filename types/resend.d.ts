declare module 'resend' {
	export class Resend {
		constructor(apiKey: string);
		emails: {
			send: (args: { from: string; to: string | string[]; subject: string; html?: string; text?: string }) => Promise<any>;
		};
	}
}
