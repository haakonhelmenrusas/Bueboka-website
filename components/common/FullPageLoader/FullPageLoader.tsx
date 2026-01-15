'use client';

import React from 'react';
import styles from './FullPageLoader.module.css';

const loadingMessages = [
	'Henter dine treningsøkter...',
	'Laster inn ditt utstyr...',
	'Sammenstiller statistikk...',
	'Forberederer dashboardet...',
	'Synkroniserer dataene dine...',
	'Nesten klar...',
];

export function FullPageLoader() {
	const [messageIndex, setMessageIndex] = React.useState(0);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className={styles.overlay}>
			<div className={styles.container}>
				<div className={styles.logoContainer}>
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logo}>
						<path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						<path
							d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>

				<div className={styles.spinner} />

				<h1 className={styles.title}>Bueboka</h1>

				<div className={styles.messageContainer}>
					<p className={styles.message}>{loadingMessages[messageIndex]}</p>
				</div>

				<div className={styles.dots}>
					<span className={styles.dot} />
					<span className={styles.dot} />
					<span className={styles.dot} />
				</div>
			</div>
		</div>
	);
}
