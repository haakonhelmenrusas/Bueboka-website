import { LuArrowLeft } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import styles from './StatisticsHeader.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function StatisticsHeader() {
	const router = useRouter();
	const { t } = useTranslation();

	return (
		<>
			<button className={styles.backButton} onClick={() => router.push('/min-side')}>
				<LuArrowLeft size={20} />
				{t['statistics.backButton']}
			</button>

			<div className={styles.headerSection}>
				<h1 className={styles.title}>{t['statistics.title']}</h1>
				<p className={styles.subtitle}>{t['statistics.subtitle']}</p>
			</div>
		</>
	);
}
