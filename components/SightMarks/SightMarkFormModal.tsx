'use client';

import React, { useState } from 'react';
import { LuX } from 'react-icons/lu';
import styles from './SightMarkFormModal.module.css';
import { Button, NumberInput } from '@/components';
import { useModalBehavior } from '@/lib/hooks/useModalBehavior';
import type { Bow } from '@/lib/types';

interface SightMarkFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: { distance: number; mark: number; bowId: string }) => Promise<void>;
	bows: Bow[];
}

export function SightMarkFormModal({ open, onClose, onSave, bows }: SightMarkFormModalProps) {
	useModalBehavior({ open, onClose });
	const [distance, setDistance] = useState<number>(0);
	const [mark, setMark] = useState<number>(0);
	const defaultBow = bows.find((b) => b.isFavorite) ?? bows[0];
	const [selectedBowId, setSelectedBowId] = useState<string>(defaultBow?.id ?? '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBowId) {
			setError('Du må velge en bue');
			return;
		}
		if (distance <= 0 || mark <= 0) {
			setError('Vennligst fyll ut begge feltene med positive verdier');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await onSave({ distance, mark, bowId: selectedBowId });
			onClose();
			setDistance(0);
			setMark(0);
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err.message : 'Kunne ikke lagre siktemerke');
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.header}>
					<h3 className={styles.title}>Nytt siktemerke</h3>
					<button onClick={onClose} className={styles.closeButton} aria-label="Lukk">
						<LuX size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="bow-select">Bue</label>
						{bows.length === 0 ? (
							<p className={styles.noBows}>Ingen buer registrert. Legg til en bue i profilen din først.</p>
						) : (
							<select
								id="bow-select"
								className={styles.select}
								value={selectedBowId}
								onChange={(e) => setSelectedBowId(e.target.value)}
							>
								{bows.map((bow) => (
									<option key={bow.id} value={bow.id}>
										{bow.name}{bow.isFavorite ? ' ⭐' : ''}
									</option>
								))}
							</select>
						)}
					</div>
					<div className={styles.inputsRow}>
						<NumberInput
							label="Avstand (m)"
							value={distance}
							onChange={setDistance}
							min={0}
							max={150}
							startEmpty
							required
							width="100%"
						/>
						<NumberInput
							label="Siktemerke"
							value={mark}
							onChange={setMark}
							step={0.01}
							startEmpty
							required
							width="100%"
						/>
					</div>
					{error && <div className={styles.error}>{error}</div>}
					<div className={styles.footer}>
						<Button label="Avbryt" type="button" buttonType="outline" onClick={onClose} disabled={loading} />
						<Button label="Lagre" type="submit" loading={loading} disabled={bows.length === 0} />
					</div>
				</form>
			</div>
		</div>
	);
}
