'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LuArrowLeft, LuBuilding2, LuChartBar, LuHash, LuTarget, LuTrophy, LuUser } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';
import type { PublicProfile } from '@/lib/types';
import styles from '@/app/profil/[id]/page.module.css';

interface Props {
	profile: PublicProfile;
	displayName: string;
}

export function PublicProfileView({ profile, displayName }: Props) {
	const { t } = useTranslation();

	return (
		<div className={styles.container}>
			<Link href="/skyttere" className={styles.backLink}>
				<LuArrowLeft size={18} />
				<span>{t['publicProfile.backToSearch']}</span>
			</Link>

			<div className={styles.card}>
				<div className={styles.avatarWrap}>
					{profile.image ? (
						<Image
							src={profile.image}
							alt={`${displayName} ${t['publicProfile.profileImageAlt']}`}
							width={120}
							height={120}
							className={styles.avatar}
						/>
					) : (
						<div className={styles.avatarPlaceholder} aria-hidden="true">
							<LuUser size={48} strokeWidth={1.5} />
						</div>
					)}
				</div>

				<h1 className={styles.name}>{displayName}</h1>

				<div className={styles.badges}>
					{profile.club && (
						<span className={styles.clubBadge}>
							<LuBuilding2 size={13} />
							{profile.club}
						</span>
					)}
					{profile.skytternr && (
						<span className={styles.skytternrBadge}>
							<LuHash size={13} />
							{profile.skytternr}
						</span>
					)}
				</div>

				{profile.stats && (
					<div className={styles.statsSection}>
						<h2 className={styles.statsTitle}>{t['publicProfile.statsTitle']}</h2>
						<div className={styles.statsGrid}>
							<div className={styles.statItem}>
								<LuTarget size={20} className={styles.statIcon} />
								<span className={styles.statValue}>{profile.stats.totalArrows.toLocaleString('nb-NO')}</span>
								<span className={styles.statLabel}>{t['publicProfile.totalArrows']}</span>
							</div>
							{profile.stats.avgScorePerArrow !== null && (
								<div className={styles.statItem}>
									<LuChartBar size={20} className={styles.statIcon} />
									<span className={styles.statValue}>
										{profile.stats.avgScorePerArrow.toLocaleString('nb-NO', { maximumFractionDigits: 2 })}
									</span>
									<span className={styles.statLabel}>{t['publicProfile.avgScorePerArrow']}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{profile.achievementCount != null && (
					<div className={styles.statsSection}>
						<h2 className={styles.statsTitle}>{t['publicProfile.achievementsTitle']}</h2>
						<div className={styles.statsGrid}>
							<div className={styles.statItem}>
								<LuTrophy size={20} className={styles.statIcon} />
								<span className={styles.statValue}>{profile.achievementCount}</span>
								<span className={styles.statLabel}>{t['publicProfile.achievementsUnlocked']}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
