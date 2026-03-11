import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

export async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { where: 'getCurrentUser' } });
		return null;
	}
}
