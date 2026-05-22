'use client';

import { ContactForm, Footer, Header } from '@/components';
import Image from 'next/image';
import { LuExternalLink } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './page.module.css';

export default function SponsingPage() {
	const { t } = useTranslation();

	const sponsors = [
		{
			name: 'Arctic bueskyting',
			logo: '/assets/arcticBueLogo.png',
			website: 'https://www.arcticbuesport.no',
			description: t['footer.partnerDesc'],
		},
		{
			name: 'Norges Bueskytterforbund',
			logo: '/assets/norgesbueskytterforbund.png',
			website: 'https://www.bueskyting.no',
			description: 'Norges Bueskytterforbund',
		},
	];

	return (
		<>
			<Header />
			<main className={styles.container}>
				<div className={styles.textCenter}>
					<h1 className={styles.title}>{t['sponsingPage.title']}</h1>
					<p className={styles.subtitle}>{t['sponsingPage.subtitle']}</p>
				</div>

				<div className={styles.gridCards}>
					{sponsors.map((sponsor, index) => (
						<div key={index} className={styles.card}>
							<div className={styles.logoWrap}>
								<Image width={120} height={120} src={sponsor.logo} alt={`${sponsor.name} logo`} className={styles.logoImg} />
							</div>
							<h3 className={styles.cardTitle}>{sponsor.name}</h3>
							<p className={styles.cardDesc}>{sponsor.description}</p>
							<a href={sponsor.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
								<span>{t['footer.visitWebsite']}</span>
								<LuExternalLink size={16} aria-hidden="true" />
							</a>
						</div>
					))}
				</div>

				<div className={styles.cta}>
					<div className={styles.ctaGrid}>
						<div className={styles.ctaTextWrap}>
							<h2 className={styles.ctaTitle}>{t['sponsingPage.ctaTitle']}</h2>
							<p className={styles.ctaSubtitle}>{t['sponsingPage.ctaSubtitle1']}</p>
							<p className={styles.ctaSubtitle}>{t['sponsingPage.ctaSubtitle2']}</p>
						</div>
						<div className={styles.ctaFormWrap}>
							<ContactForm />
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
