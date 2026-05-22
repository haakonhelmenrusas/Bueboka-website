import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ArrowsChart.module.css';
import { PracticeCategory } from './types';
import { getPracticeCategoryLabel } from '@/lib/labels';
import { Select } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

interface ArrowsChartProps {
	data: any[];
	series: Array<{ name: string }>;
	formatDate: (date: string) => string;
	selectedCategory: PracticeCategory;
	onCategoryChange: (category: PracticeCategory) => void;
}

// Distinct, high-contrast palette for stacked bar segments.
// Ordered so adjacent entries are maximally different in hue.
const CHART_COLORS = [
	'#0c82ac', // app blue
	'#e05c2a', // orange
	'#2a9d5c', // green
	'#c8382e', // red
	'#7c3aed', // violet
	'#d4a017', // amber/gold
	'#0e7a6b', // teal
	'#d63a8a', // pink
	'#1d4ed8', // royal blue
	'#6b7280', // neutral grey
] as const;

export function ArrowsChart({ data, series, formatDate, selectedCategory, onCategoryChange }: ArrowsChartProps) {
	const { t } = useTranslation();

	// Category options for Select component
	const categoryOptions = [
		{ value: 'all', label: t['common.all'] },
		{ value: 'SKIVE_INDOOR', label: getPracticeCategoryLabel('SKIVE_INDOOR', t) },
		{ value: 'SKIVE_OUTDOOR', label: getPracticeCategoryLabel('SKIVE_OUTDOOR', t) },
		{ value: 'JAKT_3D', label: getPracticeCategoryLabel('JAKT_3D', t) },
		{ value: 'FELT', label: getPracticeCategoryLabel('FELT', t) },
	];

	// Extract all unique series names from data (including session suffixes like "18m - 40cm (Økt 1)")
	const allSeriesNames = new Set<string>();
	data.forEach((point) => {
		Object.keys(point).forEach((key) => {
			if (key !== 'date') {
				allSeriesNames.add(key);
			}
		});
	});

	const seriesArray = Array.from(allSeriesNames);

	// Assign colors - use lighter shades for session 2, 3, etc of same base series
	const getColorForSeries = (seriesName: string, index: number): string => {
		// Check if this is a session-suffixed series
		const sessionMatch = seriesName.match(/^(.+) \(Økt (\d+)\)$/);
		if (sessionMatch) {
			const [, baseName, sessionNum] = sessionMatch;
			const sessionIndex = parseInt(sessionNum) - 1;

			// Find base series index
			const baseIndex = series.findIndex((s) => s.name === baseName);
			const colorIndex = baseIndex >= 0 ? baseIndex : index;
			const baseColor = CHART_COLORS[colorIndex % CHART_COLORS.length];

			// Make subsequent sessions lighter by adding transparency
			if (sessionIndex > 0) {
				const opacity = Math.max(0.5, 1 - sessionIndex * 0.25);
				const opacityHex = Math.round(opacity * 255)
					.toString(16)
					.padStart(2, '0');
				return `${baseColor}${opacityHex}`;
			}
			return baseColor;
		}

		// Regular series - use normal color
		return CHART_COLORS[index % CHART_COLORS.length];
	};

	return (
		<div className={styles.chartCard}>
			<div className={styles.chartHeader}>
				<div>
					<h3 className={styles.chartTitle}>{t['statistics.arrowsOverTime']}</h3>
					<p className={styles.chartSubtitle}>{t['statistics.groupedByDistance']}</p>
				</div>
				<div className={styles.filterGroup}>
					<Select
						label={t['form.category']}
						options={categoryOptions}
						value={selectedCategory}
						onChange={(value) => onCategoryChange(value as PracticeCategory)}
						containerClassName={styles.filterSelect}
					/>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" style={{ fontSize: '0.875rem' }} textAnchor="end" height={80} />
					<YAxis
						stroke="#6b7280"
						style={{ fontSize: '0.875rem' }}
						label={{ value: t['statistics.arrowCount'], angle: -90, position: 'insideLeft', fill: '#6b7280' }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: '#ffffff',
							border: '1px solid #d1d5db',
							borderRadius: '8px',
							padding: '12px',
							color: '#111827',
						}}
						labelStyle={{ color: '#111827' }}
						itemStyle={{ color: '#111827' }}
						labelFormatter={(label) => `${t['statistics.date']} ${formatDate(label as string)}`}
					/>
					<Legend wrapperStyle={{ paddingTop: '20px' }} />
					{seriesArray.map((seriesName, index) => (
						<Bar
							key={seriesName}
							dataKey={seriesName}
							fill={getColorForSeries(seriesName, index)}
							name={seriesName}
							stackId="a"
							barSize={50}
						/>
					))}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
