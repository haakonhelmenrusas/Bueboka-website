export type EmailLocale = 'no' | 'en';

/**
 * Resolve which locale to use for an outbound email.
 *
 * Priority:
 *   1. User's stored locale preference (from the DB)
 *   2. Accept-Language header from the triggering HTTP request
 *   3. 'no' (Norwegian) as the default
 */
export function resolveEmailLocale(
  userLocale: string | null | undefined,
  request?: Request
): EmailLocale {
  if (userLocale === 'en') return 'en';
  if (userLocale === 'no') return 'no';

  if (request) {
    const acceptLang = request.headers.get('accept-language') ?? '';
    const primary = acceptLang.split(',')[0].split(';')[0].trim().toLowerCase();
    if (primary.startsWith('en')) return 'en';
    if (primary.startsWith('nb') || primary.startsWith('nn') || primary.startsWith('no')) return 'no';
  }

  return 'no';
}
