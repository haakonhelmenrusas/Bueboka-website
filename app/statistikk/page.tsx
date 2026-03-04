'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { Header } from '@/components';
import {
	ArrowsChart,
	BreakdownSection,
	type DateRange,
	EmptyState,
	FilterControls,
	type PracticeCategory,
	ScoreChart,
	type Series,
	StatisticsHeader,
} from '@/components/Statistics';
import { exportToCSV } from '@/lib/csvExport';
import styles from './page.module.css';

interface DetailedStatsResponse {
	series: Series[];
}

export default function StatisticsPage() {
	const [series, setSeries] = useState<Series[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<DateRange>('all');
	const [selectedCategory, setSelectedCategory] = useState<PracticeCategory>('all');
	const router = useRouter();

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const response = await fetch('/api/profile');
			if (!response.ok) {
				if (response.status === 401) {
					router.replace('/logg-inn');
					return;
				}
			}
			await fetchDetailedStats();
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'statistikk', action: 'checkAuth' } });
			setError('En feil oppstod');
		} finally {
			setLoading(false);
		}
	};

	const fetchDetailedStats = async () => {
		try {
			const res = await fetch('/api/stats/detailed');
			if (!res.ok) {
				if (res.status === 401) {
					router.replace('/logg-inn');
					return;
				}
				setError('Kunne ikke hente statistikk');
				return;
			}
			const data: DetailedStatsResponse = await res.json();
			setSeries(data.series || []);
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'statistikk', action: 'fetchDetailedStats' } });
			setError('En feil oppstod');
		}
	};

	// Filter data based on date range
	const getFilteredSeries = (): Series[] => {
		if (dateRange === 'all') return series;

		const now = new Date();
		const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
		const days = daysMap[dateRange];
		const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
		const cutoffStr = cutoffDate.toISOString().split('T')[0];

		return series
			.map((s) => ({
				...s,
				data: s.data.filter((d) => d.date >= cutoffStr),
			}))
			.filter((s) => s.data.length > 0);
	};

	const filteredSeries = getFilteredSeries();

	// Combine all data points from all series into a single dataset for the chart
	const getChartData = () => {
		if (!filteredSeries.length) return [];

		// Get all unique dates
		const allDates = new Set<string>();
		filteredSeries.forEach((s) => {
			s.data.forEach((d) => allDates.add(d.date));
		});

		const sortedDates = Array.from(allDates).sort();

		// Create data points with all series values (arrows and scores)
		return sortedDates.map((date) => {
			const point: any = { date };

			filteredSeries.forEach((s) => {
				const dataPoint = s.data.find((d) => d.date === date);
				point[s.name] = dataPoint?.arrows || 0;
				point[`${s.name}_score`] = dataPoint?.score || 0;
			});

			return point;
		});
	};

	const chartData = getChartData();

	// Filter chart data to only include points with arrows > 0 and by selected category
	// When multiple sessions on same date, stack them in the same column
	const getArrowsChartData = () => {
		// Group by date, then by session, then by series
		const dateMap = new Map<string, Map<string, Map<string, number>>>();

		filteredSeries.forEach((s) => {
			s.data.forEach((d) => {
				const matchesCategory = selectedCategory === 'all' || d.practiceCategory === selectedCategory;

				if (d.arrows > 0 && matchesCategory) {
					if (!dateMap.has(d.date)) {
						dateMap.set(d.date, new Map());
					}

					const sessionMap = dateMap.get(d.date)!;
					const sessionId = d.sessionId || 'default';

					if (!sessionMap.has(sessionId)) {
						sessionMap.set(sessionId, new Map());
					}

					const seriesMap = sessionMap.get(sessionId)!;
					seriesMap.set(s.name, (seriesMap.get(s.name) || 0) + d.arrows);
				}
			});
		});

		// Convert to array format for chart
		// For multiple sessions on same date, create series like "seriesName (Session 1)", "seriesName (Session 2)"
		const result: any[] = [];
		const sortedDates = Array.from(dateMap.keys()).sort();
		const allSeriesWithSessions = new Set<string>();

		sortedDates.forEach((date) => {
			const sessionMap = dateMap.get(date)!;
			const sessions = Array.from(sessionMap.entries());
			const point: any = { date };

			if (sessions.length === 1) {
				// Single session: use normal series names
				const [, seriesMap] = sessions[0];
				seriesMap.forEach((arrows, seriesName) => {
					point[seriesName] = arrows;
					allSeriesWithSessions.add(seriesName);
				});
			} else {
				// Multiple sessions: add session suffix to series names
				sessions.forEach(([sessionId], sessionIndex) => {
					const seriesMap = sessionMap.get(sessionId)!;
					seriesMap.forEach((arrows, seriesName) => {
						const key = `${seriesName} (Økt ${sessionIndex + 1})`;
						point[key] = arrows;
						allSeriesWithSessions.add(key);
					});
				});
			}

			result.push(point);
		});

		return result;
	};

	// Calculate average score per arrow grouped by practice type (training vs competition)
	const getScoreChartData = () => {
		// Group by date and practice type
		const dateMap = new Map<string, { training: { score: number; arrows: number }; competition: { score: number; arrows: number } }>();

		filteredSeries.forEach((s) => {
			s.data.forEach((d) => {
				if (d.score > 0 && d.arrows > 0) {
					if (!dateMap.has(d.date)) {
						dateMap.set(d.date, {
							training: { score: 0, arrows: 0 },
							competition: { score: 0, arrows: 0 },
						});
					}

					const entry = dateMap.get(d.date)!;
					if (d.practiceType === 'KONKURRANSE') {
						entry.competition.score += d.score;
						entry.competition.arrows += d.arrows;
					} else {
						entry.training.score += d.score;
						entry.training.arrows += d.arrows;
					}
				}
			});
		});

		// Convert to array and calculate averages
		return Array.from(dateMap.entries())
			.map(([date, data]) => ({
				date,
				training_avg: data.training.arrows > 0 ? data.training.score / data.training.arrows : null,
				competition_avg: data.competition.arrows > 0 ? data.competition.score / data.competition.arrows : null,
			}))
			.filter((point) => point.training_avg !== null || point.competition_avg !== null)
			.sort((a, b) => a.date.localeCompare(b.date));
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
	};

	const downloadCSV = () => {
		// Prepare headers
		const headers = ['Dato', ...filteredSeries.map((s) => s.name)];

		// Prepare data rows
		const rows = chartData.map((point) => {
			const row = [point.date];
			filteredSeries.forEach((s) => {
				row.push(String(point[s.name] || 0));
			});
			return row;
		});

		// Generate filename with current date
		const filename = `bueboka-statistikk-${new Date().toISOString().split('T')[0]}`;

		// Export to CSV
		exportToCSV(headers, rows, filename);
	};

	const getBreakdownItems = () => {
		// Get colors from CSS variables
		const root = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
		const colors = root
			? [
					root.getPropertyValue('--primary').trim(),
					root.getPropertyValue('--primary-light').trim(),
					root.getPropertyValue('--secondary').trim(),
					root.getPropertyValue('--warning').trim(),
					root.getPropertyValue('--success').trim(),
					root.getPropertyValue('--error').trim(),
					'#9333ea', // Purple
					'#0891b2', // Cyan
					'#d97706', // Amber
					'#059669', // Emerald
				]
			: [];

		return filteredSeries.map((s, index) => ({
			name: s.name,
			data: s.data,
			color: colors[index % colors.length] || '#053546',
		}));
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<Header />
				<main className={styles.main}>
					<div className={styles.loader}>Laster statistikk...</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<Header />
				<main className={styles.main}>
					<div className={styles.error}>{error}</div>
				</main>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Header />
			<main className={styles.main} id="main-content">
				<div className={styles.content}>
					<StatisticsHeader />
					{series.length === 0 ? (
						<EmptyState />
					) : (
						<>
							<FilterControls dateRange={dateRange} onDateRangeChange={setDateRange} onDownloadCSV={downloadCSV} />
							<div className={styles.chartSection}>
								<ArrowsChart
									data={getArrowsChartData()}
									series={filteredSeries}
									formatDate={formatDate}
									selectedCategory={selectedCategory}
									onCategoryChange={setSelectedCategory}
								/>
								<ScoreChart data={getScoreChartData()} formatDate={formatDate} />
								<BreakdownSection items={getBreakdownItems()} />
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
