'use client';

import React from 'react';
import styles from './page.module.css';
import headerStyles from '@/components/Header/Header.module.css';
import equipmentStyles from '@/components/EquipmentSection/EquipmentSection.module.css';
import sightMarksStyles from '@/components/SightMarks/SightMarksSection.module.css';

function SkeletonBlock({ className }: { className: string }) {
	return <div className={className} aria-hidden="true" />;
}

export function MyPageSkeleton() {
	return (
		<div className={styles.page}>
			{/* Header Skeleton */}
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

			{/* Main Content */}
			<main id="main-content" className={styles.main}>
				<div className={styles.profileContainer}>
					<div className={styles.profileSummaryGrid}>
						{/* Profile Card */}
						<div>
							<div className={styles.profileCard}>
								<SkeletonBlock className={styles.avatarSkeleton} />
								<SkeletonBlock className={styles.lineSkeletonWide} />
								<SkeletonBlock className={styles.lineSkeleton} />
								<SkeletonBlock className={styles.buttonSkeleton} />
							</div>
						</div>

						{/* Summary Card */}
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

			{/* Equipment Section */}
			<section className={equipmentStyles.section}>
				<div className={equipmentStyles.header}>
					<SkeletonBlock className={styles.sectionTitleSkeletonLight} />
				</div>
				<div className={equipmentStyles.panel}>
					<div className={equipmentStyles.grid}>
						<div>
							<div className={equipmentStyles.subHeaderRow}>
								<SkeletonBlock className={styles.equipmentTitleSkeleton} />
								<SkeletonBlock className={styles.smallButtonSkeleton} />
							</div>
							<div className={equipmentStyles.list}>
								{Array.from({ length: 2 }).map((_, i) => (
									<SkeletonBlock key={i} className={styles.itemSkeleton} />
								))}
							</div>
						</div>
						<div>
							<div className={equipmentStyles.subHeaderRow}>
								<SkeletonBlock className={styles.equipmentTitleSkeleton} />
								<SkeletonBlock className={styles.smallButtonSkeleton} />
							</div>
							<div className={equipmentStyles.list}>
								{Array.from({ length: 2 }).map((_, i) => (
									<SkeletonBlock key={i} className={styles.itemSkeleton} />
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Practices Section */}
			<section className={styles.practicesSection}>
				<div className={styles.practicesHeader}>
					<SkeletonBlock className={styles.practicesTitleSkeleton} />
					<div style={{ marginLeft: 'auto' }}>
						<SkeletonBlock className={styles.actionButtonSkeleton} />
					</div>
				</div>
				<div className={styles.practicesList}>
					<div className={styles.list}>
						{Array.from({ length: 3 }).map((_, i) => (
							<SkeletonBlock key={i} className={styles.itemSkeleton} />
						))}
					</div>
				</div>
			</section>

			{/* Sight Marks Section */}
			<section className={sightMarksStyles.section}>
				<div className={sightMarksStyles.header}>
					<SkeletonBlock className={styles.sectionTitleSkeletonLight} />
				</div>
				<div className={sightMarksStyles.container}>
					<div className={styles.list}>
						{Array.from({ length: 2 }).map((_, i) => (
							<SkeletonBlock key={i} className={styles.itemSkeleton} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
