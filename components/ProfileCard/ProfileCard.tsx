'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProfileCard.module.css';
import { LuCamera, LuLoader, LuPencil, LuTrophy, LuUser } from 'react-icons/lu';
import { Button } from '@/components';
import { compressImage } from '@/lib/imageUtils';

export interface ProfileCardProps {
	name?: string | null;
	email: string;
	club?: string | null;
	image?: string | null;
	onEdit: () => void;
	onImageUpdate: (newImage: string) => Promise<void>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, club, image, onEdit, onImageUpdate }) => {
	const displayName = name || email;
	const displayClub = club || 'Ingen klubb oppgitt';
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleAchievementsClick = () => {
		router.push('/achievements');
	};

	const handleAvatarClick = () => {
		if (isUploading) return;
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Vennligst velg en bildefil');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			alert('Bildet må være mindre enn 10MB');
			return;
		}

		setIsUploading(true);

		try {
			const compressedImage = await compressImage(file);
			await onImageUpdate(compressedImage);
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Kunne ikke laste opp bildet');
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<section className={styles.card} aria-label="Profil">
			<div
				className={styles.avatarWrap}
				onClick={handleAvatarClick}
				role="button"
				tabIndex={0}
				aria-label="Endre profilbilde"
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						handleAvatarClick();
					}
				}}
			>
				{isUploading ? (
					<div className={styles.loadingOverlay}>
						<LuLoader className={styles.spinner} />
					</div>
				) : (
					<div className={styles.hoverOverlay}>
						<LuCamera size={32} />
						<span className={styles.overlayText}>Endre</span>
					</div>
				)}

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
						<LuUser size={56} strokeWidth={1.5} />
					</div>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className={styles.hiddenInput}
					aria-hidden="true"
				/>
			</div>
			<header className={styles.header}>
				<h2 className={styles.name}>{displayName}</h2>
				<p className={styles.meta}>{displayClub}</p>
			</header>
			<div className={styles.buttonGroup}>
				<Button label="Rediger" onClick={onEdit} icon={<LuPencil size={18} />} size="normal" buttonType="outline" />
				<Button
					label="Mine prestasjoner"
					onClick={handleAchievementsClick}
					icon={<LuTrophy size={18} />}
					size="normal"
					buttonType="filled"
				/>
			</div>
		</section>
	);
};
