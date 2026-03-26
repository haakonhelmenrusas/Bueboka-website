'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProfileCard.module.css';
import { LuBuilding2, LuCamera, LuHash, LuLoader, LuPencil, LuTrash, LuTrophy, LuUser } from 'react-icons/lu';
import { Button } from '@/components';
import { Badge } from '@/components/common/Badge/Badge';
import { compressImage } from '@/lib/imageUtils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';

export interface ProfileCardProps {
	name?: string | null;
	email: string;
	club?: string | null;
	image?: string | null;
	onImageUpdate: (newImage: string | null) => Promise<void>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, club, image, onImageUpdate }) => {
	const displayName = name || email;
	const displayClub = club || 'Ingen klubb oppgitt';
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

	const handleAchievementsClick = () => {
		router.push('/achievements');
	};

	const handleAvatarClick = () => {
		if (isUploading) return;
		setMenuOpen((prev) => !prev);
	};

	const handleUploadClick = () => {
		setMenuOpen(false);
		fileInputRef.current?.click();
	};

	const handleRemoveClick = async () => {
		setMenuOpen(false);
		if (!image) return;

		setIsUploading(true);
		try {
			await onImageUpdate(null);
		} catch (error) {
			console.error('Error removing image:', error);
		} finally {
			setIsUploading(false);
		}
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
			<button className={styles.trophyButton} onClick={handleAchievementsClick}>
				<LuTrophy size={20} color="var(--accent-yellow)" />
			</button>
			<div className={styles.avatarContainer} ref={menuRef}>
				<div
					className={styles.avatarWrap}
					onClick={handleAvatarClick}
					role="button"
					tabIndex={0}
					aria-label="Endre profilbilde"
					aria-expanded={menuOpen}
					aria-haspopup="menu"
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
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
							<LuPencil size={32} />
							<span className={styles.overlayText}>Rediger</span>
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
				</div>
				{menuOpen && (
					<div className={styles.menu} role="menu">
						<button className={styles.menuItem} onClick={handleUploadClick} role="menuitem">
							<LuCamera size={18} />
							<span>Last opp bilde</span>
						</button>
						{image && (
							<button className={`${styles.menuItem} ${styles.menuItemDelete}`} onClick={handleRemoveClick} role="menuitem">
								<LuTrash size={18} />
								<span>Fjern bilde</span>
							</button>
						)}
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
				<Badge variant="primary" icon={<LuBuilding2 size={13} />}>
					{displayClub}
				</Badge>
			</header>
		</section>
	);
};
