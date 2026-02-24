'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components';
import {
	ArrowsChart,
	BreakdownSection,
	type DateRange,
	EmptyState,
	FilterControls,
	ScoreChart,
	type Series,
	StatisticsHeader,
	SummaryCards,
} from '@/components/Statistics';
import styles from './page.module.css';
import * as Sentry from '@sentry/nextjs';
import { exportToCSV } from '@/lib/csvExport';

interface DetailedStatsResponse {
	series: Series[];
}

// Generate distinct colors for each line
const COLORS = [
	'#053546', // Primary
	'#0c82ac', // Primary light
	'#227B9A', // Secondary
	'#FFA500', // Orange
	'#008000', // Green
	'#DD0000', // Red
	'#9333ea', // Purple
	'#0891b2', // Cyan
	'#d97706', // Amber
	'#059669', // Emerald
];

export default function StatisticsPage() {
	const [series, setSeries] = useState<Series[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<DateRange>('all');
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

	// Filter chart data to only include points with arrows > 0
	const getArrowsChartData = () => {
		return chartData
			.map((point) => {
				const filteredPoint: any = { date: point.date };
				let hasArrows = false;

				filteredSeries.forEach((s) => {
					if (point[s.name] > 0) {
						filteredPoint[s.name] = point[s.name];
						hasArrows = true;
					}
				});

				return hasArrows ? filteredPoint : null;
			})
			.filter((point) => point !== null);
	};

	// Filter chart data to only include points with scores > 0
	const getScoreChartData = () => {
		return chartData
			.map((point) => {
				const filteredPoint: any = { date: point.date };
				let hasScore = false;

				filteredSeries.forEach((s) => {
					const scoreKey = `${s.name}_score`;
					if (point[scoreKey] > 0) {
						filteredPoint[scoreKey] = point[scoreKey];
						hasScore = true;
					}
				});

				return hasScore ? filteredPoint : null;
			})
			.filter((point) => point !== null);
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

	const getMostUsed = () => {
		if (filteredSeries.length === 0) return 'N/A';
		return filteredSeries.reduce((prev, curr) => (prev.data.length > curr.data.length ? prev : curr)).name;
	};

	const getBreakdownItems = () => {
		return filteredSeries.map((s, index) => ({
			name: s.name,
			data: s.data,
			color: COLORS[index % COLORS.length],
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
								<ArrowsChart data={getArrowsChartData()} series={filteredSeries} colors={COLORS} formatDate={formatDate} />

								<ScoreChart data={getScoreChartData()} series={filteredSeries} colors={COLORS} formatDate={formatDate} />

								<SummaryCards totalCombinations={filteredSeries.length} totalSessions={chartData.length} mostUsed={getMostUsed()} />

								<BreakdownSection items={getBreakdownItems()} />
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
