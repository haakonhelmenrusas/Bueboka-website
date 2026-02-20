import styles from './page.module.css';

export default function PersonvernPage() {
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<h1>Personvernerklæring</h1>

				<div className={styles.notice}>
					<p>
						En fullstendig personvernerklæring er under utarbeidelse. Inntil videre håndteres all persondata i henhold til GDPR-regelverket.
					</p>
				</div>
				<section>
					<h2>1. Dataansvarlig</h2>
					<p>
						<strong>Bueboka</strong>
						<br />
						E-post: contact@bueboka.no
					</p>
				</section>
				<section>
					<h2>2. Hvilke data samler vi inn?</h2>
					<p>Vi samler inn følgende informasjon:</p>
					<ul>
						<li>E-postadresse (for autentisering)</li>
						<li>Navn og klubb (valgfritt)</li>
						<li>Treningsdata (økter, resultater, utstyr)</li>
						<li>Teknisk informasjon (IP-adresse, nettlesertype)</li>
					</ul>
				</section>
				<section>
					<h2>3. Formål</h2>
					<p>Vi bruker dataene dine til:</p>
					<ul>
						<li>Å tilby deg appens funksjoner</li>
						<li>Å forbedre tjenesten</li>
						<li>Å kommunisere med deg om din konto</li>
					</ul>
				</section>
				<section>
					<h2>4. Dine rettigheter</h2>
					<p>Du har rett til å:</p>
					<ul>
						<li>Få innsyn i dine data</li>
						<li>Rette feil i dine data</li>
						<li>Slette din konto og alle tilhørende data</li>
						<li>Eksportere dine data</li>
					</ul>
					<p>
						For å utøve disse rettighetene, kontakt oss på <a href="mailto:contact@bueboka.no">contact@bueboka.no</a>
					</p>
				</section>
				<section>
					<h2>5. Sikkerhet</h2>
					<p>Vi bruker industristandarder for å beskytte dine data, inkludert:</p>
					<ul>
						<li>Krypterte forbindelser (HTTPS)</li>
						<li>Sikker passordlagring (bcrypt)</li>
						<li>Regelmessige sikkerhetsoppdateringer</li>
					</ul>
				</section>

				<section>
					<h2>6. Kontakt</h2>
					<p>
						Har du spørsmål om hvordan vi håndterer dine data?
						<br />
						Kontakt oss på <a href="mailto:contact@bueboka.no">contact@bueboka.no</a>
					</p>
				</section>

				<p className={styles.lastUpdated}>
					<em>Sist oppdatert: 19. februar 2026</em>
				</p>
			</main>
		</div>
	);
}
