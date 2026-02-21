import { ChartBar, Target, ToolCase } from 'lucide-react';
import styles from './Features.module.css';

export function Features() {
	const features = [
		{
			icon: <Target className={styles.icon} />,
			title: 'Registering av trening',
			description: 'Hold detaljerte oversikter over skytesesjonene dine og følg forbedringen over tid.',
		},
		{
			icon: <ChartBar className={styles.icon} />,
			title: 'Beregning siktemerker',
			description: 'Skyt, legg inn og få dine siktemerker beregnet.',
		},
		{
			icon: <ToolCase className={styles.icon} />,
			title: 'Full kontroll på utstyr',
			description: 'Lagre din profil med klubb, buer og pilsett.',
		},
	];

	return (
		<section id="features" className={styles.section}>
			<div className={styles.container}>
				<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
					<h2 className={styles.title}>Alt du trenger for å lykkes</h2>
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
				<div className={`${styles.cta} ${styles.reveal}`} style={{ animationDelay: '600ms' }}>
					<h3 className={styles.ctaTitle}>Nye funksjoner tilgjengelig nå!</h3>
					<p className={styles.ctaText}>Vi har lansert statistikk og enkel pålogging med e-post eller Google. Kom i gang i dag!</p>
					<div className={styles.tiles}>
						<div>
							<div className={styles.bulletContainer}>
								<div className={styles.bullet} />
								<p>Detaljert statistikk ✨</p>
							</div>
							<div
								className={`${styles.tile}`}
								style={{
									backgroundImage: `url('https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
								}}
							/>
						</div>
						<div>
							<div className={styles.bulletContainer}>
								<div className={styles.bullet} />
								<p>Innlogging med Google ✨</p>
							</div>
							<div
								className={`${styles.tile}`}
								style={{
									backgroundImage: `url('https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTUxNzUxOTF8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
								}}
							/>
						</div>
						<div>
							<div className={styles.bulletContainer}>
								<div className={styles.bullet} />
								<p>Snart: Registrering av score</p>
							</div>
							<div
								className={`${styles.tile}`}
								style={{
									backgroundImage: `url('https://plus.unsplash.com/premium_photo-1718315730752-eb55b9b6afa8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
