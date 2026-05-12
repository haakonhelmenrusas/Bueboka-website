'use client';

import { LuBriefcase, LuChartBar, LuTarget } from 'react-icons/lu';
import styles from './Features.module.css';
import { useTranslation } from '@/context/LanguageProvider';

export function Features() {
	const { t } = useTranslation();

	const features = [
		{
			icon: <LuTarget className={styles.icon} aria-hidden="true" />,
			title: t['features.1title'],
			description: t['features.1text'],
		},
		{
			icon: <LuChartBar className={styles.icon} aria-hidden="true" />,
			title: t['features.2title'],
			description: t['features.2text'],
		},
		{
			icon: <LuBriefcase className={styles.icon} aria-hidden="true" />,
			title: t['features.3title'],
			description: t['features.3text'],
		},
	];

	return (
		<section id="features" className={styles.section} aria-labelledby="features-heading">
			<div className={styles.container}>
				<div className={`${styles.reveal} ${styles.textCenter} ${styles.headerBlock}`}>
					<h2 id="features-heading" className={styles.title}>
						{t['features.title']}
					</h2>
					<p className={styles.subtitle}>{t['features.subtitle']}</p>
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
