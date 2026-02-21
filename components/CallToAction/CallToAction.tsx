import Link from 'next/link';
import { ArrowRight, BarChart3, Target, Zap } from 'lucide-react';
import styles from './CallToAction.module.css';

export function CallToAction() {
	return (
		<section className={styles.section} aria-labelledby="cta-heading">
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
						<h2 id="cta-heading" className={styles.title}>
							Klar til å ta treningen din til neste nivå?
						</h2>
						<p className={styles.subtitle}>
							Bli med i fellesskapet av bueskyttere som bruker Bueboka for å spore fremgang, analysere statistikk og optimalisere sin
							skyting.
						</p>
					</div>

					<div className={styles.featuresGrid}>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '0ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<Zap />
							</div>
							<h3 className={styles.featureTitle}>Kom i gang på sekunder</h3>
							<p className={styles.featureText}>Registrer deg med e-post eller Google og begynn å logge treningsøkter med en gang.</p>
						</div>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '120ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<BarChart3 />
							</div>
							<h3 className={styles.featureTitle}>Følg din fremgang</h3>
							<p className={styles.featureText}>Se detaljert statistikk over treningsøktene dine og følg utviklingen over tid.</p>
						</div>
						<div className={`${styles.featureCard} ${styles.reveal}`} style={{ animationDelay: '240ms' }}>
							<div className={styles.featureIcon} aria-hidden="true">
								<Target />
							</div>
							<h3 className={styles.featureTitle}>Optimaliser skytingen</h3>
							<p className={styles.featureText}>Administrer utstyr, registrer siktemerker, og få innsikt som forbedrer nøyaktigheten.</p>
						</div>
					</div>

					<div className={`${styles.ctaBlock} ${styles.reveal}`} style={{ animationDelay: '360ms' }}>
						<Link href="/ny-bruker" className={styles.ctaButton}>
							Opprett bruker
							<ArrowRight className={styles.ctaIcon} aria-hidden="true" />
						</Link>
						<p className={styles.ctaSubtext}>Gratis å bruke. Ingen kredittkort nødvendig.</p>
						<p className={styles.existingUser}>
							Har du allerede en konto?{' '}
							<Link href="/logg-inn" className={styles.loginLink}>
								Logg inn her
							</Link>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
