'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { Arrow, Bow } from '@/lib/types';
import { onEquipmentChanged } from '@/lib/events';

export function useEquipmentData() {
	const [bows, setBows] = useState<Bow[]>([]);
	const [arrows, setArrows] = useState<Arrow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchBows = useCallback(async () => {
		try {
			const res = await fetch('/api/bows');
			if (!res.ok) {
				setError('Kunne ikke hente buer');
				return;
			}
			const data = await res.json();
			setBows(data.bows ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { area: 'EquipmentSection', action: 'fetchBows' } });
			setError(err instanceof Error ? err.message : 'Kunne ikke hente buer');
		}
	}, []);

	const fetchArrows = useCallback(async () => {
		try {
			const res = await fetch('/api/arrows');
			if (!res.ok) {
				setError('Kunne ikke hente piler');
				return;
			}
			const data = await res.json();
			setArrows(data.arrows ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { area: 'EquipmentSection', action: 'fetchArrows' } });
			setError(err instanceof Error ? err.message : 'Kunne ikke hente piler');
		}
	}, []);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await Promise.all([fetchBows(), fetchArrows()]);
		setLoading(false);
	}, [fetchBows, fetchArrows]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		return onEquipmentChanged(() => {
			refresh();
		});
	}, [refresh]);

	return { bows, arrows, loading, error, refresh, refreshBows: fetchBows, refreshArrows: fetchArrows, setBows, setArrows };
}
