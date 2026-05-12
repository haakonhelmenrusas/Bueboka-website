'use client';

import Link from 'next/link';
import { LuChartBar, LuChevronRight, LuFlame, LuZap } from 'react-icons/lu';
import styles from './CallToAction.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function CallToAction() {
	const { t } = useTranslation();

	return (
		<section className={styles.section} aria-labelledby="cta-heading">
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
						<h2 id="cta-heading" className={styles.title}>
							{t['cta.title']}
						</h2>
						<p className={styles.subtitle}>{t['cta.subtitle']}</p>
					</div>

					<div className={styles.featuresGrid}>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '0ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<LuZap className="w-6 h-6" />
							</div>
							<h3 className={styles.featureTitle}>{t['cta.feature1Title']}</h3>
							<p className={styles.featureText}>{t['cta.feature1Text']}</p>
						</div>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '120ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<LuChartBar className="w-6 h-6" />
							</div>
							<h3 className={styles.featureTitle}>{t['cta.feature2Title']}</h3>
							<p className={styles.featureText}>{t['cta.feature2Text']}</p>
						</div>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '240ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<LuFlame className="w-6 h-6" />
							</div>
							<h3 className={styles.featureTitle}>{t['cta.feature3Title']}</h3>
							<p className={styles.featureText}>{t['cta.feature3Text']}</p>
						</div>
					</div>

					<div className={`${styles.ctaBlock} ${styles.reveal}`} style={{ animationDelay: '360ms' }}>
						<Link href="/ny-bruker" className={styles.ctaButton}>
							{t['cta.registerButton']}
							<LuChevronRight className={styles.ctaIcon} aria-hidden="true" />
						</Link>
						<p className={styles.existingUser}>
							{t['cta.alreadyHaveAccount']}{' '}
							<Link href="/logg-inn" className={styles.loginLink}>
								{t['cta.loginHere']}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
