'use client';

import React, { useState } from 'react';
import { LuX } from 'react-icons/lu';
import styles from './ProfileEditModal.module.css';
import { ProfileForm } from './ProfileForm';
import { useModalBehavior } from '@/lib/hooks/useModalBehavior';

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

	// Reset state when modal opens/closes
	React.useEffect(() => {
		if (isOpen) {
			setMessage(null);
		}
	}, [isOpen]);

	const handleProfileSubmit = async (values: { name: string; club: string }) => {
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: values.name,
					club: values.club,
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
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="profile-edit-title"
			>
				<div className={styles.header}>
					<h2 id="profile-edit-title" className={styles.title}>
						Rediger profil
					</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<LuX size={24} />
					</button>
				</div>
				<div className={styles.content}>
					{message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}
					<div className={styles.form}>
						<ProfileForm
							initialValues={{ name: user.name || '', club: user.club || '' }}
							loading={loading}
							onSubmit={handleProfileSubmit}
							onCancel={onClose}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
