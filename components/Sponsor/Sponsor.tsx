import { ExternalLink } from 'lucide-react';
import styles from './Sponsor.module.css';
import { ContactForm } from '@/components';

export function Sponsors() {
	const sponsors = [
		{
			name: 'Arctic bueskyting',
			logo: './assets/arcticBueLogo.png',
			website: 'https://www.archeryproshop.com',
			description: 'Premium utstyr for alle bueskyttere',
		},
	];

	return (
		<section id="sponsors" className={styles.section}>
			<div className={styles.container}>
				<div className={`${styles.textCenter} ${styles.mb16} ${styles.reveal}`}>
					<h2 className={styles.title}>Våre sponsorer</h2>
					<p className={styles.subtitle}>Vi er stolte av å samarbeide med ledende aktører i bueskyting-miljøet som støtter vår visjon.</p>
				</div>

				<div className={styles.gridCards}>
					{sponsors.map((sponsor, index) => (
						<div key={index} className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: `${index * 100}ms` }}>
							<div className={styles.logoWrap}>
								<img src={sponsor.logo} alt={sponsor.name} className={styles.logoImg} />
							</div>
							<h3 className={styles.cardTitle}>{sponsor.name}</h3>
							<p className={styles.cardDesc}>{sponsor.description}</p>
							<a href={sponsor.website} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.scaleOnHover}`}>
								<span>Besøk nettside</span>
								<ExternalLink className={styles.linkIconSm} />
							</a>
						</div>
					))}
				</div>

				<div className={`${styles.textCenter} ${styles.reveal}`} style={{ animationDelay: '800ms' }}>
					<div className={styles.cta}>
						<div className={styles.ctaGrid}>
							<div className={styles.ctaTextWrap}>
								<h3 className={styles.ctaTitle}>Vil du bli sponsor?</h3>
								<p className={styles.ctaSubtitle}>
									Vi søker partnere som deler vår lidenskap for bueskyting og ønsker å støtte utviklingen av appen. Kontakt oss for å lære
									mer om samarbeidsmuligheter.
								</p>
							</div>

							<div className={styles.ctaFormWrap}>
								{/* Keep existing component usage */}
								<ContactForm />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
// ... existing code ...