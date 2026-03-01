import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ArrowsChart.module.css';
import { useEffect, useState } from 'react';
import { PracticeCategory } from './types';
import { PRACTICE_CATEGORY_LABELS } from '@/lib/labels';

interface ArrowsChartProps {
	data: any[];
	series: Array<{ name: string }>;
	formatDate: (date: string) => string;
	selectedCategory: PracticeCategory;
	onCategoryChange: (category: PracticeCategory) => void;
}

// Generate colors from CSS variables
const getChartColors = (): string[] => {
	if (typeof window === 'undefined') return [];

	const root = getComputedStyle(document.documentElement);
	return [
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
	];
};

export function ArrowsChart({ data, series, formatDate, selectedCategory, onCategoryChange }: ArrowsChartProps) {
	const [colors, setColors] = useState<string[]>([]);

	useEffect(() => {
		setColors(getChartColors());
	}, []);

	return (
		<div className={styles.chartCard}>
			<div className={styles.chartHeader}>
				<div>
					<h3 className={styles.chartTitle}>Piler skutt over tid</h3>
					<p className={styles.chartSubtitle}>Gruppert etter avstand og blinktype</p>
				</div>
				<div className={styles.filterGroup}>
					<label htmlFor="category-filter" className={styles.filterLabel}>
						Kategori:
					</label>
					<select
						id="category-filter"
						className={styles.filterSelect}
						value={selectedCategory}
						onChange={(e) => onCategoryChange(e.target.value as PracticeCategory)}
					>
						<option value="all">Alle kategorier</option>
						<option value="SKIVE_INDOOR">{PRACTICE_CATEGORY_LABELS.SKIVE_INDOOR}</option>
						<option value="SKIVE_OUTDOOR">{PRACTICE_CATEGORY_LABELS.SKIVE_OUTDOOR}</option>
						<option value="JAKT_3D">{PRACTICE_CATEGORY_LABELS.JAKT_3D}</option>
						<option value="FELT">{PRACTICE_CATEGORY_LABELS.FELT}</option>
					</select>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
					<YAxis
						stroke="#6b7280"
						style={{ fontSize: '0.875rem' }}
						label={{ value: 'Antall piler', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
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
						labelFormatter={(label) => `Dato: ${formatDate(label as string)}`}
					/>
					<Legend wrapperStyle={{ paddingTop: '20px' }} />
					{series.map((s, index) => (
						<Bar key={s.name} dataKey={s.name} fill={colors[index % colors.length] || '#053546'} name={s.name} barSize={8} />
					))}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
