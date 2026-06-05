'use client';

import Image from 'next/image';
import { LuChevronRight, LuSparkles } from 'react-icons/lu';
import styles from './Bueboka2Announcement.module.css';
import { useTranslation } from '@/context/LanguageProvider';

const features = [
	{ key: 'training', image: '02_training_appstore' },
	{ key: 'achievements', image: '04_achievements_appstore' },
	{ key: 'statistics', image: '05_statistics_appstore' },
	{ key: 'competitions', image: '08_competition_appstore' },
] as const;

export function Bueboka2Announcement() {
	const { t, locale } = useTranslation();
	const suffix = locale === 'en' ? 'en' : 'no';

	return (
		<section className={styles.section} aria-label="Bueboka 2.0">
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.badge}>
						<LuSparkles className="w-4 h-4" />
						<span>{t['bueboka2.badge']}</span>
					</div>
					<h2 className={styles.title}>
						{t['bueboka2.titlePrefix']} <span className={styles.highlight}>Bueboka 2.0</span>
					</h2>
					<p className={styles.subtitle}>{t['bueboka2.subtitle']}</p>
				</div>

				<div className={styles.grid}>
					{features.map(({ key, image }) => (
						<div key={key} className={styles.card}>
							<div className={styles.cardImageWrapper}>
								<Image
									src={`/assets/screenshots/${image}_${suffix}.webp`}
									alt={t[`bueboka2.${key}Alt` as keyof typeof t]}
									width={640}
									height={1385}
									className={styles.cardImage}
								/>
							</div>
							<h3 className={styles.cardTitle}>
								{t[`bueboka2.${key}Title` as keyof typeof t]}
							</h3>
						</div>
					))}
				</div>

				<div className={styles.cta}>
					<a href="/ny-bruker" className={styles.primaryButton}>
						{t['bueboka2.ctaPrimary']}
						<LuChevronRight className="w-5 h-5" />
					</a>
					<a href="/logg-inn" className={styles.secondaryButton}>
						{t['nav.login']}
					</a>
				</div>
			</div>
		</section>
	);
}
