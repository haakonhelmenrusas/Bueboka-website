import { LuKey, LuShield, LuTarget } from 'react-icons/lu';
import styles from './Privacy.module.css';

export function Privacy() {
	return (
		<section className={styles.section} aria-labelledby="privacy-heading">
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
						<h2 id="privacy-heading" className={styles.title}>
							Dine data er trygge hos oss
						</h2>
						<p className={styles.subtitle}>
							Vi tar personvern på alvor og forplikter oss til å beskytte informasjonen din. Hos Bueboka har du full kontroll over dine egne
							data.
						</p>
					</div>
					<div className={styles.grid}>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '0ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuShield className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>100% personvern</h3>
							<p className={styles.cardText}>
								Vi selger aldri dine data. Informasjonen din blir behandlet konfidensielt og lagres sikkert. Bueboka er bygget for
								bueskyttere, av bueskyttere, ikke for å tjene penger på dataene dine.
							</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '160ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuTarget className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>Kun til appens drift</h3>
							<p className={styles.cardText}>
								Alle data som samles inn brukes utelukkende til å gi deg en bedre opplevelse av appen. Ingen tredjeparter har tilgang til
								personopplysningene dine. Vi fokuserer på skyting, ikke salg.
							</p>
						</div>
						<div className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: '320ms' }}>
							<div className={styles.iconBox} aria-hidden="true">
								<LuKey className={styles.icon} />
							</div>
							<h3 className={styles.cardTitle}>Din kontroll</h3>
							<p className={styles.cardText}>
								Du har full kontroll over dine data. Slett kontoen din når som helst, og all tilhørende informasjon fjernes permanent.
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
