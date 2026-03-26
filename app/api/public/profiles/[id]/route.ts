import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

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
						totalScore: true,
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

		if (!user) {
			return NextResponse.json({ error: 'Profil ikke funnet' }, { status: 404 });
		}

		// Calculate basic stats if user has opted in
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

		const profile = {
			id: user.id,
			name: user.publicName ? user.name : null,
			club: user.publicClub ? user.club : null,
			image: user.image,
			skytternr: user.publicSkytternr ? user.skytternr : null,
			stats,
			achievementCount: user.publicAchievements ? user.achievements.length : null,
		};

		return NextResponse.json({ profile });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
}
