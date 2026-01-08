'use client';

import React from 'react';
import { X } from 'lucide-react';
import styles from './ArrowsModal.module.css';
import { ArrowsForm, ArrowsFormValues } from '@/components/ProfileEditModal/ArrowsForm';
import { useModalBehavior } from '@/lib/useModalBehavior';

interface ArrowsModalProps {
	open: boolean;
	onClose: () => void;
	onSaved?: () => void;
}

export function ArrowsModal({ open, onClose, onSaved }: ArrowsModalProps) {
	useModalBehavior({ open, onClose });

	const [loading, setLoading] = React.useState(false);
	const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleSubmit = async (values: ArrowsFormValues) => {
		setLoading(true);
		setMessage(null);
		try {
			const response = await fetch('/api/arrows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				setMessage({ type: 'error', text: 'Kunne ikke legge til piler' });
				return;
			}

			setMessage({ type: 'success', text: 'Piler lagt til' });
			setTimeout(() => {
				onSaved?.();
			}, 800);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Legg til piler">
				<div className={styles.header}>
					<h2 className={styles.title}>Legg til piler</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
						<X size={22} />
					</button>
				</div>

				{message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}

				<ArrowsForm loading={loading} onSubmit={handleSubmit} />
			</div>
		</div>
	);
}
