'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Arrow, Bow } from '@/lib/types';
import { onEquipmentChanged } from '@/lib/events';

export function useEquipmentData() {
	const [bows, setBows] = useState<Bow[]>([]);
	const [arrows, setArrows] = useState<Arrow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/equipment?t=${Date.now()}`);
			if (!res.ok) {
				setError('Kunne ikke hente utstyr');
				return;
			}
			const data = await res.json();
			setBows(data.bows ?? []);
			setArrows(data.arrows ?? []);
		} catch (err) {
			setError('Kunne ikke hente utstyr');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		return onEquipmentChanged(refresh);
	}, [refresh]);

	return { bows, arrows, loading, error, refresh, setBows, setArrows };
}
