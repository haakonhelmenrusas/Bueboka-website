import { Download } from 'lucide-react';
import styles from './FilterControls.module.css';

type DateRange = 'all' | '7days' | '30days' | '90days';

interface FilterControlsProps {
	dateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
	onDownloadCSV: () => void;
}

export function FilterControls({ dateRange, onDateRangeChange, onDownloadCSV }: FilterControlsProps) {
	return (
		<div className={styles.controlsSection}>
			<div className={styles.filterGroup}>
				<label className={styles.filterLabel}>Tidsperiode:</label>
				<div className={styles.filterButtons}>
					<button
						className={`${styles.filterButton} ${dateRange === '7days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('7days')}
					>
						7 dager
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === '30days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('30days')}
					>
						30 dager
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === '90days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('90days')}
					>
						90 dager
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === 'all' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('all')}
					>
						Alle
					</button>
				</div>
			</div>

			<button className={styles.downloadButton} onClick={onDownloadCSV}>
				<Download size={18} />
				Last ned CSV
			</button>
		</div>
	);
}
