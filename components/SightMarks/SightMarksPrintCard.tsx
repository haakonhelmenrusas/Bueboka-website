'use client';

import React from 'react';
import styles from './SightMarksPrintCard.module.css';
import type { FullMarksResult } from '@/types/SightMarks';

export interface SightMarksPrintData {
	marksData: FullMarksResult;
	/** Display name for the set (custom name, or bow name fallback). */
	setName: string;
	bowName: string;
	arrowName?: string | null;
	/** Calibration distances used to build the ballistics model. */
	givenDistances?: number[];
	showSpeed?: boolean;
}

function formatAngle(a: string) {
	const n = parseFloat(a);
	if (Number.isNaN(n) || n === 0) return '0°';
	return n > 0 ? `+${n}°` : `${n}°`;
}

export const SightMarksPrintCard = React.forwardRef<HTMLDivElement, { data: SightMarksPrintData }>(
	({ data }, ref) => {
		const { marksData, setName, bowName, arrowName, givenDistances, showSpeed } = data;
		const { distances, sight_marks_by_hill_angle, arrow_speed_by_angle } = marksData;
		const angles = Object.keys(sight_marks_by_hill_angle);

		const today = new Date().toLocaleDateString('nb-NO', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		return (
			<div className={styles.card} ref={ref}>
				<div className={styles.header}>
					<div className={styles.brand}>
						<div className={styles.brandLogoCircle}>
							<img src="/assets/logo.png" alt="Bueboka" className={styles.brandLogo} />
						</div>
						<span className={styles.brandName}>Bueboka</span>
					</div>
					<span className={styles.headerBadge}>Siktemerker</span>
				</div>

				<div className={styles.infoSection}>
					<div className={styles.infoTitle}>{setName}</div>
					<div className={styles.infoMeta}>
						<span>🎯 {bowName}</span>
						{arrowName && <span>↗ {arrowName}</span>}
						{givenDistances && givenDistances.length > 0 && (
							<span>Innsk.: {givenDistances.map((d) => `${d} m`).join(' · ')}</span>
						)}
					</div>
					<div className={styles.infoDate}>{today}</div>
				</div>

				<div className={styles.tableSection}>
					<table className={styles.table}>
						<thead>
							<tr className={styles.tableHead}>
								<th className={styles.thDistance}>Avstand</th>
								{angles.map((angle) => (
									<th key={angle} className={styles.thAngle}>
										{formatAngle(angle)}
										{showSpeed && <div className={styles.thSpeedLabel}>m/s</div>}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{distances.map((dist, i) => (
								<tr key={dist} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
									<td className={styles.tdDistance}>{dist.toFixed(0)} m</td>
									{angles.map((angle) => {
										const mark = sight_marks_by_hill_angle[angle]?.[i];
										const speed = arrow_speed_by_angle[angle]?.[i];
										return (
									<td className={styles.tdMark}>
												<span className={styles.markValue}>
													{mark != null ? mark.toFixed(2).replace('.', ',') : '—'}
												</span>
												{showSpeed && speed != null && (
													<span className={styles.speedValue}>{speed.toFixed(1).replace('.', ',')}</span>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className={styles.footer}>
					<span className={styles.footerText}>bueboka.no</span>
				</div>
			</div>
		);
	},
);

SightMarksPrintCard.displayName = 'SightMarksPrintCard';

