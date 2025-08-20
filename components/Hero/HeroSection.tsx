import Image from 'next/image';
import React from 'react';
import styles from './HeroSection.module.css';
import { AppStoreBadge, HeroBackground } from '@/components';

export function HeroSection() {
	return (
		<section className={styles.section}>
			<HeroBackground />

			<div className={styles.container}>
				<div className={styles.grid}>
					{/* Left: Hero content */}
					<div className={styles.left}>
						<div className={styles.brandPill}>
							<Image src="/assets/logo.png" alt="Logo" width={48} height={48} priority />
							<span className={styles.pillText}>Bueskyting for alle</span>
						</div>

						<h1 className={styles.title}>
							<span className={styles.titleGradient}>Bueboka</span>
						</h1>

						<p className={styles.subtitle}>Hold oversikt over trening, resultater og utstyr. Laget for bueskyttere – av bueskyttere.</p>

						<div className={styles.badges}>
							<AppStoreBadge store="android" href="https://play.google.com/store/apps/details?id=com.aaronshade.bueboka&hl=no_nb" />
							<AppStoreBadge store="ios" href="https://apps.apple.com/no/app/bueboka/id6448108838?l=nb" />
						</div>
					</div>

					{/* Right: Phone mockups */}
					<div className={styles.right}>
						<div className={styles.phoneCard}>
							<Image src="/assets/iOS.png" alt="iOS app preview" width={400} height={680} className={styles.phoneImg} priority />
						</div>
						<div className={`${styles.phoneCard} ${styles.phoneOffset}`}>
							<Image src="/assets/Android.png" alt="Android app preview" width={300} height={560} className={styles.phoneImg} priority />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
