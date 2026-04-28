'use client';

import Link from 'next/link';
import { LuKey, LuShield, LuTarget } from 'react-icons/lu';
import styles from './Privacy.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function Privacy() {
	const { t } = useTranslation();

	return (
		<section className={styles.section} aria-labelledby="privacy-heading">
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
						<h2 id="privacy-heading" className={styles.title}>
							{t['privacy.title']}
						</h2>
						<p className={styles.subtitle}>{t['privacy.subtitle']}</p>
					</div>
					<div className={styles.grid}>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '0ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuShield className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>{t['privacy.1title']}</h3>
							<p className={styles.cardText}>{t['privacy.1text']}</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '160ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuTarget className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>{t['privacy.2title']}</h3>
							<p className={styles.cardText}>{t['privacy.2text']}</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '320ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuKey className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>{t['privacy.3title']}</h3>
							<p className={styles.cardText}>{t['privacy.3text']}</p>
							<Link href="/slett-konto" className={styles.cardLink}>
								{t['privacy.3link']}
							</Link>
						</div>
					</div>
					<div className={`${styles.footer} ${styles.reveal}`} style={{ animationDelay: '480ms' }}>
						<p className={styles.footerText}>{t['privacy.footerText']}</p>
					</div>
				</div>
			</div>
		</section>
	);
}
