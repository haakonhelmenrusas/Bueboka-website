import { LuActivity, LuCalendar, LuCircleCheck, LuStar, LuTarget, LuCircleX, LuTrophy } from 'react-icons/lu';
import styles from './BreakdownSection.module.css';
import type { SeriesData } from './types';
import { useTranslation } from '@/context/LanguageProvider';

interface BreakdownItem {
	name: string;
	data: SeriesData[];
	color: string;
}

interface BreakdownSectionProps {
	items: BreakdownItem[];
}

export function BreakdownSection({ items }: BreakdownSectionProps) {
	const { t } = useTranslation();

	return (
		<div className={styles.breakdownSection}>
			<h2 className={styles.sectionTitle}>{t['statistics.breakdownTitle']}</h2>
			<div className={styles.breakdownGrid}>
				{items.map((item) => {
					const totalArrows = item.data.reduce((sum, d) => sum + d.arrows, 0);
					const totalScore = item.data.reduce((sum, d) => sum + d.score, 0);

					const scoredArrows = item.data.reduce((sum, d) => sum + d.scoredArrows, 0);

					const percentScored = totalArrows > 0 ? Math.round((scoredArrows / totalArrows) * 100) : 0;
					const percentUnscored = totalArrows > 0 ? 100 - percentScored : 0;

					const avgArrows = Math.round(totalArrows / item.data.length);
					const avgScore = scoredArrows > 0 ? (totalScore / scoredArrows).toFixed(2).replace('.', ',') : '0,00';

					return (
						<div key={item.name} className={styles.breakdownCard}>
							<div className={styles.breakdownHeader}>
								<div className={styles.breakdownColor} style={{ backgroundColor: item.color }} />
								<h3 className={styles.breakdownTitle}>{item.name}</h3>
							</div>
							<div className={styles.breakdownStats}>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuCalendar className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.sessions']}</span>
									</div>
									<span className={styles.breakdownValue}>{item.data.length}</span>
								</div>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuTarget className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.arrows']}</span>
									</div>
									<span className={styles.breakdownValue}>{totalArrows}</span>
								</div>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuCircleCheck className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.arrowsWithScore']}</span>
									</div>
									<span className={styles.breakdownValue}>{percentScored} %</span>
								</div>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuCircleX className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.arrowsWithoutScore']}</span>
									</div>
									<span className={styles.breakdownValue}>{percentUnscored} %</span>
								</div>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuActivity className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.arrowsPerSession']}</span>
									</div>
									<span className={styles.breakdownValue}>{avgArrows}</span>
								</div>
								<div className={styles.breakdownStat}>
									<div className={styles.statLabelWrapper}>
										<LuStar className={styles.statIcon} />
										<span className={styles.breakdownLabel}>{t['statistics.avgScore']}</span>
									</div>
									<span className={styles.breakdownValue}>
										{avgScore} <span className={styles.unit}>{t['statistics.perArrow']}</span>
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
