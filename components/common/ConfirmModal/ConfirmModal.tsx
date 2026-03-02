'use client';

import React from 'react';
import { LuX } from 'react-icons/lu';
import styles from './ConfirmModal.module.css';
import { useModalBehavior } from '@/lib/useModalBehavior';

export interface ConfirmModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'danger' | 'default';
	isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Bekreft',
	cancelLabel = 'Avbryt',
	variant = 'default',
	isLoading = false,
}) => {
	useModalBehavior({ open, onClose });

	if (!open) return null;

	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
				<div className={styles.header}>
					<h3 id="confirm-title" className={styles.title}>
						{title}
					</h3>
					<button className={styles.closeButton} onClick={onCancel} aria-label="Lukk">
						<LuX size={20} />
					</button>
				</div>

				<div className={styles.content}>
					<p className={styles.message}>{message}</p>
				</div>

				<div className={styles.actions}>
					<button className={`${styles.button} ${styles.secondary}`} onClick={onClose} disabled={isLoading}>
						{cancelLabel}
					</button>
					<button
						className={`${styles.button} ${variant === 'danger' ? styles.danger : styles.primary}`}
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? 'Vennligst vent...' : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};
