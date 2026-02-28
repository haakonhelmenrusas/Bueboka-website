'use client';

import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { Practice } from '@/lib/types';

export function usePracticeDetails() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPracticeDetails = useCallback(async (id: string): Promise<Practice | null> => {
		setLoading(true);
		setError(null);
		try {
			// Add timestamp to bust cache
			const timestamp = Date.now();
			const res = await fetch(`/api/practices/${id}/details?_t=${timestamp}`);
			if (!res.ok) {
				setError('Kunne ikke hente trening');
				return null;
			}
			const data = await res.json();
			return (data.practice ?? null) as Practice | null;
		} catch (err) {
			Sentry.captureException(err, { tags: { area: 'PracticesSection', action: 'fetchPracticeDetails' } });
			setError('Kunne ikke hente trening');
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return { fetchPracticeDetails, loading, error };
}
