'use client';

import { LuArrowBigRightDash, LuBolt, LuChevronRight, LuCloud, LuSmartphone, LuSparkles } from 'react-icons/lu';
import styles from './Bueboka2Announcement.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function Bueboka2Announcement() {
	const { t } = useTranslation();

	return (
		<section className={styles.section} aria-label="Bueboka 2.0 Announcement">
			<div className={styles.container}>
				<div className={styles.badge}>
					<LuSparkles className="w-4 h-4" />
					<span>{t['bueboka2.badge']}</span>
				</div>

				<div className={styles.content}>
					<h2 className={styles.title}>
						{t['bueboka2.titlePrefix']} <span className={styles.highlight}>Bueboka 2.0</span>
					</h2>
					<p className={styles.subtitle}>{t['bueboka2.subtitle']}</p>

					<div className={styles.features}>
						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<LuBolt className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>{t['bueboka2.feature1Title']}</h3>
								<p className={styles.featureText}>{t['bueboka2.feature1Text']}</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<LuCloud className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>{t['bueboka2.feature2Title']}</h3>
								<p className={styles.featureText}>{t['bueboka2.feature2Text']}</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<LuArrowBigRightDash className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>{t['bueboka2.feature3Title']}</h3>
								<p className={styles.featureText}>{t['bueboka2.feature3Text']}</p>
							</div>
						</div>
					</div>

					<div className={styles.upgradeNotice}>
						<div className={styles.upgradeIcon}>
							<LuSmartphone className="w-8 h-8" />
						</div>
						<div className={styles.upgradeContent}>
							<h3 className={styles.upgradeTitle}>{t['bueboka2.upgradeTitle']}</h3>
							<p className={styles.upgradeText}>
								{t['bueboka2.upgradeTextPart1']}
								<strong>{t['bueboka2.upgradeDate']}</strong>
								{t['bueboka2.upgradeTextPart2']}
							</p>
							<div className={styles.upgradeWarning}>
								<div className={styles.warningIcon}>⚠️</div>
								<div>
									<strong>{t['bueboka2.warningTitle']}</strong> {t['bueboka2.warningText']}
								</div>
							</div>
						</div>
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

				<div className={styles.backgroundDecoration}>
					<div className={styles.circle1}></div>
					<div className={styles.circle2}></div>
					<div className={styles.circle3}></div>
				</div>
			</div>
		</section>
	);
}
