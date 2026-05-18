import { resolveEmailLocale } from './locale';

function makeRequest(acceptLanguage: string): Request {
	return {
		headers: {
			get: (key: string) => (key === 'accept-language' ? acceptLanguage : null),
		},
	} as unknown as Request;
}

describe('resolveEmailLocale', () => {
	describe('stored user locale', () => {
		it('returns "no" when stored locale is "no"', () => {
			expect(resolveEmailLocale('no')).toBe('no');
		});

		it('returns "en" when stored locale is "en"', () => {
			expect(resolveEmailLocale('en')).toBe('en');
		});

		it('stored locale takes priority over Accept-Language header', () => {
			expect(resolveEmailLocale('no', makeRequest('en'))).toBe('no');
			expect(resolveEmailLocale('en', makeRequest('nb-NO'))).toBe('en');
		});

		it('ignores unrecognised stored locale and falls through', () => {
			// 'fr' is not a supported locale — should not return 'fr'
			const result = resolveEmailLocale('fr');
			expect(['no', 'en']).toContain(result);
		});
	});

	describe('Accept-Language fallback', () => {
		it('returns "en" for "en" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('en'))).toBe('en');
		});

		it('returns "en" for "en-US" Accept-Language', () => {
			expect(resolveEmailLocale(undefined, makeRequest('en-US'))).toBe('en');
		});

		it('returns "en" for "en-US,en;q=0.9" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('en-US,en;q=0.9'))).toBe('en');
		});

		it('returns "no" for "nb" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('nb'))).toBe('no');
		});

		it('returns "no" for "nb-NO" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('nb-NO,nb;q=0.9'))).toBe('no');
		});

		it('returns "no" for "nn-NO" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('nn-NO'))).toBe('no');
		});

		it('returns "no" for "no" Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('no'))).toBe('no');
		});
	});

	describe('defaults', () => {
		it('defaults to "no" when locale is null and no request', () => {
			expect(resolveEmailLocale(null)).toBe('no');
		});

		it('defaults to "no" when locale is undefined and no request', () => {
			expect(resolveEmailLocale(undefined)).toBe('no');
		});

		it('defaults to "no" for unrecognised Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest('fr-FR'))).toBe('no');
			expect(resolveEmailLocale(null, makeRequest('de'))).toBe('no');
		});

		it('defaults to "no" for empty Accept-Language', () => {
			expect(resolveEmailLocale(null, makeRequest(''))).toBe('no');
		});
	});
});
