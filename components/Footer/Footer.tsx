'use client';

import { LuExternalLink } from 'react-icons/lu';
import { AppStoreBadge } from '@/components';
import React from 'react';
import styles from './Footer.module.css';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageProvider';

export function Footer() {
	const { t } = useTranslation();

	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={`${styles.center} ${styles.revealOnce}`}>
					<div className={styles.logoLink}>
						<div className={styles.logoBox}>
							<Image width={24} height={24} src="/assets/logo.png" alt="Bueboka Logo" className={styles.logoImg} />
						</div>
						<span className={styles.brandText}>Bueboka</span>
					</div>

					<p className={styles.lead}>{t['footer.downloadCta']}</p>
					<div className={styles.badgesRow}>
						<AppStoreBadge store="ios" href="https://apps.apple.com/app/bueboka" />
						<AppStoreBadge store="android" href="https://play.google.com/store/apps/details?id=com.bueboka" />
					</div>

					<div className={styles.sponsorsSection}>
						<p className={styles.sponsorsLabel}>{t['footer.partners']}</p>
						<div className={styles.sponsorsGrid}>
							<div className={styles.sponsorCard}>
								<div className={styles.sponsorLogoWrap}>
									<Image
										src="/assets/arcticBueLogo.png"
										alt="Arctic bueskyting logo"
										width={120}
										height={96}
										className={styles.sponsorLogo}
									/>
								</div>
								<h3 className={styles.sponsorName}>Arctic bueskyting</h3>
								<p className={styles.sponsorDesc}>{t['footer.partnerDesc']}</p>
								<a
									href="https://www.arcticbuesport.no?utm_source=bueboka&utm_medium=bueboka&utm_campaign=bueboka2026"
									target="_blank"
									rel="noopener noreferrer"
									className={styles.sponsorLink}
								>
									{t['footer.visitWebsite']}
									<LuExternalLink size={14} />
								</a>
							</div>
						</div>
					</div>

					<div className={styles.separator}>
						<p className={styles.finePrint}>
							© 2026 Bueboka. {t['footer.allRightsReserved']} Laget med ❤️ av{' '}
							<a
								href="https://rusåsdesign.no"
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.creditLink} ${styles.scaleOnHover}`}
							>
								Rusås Design
							</a>
							.
						</p>
						<p className={styles.finePrint} style={{ marginTop: '0.5rem' }}>
							This site is powered by{' '}
							<a
								href="https://www.netlify.com"
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.creditLink} ${styles.scaleOnHover}`}
							>
								Netlify
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
