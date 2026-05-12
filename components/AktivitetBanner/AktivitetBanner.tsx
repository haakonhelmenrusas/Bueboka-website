'use client';

import { useEffect, useState } from 'react';
import { LuActivity, LuX } from 'react-icons/lu';
import styles from './AktivitetBanner.module.css';
import { useTranslation } from '@/context/LanguageProvider';

const STORAGE_KEY = 'aktivitet-banner-dismissed';

export function AktivitetBanner() {
	const { t } = useTranslation();
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
				<h2 className={styles.introBannerTitle}>{t['aktBanner.title']}</h2>
				<p className={styles.introBannerDescription}>{t['aktBanner.description']}</p>
			</div>
			<button className={styles.introBannerClose} onClick={handleDismiss} aria-label={t['aktBanner.close']}>
				<LuX size={18} />
			</button>
		</div>
	);
}
