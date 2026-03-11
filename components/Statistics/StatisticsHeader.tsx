import { LuArrowLeft } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import styles from './StatisticsHeader.module.css';

export function StatisticsHeader() {
	const router = useRouter();

	return (
		<>
			<button className={styles.backButton} onClick={() => router.push('/min-side')}>
				<LuArrowLeft size={20} />
				Tilbake til Min side
			</button>

			<div className={styles.headerSection}>
				<h1 className={styles.title}>Statistikk</h1>
				<p className={styles.subtitle}>Detaljert oversikt over din trening</p>
			</div>
		</>
	);
}
