import { verifyEmailEmail } from './verify-email';

const BASE = { name: 'Haakon', url: 'https://bueboka.no/verify?token=abc', baseUrl: 'https://bueboka.no' };

describe('verifyEmailEmail', () => {
	describe('Norwegian (no)', () => {
		const result = verifyEmailEmail({ ...BASE, locale: 'no' });

		it('has the correct subject', () => {
			expect(result.subject).toBe('Bekreft e-postadressen din - Bueboka');
		});

		it('html contains the Norwegian heading', () => {
			expect(result.html).toContain('Velkommen til Bueboka!');
		});

		it('html contains the user name', () => {
			expect(result.html).toContain('Haakon');
		});

		it('html contains the verification URL', () => {
			expect(result.html).toContain(BASE.url);
		});

		it('html contains the Norwegian button text', () => {
			expect(result.html).toContain('Bekreft e-postadresse');
		});

		it('html sets lang="nb"', () => {
			expect(result.html).toContain('lang="nb"');
		});

		it('html contains the logo image from baseUrl', () => {
			expect(result.html).toContain(`${BASE.baseUrl}/assets/logo.png`);
		});

		it('text contains the verification URL', () => {
			expect(result.text).toContain(BASE.url);
		});

		it('text is plain with no HTML tags', () => {
			expect(result.text).not.toMatch(/<[^>]+>/);
		});
	});

	describe('English (en)', () => {
		const result = verifyEmailEmail({ ...BASE, locale: 'en' });

		it('has the correct subject', () => {
			expect(result.subject).toBe('Verify your email address - Bueboka');
		});

		it('html contains the English heading', () => {
			expect(result.html).toContain('Welcome to Bueboka!');
		});

		it('html contains the English button text', () => {
			expect(result.html).toContain('Verify email address');
		});

		it('html sets lang="en"', () => {
			expect(result.html).toContain('lang="en"');
		});

		it('html contains the verification URL', () => {
			expect(result.html).toContain(BASE.url);
		});

		it('text contains the English greeting', () => {
			expect(result.text).toContain('Hi Haakon!');
		});

		it('text contains the verification URL', () => {
			expect(result.text).toContain(BASE.url);
		});
	});

	describe('name fallback', () => {
		it('handles an empty name without crashing', () => {
			const result = verifyEmailEmail({ ...BASE, name: '', locale: 'en' });
			expect(result.html).toBeDefined();
			expect(result.text).toBeDefined();
		});
	});
});
