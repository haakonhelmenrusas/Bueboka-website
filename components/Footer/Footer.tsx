'use client';

import { Github } from 'lucide-react';
import { AppStoreBadge } from '@/components';
import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
	const handleLogoClick = (e: React.MouseEvent) => {
		const currentUrl = window.location.href;
		const targetUrl = window.location.origin + window.location.pathname;

		if (currentUrl === targetUrl) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	return (
		<footer id="contact" className={styles.footer}>
			<div className={styles.container}>
				<div className={`${styles.center} ${styles.revealOnce}`}>
					<Link href="/" onClick={handleLogoClick} className={`${styles.logoLink} ${styles.pressable}`}>
						<div className={styles.logoBox}>
							<Image width={24} height={24} src="/assets/logo.png" alt="Bueboka Logo" className={styles.logoImg} />
						</div>
						<span className={styles.brandText}>Bueboka</span>
					</Link>
					<p className={styles.lead}>
						Klar til å ta bueskyting-ferdighetene dine til neste nivå? Sjekk ut koden vår på GitHub eller last ned appen i dag.
					</p>
					<div className={styles.ctaRow}>
						<a
							href="https://github.com/haakonhelmenrusas/Bueboka-website/"
							target="_blank"
							className={`${styles.ctaBtn} ${styles.pressable}`}
						>
							<Github className={styles.icon} />
							<span>GitHub</span>
						</a>
					</div>
					<div className={styles.badgesRow}>
						<AppStoreBadge store="ios" href="https://apps.apple.com/app/bueboka" />
						<AppStoreBadge store="android" href="https://play.google.com/store/apps/details?id=com.bueboka" />
					</div>
					<div className={styles.separator}>
						<p className={styles.finePrint}>
							© 2025 Bueboka. Alle rettigheter forbeholdt. Laget med ❤️ av{' '}
							<a
								href="https://rusåsdesign.no"
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.creditLink} ${styles.scaleOnHover}`}
							>
								Rusås Design
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
