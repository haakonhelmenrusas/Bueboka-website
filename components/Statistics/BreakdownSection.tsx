import styles from './BreakdownSection.module.css';

interface SeriesData {
	date: string;
	arrows: number;
	score: number;
}

interface BreakdownItem {
	name: string;
	data: SeriesData[];
	color: string;
}

interface BreakdownSectionProps {
	items: BreakdownItem[];
}

export function BreakdownSection({ items }: BreakdownSectionProps) {
	return (
		<div className={styles.breakdownSection}>
			<h2 className={styles.sectionTitle}>Oversikt per kombinasjon</h2>
			<div className={styles.breakdownGrid}>
				{items.map((item) => {
					const totalArrows = item.data.reduce((sum, d) => sum + d.arrows, 0);
					const totalScore = item.data.reduce((sum, d) => sum + d.score, 0);
					const avgArrows = Math.round(totalArrows / item.data.length);
					const avgScore = item.data.length > 0 ? Math.round(totalScore / item.data.length) : 0;

					return (
						<div key={item.name} className={styles.breakdownCard}>
							<div className={styles.breakdownHeader}>
								<div className={styles.breakdownColor} style={{ backgroundColor: item.color }} />
								<h3 className={styles.breakdownTitle}>{item.name}</h3>
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
									<span className={styles.breakdownValue}>{item.data.length}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
