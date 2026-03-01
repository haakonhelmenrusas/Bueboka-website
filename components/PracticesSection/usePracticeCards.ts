'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export type PracticeCardItem = {
	id: string;
	date: string;
	arrowsShot: number;
	location?: string | null;
	environment?: string | null;
	rating?: number | null;
	practiceType?: string | null;
	totalScore?: number | null;
	bowName?: string | null;
	arrowsName?: string | null;
	roundTypeName?: string | null;
};

interface PracticeCardsResponse {
	practices: PracticeCardItem[];
	page: number;
	pageSize: number;
	total: number;
}

// Simple in-memory cache for the current session
const pageCache = new Map<string, { data: PracticeCardsResponse; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds - short TTL for responsive updates

export type PracticeFilterType = 'all' | 'TRENING' | 'KONKURRANSE';

export function usePracticeCards({ pageSize = 10 }: { pageSize?: number } = {}) {
	const [cards, setCards] = useState<PracticeCardItem[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [filter, setFilter] = useState<PracticeFilterType>('all');
	const inFlightRef = useRef(false);
	const pageRef = useRef(1);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
	const showPagination = total > pageSize;

	const fetchPage = useCallback(
		async (nextPage: number, skipCache = false, currentFilter: PracticeFilterType = 'all') => {
			if (inFlightRef.current) return;

			// Check cache first (unless explicitly skipping)
			const cacheKey = `page-${nextPage}-size-${pageSize}-filter-${currentFilter}`;
			if (!skipCache) {
				const cached = pageCache.get(cacheKey);
				if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
					// Use cached data
					setCards(cached.data.practices ?? []);
					setPage(cached.data.page ?? nextPage);
					pageRef.current = cached.data.page ?? nextPage;
					setTotal(cached.data.total ?? 0);
					return;
				}
			}

			inFlightRef.current = true;
			setLoading(true);
			try {
				// Add timestamp to bust browser cache
				const timestamp = Date.now();
				const filterParam = currentFilter !== 'all' ? `&filter=${currentFilter}` : '';
				const res = await fetch(`/api/practices/cards?page=${nextPage}&pageSize=${pageSize}${filterParam}&_t=${timestamp}`);
				if (!res.ok) return;
				const data = (await res.json()) as PracticeCardsResponse;

				// Store in cache
				pageCache.set(cacheKey, { data, timestamp: Date.now() });

				setCards(data.practices ?? []);
				const newPage = data.page ?? nextPage;
				setPage(newPage);
				pageRef.current = newPage;
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
		// Clear cache on mount to ensure fresh data
		pageCache.clear();
		fetchPage(1, false, filter);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Re-fetch when filter changes
	useEffect(() => {
		pageCache.clear();
		setPage(1);
		pageRef.current = 1;
		fetchPage(1, true, filter);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const reload = useCallback(async () => {
		// Clear cache and force refresh
		pageCache.clear();
		await fetchPage(Math.min(pageRef.current, totalPages), true, filter);
	}, [fetchPage, totalPages, filter]);

	const goToPrev = useCallback(() => {
		const nextPage = Math.max(1, pageRef.current - 1);
		fetchPage(nextPage, false, filter);
	}, [fetchPage, filter]);

	const goToNext = useCallback(() => {
		const nextPage = pageRef.current + 1;
		fetchPage(nextPage, false, filter);
	}, [fetchPage, filter]);

	const removeLocal = useCallback(
		async (id: string) => {
			let prevCount = 0;
			setCards((prev) => {
				prevCount = prev.length;
				return prev.filter((p) => p.id !== id);
			});
			setTotal((prev) => Math.max(0, prev - 1));

			// Clear cache since data changed
			pageCache.clear();

			if (prevCount === 1 && pageRef.current > 1) {
				await fetchPage(pageRef.current - 1, true, filter);
				return;
			}
		},
		[fetchPage, filter]
	);

	return {
		cards,
		page,
		total,
		pageSize,
		loading,
		totalPages,
		showPagination,
		filter,
		setFilter,
		fetchPage,
		reload,
		goToPrev,
		goToNext,
		removeLocal,
	};
}
