import { Key, Shield, Target } from 'lucide-react';
import styles from './Privacy.module.css';

export function Privacy() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
						<h2 className={styles.title}>Dine data er trygge hos oss</h2>
						<p className={styles.subtitle}>
							Vi tar personvern på alvor og forplikter oss til å beskytte informasjonen din. Hos Bueboka har du full kontroll over dine egne
							data.
						</p>
					</div>
					<div className={styles.grid}>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '0ms' }}>
							<div className={styles.iconBox}>
								<Shield className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>100% personvern</h3>
							<p className={styles.cardText}>
								Vi deler eller selger aldri dataene dine til tredjeparter. Din informasjon forblir privat og tilhører kun deg. All data
								krypteres og lagres sikkert i samsvar med GDPR.
							</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '160ms' }}>
							<div className={styles.iconBox}>
								<Target className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>Kun til appens drift</h3>
							<p className={styles.cardText}>
								Vi bruker dataene dine utelukkende til å drive appen og gi deg den beste brukeropplevelsen. Ingen analyse, ingen
								markedsføring, ingen annen bruk.
							</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '320ms' }}>
							<div className={styles.iconBox}>
								<Key className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>Din kontroll</h3>
							<p className={styles.cardText}>
								Du har full kontroll over dine data. Slett kontoen din når som helst, og all tilhørende informasjon fjernes permanent. Ingen
								bindinger, ingen skjulte agendaer.
							</p>
						</div>
					</div>
					<div className={`${styles.footer} ${styles.reveal}`} style={{ animationDelay: '480ms' }}>
						<p className={styles.footerText}>Har du spørsmål om hvordan vi håndterer dataene dine? Ta gjerne kontakt med oss.</p>
					</div>
				</div>
			</div>
		</section>
	);
}
