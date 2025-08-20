import { Star, Users, Zap } from 'lucide-react';
import styles from './Features.module.css';

export function Features() {
	const features = [
		{
			icon: <Star className={styles.icon} />,
			title: 'Poengregistrering',
			description: 'Hold detaljerte oversikter over skytesesjonene dine og følg forbedringen over tid.',
		},
		{
			icon: <Zap className={styles.icon} />,
			title: 'Prestasjonsanalyse',
			description: 'Få innsikt i skyttemønstrene dine og identifiser områder for forbedring.',
		},
		{
			icon: <Users className={styles.icon} />,
			title: 'Fellesskapsfunksjoner',
			description: 'Koble deg til andre bueskyttere, del fremgangen din, og lær av fellesskapet.',
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
					<h3 className={styles.ctaTitle}>Se fremgangen din i sanntid</h3>
					<p className={styles.ctaText}>
						Med vårt intuitive dashbord og detaljerte analyser vil du alltid vite nøyaktig hvordan du forbedrer deg og hva du skal fokusere
						på videre.
					</p>

					<div className={styles.tiles}>
						<div
							className={`${styles.tile} ${styles.tileHover}`}
							style={{
								backgroundImage: `url('https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGF0aXN0aWNzJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc1NTI2MDk0NXww&ixlib=rb-4.1.0&q=80&w=1080')`,
							}}
						/>
						<div
							className={`${styles.tile} ${styles.tileHover}`}
							style={{
								backgroundImage: `url('https://images.unsplash.com/photo-1612198273689-b437f53152ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaCUyMGNoYXJ0JTIwZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzU1MjYwOTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
							}}
						/>
						<div
							className={`${styles.tile} ${styles.tileHover}`}
							style={{
								backgroundImage: `url('https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTUxNzUxOTF8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
// ... existing code ...
