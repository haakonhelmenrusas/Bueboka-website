import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LuArrowLeft, LuBuilding2, LuHash, LuTarget, LuUser } from 'react-icons/lu';
import type { PublicProfile } from '@/lib/types';
import styles from './page.module.css';

interface Props {
	params: Promise<{ id: string }>;
}

async function getPublicProfile(id: string): Promise<PublicProfile | null> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
	const res = await fetch(`${baseUrl}/api/public/profiles/${id}`, { cache: 'no-store' });
	if (res.status === 404) return null;
	if (!res.ok) throw new Error('Failed to fetch profile');
	const data = await res.json();
	return data.profile ?? null;
}

export default async function PublicProfilePage({ params }: Props) {
	const { id } = await params;
	const profile = await getPublicProfile(id);

	if (!profile) {
		notFound();
	}

	const displayName = profile.name ?? 'Anonym bueskytter';

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.container}>
					<Link href="/profiler" className={styles.backLink}>
						<LuArrowLeft size={18} />
						<span>Tilbake til søk</span>
					</Link>

					<div className={styles.card}>
						<div className={styles.avatarWrap}>
							{profile.image ? (
								<Image
									src={profile.image}
									alt={`${displayName} profilbilde`}
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
								<h2 className={styles.statsTitle}>Statistikk</h2>
								<div className={styles.statsGrid}>
									<div className={styles.statItem}>
										<LuTarget size={20} className={styles.statIcon} />
										<span className={styles.statValue}>{profile.stats.totalArrows.toLocaleString('nb-NO')}</span>
										<span className={styles.statLabel}>Piler skutt totalt</span>
									</div>
									{profile.stats.avgScorePerArrow !== null && (
										<div className={styles.statItem}>
											<span className={styles.statValue}>{profile.stats.avgScorePerArrow.toLocaleString('nb-NO', { maximumFractionDigits: 2 })}</span>
											<span className={styles.statLabel}>Snittpoeng per pil</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
