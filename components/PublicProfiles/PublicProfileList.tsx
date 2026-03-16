'use client';

import React from 'react';
import { PublicUserCard } from './PublicUserCard';
import type { PublicProfile } from '@/lib/types';
import styles from './PublicProfileList.module.css';

export interface PublicProfileListProps {
	profiles: PublicProfile[];
	loading: boolean;
	searched: boolean;
	query: string;
}

export const PublicProfileList: React.FC<PublicProfileListProps> = ({ profiles, loading, searched, query }) => {
	if (loading) {
		return (
			<div className={styles.status}>
				<span className={styles.spinner} aria-hidden="true" />
				Søker…
			</div>
		);
	}

	if (searched && profiles.length === 0) {
		return (
			<div className={styles.status}>
				{query.trim()
					? `Ingen profiler funnet for «${query.trim()}».`
					: 'Ingen offentlige profiler funnet.'}
			</div>
		);
	}

	if (profiles.length === 0) return null;

	return (
		<ul className={styles.list} aria-label="Søkeresultater">
			{profiles.map((profile) => (
				<li key={profile.id}>
					<PublicUserCard profile={profile} />
				</li>
			))}
		</ul>
	);
};

