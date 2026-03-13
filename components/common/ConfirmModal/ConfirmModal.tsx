'use client';

import React from 'react';
import styles from './ConfirmModal.module.css';
import { Modal } from '../Modal/Modal';

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
	return (
		<Modal open={open} onClose={onClose} title={title} maxWidth={500} zIndex={220}>
			<div className={styles.content}>
				<p className={styles.message}>{message}</p>
			</div>
			<div className={styles.actions}>
				<button className={`${styles.button} ${styles.secondary}`} onClick={onClose} disabled={isLoading}>
					{cancelLabel}
				</button>
				<button
					className={`${styles.button} ${variant === 'danger' ? styles.danger : styles.primary}`}
					onClick={onConfirm}
					disabled={isLoading}
				>
					{isLoading ? 'Vennligst vent...' : confirmLabel}
				</button>
			</div>
		</Modal>
	);
};
