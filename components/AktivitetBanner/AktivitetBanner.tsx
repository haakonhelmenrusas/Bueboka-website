'use client';

import { useEffect, useState } from 'react';
import { LuActivity, LuX } from 'react-icons/lu';
import styles from './AktivitetBanner.module.css';

const STORAGE_KEY = 'aktivitet-banner-dismissed';

export function AktivitetBanner() {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY) === '1') {
			setVisible(false);
		}
	}, []);

	const handleDismiss = () => {
		localStorage.setItem(STORAGE_KEY, '1');
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div className={styles.introBanner}>
			<div className={styles.introBannerIcon}>
				<LuActivity size={24} />
			</div>
			<div className={styles.introBannerText}>
				<h2 className={styles.introBannerTitle}>Din treningslogg</h2>
				<p className={styles.introBannerDescription}>
					Her finner du alle treningene og konkurransene du har registrert. Bla gjennom historikken, se detaljer om enkeltøkter, og hold
					oversikt over fremgangen din over tid.
				</p>
			</div>
			<button className={styles.introBannerClose} onClick={handleDismiss} aria-label="Lukk informasjonsbanner">
				<LuX size={18} />
			</button>
		</div>
	);
}
