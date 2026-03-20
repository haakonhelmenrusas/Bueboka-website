'use client';

import { useCallback, useState } from 'react';
import type { Practice } from '@/lib/types';

export function usePracticeDetails() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPracticeDetails = useCallback(async (id: string, practiceType?: string): Promise<Practice | null> => {
		setLoading(true);
		setError(null);
		try {
			// Add timestamp to bust cache
			const timestamp = Date.now();

			// Determine which endpoint to call based on practiceType
			const endpoint =
				practiceType === 'KONKURRANSE' ? `/api/competitions/${id}/details?_t=${timestamp}` : `/api/practices/${id}/details?_t=${timestamp}`;

			const res = await fetch(endpoint);

			if (!res.ok) {
				setError('Kunne ikke hente detaljer');
				return null;
			}
			const data = await res.json();
			return (data.practice ?? null) as Practice | null;
		} catch (err) {
			setError('Kunne ikke hente detaljer');
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return { fetchPracticeDetails, loading, error };
}
