'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LuBuilding2, LuHash, LuUser } from 'react-icons/lu';
import { ANONYMOUS_ARCHER_LABEL } from '@/lib/labels';
import type { PublicProfile } from '@/lib/types';
import styles from './PublicUserCard.module.css';

export interface PublicUserCardProps {
	profile: PublicProfile;
}

export const PublicUserCard: React.FC<PublicUserCardProps> = ({ profile }) => {
	const displayName = profile.name ?? ANONYMOUS_ARCHER_LABEL;

	return (
		<Link href={`/profil/${profile.id}`} className={styles.card}>
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
			<div className={styles.info}>
				<span className={styles.name}>{displayName}</span>
				{profile.club && (
					<span className={styles.meta}>
						<LuBuilding2 size={13} />
						{profile.club}
					</span>
				)}
				{profile.skytternr && (
					<span className={styles.meta}>
						<LuHash size={13} />
						{profile.skytternr}
					</span>
				)}
			</div>
			<div className={styles.arrow} aria-hidden="true">›</div>
		</Link>
	);
};

