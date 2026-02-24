'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Header } from '@/components';
import styles from './page.module.css';
import * as Sentry from '@sentry/nextjs';
import { ArrowLeft, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';

interface SeriesData {
	date: string;
	arrows: number;
	score: number;
}

interface Series {
	name: string;
	data: SeriesData[];
}

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

type DateRange = 'all' | '7days' | '30days' | '90days';

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
	const getFilteredSeries = () => {
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
	const chartData = () => {
		if (!filteredSeries.length) return [];

		// Get all unique dates
		const allDates = new Set<string>();
		filteredSeries.forEach((s) => {
			s.data.forEach((d) => allDates.add(d.date));
		});

		const sortedDates = Array.from(allDates).sort();

		// Create data points with all series values
		return sortedDates.map((date) => {
			const point: any = { date };

			filteredSeries.forEach((s) => {
				const dataPoint = s.data.find((d) => d.date === date);
				point[s.name] = dataPoint?.arrows || 0;
			});

			return point;
		});
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
	};

	const downloadCSV = () => {
		// Prepare headers
		const headers = ['Dato', ...filteredSeries.map((s) => s.name)];

		// Prepare data rows
		const rows = chartData().map((point) => {
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
					<button className={styles.backButton} onClick={() => router.push('/min-side')}>
						<ArrowLeft size={20} />
						Tilbake til Min side
					</button>

					<div className={styles.headerSection}>
						<h1 className={styles.title}>Statistikk</h1>
						<p className={styles.subtitle}>Detaljert oversikt over din trening</p>
					</div>

					{series.length === 0 ? (
						<div className={styles.emptyState}>
							<p>Ingen treningsdata tilgjengelig ennå.</p>
							<p>Start å registrere treninger for å se statistikk her!</p>
						</div>
					) : (
						<>
							{/* Filter controls */}
							<div className={styles.controlsSection}>
								<div className={styles.filterGroup}>
									<label className={styles.filterLabel}>Tidsperiode:</label>
									<div className={styles.filterButtons}>
										<button
											className={`${styles.filterButton} ${dateRange === '7days' ? styles.filterButtonActive : ''}`}
											onClick={() => setDateRange('7days')}
										>
											7 dager
										</button>
										<button
											className={`${styles.filterButton} ${dateRange === '30days' ? styles.filterButtonActive : ''}`}
											onClick={() => setDateRange('30days')}
										>
											30 dager
										</button>
										<button
											className={`${styles.filterButton} ${dateRange === '90days' ? styles.filterButtonActive : ''}`}
											onClick={() => setDateRange('90days')}
										>
											90 dager
										</button>
										<button
											className={`${styles.filterButton} ${dateRange === 'all' ? styles.filterButtonActive : ''}`}
											onClick={() => setDateRange('all')}
										>
											Alle
										</button>
									</div>
								</div>

								<button className={styles.downloadButton} onClick={downloadCSV}>
									<Download size={18} />
									Last ned CSV
								</button>
							</div>

							<div className={styles.chartSection}>
								<div className={styles.chartCard}>
									<h2 className={styles.chartTitle}>Piler skutt over tid</h2>
									<p className={styles.chartSubtitle}>Gruppert etter avstand og blinktype</p>

									<ResponsiveContainer width="100%" height={400}>
										<LineChart data={chartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
											<XAxis dataKey="date" tickFormatter={formatDate} stroke="#4b5563" style={{ fontSize: '0.875rem' }} />
											<YAxis
												stroke="#4b5563"
												style={{ fontSize: '0.875rem' }}
												label={{ value: 'Antall piler', angle: -90, position: 'insideLeft' }}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: '#f3f4f6',
													border: '1px solid #d1d5db',
													borderRadius: '8px',
													padding: '12px',
												}}
												labelFormatter={(label) => `Dato: ${formatDate(label as string)}`}
											/>
											<Legend wrapperStyle={{ paddingTop: '20px' }} />
											{filteredSeries.map((s, index) => (
												<Line
													key={s.name}
													type="monotone"
													dataKey={s.name}
													stroke={COLORS[index % COLORS.length]}
													strokeWidth={2}
													dot={{ r: 4 }}
													activeDot={{ r: 6 }}
													name={s.name}
												/>
											))}
										</LineChart>
									</ResponsiveContainer>
								</div>

								{/* Summary cards */}
								<div className={styles.summaryGrid}>
									<div className={styles.summaryCard}>
										<h3 className={styles.summaryTitle}>Totalt antall kombinasjoner</h3>
										<div className={styles.summaryValue}>{filteredSeries.length}</div>
										<p className={styles.summaryText}>Ulike avstand/blink kombinasjoner</p>
									</div>

									<div className={styles.summaryCard}>
										<h3 className={styles.summaryTitle}>Total treningsøkter</h3>
										<div className={styles.summaryValue}>{chartData().length}</div>
										<p className={styles.summaryText}>Registrerte økter</p>
									</div>

									<div className={styles.summaryCard}>
										<h3 className={styles.summaryTitle}>Mest brukt</h3>
										<div className={styles.summaryValue}>
											{filteredSeries.length > 0
												? filteredSeries.reduce((prev, curr) => (prev.data.length > curr.data.length ? prev : curr)).name
												: 'N/A'}
										</div>
										<p className={styles.summaryText}>Hyppigst trent kombinasjon</p>
									</div>
								</div>

								{/* Breakdown by combination */}
								<div className={styles.breakdownSection}>
									<h2 className={styles.sectionTitle}>Oversikt per kombinasjon</h2>
									<div className={styles.breakdownGrid}>
										{filteredSeries.map((s, index) => {
											const totalArrows = s.data.reduce((sum, d) => sum + d.arrows, 0);
											const totalScore = s.data.reduce((sum, d) => sum + d.score, 0);
											const avgArrows = Math.round(totalArrows / s.data.length);
											const avgScore = s.data.length > 0 ? Math.round(totalScore / s.data.length) : 0;

											return (
												<div key={s.name} className={styles.breakdownCard}>
													<div className={styles.breakdownHeader}>
														<div className={styles.breakdownColor} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
														<h3 className={styles.breakdownTitle}>{s.name}</h3>
													</div>
													<div className={styles.breakdownStats}>
														<div className={styles.breakdownStat}>
															<span className={styles.breakdownLabel}>Totalt piler</span>
															<span className={styles.breakdownValue}>{totalArrows}</span>
														</div>
														<div className={styles.breakdownStat}>
															<span className={styles.breakdownLabel}>Total score</span>
															<span className={styles.breakdownValue}>{totalScore}</span>
														</div>
														<div className={styles.breakdownStat}>
															<span className={styles.breakdownLabel}>Gj.snitt piler</span>
															<span className={styles.breakdownValue}>{avgArrows} piler/økt</span>
														</div>
														<div className={styles.breakdownStat}>
															<span className={styles.breakdownLabel}>Gj.snitt score</span>
															<span className={styles.breakdownValue}>{avgScore} poeng/økt</span>
														</div>
														<div className={styles.breakdownStat}>
															<span className={styles.breakdownLabel}>Antall økter</span>
															<span className={styles.breakdownValue}>{s.data.length}</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
