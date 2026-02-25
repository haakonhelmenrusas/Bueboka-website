import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
	averageScore: number;
	totalSessions: number;
	mostUsed: string;
}

export function SummaryCards({ averageScore, totalSessions, mostUsed }: SummaryCardsProps) {
	return (
		<div className={styles.summaryGrid}>
			<div className={styles.summaryCard}>
				<h3 className={styles.summaryTitle}>Gjennomsnittlig score</h3>
				<div className={styles.summaryValue}>{averageScore > 0 ? averageScore.toFixed(1) : '—'}</div>
				<p className={styles.summaryText}>Per treningsøkt</p>
			</div>

			<div className={styles.summaryCard}>
				<h3 className={styles.summaryTitle}>Total treningsøkter</h3>
				<div className={styles.summaryValue}>{totalSessions}</div>
				<p className={styles.summaryText}>Registrerte økter</p>
			</div>

			<div className={styles.summaryCard}>
				<h3 className={styles.summaryTitle}>Mest brukt</h3>
				<div className={styles.summaryValue}>{mostUsed}</div>
				<p className={styles.summaryText}>Hyppigst trent kombinasjon</p>
			</div>
		</div>
	);
}
