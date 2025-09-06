import { ExternalLink } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import styles from './Contributors.module.css';

export function Contributors() {
	const contributors = [
		{
			name: 'Haakon Helmen Rusås',
			role: 'Prosjektleder | Utvikler',
			website: 'https://rusåsdesign.no',
			initials: 'HHR',
			image: '/assets/haakon.jpg',
		},
		{
			name: 'Per Olav Rusås',
			role: 'Utvikler | Bueskytter',
			initials: 'PR',
			image: '/assets/per_olav.jpeg',
		},
		{
			name: 'Martine Helmen Rusås',
			role: 'Utvikler | Bueskytter',
			initials: 'MHR',
			image: '/assets/martine.jpg',
		},
		{
			name: 'Fanny Hamran',
			role: 'UX Designer',
			website: 'https://www.linkedin.com/in/fannyhamran?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
			initials: 'FH',
		},
	];

	return (
		<section id="team" className={styles.section}>
			<div className={styles.container}>
				<div className={`${styles.textCenter} ${styles.mb16} ${styles.reveal}`}>
					<h2 className={styles.title}>Møt teamet</h2>
					<p className={styles.subtitle}>
						De lidenskapelige personene bak Bueboka som er dedikert til å forbedre bueskyting-opplevelsen for alle.
					</p>
				</div>

				<div className={styles.grid}>
					{contributors.map((contributor, index) => (
						<div key={index} className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: `${index * 100}ms` }}>
							{contributor.image ? (
								<div>
									<Image src={contributor.image} alt="Profile picture" width={100} height={100} className={styles.profile} />
								</div>
							) : (
								<div className={styles.avatar}>
									<span className={styles.avatarText}>{contributor.initials}</span>
								</div>
							)}
							<h3 className={styles.name}>{contributor.name}</h3>
							<p className={styles.role}>{contributor.role}</p>
							{contributor.website && (
								<a href={contributor.website} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.scaleOnHover}`}>
									<span>Besøk nettside</span>
									<ExternalLink className={styles.externalIcon} />
								</a>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
