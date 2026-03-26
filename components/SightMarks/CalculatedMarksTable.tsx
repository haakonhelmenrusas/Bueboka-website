import styles from './CalculatedMarksTable.module.css';
import type { FullMarksResult } from '@/types/SightMarks';
import { LuWind } from 'react-icons/lu';

interface CalculatedMarksTableProps {
	marksData: FullMarksResult;
	showSpeed: boolean;
}

function formatAngle(a: string) {
	const n = parseFloat(a);
	if (Number.isNaN(n) || n === 0) return 'Flatmark';
	return n > 0 ? `+ ${n}°` : `- ${Math.abs(n)}°`;
}

export function CalculatedMarksTable({ marksData, showSpeed }: CalculatedMarksTableProps) {
	const { distances, sight_marks_by_hill_angle, arrow_speed_by_angle } = marksData;
	const angles = Object.keys(sight_marks_by_hill_angle);

	if (distances.length === 0 || angles.length === 0) {
		return <p className={styles.empty}>Ingen data å vise.</p>;
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.tableScroll}>
				<table className={styles.table}>
					<thead className={styles.thead}>
						<tr className={styles.headerRow}>
							<th className={styles.distanceHeader}>Avstand</th>
							{angles.map((angle) => (
								<th key={angle} className={styles.angleHeader}>
									<span className={styles.angleLabel}>{formatAngle(angle)}</span>
									{showSpeed && (
										<span className={styles.speedLabel}>
											<LuWind size={12} aria-hidden="true" /> m/s
										</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{distances.map((dist, i) => (
							<tr key={dist} className={styles.bodyRow}>
								<td className={styles.distanceCell}>{dist.toFixed(0)} m</td>
								{angles.map((angle) => {
									const mark = sight_marks_by_hill_angle[angle]?.[i];
									const speed = arrow_speed_by_angle[angle]?.[i];
									return (
										<td key={angle} className={styles.markCell}>
											<span className={styles.markValue}>{mark != null ? mark.toFixed(2).replace('.', ',') : '—'}</span>
											{showSpeed && <span className={styles.speedValue}>{speed != null ? speed.toFixed(1).replace('.', ',') : '—'}</span>}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
