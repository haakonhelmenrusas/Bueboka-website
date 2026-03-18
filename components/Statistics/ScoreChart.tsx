'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ScoreChart.module.css';
import { useEffect, useState } from 'react';
import { Select } from '@/components';
import { PRACTICE_CATEGORY_LABELS } from '@/lib/labels';
import { PracticeCategory } from './types';

interface ScoreChartProps {
	data: any[];
	formatDate: (date: string) => string;
	selectedCategory: PracticeCategory;
	onCategoryChange: (category: PracticeCategory) => void;
}

// Generate colors from CSS variables
const getChartColors = (): { training: string; competition: string } => {
	if (typeof window === 'undefined') return { training: '#053546', competition: '#e63946' };

	const root = getComputedStyle(document.documentElement);
	return {
		training: root.getPropertyValue('--primary').trim() || '#053546',
		competition: root.getPropertyValue('--error').trim() || '#e63946',
	};
};

export function ScoreChart({ data, formatDate, selectedCategory, onCategoryChange }: ScoreChartProps) {
	const [colors, setColors] = useState<{ training: string; competition: string }>({ training: '#053546', competition: '#e63946' });

	useEffect(() => {
		setColors(getChartColors());
	}, []);

	const categoryOptions = [
		{ value: 'SKIVE_INDOOR', label: PRACTICE_CATEGORY_LABELS.SKIVE_INDOOR },
		{ value: 'SKIVE_OUTDOOR', label: PRACTICE_CATEGORY_LABELS.SKIVE_OUTDOOR },
		{ value: 'JAKT_3D', label: PRACTICE_CATEGORY_LABELS.JAKT_3D },
		{ value: 'FELT', label: PRACTICE_CATEGORY_LABELS.FELT },
	];

	// Fixed y-axis ticks from 0 to 11
	const yTicks = Array.from({ length: 12 }, (_, i) => i);

	return (
		<div className={styles.chartCard}>
			<div className={styles.chartHeader}>
				<div>
					<h3 className={styles.chartTitle}>Gjennomsnittlig score per pil</h3>
					<p className={styles.chartSubtitle}>Trening vs. Konkurranse</p>
				</div>
				<div className={styles.filterGroup}>
					<Select
						label="Kategori"
						options={categoryOptions}
						value={selectedCategory}
						onChange={(value) => onCategoryChange(value as PracticeCategory)}
						containerClassName={styles.filterSelect}
					/>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={400}>
				<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
					<YAxis
						stroke="#6b7280"
						style={{ fontSize: '0.875rem' }}
						label={{ value: 'Snitt score per pil', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
						ticks={yTicks}
						domain={[0, 11]}
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
						formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, '']}
					/>
					<Legend wrapperStyle={{ paddingTop: '20px' }} />
					<Line
						type="monotone"
						dataKey="training_avg"
						stroke={colors.training}
						strokeWidth={2}
						dot={{ r: 4 }}
						activeDot={{ r: 6 }}
						name="Trening"
						connectNulls
					/>
					<Line
						type="monotone"
						dataKey="competition_avg"
						stroke={colors.competition}
						strokeWidth={2}
						dot={{ r: 4 }}
						activeDot={{ r: 6 }}
						name="Konkurranse"
						connectNulls
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
