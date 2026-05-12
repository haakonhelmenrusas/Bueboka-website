'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LuSearch, LuUsers } from 'react-icons/lu';
import { Footer, Header } from '@/components';
import { PublicProfileList } from '@/components/PublicProfiles/PublicProfileList';
import type { PublicProfile } from '@/lib/types';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './page.module.css';

export default function SkytterePage() {
	const { t } = useTranslation();
	const [query, setQuery] = useState('');
	const [profiles, setProfiles] = useState<PublicProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetch('/api/public/profiles').then((res) => {
			if (res.status === 401) router.replace('/logg-inn');
		});
	}, [router]);

	const fetchProfiles = useCallback(
		async (q: string) => {
			setLoading(true);
			try {
				const res = await fetch(`/api/public/profiles?q=${encodeURIComponent(q.trim())}`);
				if (res.status === 401) {
					router.replace('/logg-inn');
					return;
				}
				if (!res.ok) return;
				const data = await res.json();
				setProfiles(data.profiles ?? []);
				setSearched(true);
			} finally {
				setLoading(false);
			}
		},
		[router]
	);

	useEffect(() => {
		if (!query.trim()) {
			setSearched(false);
			setProfiles([]);
			return;
		}
		const timer = setTimeout(() => fetchProfiles(query), 300);
		return () => clearTimeout(timer);
	}, [query, fetchProfiles]);

	const showIdle = !loading && !searched;

	return (
		<div className={styles.page}>
			<Header />
			<main id="main-content" className={styles.main}>
				<section className={styles.hero}>
					<div className={styles.heroIcon} aria-hidden="true">
						<LuUsers size={36} strokeWidth={1.5} />
					</div>
					<h1 className={styles.title}>{t['skyttere.title']}</h1>
					<p className={styles.subtitle}>{t['skyttere.subtitle']}</p>
					<div className={styles.searchWrap}>
						<div className={styles.searchIcon} aria-hidden="true">
							<LuSearch size={20} />
						</div>
						<input
							id="skyttere-search"
							type="search"
							className={styles.searchInput}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={t['skyttere.searchPlaceholder']}
							autoComplete="off"
							aria-label={t['skyttere.searchAriaLabel']}
						/>
					</div>
				</section>

				<section className={styles.results}>
					{showIdle ? (
						<div className={styles.idle} aria-hidden="true">
							<div className={styles.idleTarget}>
								<div className={styles.idleRing} />
								<div className={styles.idleRing} />
								<div className={styles.idleRing} />
								<div className={styles.idleCenter}>
									<LuUsers size={28} strokeWidth={1.5} />
								</div>
							</div>
							<p className={styles.idleHint}>{t['skyttere.startTyping']}</p>
						</div>
					) : (
						<PublicProfileList profiles={profiles} loading={loading} searched={searched} query={query} />
					)}
				</section>
			</main>
			<Footer />
		</div>
	);
}
