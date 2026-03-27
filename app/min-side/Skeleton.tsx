'use client';

import React from 'react';
import styles from './page.module.css';
import headerStyles from '@/components/Header/Header.module.css';
import equipmentStyles from '@/components/EquipmentSection/EquipmentSection.module.css';

function SkeletonBlock({ className }: { className: string }) {
	return <div className={className} aria-hidden="true" />;
}

export function MyPageSkeleton() {
	return (
		<div className={styles.page}>
			<header className={headerStyles.header}>
				<div className={headerStyles.container}>
					<div className={headerStyles.row}>
						<div className={headerStyles.logoLink}>
							<div className={headerStyles.logoBox}>
								<div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,0.08)' }} />
							</div>
							<div className={headerStyles.brand}>Bueboka</div>
						</div>
						<div style={{ marginLeft: 'auto' }}>
							<SkeletonBlock className={styles.circleSkeleton} />
						</div>
					</div>
				</div>
			</header>
			<main id="main-content" className={styles.main}>
				<div className={styles.profileContainer}>
					<div className={styles.profileSummaryGrid}>
						<div>
							<div className={styles.profileCard}>
								<SkeletonBlock className={styles.avatarSkeleton} />
								<SkeletonBlock className={styles.lineSkeletonWide} />
								<SkeletonBlock className={styles.lineSkeleton} />
								<SkeletonBlock className={styles.buttonSkeleton} />
							</div>
						</div>
						<div className={styles.summaryCard}>
							<SkeletonBlock className={styles.sectionTitleSkeleton} />
							<SkeletonBlock className={styles.lineSkeleton} />
							<div style={{ marginTop: 'var(--space-4)' }}>
								<SkeletonBlock className={styles.statsSkeleton} />
							</div>
							<div className={styles.statsButtonContainer}>
								<SkeletonBlock className={styles.buttonSkeleton} />
							</div>
						</div>
					</div>
				</div>
			</main>
			<div className={styles.quickActionsSkeleton}>
				{Array.from({ length: 4 }).map((_, i) => (
					<SkeletonBlock key={i} className={styles.toolButtonSkeleton} />
				))}
			</div>
			<section className={styles.practicesSection}>
				<div className={styles.practicesHeader}>
					<SkeletonBlock className={styles.practicesTitleSkeleton} />
					<div style={{ marginLeft: 'auto' }}>
						<SkeletonBlock className={styles.seeAllLinkSkeleton} />
					</div>
				</div>
				<div className={styles.practicesList}>
					<div className={styles.list} style={{ minHeight: 200 }}>
						{Array.from({ length: 5 }).map((_, i) => (
							<SkeletonBlock key={i} className={styles.itemSkeleton} />
						))}
					</div>
				</div>
			</section>
			<section className={equipmentStyles.section}>
				<div className={equipmentStyles.header}>
					<SkeletonBlock className={styles.sectionTitleSkeletonLight} />
				</div>
				<div className={equipmentStyles.grid}>
					<div className={equipmentStyles.list}>
						{Array.from({ length: 2 }).map((_, i) => (
							<SkeletonBlock key={i} className={styles.itemSkeleton} />
						))}
					</div>
					<div className={equipmentStyles.list}>
						{Array.from({ length: 2 }).map((_, i) => (
							<SkeletonBlock key={i} className={styles.itemSkeleton} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
