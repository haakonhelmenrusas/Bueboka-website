'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuBuilding2, LuHash, LuSearch, LuUser } from 'react-icons/lu';
import { Footer, Header, Input } from '@/components';
import type { PublicProfile } from '@/lib/types';
import styles from './page.module.css';

export default function ProfilerPage() {
	const [query, setQuery] = useState('');
	const [profiles, setProfiles] = useState<PublicProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);

	const fetchProfiles = useCallback(async (q: string) => {
		setLoading(true);
		try {
			const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
			const res = await fetch(`/api/public/profiles${params}`);
			if (!res.ok) return;
			const data = await res.json();
			setProfiles(data.profiles ?? []);
			setSearched(true);
		} finally {
			setLoading(false);
		}
	}, []);

	// Load all public profiles on mount
	useEffect(() => {
		fetchProfiles('');
	}, [fetchProfiles]);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchProfiles(query);
		}, 300);
		return () => clearTimeout(timer);
	}, [query, fetchProfiles]);

	return (
		<div className={styles.page}>
			<Header />
			<main id="main-content" className={styles.main}>
				<div className={styles.container}>
					<div className={styles.pageHeader}>
						<h1 className={styles.title}>Finn bueskyttere</h1>
						<p className={styles.subtitle}>Søk etter bueskyttere som har delt profilen sin offentlig</p>
					</div>

					<div className={styles.searchBar}>
						<Input
							id="profile-search"
							label=""
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Søk etter navn eller klubb…"
							icon={<LuSearch size={18} />}
						/>
					</div>

					{loading && (
						<div className={styles.status}>Søker…</div>
					)}

					{!loading && searched && profiles.length === 0 && (
						<div className={styles.status}>
							{query.trim() ? 'Ingen profiler funnet for dette søket.' : 'Ingen offentlige profiler funnet.'}
						</div>
					)}

					{!loading && profiles.length > 0 && (
						<ul className={styles.list}>
							{profiles.map((profile) => {
								const displayName = profile.name ?? 'Anonym bueskytter';
								return (
									<li key={profile.id}>
										<Link href={`/profil/${profile.id}`} className={styles.profileCard}>
											<div className={styles.avatarWrap}>
												{profile.image ? (
													<Image
														src={profile.image}
														alt={`${displayName} profilbilde`}
														width={56}
														height={56}
														className={styles.avatar}
													/>
												) : (
													<div className={styles.avatarPlaceholder} aria-hidden="true">
														<LuUser size={24} strokeWidth={1.5} />
													</div>
												)}
											</div>
											<div className={styles.profileInfo}>
												<span className={styles.profileName}>{displayName}</span>
												{profile.club && (
													<span className={styles.profileMeta}>
														<LuBuilding2 size={13} />
														{profile.club}
													</span>
												)}
												{profile.skytternr && (
													<span className={styles.profileMeta}>
														<LuHash size={13} />
														{profile.skytternr}
													</span>
												)}
											</div>
										</Link>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
