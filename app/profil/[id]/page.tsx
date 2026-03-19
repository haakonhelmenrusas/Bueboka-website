import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LuArrowLeft, LuBuilding2, LuHash, LuTarget, LuTrophy, LuUser } from 'react-icons/lu';
import { prisma } from '@/lib/prisma';
import { ANONYMOUS_ARCHER_LABEL } from '@/lib/labels';
import type { PublicProfile } from '@/lib/types';
import styles from './page.module.css';
import { Header } from '@/components';

interface Props {
	params: Promise<{ id: string }>;
}

async function getPublicProfile(id: string): Promise<PublicProfile | null> {
	const user = await prisma.user.findUnique({
		where: { id, isPublic: true },
		select: {
			id: true,
			name: true,
			club: true,
			image: true,
			skytternr: true,
			publicName: true,
			publicClub: true,
			publicSkytternr: true,
			publicStats: true,
			publicAchievements: true,
			practices: {
				select: {
					ends: {
						select: {
							arrows: true,
							scores: true,
							arrowsWithoutScore: true,
						},
					},
				},
			},
			achievements: {
				select: { id: true },
			},
		},
	});

	if (!user) return null;

	let stats: { totalArrows: number; avgScorePerArrow: number | null } | null = null;
	if (user.publicStats) {
		let totalArrows = 0;
		let totalScore = 0;
		let scoredArrows = 0;

		for (const practice of user.practices) {
			for (const end of practice.ends) {
				const endScoredArrows = end.scores.length;
				const endUnscoredArrows = end.arrowsWithoutScore ?? 0;
				// Use the explicit arrows field when available (covers sessions recorded
				// without individual scores), falling back to scores.length.
				const endTotalArrows = end.arrows != null
					? end.arrows + endUnscoredArrows
					: endScoredArrows + endUnscoredArrows;
				totalArrows += endTotalArrows;
				scoredArrows += endScoredArrows;
				totalScore += end.scores.reduce((sum, s) => sum + s, 0);
			}
		}

		stats = {
			totalArrows,
			avgScorePerArrow: scoredArrows > 0 ? Math.round((totalScore / scoredArrows) * 100) / 100 : null,
		};
	}

	return {
		id: user.id,
		name: user.publicName ? user.name : null,
		club: user.publicClub ? user.club : null,
		image: user.image,
		skytternr: user.publicSkytternr ? user.skytternr : null,
		stats,
		achievementCount: user.publicAchievements ? user.achievements.length : null,
	};
}

export default async function PublicProfilePage({ params }: Props) {
	const { id } = await params;
	const profile = await getPublicProfile(id);

	if (!profile) {
		notFound();
	}

	const displayName = profile.name ?? ANONYMOUS_ARCHER_LABEL;

	return (
		<div className={styles.page}>
			<Header />
			<main className={styles.main}>
				<div className={styles.container}>
					<Link href="/skyttere" className={styles.backLink}>
						<LuArrowLeft size={18} />
						<span>Tilbake til søk</span>
					</Link>

					<div className={styles.card}>
						<div className={styles.avatarWrap}>
							{profile.image ? (
								<Image src={profile.image} alt={`${displayName} profilbilde`} width={120} height={120} className={styles.avatar} />
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
								<h2 className={styles.statsTitle}>Statistikk</h2>
								<div className={styles.statsGrid}>
									<div className={styles.statItem}>
										<LuTarget size={20} className={styles.statIcon} />
										<span className={styles.statValue}>{profile.stats.totalArrows.toLocaleString('nb-NO')}</span>
										<span className={styles.statLabel}>Piler skutt totalt</span>
									</div>
									{profile.stats.avgScorePerArrow !== null && (
										<div className={styles.statItem}>
											<span className={styles.statValue}>
												{profile.stats.avgScorePerArrow.toLocaleString('nb-NO', { maximumFractionDigits: 2 })}
											</span>
											<span className={styles.statLabel}>Snittpoeng per pil</span>
										</div>
									)}
								</div>
							</div>
						)}

						{profile.achievementCount != null && (
							<div className={styles.statsSection}>
								<h2 className={styles.statsTitle}>Prestasjoner</h2>
								<div className={styles.statsGrid}>
									<div className={styles.statItem}>
										<LuTrophy size={20} className={styles.statIcon} />
										<span className={styles.statValue}>{profile.achievementCount}</span>
										<span className={styles.statLabel}>Prestasjoner oppnådd</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
