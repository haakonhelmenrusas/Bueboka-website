'use client';

import React, { useRef, useState } from 'react';
import styles from './ImageUpload.module.css';
import Image from 'next/image';
import { LuCamera, LuLoader, LuTrash, LuUpload, LuUser } from 'react-icons/lu';
import { compressImage } from '@/lib/imageUtils';

interface ImageUploadProps {
	currentImage?: string | null;
	onImageChange: (imageData: string | null) => void;
	disabled?: boolean;
}

export function ImageUpload({ currentImage, onImageChange, disabled }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(currentImage || null);
	const [error, setError] = useState<string | null>(null);
	const [isCompressing, setIsCompressing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('Vennligst velg en bildefil');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setError('Bildet må være mindre enn 10MB');
			return;
		}

		setError(null);
		setIsCompressing(true);

		try {
			const compressedImage = await compressImage(file);
			setPreview(compressedImage);
			onImageChange(compressedImage);
		} catch (err) {
			console.error('Error compressing image:', err);
			setError('Kunne ikke behandle bildet');
		} finally {
			setIsCompressing(false);
		}
	};

	const handleRemove = () => {
		setPreview(null);
		onImageChange(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className={styles.container}>
			<label className={styles.label}>Profilbilde</label>

			<div className={styles.uploadArea}>
				{isCompressing ? (
					<div className={styles.loading}>
						<LuLoader className={styles.spinner} />
						<span>Behandler bilde...</span>
					</div>
				) : preview ? (
					<div className={styles.preview}>
						<Image src={preview} alt="Forhåndsvisning av profilbilde" width={120} height={120} className={styles.image} />
						<div className={styles.actions}>
							<button type="button" onClick={handleClick} disabled={disabled} className={styles.changeButton} aria-label="Endre bilde">
								<LuCamera className="w-4 h-4" />
								<span>Endre</span>
							</button>
							<button type="button" onClick={handleRemove} disabled={disabled} className={styles.removeButton} aria-label="Fjern bilde">
								<LuTrash className="w-4 h-4" />
								<span>Fjern</span>
							</button>
						</div>
					</div>
				) : (
					<button
						type="button"
						onClick={handleClick}
						disabled={disabled}
						className={styles.placeholderButton}
						aria-label="Last opp profilbilde"
					>
						<div className={styles.placeholderIcon}>
							<LuUser className="w-12 h-12 stroke-1" />
						</div>
						<div className={styles.overlay}>
							<LuCamera className="w-8 h-8" />
							<span className={styles.overlayText}>Last opp</span>
						</div>
					</button>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					disabled={disabled}
					className={styles.fileInput}
					aria-label="Velg profilbilde"
				/>
			</div>

			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
}
