'use client';

import React from 'react';
import styles from './page.module.css';

function SkeletonBlock({ className }: { className: string }) {
	return <div className={className} aria-hidden="true" />;
}

export function MyPageSkeleton() {
	return (
		<div className={styles.page}>
			<div className={styles.headerBar}>
				<div className={styles.logoBox}>
					<div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.08)' }} />
				</div>
				<div className={styles.brand}>Bueboka</div>
				<div style={{ marginLeft: 'auto' }}>
					<SkeletonBlock className={styles.circleSkeleton} />
				</div>
			</div>

			<main className={styles.main}>
				<div className={styles.card}>
					<div className={styles.twoColumn}>
						<section className={styles.left}>
							<div className={styles.profileCard}>
								<SkeletonBlock className={styles.avatarSkeleton} />
								<SkeletonBlock className={styles.lineSkeletonWide} />
								<SkeletonBlock className={styles.lineSkeleton} />
								<SkeletonBlock className={styles.buttonSkeleton} />
							</div>
						</section>

						<section className={styles.right}>
							<div className={styles.topRightRow}>
								<div className={styles.rightActions}>
									<SkeletonBlock className={styles.actionButtonSkeleton} />
									<SkeletonBlock className={styles.actionButtonSkeleton} />
								</div>
							</div>

							<div className={styles.rightContent}>
								<div>
									<SkeletonBlock className={styles.sectionTitleSkeleton} />
									<div className={styles.list}>
										{Array.from({ length: 2 }).map((_, i) => (
											<SkeletonBlock key={i} className={styles.itemSkeleton} />
										))}
									</div>
								</div>

								<div>
									<SkeletonBlock className={styles.sectionTitleSkeleton} />
									<div className={styles.list}>
										{Array.from({ length: 2 }).map((_, i) => (
											<SkeletonBlock key={i} className={styles.itemSkeleton} />
										))}
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>

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
		</div>
	);
}
