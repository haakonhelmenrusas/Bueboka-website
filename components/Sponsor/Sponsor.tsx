'use client';

import styles from './Sponsor.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { LuArrowRight } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';

export function Sponsors() {
	const { t } = useTranslation();

	return (
		<section id="contact" className={styles.section}>
			<div className={styles.container}>
				<div className={`${styles.textCenter} ${styles.mb16}`}>
					<h2 className={styles.title}>{t['sponsor.title']}</h2>
					<p className={styles.subtitle}>{t['sponsor.subtitle']}</p>
				</div>
				<div className={styles.supportGrid}>
					<div className={`${styles.card} ${styles.vippsCard}`}>
						<h3 className={styles.cardTitle}>{t['sponsor.vippsTitle']}</h3>
						<p className={styles.cardDesc}>{t['sponsor.vippsDesc']}</p>
						<div className={styles.vippsContent}>
							<div className={styles.qrPlaceholder}>
								<Image src="/assets/vipps-qr.png" alt={t['sponsor.vippsQrAlt']} width={150} height={150} className={styles.qrImage} />
							</div>
							<div className={styles.vippsNumberBox}>
								<span className={styles.vippsLabel}>{t['sponsor.vippsLabel']}</span>
								<span className={styles.vippsNumber}>44294</span>
							</div>
						</div>
					</div>
					<div className={`${styles.card} ${styles.sponsorLinkCard}`}>
						<h3 className={styles.cardTitle}>{t['sponsor.businessTitle']}</h3>
						<p className={styles.cardDesc}>{t['sponsor.businessDesc']}</p>
						<Link href="/sponsing" className={styles.primaryButton}>
							<span>{t['sponsor.sponsorButton']}</span>
							<LuArrowRight size={20} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
