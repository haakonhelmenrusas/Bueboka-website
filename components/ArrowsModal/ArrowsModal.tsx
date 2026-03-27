'use client';

import { useEffect, useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import styles from './ArrowsModal.module.css';
import { ArrowsForm, ArrowsFormValues } from '@/components/ProfileEditModal/ArrowsForm';
import { Button, Modal } from '@/components';
import { emitEquipmentChanged } from '@/lib/events';

interface ArrowsModalProps {
	open: boolean;
	onClose: () => void;
	onSaved?: () => void;
	editingArrows?: {
		id: string;
		name: string;
		material: ArrowsFormValues['material'];
		arrowsCount?: number | null;
		diameter?: number | null;
		length?: number | null;
		weight?: number | null;
		spine?: string | null;
		pointType?: string | null;
		pointWeight?: number | null;
		vanes?: string | null;
		nock?: string | null;
		notes?: string | null;
		isFavorite?: boolean;
	};
}

export function ArrowsModal({ open, onClose, onSaved, editingArrows }: ArrowsModalProps) {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (!open) {
			setMessage(null);
			setLoading(false);
			setDeleting(false);
			return;
		}
		setMessage(null);
	}, [open, editingArrows?.id]);

	const handleSubmit = async (values: ArrowsFormValues) => {
		const hasChanges =
			!editingArrows ||
			values.name !== editingArrows.name ||
			values.material !== editingArrows.material ||
			(values.arrowsCount ?? null) !== (editingArrows.arrowsCount ?? null) ||
			(values.diameter ?? null) !== (editingArrows.diameter ?? null) ||
			(values.length ?? null) !== (editingArrows.length ?? null) ||
			(values.weight ?? null) !== (editingArrows.weight ?? null) ||
			(values.spine || '') !== (editingArrows.spine || '') ||
			(values.pointType || '') !== (editingArrows.pointType || '') ||
			(values.pointWeight ?? null) !== (editingArrows.pointWeight ?? null) ||
			(values.vanes || '') !== (editingArrows.vanes || '') ||
			(values.nock || '') !== (editingArrows.nock || '') ||
			(values.notes || '') !== (editingArrows.notes || '') ||
			values.isFavorite !== Boolean(editingArrows.isFavorite);

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
				emitEquipmentChanged();
				if (hasChanges) onSaved?.();
				onClose();
			}, 800);
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'En feil oppstod' });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!editingArrows) return;
		setDeleting(true);
		setMessage(null);
		try {
			const res = await fetch(`/api/arrows/${editingArrows.id}`, { method: 'DELETE' });
			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}
				setMessage({ type: 'error', text: details?.error || 'Kunne ikke slette pilsett' });
				return;
			}

			setMessage({ type: 'success', text: 'Pilsett slettet' });
			setTimeout(() => {
				emitEquipmentChanged();
				onSaved?.();
				onClose();
			}, 500);
		} catch (e) {
			setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Kunne ikke slette pilsett' });
		} finally {
			setDeleting(false);
		}
	};

	if (!open) return null;

	return (
		<Modal open={open} onClose={onClose} title={editingArrows ? 'Rediger piler' : 'Legg til piler'} maxWidth={640}>
			{message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}
			<div className={styles.form}>
				<ArrowsForm
					initialValues={
						editingArrows
							? {
									name: editingArrows.name,
									material: editingArrows.material,
									arrowsCount: editingArrows.arrowsCount ?? null,
									diameter: editingArrows.diameter ?? null,
									length: editingArrows.length ?? null,
									weight: editingArrows.weight ?? null,
									spine: editingArrows.spine ?? '',
									pointType: editingArrows.pointType ?? '',
									pointWeight: editingArrows.pointWeight ?? null,
									vanes: editingArrows.vanes ?? '',
									nock: editingArrows.nock ?? '',
									notes: editingArrows.notes ?? '',
									isFavorite: Boolean(editingArrows.isFavorite),
								}
							: undefined
					}
					onSubmit={handleSubmit}
				/>

				<div className={styles.actions}>
					{editingArrows ? (
						<Button
							label={deleting ? 'Sletter...' : 'Slett piler'}
							onClick={handleDelete}
							disabled={loading || deleting}
							buttonType="outline"
							variant="warning"
							icon={<LuTrash2 size={18} />}
						/>
					) : null}
					<Button label="Avbryt" onClick={onClose} disabled={loading || deleting} buttonType="outline" />
					<Button
						label={loading ? (editingArrows ? 'Oppdaterer...' : 'Lagrer...') : editingArrows ? 'Oppdater' : 'Lagre'}
						onClick={() => {
							const form = document.getElementById('arrows-form') as HTMLFormElement | null;
							form?.requestSubmit();
						}}
						loading={loading}
						disabled={deleting}
					/>
				</div>
			</div>
		</Modal>
	);
}
