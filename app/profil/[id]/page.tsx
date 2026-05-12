import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ANONYMOUS_ARCHER_LABEL } from '@/lib/labels';
import type { PublicProfile } from '@/lib/types';
import { Header } from '@/components';
import { PublicProfileView } from '@/components/PublicProfiles/PublicProfileView';
import styles from './page.module.css';

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
				const endTotalArrows = end.arrows != null ? end.arrows + endUnscoredArrows : endScoredArrows + endUnscoredArrows;
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
				<PublicProfileView profile={profile} displayName={displayName} />
			</main>
		</div>
	);
}
