'use client';

import React from 'react';
import Image from 'next/image';
import { LuExternalLink } from 'react-icons/lu';
import styles from './Contributors.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function Contributors() {
	const { t } = useTranslation();

	const contributors = [
		{
			name: 'Haakon Helmen Rusås',
			role: t['contributors.roleProjectLeadDeveloper'],
			website: 'https://rusåsdesign.no',
			initials: 'HHR',
			image: '/assets/haakon.jpg',
		},
		{
			name: 'Per Olav Rusås',
			role: t['contributors.roleDeveloperArcher'],
			initials: 'PR',
			image: '/assets/per_olav.jpeg',
		},
		{
			name: 'Martine Helmen Rusås',
			role: t['contributors.roleDeveloperArcher'],
			initials: 'MHR',
			image: '/assets/martine.jpg',
		},
		{
			name: 'Fanny Hamran',
			role: t['contributors.roleUxDesigner'],
			website: 'https://www.linkedin.com/in/fannyhamran?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
			initials: 'FH',
		},
	];

	return (
		<section id="team" className={styles.section} aria-labelledby="team-heading">
			<div className={styles.container}>
				<div className={`${styles.textCenter} ${styles.mb16} ${styles.reveal}`}>
					<h2 id="team-heading" className={styles.title}>
						{t['contributors.title']}
					</h2>
					<p className={styles.subtitle}>{t['contributors.subtitle']}</p>
				</div>

				<div className={styles.grid}>
					{contributors.map((contributor, index) => (
						<div key={index} className={`${styles.card} ${styles.reveal}`} style={{ animationDelay: `${index * 100}ms` }}>
							{contributor.image ? (
								<div>
									<Image
										src={contributor.image}
										alt={`${contributor.name} ${t['contributors.profileImageAlt']}`}
										width={100}
										height={100}
										className={styles.profile}
									/>
								</div>
							) : (
								<div className={styles.avatar} role="img" aria-label={`${contributor.name} ${t['contributors.initialsLabel']}`}>
									<span className={styles.avatarText} aria-hidden="true">
										{contributor.initials}
									</span>
								</div>
							)}
							<h3 className={styles.name}>{contributor.name}</h3>
							<p className={styles.role}>{contributor.role}</p>
							{contributor.website && (
								<a href={contributor.website} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.scaleOnHover}`}>
									<span>{t['contributors.visitWebsite']}</span>
									<LuExternalLink className={styles.externalIcon} aria-hidden="true" />
									<span className="sr-only">{t['contributors.openNewTab']}</span>
								</a>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
