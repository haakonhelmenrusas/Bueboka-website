import { ContactForm, Footer, Header } from '@/components';
import Image from 'next/image';
import { LuExternalLink } from 'react-icons/lu';
import styles from './page.module.css';

export default function SponsingPage() {
	const sponsors = [
		{
			name: 'Arctic bueskyting',
			logo: '/assets/arcticBueLogo.png',
			website: 'https://www.arcticbuesport.no',
			description: 'Premium utstyr for alle bueskyttere',
		},
		{
			name: 'Norges Bueskytterforbund',
			logo: '/assets/norgesBueskytterforbund.png',
			website: 'https://www.bueskyting.no',
			description: 'Norges Bueskytterforbund',
		},
	];

	return (
		<>
			<Header />
			<main className={styles.container}>
				<div className={styles.textCenter}>
					<h1 className={styles.title}>Våre samarbeidspartnere</h1>
					<p className={styles.subtitle}>Vi er stolte av å samarbeide med ledende aktører i bueskyting-miljøet som støtter vår visjon.</p>
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
								<span>Besøk nettside</span>
								<LuExternalLink size={16} aria-hidden="true" />
							</a>
						</div>
					))}
				</div>

				<div className={styles.cta}>
					<div className={styles.ctaGrid}>
						<div className={styles.ctaTextWrap}>
							<h2 className={styles.ctaTitle}>Vil du bli sponsor?</h2>
							<p className={styles.ctaSubtitle}>
								Vi søker partnere som deler vår lidenskap for bueskyting og ønsker å støtte utviklingen av appen. Som sponsor får du
								synlighet i appen og på nettsiden vår.
							</p>
							<p className={styles.ctaSubtitle}>Ta kontakt med oss via skjemaet for å lære mer om samarbeidsmuligheter.</p>
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
