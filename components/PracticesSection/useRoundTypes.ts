'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export type RoundTypeItem = {
	id: string;
	name: string;
	environment: string;
	distanceMeters?: number | null;
	targetType?: {
		sizeCm: number;
		type: string;
		scoringZones?: number;
	} | null;
	numberArrows?: number | null;
	arrowsWithoutScore?: number | null;
	roundScore?: number | null;
};

export function useRoundTypes() {
	const [roundTypes, setRoundTypes] = useState<RoundTypeItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchRoundTypes = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/round-types');
			if (!res.ok) {
				if (res.status === 401) {
					setRoundTypes([]);
					return;
				}
				setError('Kunne ikke hente runder');
				return;
			}
			const data = await res.json();
			setRoundTypes(data.roundTypes ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { area: 'useRoundTypes', action: 'fetchRoundTypes' } });
			setError('Kunne ikke hente runder');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRoundTypes();
	}, [fetchRoundTypes]);

	return { roundTypes, loading, error, refresh: fetchRoundTypes };
}
