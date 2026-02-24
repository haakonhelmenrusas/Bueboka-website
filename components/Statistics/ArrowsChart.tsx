import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './ArrowsChart.module.css';

interface ArrowsChartProps {
	data: any[];
	series: Array<{ name: string }>;
	colors: string[];
	formatDate: (date: string) => string;
}

export function ArrowsChart({ data, series, colors, formatDate }: ArrowsChartProps) {
	return (
		<div className={styles.chartCard}>
			<h2 className={styles.chartTitle}>Piler skutt over tid</h2>
			<p className={styles.chartSubtitle}>Gruppert etter avstand og blinktype</p>

			<ResponsiveContainer width="100%" height={400}>
				<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
					<XAxis dataKey="date" tickFormatter={formatDate} stroke="#4b5563" style={{ fontSize: '0.875rem' }} />
					<YAxis stroke="#4b5563" style={{ fontSize: '0.875rem' }} label={{ value: 'Antall piler', angle: -90, position: 'insideLeft' }} />
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
					{series.map((s, index) => (
						<Line
							key={s.name}
							type="monotone"
							dataKey={s.name}
							stroke={colors[index % colors.length]}
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
