'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './ProfileEditModal.module.css';
import { ProfileForm } from './ProfileForm';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { ImageUpload } from '@/components/common/ImageUpload/ImageUpload';

interface ProfileEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: {
		id: string;
		name: string | null;
		email: string;
		club: string | null;
		image?: string | null;
	};
	onProfileUpdate?: () => void;
}

export function ProfileEditModal({ isOpen, onClose, user, onProfileUpdate }: ProfileEditModalProps) {
	useModalBehavior({ open: isOpen, onClose });

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [profileImage, setProfileImage] = useState<string | null>(user.image || null);

	// Reset state when modal opens/closes
	React.useEffect(() => {
		if (isOpen) {
			setMessage(null);
			setProfileImage(user.image || null);
		}
	}, [isOpen, user.image]);

	const handleProfileSubmit = async (values: { club: string }) => {
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					club: values.club,
					image: profileImage,
				}),
			});

			if (!response.ok) {
				setMessage({ type: 'error', text: 'Failed to update profile' });
				return;
			}

			setMessage({ type: 'success', text: 'Profil oppdatert' });
			setTimeout(() => {
				onProfileUpdate?.();
				onClose();
			}, 1000);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h2 className={styles.title}>Rediger profil</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
						<X size={24} />
					</button>
				</div>

				<div className={styles.content}>
					{message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}
					<div className={styles.form}>
						<ImageUpload currentImage={profileImage} onImageChange={setProfileImage} disabled={loading} />
						<ProfileForm initialValues={{ club: user.club || '' }} loading={loading} onSubmit={handleProfileSubmit} />
					</div>
				</div>
			</div>
		</div>
	);
}
