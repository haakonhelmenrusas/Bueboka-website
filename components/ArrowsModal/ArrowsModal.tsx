'use client';

import React from 'react';
import { X } from 'lucide-react';
import styles from './ArrowsModal.module.css';
import { ArrowsForm, ArrowsFormValues } from '@/components/ProfileEditModal/ArrowsForm';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { Button } from '@/components';

interface ArrowsModalProps {
	open: boolean;
	onClose: () => void;
	onSaved?: () => void;
	editingArrows?: {
		id: string;
		name: string;
		material: ArrowsFormValues['material'];
	};
}

export function ArrowsModal({ open, onClose, onSaved, editingArrows }: ArrowsModalProps) {
	useModalBehavior({ open, onClose });

	const [loading, setLoading] = React.useState(false);
	const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleSubmit = async (values: ArrowsFormValues) => {
		setLoading(true);
		setMessage(null);
		try {
			const url = editingArrows ? `/api/arrows/${editingArrows.id}` : '/api/arrows';
			const method = editingArrows ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				setMessage({ type: 'error', text: editingArrows ? 'Kunne ikke oppdatere piler' : 'Kunne ikke legge til piler' });
				return;
			}

			setMessage({ type: 'success', text: editingArrows ? 'Piler oppdatert' : 'Piler lagt til' });
			setTimeout(() => {
				onSaved?.();
				if (editingArrows) onClose();
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
			<div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Piler">
				<div className={styles.header}>
					<h2 className={styles.title}>{editingArrows ? 'Rediger piler' : 'Legg til piler'}</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
						<X size={22} />
					</button>
				</div>

				{message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}

				<div className={styles.form}>
					<ArrowsForm
						initialValues={editingArrows ? { name: editingArrows.name, material: editingArrows.material } : undefined}
						loading={loading}
						onSubmit={handleSubmit}
					/>

					<div className={styles.actions}>
						<Button label="Avbryt" onClick={onClose} disabled={loading} buttonType="outline" width={160} />
						<Button
							label={loading ? (editingArrows ? 'Oppdaterer...' : 'Lagrer...') : editingArrows ? 'Oppdater' : 'Lagre'}
							onClick={() => {
								const form = document.getElementById('arrows-form') as HTMLFormElement | null;
								form?.requestSubmit();
							}}
							loading={loading}
							width={180}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
