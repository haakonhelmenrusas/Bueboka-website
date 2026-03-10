import { LuBriefcase, LuChartBar, LuTarget } from 'react-icons/lu';
import styles from './Features.module.css';

export function Features() {
	const features = [
		{
			icon: <LuTarget className={styles.icon} aria-hidden="true" />,
			title: 'Registering av trening',
			description: 'Hold detaljerte oversikter over skytesesjonene dine og følg forbedringen over tid.',
		},
		{
			icon: <LuChartBar className={styles.icon} aria-hidden="true" />,
			title: 'Beregning siktemerker',
			description: 'Skyt, legg inn og få dine siktemerker beregnet.',
		},
		{
			icon: <LuBriefcase className={styles.icon} aria-hidden="true" />,
			title: 'Full kontroll på utstyr',
			description: 'Lagre din profil med klubb, buer og pilsett.',
		},
	];

	return (
		<section id="features" className={styles.section} aria-labelledby="features-heading">
			<div className={styles.container}>
				<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
					<h2 id="features-heading" className={styles.title}>
						Alt du trenger for å lykkes
					</h2>
					<p className={styles.subtitle}>
						Bueboka tilbyr omfattende verktøy for å hjelpe deg bli en bedre bueskytter, enten du er nybegynner eller erfaren.
					</p>
				</div>
				<div className={styles.grid}>
					{features.map((feature, index) => (
						<div key={index} className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: `${index * 120}ms` }}>
							<div className={styles.iconBox}>{feature.icon}</div>
							<h3 className={styles.cardTitle}>{feature.title}</h3>
							<p className={styles.cardText}>{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
