'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import styles from './ImageUpload.module.css';
import Image from 'next/image';

interface ImageUploadProps {
	currentImage?: string | null;
	onImageChange: (imageData: string | null) => void;
	disabled?: boolean;
}

export function ImageUpload({ currentImage, onImageChange, disabled }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(currentImage || null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('Vennligst velg en bildefil');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError('Bildet må være mindre enn 5MB');
			return;
		}

		setError(null);

		// Read file and convert to base64
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64String = reader.result as string;
			setPreview(base64String);
			onImageChange(base64String);
		};
		reader.onerror = () => {
			setError('Kunne ikke lese bildefilen');
		};
		reader.readAsDataURL(file);
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
				{preview ? (
					<div className={styles.preview}>
						<Image src={preview} alt="Profile preview" width={120} height={120} className={styles.image} />
						<div className={styles.actions}>
							<button type="button" onClick={handleClick} disabled={disabled} className={styles.changeButton} aria-label="Endre bilde">
								<Camera size={16} />
								<span>Endre</span>
							</button>
							<button type="button" onClick={handleRemove} disabled={disabled} className={styles.removeButton} aria-label="Fjern bilde">
								<Trash2 size={16} />
								<span>Fjern</span>
							</button>
						</div>
					</div>
				) : (
					<button type="button" onClick={handleClick} disabled={disabled} className={styles.uploadButton}>
						<Upload size={24} />
						<span className={styles.uploadText}>Last opp profilbilde</span>
						<span className={styles.uploadHint}>Maks 5MB (JPG, PNG, GIF)</span>
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
