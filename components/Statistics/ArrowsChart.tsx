import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ArrowsChart.module.css';
import { useEffect, useState } from 'react';

interface ArrowsChartProps {
	data: any[];
	series: Array<{ name: string }>;
	formatDate: (date: string) => string;
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

export function ArrowsChart({ data, series, formatDate }: ArrowsChartProps) {
	const [colors, setColors] = useState<string[]>([]);

	useEffect(() => {
		setColors(getChartColors());
	}, []);

	return (
		<div className={styles.chartCard}>
			<h2 className={styles.chartTitle}>Piler skutt over tid</h2>
			<p className={styles.chartSubtitle}>Gruppert etter avstand og blinktype</p>

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
