import { LuArrowUpRight, LuUsers } from 'react-icons/lu';
import { SiFacebook } from 'react-icons/si';
import styles from './SocialMedia.module.css';

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
	return (
		<section id="community" className={styles.section} aria-labelledby="social-heading">
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.badge}>
						<LuUsers size={14} />
						<span>Fellesskap</span>
					</div>
					<h2 id="social-heading" className={styles.title}>
						Bli en del av fellesskapet
					</h2>
					<p className={styles.subtitle}>
						Vi er aktive på sosiale medier! Bli med i samtalen, del opplevelser og hold deg oppdatert på alt som skjer i
						Bueboka-fellesskapet.
					</p>
				</div>

				<div className={styles.cards}>
					{/* Facebook */}
					<a
						href={FACEBOOK_URL}
						target="_blank"
						rel="noopener noreferrer"
						className={`${styles.card} ${styles.facebookCard}`}
						aria-label="Åpne Bueboka sin Facebook-gruppe (åpner i ny fane)"
					>
						<div className={`${styles.cardTop} ${styles.facebookTop}`}>
							<SiFacebook className={styles.platformIcon} aria-hidden="true" />
							<div className={styles.platformBrand}>Facebook</div>
						</div>
						<div className={styles.cardBody}>
							<p className={styles.platformText}>
								Bli med i vår Facebook-gruppe der bueskyttere over hele landet deler erfaringer, stiller spørsmål og feirer resultater. Et
								aktivt og hyggelig fellesskap for alle nivåer.
							</p>
							<div className={`${styles.cta} ${styles.facebookCta}`}>
								<span>Åpne Facebook-siden</span>
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
						aria-label="Besøk Bueboka sin Hudd-gruppe (åpner i ny fane)"
					>
						<div className={`${styles.cardTop} ${styles.huddTop}`}>
							<HuddLogo className={styles.platformIcon} />
							<div className={styles.platformBrand}>Hudd</div>
						</div>
						<div className={styles.cardBody}>
							<p className={styles.platformText}>
								Finn oss på Hudd – den norske plattformen. Delta i diskusjoner, hold deg oppdatert og knytt kontakt med bueskyttere i ditt
								nærområde.
							</p>
							<div className={`${styles.cta} ${styles.huddCta}`}>
								<span>Besøk oss på Hudd</span>
								<LuArrowUpRight size={18} aria-hidden="true" />
							</div>
						</div>
					</a>
				</div>
			</div>
		</section>
	);
}
