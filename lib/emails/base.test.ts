import { buildEmailHtml } from './base';

const OPTS = {
	lang: 'en',
	baseUrl: 'https://bueboka.no',
	heading: 'Test heading',
	greeting: 'Hi there!',
	body: 'This is the body text.',
	buttonText: 'Click me',
	buttonUrl: 'https://bueboka.no/action?token=xyz',
	fallbackLinkLabel: 'Or paste this link:',
	footerNote: 'If this was not you, ignore this email.',
	expiryNote: 'This link expires in 30 minutes.',
	brandTagline: 'Your archery log.',
};

describe('buildEmailHtml', () => {
	let html: string;

	beforeAll(() => {
		html = buildEmailHtml(OPTS);
	});

	it('returns a non-empty string', () => {
		expect(typeof html).toBe('string');
		expect(html.length).toBeGreaterThan(0);
	});

	it('sets the correct lang attribute', () => {
		expect(html).toContain('lang="en"');
	});

	it('contains the heading', () => {
		expect(html).toContain('Test heading');
	});

	it('contains the greeting', () => {
		expect(html).toContain('Hi there!');
	});

	it('contains the body text', () => {
		expect(html).toContain('This is the body text.');
	});

	it('contains the button text', () => {
		expect(html).toContain('Click me');
	});

	it('contains the button URL as an href', () => {
		expect(html).toContain(`href="${OPTS.buttonUrl}"`);
	});

	it('contains the button URL as a fallback text link', () => {
		expect(html).toContain(OPTS.buttonUrl);
	});

	it('contains the fallback link label', () => {
		expect(html).toContain('Or paste this link:');
	});

	it('contains the footer note', () => {
		expect(html).toContain('If this was not you, ignore this email.');
	});

	it('contains the expiry note', () => {
		expect(html).toContain('This link expires in 30 minutes.');
	});

	it('contains the brand tagline', () => {
		expect(html).toContain('Your archery log.');
	});

	it('contains the logo image pointing to baseUrl', () => {
		expect(html).toContain(`${OPTS.baseUrl}/assets/logo.png`);
	});

	it('contains the current year in the brand footer', () => {
		expect(html).toContain(String(new Date().getFullYear()));
	});

	it('sets lang="nb" when passed "nb"', () => {
		const result = buildEmailHtml({ ...OPTS, lang: 'nb' });
		expect(result).toContain('lang="nb"');
	});
});
