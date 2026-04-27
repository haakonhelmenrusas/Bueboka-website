import type { Metadata } from 'next';
import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';
import styles from './page.module.css';

export const metadata: Metadata = {
	title: 'Slett konto – Bueboka',
	description: 'Steg-for-steg veiledning for å slette Bueboka-kontoen din og alle tilhørende data.',
};

export default function SlettKontoPage() {
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<Link href="/" className={styles.backLink}>
					<LuArrowLeft size={16} />
					Tilbake til forsiden
				</Link>

				<h1>Slett konto</h1>

				<p className={styles.lead}>
					Du kan når som helst slette Bueboka-kontoen din. Sletting er permanent – alle dine data, inkludert treningsøkter,
					konkurranse&shy;resultater, utstyr og siktemerker, vil bli fjernet for godt og kan ikke gjenopprettes.
				</p>

				<div className={styles.warning}>
					<p>
						<strong>⚠️ Advarsel:</strong> Sletting av kontoen kan ikke angres. Sørg for at du har tatt vare på informasjon du ønsker å
						beholde før du fortsetter.
					</p>
				</div>

				{/* ── Mobile app ── */}
				<div className={styles.method}>
					<h2>
						Via mobilappen <span className={styles.methodBadge}>iOS &amp; Android</span>
					</h2>
					<ol className={styles.steps}>
						<li className={styles.step}>
							<span className={styles.stepNumber}>1</span>
							<div className={styles.stepContent}>
								<strong>Åpne Bueboka-appen</strong>
								<p>Start appen på telefonen din og logg inn hvis du ikke allerede er innlogget.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>2</span>
							<div className={styles.stepContent}>
								<strong>Gå til Min side</strong>
								<p>Trykk på profil-ikonet eller «Min side» i navigasjonsmenyen nederst på skjermen.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>3</span>
							<div className={styles.stepContent}>
								<strong>Åpne Innstillinger</strong>
								<p>Trykk på tannhjulet eller «Innstillinger» øverst til høyre på profilsiden.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>4</span>
							<div className={styles.stepContent}>
								<strong>Velg «Slett konto»</strong>
								<p>Rull ned til bunnen av innstillingssiden og trykk på «Slett konto».</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>5</span>
							<div className={styles.stepContent}>
								<strong>Bekreft slettingen</strong>
								<p>
									Du vil bli bedt om å bekrefte at du virkelig ønsker å slette kontoen. Les advarselen nøye og trykk «Bekreft» for å
									fullføre. Kontoen og alle data slettes umiddelbart.
								</p>
							</div>
						</li>
					</ol>
				</div>

				<hr className={styles.divider} />

				{/* ── Web ── */}
				<div className={styles.method}>
					<h2>
						Via nettleseren <span className={styles.methodBadge}>Web</span>
					</h2>
					<ol className={styles.steps}>
						<li className={styles.step}>
							<span className={styles.stepNumber}>1</span>
							<div className={styles.stepContent}>
								<strong>Logg inn på bueboka.no</strong>
								<p>
									Gå til{' '}
									<Link href="/logg-inn" style={{ color: '#0c82ac' }}>
										bueboka.no/logg-inn
									</Link>{' '}
									og logg inn med e-post og passord.
								</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>2</span>
							<div className={styles.stepContent}>
								<strong>Gå til Profil</strong>
								<p>Klikk på profilmenyen øverst til høyre og velg «Profil», eller gå direkte til /profil.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>3</span>
							<div className={styles.stepContent}>
								<strong>Åpne Innstillinger</strong>
								<p>Klikk på «Innstillinger» i profilmenyen eller på profil-siden.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>4</span>
							<div className={styles.stepContent}>
								<strong>Velg «Slett konto»</strong>
								<p>Rull ned til bunnen av siden og klikk på «Slett konto»-knappen.</p>
							</div>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>5</span>
							<div className={styles.stepContent}>
								<strong>Bekreft slettingen</strong>
								<p>
									En bekreftelsesdialog vises. Klikk «Bekreft» for å fullføre slettingen. Du logges ut umiddelbart og kontoen fjernes
									permanent.
								</p>
							</div>
						</li>
					</ol>
				</div>

				<hr className={styles.divider} />

				{/* ── Contact ── */}
				<div className={styles.contact}>
					<h2>Trenger du hjelp?</h2>
					<p>
						Hvis du har problemer med å slette kontoen, eller ønsker at vi skal gjøre det manuelt på dine vegne, ta kontakt med oss på{' '}
						<a href="mailto:contact@bueboka.no">kontakt@bueboka.no</a>. Vi er her for å hjelpe!
					</p>
				</div>

				<p className={styles.lastUpdated}>
					<em>Sist oppdatert: 27. april 2026</em>
				</p>
			</main>
		</div>
	);
}
