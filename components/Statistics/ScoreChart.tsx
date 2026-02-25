import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ScoreChart.module.css';
import { useEffect, useState } from 'react';

interface ScoreChartProps {
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

export function ScoreChart({ data, series, formatDate }: ScoreChartProps) {
	const [isDark, setIsDark] = useState(false);
	const [colors, setColors] = useState<string[]>([]);

	useEffect(() => {
		// Check if dark mode is active
		const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
		setIsDark(darkModeQuery.matches);

		const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
		darkModeQuery.addEventListener('change', handler);

		// Get colors from CSS variables
		setColors(getChartColors());

		return () => darkModeQuery.removeEventListener('change', handler);
	}, []);

	const gridColor = isDark ? '#374151' : '#e5e7eb';
	const axisColor = isDark ? '#9ca3af' : '#6b7280';
	const tooltipBg = isDark ? '#1f2937' : '#ffffff';
	const tooltipBorder = isDark ? '#4b5563' : '#d1d5db';
	const tooltipTextColor = isDark ? '#f3f4f6' : '#111827';

	return (
		<div className={styles.chartCard}>
			<h2 className={styles.chartTitle}>Score over tid</h2>
			<p className={styles.chartSubtitle}>Total score per økt gruppert etter avstand og blinktype</p>

			<ResponsiveContainer width="100%" height={400}>
				<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
					<XAxis dataKey="date" tickFormatter={formatDate} stroke={axisColor} style={{ fontSize: '0.875rem' }} />
					<YAxis
						stroke={axisColor}
						style={{ fontSize: '0.875rem' }}
						label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: axisColor }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: tooltipBg,
							border: `1px solid ${tooltipBorder}`,
							borderRadius: '8px',
							padding: '12px',
							color: tooltipTextColor,
						}}
						labelStyle={{ color: tooltipTextColor }}
						itemStyle={{ color: tooltipTextColor }}
						labelFormatter={(label) => `Dato: ${formatDate(label as string)}`}
					/>
					<Legend wrapperStyle={{ paddingTop: '20px' }} />
					{series.map((s, index) => (
						<Line
							key={s.name}
							type="monotone"
							dataKey={`${s.name}_score`}
							stroke={colors[index % colors.length] || '#053546'}
							strokeWidth={2}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
							name={s.name}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
