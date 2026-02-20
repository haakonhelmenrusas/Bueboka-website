'use client';

import React from 'react';
import Image from 'next/image';
import styles from './ProfileCard.module.css';
import { Edit, User } from 'lucide-react';
import { Button } from '@/components';

export interface ProfileCardProps {
	name?: string | null;
	email: string;
	club?: string | null;
	image?: string | null;
	onEdit: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, club, image, onEdit }) => {
	const displayName = name || email;
	const displayClub = club || 'Ingen klubb oppgitt';

	return (
		<section className={styles.card} aria-label="Profil">
			<div className={styles.avatarWrap}>
				{image ? (
					<Image
						loading="eager"
						src={image}
						alt={name ? `${name} profilbilde` : 'Profilbilde'}
						width={140}
						height={140}
						className={styles.avatar}
					/>
				) : (
					<div className={styles.avatarPlaceholder} aria-hidden="true">
						<User size={56} strokeWidth={1.5} />
					</div>
				)}
			</div>
			<header className={styles.header}>
				<h2 className={styles.name}>{displayName}</h2>
				<p className={styles.meta}>{displayClub}</p>
			</header>
			<Button label="Rediger" onClick={onEdit} icon={<Edit size={18} />} size="small" buttonType="outline" />
		</section>
	);
};
