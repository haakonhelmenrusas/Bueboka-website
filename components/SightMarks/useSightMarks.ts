import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { SightMark } from '@/types/SightMarks';

export function useSightMarks() {
	const [sightMarks, setSightMarks] = useState<SightMark[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSightMarks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/sight-marks');
			if (!res.ok) {
				setError('Failed to fetch sight marks');
				return;
			}
			const data = await res.json();
			setSightMarks(data.sightMarks || []);
		} catch (err) {
			Sentry.captureException(err, { tags: { hook: 'useSightMarks' } });
			setError('An error occurred');
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteSightMark = useCallback(async (id: string) => {
		try {
			const res = await fetch(`/api/sight-marks/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				setError('Failed to delete sight mark');
				return;
			}
			setSightMarks((prev) => prev.filter((sm) => sm.id !== id));
		} catch (err) {
			Sentry.captureException(err, { tags: { hook: 'useSightMarks', action: 'delete' } });
			setError('An error occurred');
		}
	}, []);

	const clearError = useCallback(() => setError(null), []);

	return { sightMarks, loading, error, fetchSightMarks, deleteSightMark, clearError };
}
