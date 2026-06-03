'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { LuChevronRight } from 'react-icons/lu';
import styles from './HeroSection.module.css';
import { AppStoreBadge, HeroBackground } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

export function HeroSection() {
	const { t, locale } = useTranslation();
	const suffix = locale === 'en' ? 'en' : 'no';

	return (
		<section className={styles.section} aria-label="Hovedbanner">
			<HeroBackground />
			<div className={styles.container}>
				<div className={styles.grid}>
					<div className={styles.left}>
						<h1 className={styles.title}>
							<span className={styles.titleGradient}>Bueboka</span>
						</h1>
						<p className={styles.subtitle}>{t['hero.subtitle']}</p>
						<div className={styles.badges}>
							<AppStoreBadge store="android" href="https://play.google.com/store/apps/details?id=com.aaronshade.bueboka&hl=no_nb" />
							<AppStoreBadge store="ios" href="https://apps.apple.com/no/app/bueboka/id6448108838?l=nb" />
						</div>
						<div className={styles.heroCta}>
							<div className={styles.heroCtaDivider}>
								<span className={styles.heroCtaDividerText}>{t['hero.orUseWeb']}</span>
							</div>
							<Link tabIndex={1} href="/ny-bruker" className={styles.heroCtaButton}>
								{t['hero.registerUser']}
								<LuChevronRight size={18} aria-hidden="true" />
							</Link>
							<p className={styles.heroCtaLogin}>
								{t['hero.alreadyHaveAccount']} <Link href="/logg-inn">{t['hero.login']}</Link>
							</p>
						</div>
					</div>
					<div className={styles.right}>
						<div className={styles.phoneCard}>
							<Image
								src={`/assets/screenshots/01_hero_appstore_${suffix}.png`}
								alt={t['hero.screenshotHeroAlt']}
								width={460}
								height={1000}
								className={styles.phoneImg}
								priority
							/>
						</div>
						<div className={`${styles.phoneCard} ${styles.phoneOffset}`}>
							<Image
								src={`/assets/screenshots/02_training_appstore_${suffix}.png`}
								alt={t['hero.screenshotTrainingAlt']}
								width={460}
								height={1000}
								className={styles.phoneImg}
								priority
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
