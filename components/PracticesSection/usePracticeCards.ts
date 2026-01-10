'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export type PracticeCardItem = { id: string; date: string; arrowsShot: number };

interface PracticeCardsResponse {
	practices: PracticeCardItem[];
	page: number;
	pageSize: number;
	total: number;
}

export function usePracticeCards({ pageSize = 10 }: { pageSize?: number } = {}) {
	const [cards, setCards] = useState<PracticeCardItem[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const inFlightRef = useRef(false);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
	const showPagination = total > pageSize;

	const fetchPage = useCallback(
		async (nextPage: number) => {
			if (inFlightRef.current) return;
			inFlightRef.current = true;
			setLoading(true);
			try {
				const res = await fetch(`/api/practices/cards?page=${nextPage}&pageSize=${pageSize}`);
				if (!res.ok) return;
				const data = (await res.json()) as PracticeCardsResponse;
				setCards(data.practices ?? []);
				setPage(data.page ?? nextPage);
				setTotal(data.total ?? 0);
			} catch (err) {
				Sentry.captureException(err, { tags: { area: 'PracticesSection', action: 'fetchPracticeCards' } });
			} finally {
				inFlightRef.current = false;
				setLoading(false);
			}
		},
		[pageSize]
	);

	useEffect(() => {
		fetchPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const reload = useCallback(async () => {
		await fetchPage(Math.min(page, totalPages));
	}, [fetchPage, page, totalPages]);

	const goToPrev = useCallback(async () => {
		await fetchPage(Math.max(1, page - 1));
	}, [fetchPage, page]);

	const goToNext = useCallback(async () => {
		await fetchPage(Math.min(totalPages, page + 1));
	}, [fetchPage, page, totalPages]);

	const removeLocal = useCallback(
		async (id: string) => {
			let prevCount = 0;
			setCards((prev) => {
				prevCount = prev.length;
				return prev.filter((p) => p.id !== id);
			});
			setTotal((prev) => Math.max(0, prev - 1));

			if (prevCount === 1 && page > 1) {
				await fetchPage(page - 1);
				return;
			}
		},
		[fetchPage, page]
	);

	return {
		cards,
		page,
		total,
		pageSize,
		loading,
		totalPages,
		showPagination,
		fetchPage,
		reload,
		goToPrev,
		goToNext,
		removeLocal,
	};
}
