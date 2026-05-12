import styles from './FilterControls.module.css';
import { LuDownload } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';

type DateRange = 'all' | '7days' | '30days' | '90days';

interface FilterControlsProps {
	dateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
	onDownloadCSV: () => void;
}

export function FilterControls({ dateRange, onDateRangeChange, onDownloadCSV }: FilterControlsProps) {
	const { t } = useTranslation();

	return (
		<div className={styles.controlsSection}>
			<div className={styles.filterGroup}>
				<label className={styles.filterLabel}>{t['statistics.timePeriod']}</label>
				<div className={styles.filterButtons}>
					<button
						className={`${styles.filterButton} ${dateRange === '7days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('7days')}
					>
						{t['statistics.filter7days']}
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === '30days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('30days')}
					>
						{t['statistics.filter30days']}
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === '90days' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('90days')}
					>
						{t['statistics.filter90days']}
					</button>
					<button
						className={`${styles.filterButton} ${dateRange === 'all' ? styles.filterButtonActive : ''}`}
						onClick={() => onDateRangeChange('all')}
					>
						{t['common.all']}
					</button>
				</div>
			</div>

			<button className={styles.downloadButton} onClick={onDownloadCSV}>
				<LuDownload size={18} />
				{t['statistics.downloadCSV']}
			</button>
		</div>
	);
}
