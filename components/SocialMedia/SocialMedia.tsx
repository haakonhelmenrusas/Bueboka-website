'use client';

import { LuArrowUpRight, LuUsers } from 'react-icons/lu';
import { SiFacebook } from 'react-icons/si';
import styles from './SocialMedia.module.css';
import { useTranslation } from '@/context/LanguageProvider';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61578533962149';
const HUDD_URL = 'https://invite.hudd.no/groups/5193';

function HuddLogo({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.15" />
			<text
				x="24"
				y="34"
				textAnchor="middle"
				fontFamily="'Inter', 'Helvetica Neue', sans-serif"
				fontWeight="900"
				fontSize="26"
				fill="currentColor"
				letterSpacing="-1"
			>
				H
			</text>
		</svg>
	);
}

export function SocialMedia() {
	const { t } = useTranslation();

	return (
		<section id="community" className={styles.section} aria-labelledby="social-heading">
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.badge}>
						<LuUsers size={14} />
						<span>{t['nav.community']}</span>
					</div>
					<h2 id="social-heading" className={styles.title}>
						{t['social.title']}
					</h2>
					<p className={styles.subtitle}>{t['social.subtitle']}</p>
				</div>

				<div className={styles.cards}>
					{/* Facebook */}
					<a
						href={FACEBOOK_URL}
						target="_blank"
						rel="noopener noreferrer"
						className={`${styles.card} ${styles.facebookCard}`}
						aria-label={t['social.facebookAriaLabel']}
					>
						<div className={`${styles.cardTop} ${styles.facebookTop}`}>
							<SiFacebook className={styles.platformIcon} aria-hidden="true" />
							<div className={styles.platformBrand}>Facebook</div>
						</div>
						<div className={styles.cardBody}>
							<p className={styles.platformText}>{t['social.facebookText']}</p>
							<div className={`${styles.cta} ${styles.facebookCta}`}>
								<span>{t['social.facebookCta']}</span>
								<LuArrowUpRight size={18} aria-hidden="true" />
							</div>
						</div>
					</a>

					{/* Hudd */}
					<a
						href={HUDD_URL}
						target="_blank"
						rel="noopener noreferrer"
						className={`${styles.card} ${styles.huddCard}`}
						aria-label={t['social.huddAriaLabel']}
					>
						<div className={`${styles.cardTop} ${styles.huddTop}`}>
							<HuddLogo className={styles.platformIcon} />
							<div className={styles.platformBrand}>Hudd</div>
						</div>
						<div className={styles.cardBody}>
							<p className={styles.platformText}>{t['social.huddText']}</p>
							<div className={`${styles.cta} ${styles.huddCta}`}>
								<span>{t['social.huddCta']}</span>
								<LuArrowUpRight size={18} aria-hidden="true" />
							</div>
						</div>
					</a>
				</div>
			</div>
		</section>
	);
}
