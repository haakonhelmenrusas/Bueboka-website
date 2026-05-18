import { resetPasswordEmail } from './reset-password';

const BASE = { name: 'Haakon', url: 'https://bueboka.no/reset?token=abc', baseUrl: 'https://bueboka.no' };

describe('resetPasswordEmail', () => {
	describe('Norwegian (no)', () => {
		const result = resetPasswordEmail({ ...BASE, locale: 'no' });

		it('has the correct subject', () => {
			expect(result.subject).toBe('Tilbakestill passord - Bueboka');
		});

		it('html contains the Norwegian heading', () => {
			expect(result.html).toContain('Tilbakestill passord');
		});

		it('html contains the user name', () => {
			expect(result.html).toContain('Haakon');
		});

		it('html contains the reset URL', () => {
			expect(result.html).toContain(BASE.url);
		});

		it('html contains the Norwegian button text', () => {
			expect(result.html).toContain('Velg nytt passord');
		});

		it('html sets lang="nb"', () => {
			expect(result.html).toContain('lang="nb"');
		});

		it('html contains the logo image from baseUrl', () => {
			expect(result.html).toContain(`${BASE.baseUrl}/assets/logo.png`);
		});

		it('text contains the reset URL', () => {
			expect(result.text).toContain(BASE.url);
		});

		it('text contains the user name', () => {
			expect(result.text).toContain('Haakon');
		});

		it('text is plain with no HTML tags', () => {
			expect(result.text).not.toMatch(/<[^>]+>/);
		});
	});

	describe('English (en)', () => {
		const result = resetPasswordEmail({ ...BASE, locale: 'en' });

		it('has the correct subject', () => {
			expect(result.subject).toBe('Reset your password - Bueboka');
		});

		it('html contains the English heading', () => {
			expect(result.html).toContain('Reset your password');
		});

		it('html contains the English button text', () => {
			expect(result.html).toContain('Choose new password');
		});

		it('html sets lang="en"', () => {
			expect(result.html).toContain('lang="en"');
		});

		it('html contains the reset URL', () => {
			expect(result.html).toContain(BASE.url);
		});

		it('text contains the English greeting', () => {
			expect(result.text).toContain('Hi Haakon!');
		});

		it('text contains the reset URL', () => {
			expect(result.text).toContain(BASE.url);
		});
	});

	describe('name fallback', () => {
		it('handles an empty name without crashing', () => {
			const result = resetPasswordEmail({ ...BASE, name: '', locale: 'en' });
			expect(result.html).toBeDefined();
			expect(result.text).toBeDefined();
		});
	});
});
