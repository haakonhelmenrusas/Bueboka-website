'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LuCalendar, LuChartBar, LuChartBarDecreasing, LuTarget, LuTrendingUp } from 'react-icons/lu';
import styles from './EmptyState.module.css';
import { Button } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

export function EmptyState() {
	const router = useRouter();
	const { t } = useTranslation();

	return (
		<div className={styles.container}>
			<div className={styles.graphic}>
				<div className={styles.iconCircle}>
					<LuChartBar size={64} className={styles.mainIcon} />
				</div>
				<div className={styles.floatingIcons}>
					<div className={`${styles.floatingIcon} ${styles.icon1}`}>
						<LuTarget size={24} />
					</div>
					<div className={`${styles.floatingIcon} ${styles.icon2}`}>
						<LuTrendingUp size={24} />
					</div>
					<div className={`${styles.floatingIcon} ${styles.icon3}`}>
						<LuCalendar size={24} />
					</div>
				</div>
			</div>

			<div className={styles.content}>
				<h2 className={styles.title}>{t['statistics.noData']}</h2>
				<p className={styles.description}>{t['statistics.noDataDesc']}</p>

				<div className={styles.features}>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuChartBarDecreasing size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>{t['statistics.feature1Title']}</strong>
							<span>{t['statistics.feature1Text']}</span>
						</div>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuTarget size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>{t['statistics.feature2Title']}</strong>
							<span>{t['statistics.feature2Text']}</span>
						</div>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuTrendingUp size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>{t['statistics.feature3Title']}</strong>
							<span>{t['statistics.feature3Text']}</span>
						</div>
					</div>
				</div>

				<div className={styles.actions}>
					<Button label={t['statistics.goToMyPage']} onClick={() => router.push('/min-side')} variant="standard" width={200} />
				</div>
			</div>
		</div>
	);
}
