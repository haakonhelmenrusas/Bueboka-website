'use client';

import React from 'react';
import { LuTrash2, LuX } from 'react-icons/lu';
import styles from './BowModal.module.css';
import { BowForm, BowFormValues, BowType } from '@/components/ProfileEditModal/BowForm';
import { useModalBehavior } from '@/lib/hooks/useModalBehavior';
import { Button } from '@/components';
import { emitEquipmentChanged } from '@/lib/events';

interface BowModalProps {
	open: boolean;
	onClose: () => void;
	editingBow?: {
		id: string;
		name: string;
		type: BowType;
		eyeToNock: number | null;
		aimMeasure: number | null;
		eyeToSight: number | null;
		isFavorite: boolean;
		notes: string | null;
	};
	onSaved?: () => void;
}

export function BowModal({ open, onClose, editingBow, onSaved }: BowModalProps) {
	useModalBehavior({ open, onClose });

	const [loading, setLoading] = React.useState(false);
	const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [deleting, setDeleting] = React.useState(false);

	const initialValues: BowFormValues = React.useMemo(
		() => ({
			name: editingBow?.name || '',
			type: (editingBow?.type || 'RECURVE') as BowType,
			eyeToNock: editingBow?.eyeToNock ?? 0,
			aimMeasure: editingBow?.aimMeasure ?? 0,
			eyeToSight: editingBow?.eyeToSight ?? 0,
			isFavorite: editingBow?.isFavorite ?? false,
			notes: editingBow?.notes || '',
		}),
		[editingBow]
	);

	React.useEffect(() => {
		if (!open) {
			setMessage(null);
			setLoading(false);
			setDeleting(false);
			return;
		}

		// When opening or switching the edited bow, clear transient feedback
		setMessage(null);
	}, [open, editingBow]);

	const handleSubmit = async (values: BowFormValues) => {
		setLoading(true);
		setMessage(null);
		try {
			const url = editingBow ? `/api/bows/${editingBow.id}` : '/api/bows';
			const method = editingBow ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: values.name,
					type: values.type,
					eyeToNock: values.eyeToNock != null && values.eyeToNock > 0 ? values.eyeToNock : null,
					aimMeasure: values.aimMeasure != null && values.aimMeasure > 0 ? values.aimMeasure : null,
					eyeToSight: values.eyeToSight != null && values.eyeToSight > 0 ? values.eyeToSight : null,
					isFavorite: values.isFavorite,
					notes: values.notes || undefined,
				}),
			});

			if (!response.ok) {
				setMessage({ type: 'error', text: editingBow ? 'Kunne ikke oppdatere bue' : 'Kunne ikke lage bue' });
				return;
			}

			setMessage({ type: 'success', text: editingBow ? 'Bue oppdatert' : 'Bue lagt til' });
			setTimeout(() => {
				emitEquipmentChanged();
				onSaved?.();
				onClose();
			}, 800);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!editingBow) return;
		setDeleting(true);
		setMessage(null);
		try {
			const res = await fetch(`/api/bows/${editingBow.id}`, { method: 'DELETE' });
			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}
				setMessage({ type: 'error', text: details?.error || 'Kunne ikke slette bue' });
				return;
			}

			setMessage({ type: 'success', text: 'Bue slettet' });
			setTimeout(() => {
				emitEquipmentChanged();
				onSaved?.();
				onClose();
			}, 500);
		} catch (e) {
			setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Kunne ikke slette bue' });
		} finally {
			setDeleting(false);
		}
	};

	if (!open) return null;

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="bow-modal-title">
				<div className={styles.header}>
					<h2 id="bow-modal-title" className={styles.title}>
						{editingBow ? 'Rediger bue' : 'Legg til bue'}
					</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<LuX size={22} />
					</button>
				</div>

				{message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}

				<div className={styles.form}>
					<BowForm initialValues={initialValues} onSubmit={handleSubmit} />

					<div className={styles.actions}>
						{editingBow ? (
							<Button
								label={deleting ? 'Sletter...' : 'Slett bue'}
								onClick={handleDelete}
								disabled={loading || deleting}
								buttonType="outline"
								variant="warning"
								width={170}
								icon={<LuTrash2 size={18} />}
							/>
						) : null}
						<Button label="Avbryt" onClick={onClose} disabled={loading || deleting} buttonType="outline" width={160} />
						<Button
							label={loading ? (editingBow ? 'Oppdaterer...' : 'Lagrer...') : editingBow ? 'Oppdater' : 'Lagre'}
							onClick={() => {
								const form = document.getElementById('bow-form') as HTMLFormElement | null;
								form?.requestSubmit();
							}}
							loading={loading}
							disabled={deleting}
							width={180}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
