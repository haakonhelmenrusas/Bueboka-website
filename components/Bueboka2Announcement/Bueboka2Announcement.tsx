import { ArrowPathIcon, BoltIcon, ChevronRightIcon, CloudIcon, DevicePhoneMobileIcon, SparklesIcon } from '@heroicons/react/24/outline';
import styles from './Bueboka2Announcement.module.css';

export function Bueboka2Announcement() {
	return (
		<section className={styles.section} aria-label="Bueboka 2.0 Announcement">
			<div className={styles.container}>
				<div className={styles.badge}>
					<SparklesIcon className="w-4 h-4" />
					<span>Nyheter</span>
				</div>

				<div className={styles.content}>
					<h2 className={styles.title}>
						Velkommen til <span className={styles.highlight}>Bueboka 2.0</span>
					</h2>
					<p className={styles.subtitle}>
						Den neste generasjonen av Norges mest populære app for bueskyttere er her! Helt ny plattform med kraftigere funksjoner, bedre
						ytelse og sømløs synkronisering på tvers av alle enheter.
					</p>

					<div className={styles.features}>
						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<BoltIcon className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>Lynrask opplevelse</h3>
								<p className={styles.featureText}>
									Helt ny teknologi gir deg raskere lasting, jevnere animasjoner og bedre ytelse på alle enheter.
								</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<CloudIcon className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>Skybasert og synkronisert</h3>
								<p className={styles.featureText}>
									All data synkroniseres automatisk. Start på mobilen, fortsett på nettbrett, fullfør på PC - dataen er alltid oppdatert.
								</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>
								<ArrowPathIcon className="w-6 h-6" />
							</div>
							<div className={styles.featureContent}>
								<h3 className={styles.featureTitle}>Moderne grensesnitt</h3>
								<p className={styles.featureText}>
									Redesignet fra bunnen av med fokus på brukervennlighet, tilgjengelighet og moderne design.
								</p>
							</div>
						</div>
					</div>

					<div className={styles.upgradeNotice}>
						<div className={styles.upgradeIcon}>
							<DevicePhoneMobileIcon className="w-8 h-8" />
						</div>
						<div className={styles.upgradeContent}>
							<h3 className={styles.upgradeTitle}>Viktig for mobilapp-brukere</h3>
							<p className={styles.upgradeText}>
								Den nye mobilappen lanseres <strong>før sommeren 2026</strong> og erstatter den nåværende versjonen. Den nye appen er bygget
								på samme teknologi som nettsiden og gir deg en mye bedre opplevelse!
							</p>
							<div className={styles.upgradeWarning}>
								<div className={styles.warningIcon}>⚠️</div>
								<div>
									<strong>Husk å overføre dataene dine:</strong> Hvis du har treningsdata i den gamle appen, sørg for å overføre dem før du
									oppdaterer til den nye versjonen. Vi sender mer informasjon om dette når den nye appen er klar.
								</div>
							</div>
						</div>
					</div>

					<div className={styles.cta}>
						<a href="/ny-bruker" className={styles.primaryButton}>
							Kom i gang med Bueboka 2.0
							<ChevronRightIcon className="w-5 h-5" />
						</a>
						<a href="/logg-inn" className={styles.secondaryButton}>
							Logg inn
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
