import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
	totalCombinations: number;
	totalSessions: number;
	mostUsed: string;
}

export function SummaryCards({ totalCombinations, totalSessions, mostUsed }: SummaryCardsProps) {
	return (
		<div className={styles.summaryGrid}>
			<div className={styles.summaryCard}>
				<h3 className={styles.summaryTitle}>Totalt antall kombinasjoner</h3>
				<div className={styles.summaryValue}>{totalCombinations}</div>
				<p className={styles.summaryText}>Ulike avstand/blink kombinasjoner</p>
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
