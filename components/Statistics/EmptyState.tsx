'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LuCalendar, LuChartBar, LuChartBarDecreasing, LuTarget, LuTrendingUp } from 'react-icons/lu';
import styles from './EmptyState.module.css';
import { Button } from '@/components';

export function EmptyState() {
	const router = useRouter();

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
				<h2 className={styles.title}>Ingen statistikk ennå</h2>
				<p className={styles.description}>Begynn å registrere treninger for å se detaljert statistikk over din fremgang og utvikling.</p>

				<div className={styles.features}>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuChartBarDecreasing size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>Følg fremgangen</strong>
							<span>Se hvordan du utvikler deg over tid</span>
						</div>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuTarget size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>Sammenlign distanser</strong>
							<span>Analyser ulike avstander og blinkstørrelser</span>
						</div>
					</div>
					<div className={styles.feature}>
						<div className={styles.featureIcon}>
							<LuTrendingUp size={20} />
						</div>
						<div className={styles.featureText}>
							<strong>Se trender</strong>
							<span>Identifiser styrker og forbedringsområder</span>
						</div>
					</div>
				</div>

				<div className={styles.actions}>
					<Button label="Gå til Min Side" onClick={() => router.push('/min-side')} variant="standard" width={200} />
				</div>
			</div>
		</div>
	);
}
