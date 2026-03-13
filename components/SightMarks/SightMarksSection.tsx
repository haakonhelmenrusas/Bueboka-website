'use client';

import { useEffect, useState } from 'react';
import { LuPlus, LuX } from 'react-icons/lu';
import { Button } from '@/components';
import styles from './SightMarksSection.module.css';
import { SightMarksTable } from './SightMarksTable';
import { SightMarkFormModal } from '@/components';
import { useSightMarks } from './useSightMarks';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import { AimDistanceMark } from '@/types/SightMarks';
import { Ballistics } from '@/lib/Contants';

interface SightMarksSectionProps {
	onRefresh?: number;
}

export function SightMarksSection({ onRefresh }: SightMarksSectionProps) {
	const { sightMarks, loading, error, fetchSightMarks, deleteSightMark, clearError } = useSightMarks();
	const { bows, arrows, refresh: refreshEquipment } = useEquipmentData();
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	useEffect(() => {
		fetchSightMarks();
		refreshEquipment();
	}, [fetchSightMarks, refreshEquipment, onRefresh]);

	const handleDelete = async (id: string) => {
		setIsDeletingId(id);
		try {
			await deleteSightMark(id);
		} finally {
			setIsDeletingId(null);
		}
	};

	const handleCreate = async (data: { distance: number; mark: number }) => {
		setCreateError(null);
		try {
			const activeBow = bows.find((b) => b.isFavorite) || bows[0];
			const activeArrow = arrows.find((a) => a.isFavorite) || arrows[0];

			if (!activeBow) {
				const msg = 'Du må registrere en bue i profilen din før du kan beregne siktemerker.';
				setCreateError(msg);
				throw new Error(msg);
			}

			// Ensure we have a bow specification
			const specRes = await fetch(`/api/bow-specifications/by-bow/${activeBow.id}`);
			if (!specRes.ok) throw new Error('Kunne ikke hente buespesifikasjon');
			const { bowSpecification: spec } = await specRes.json();

			if (!spec) throw new Error('Fant ingen buespesifikasjon. Sjekk at du har registrert en bue i profilen din.');

			// Find active sight mark for this bow spec (assuming most recent is active)
			const activeSightMark = sightMarks.find((sm) => sm.bowSpecificationId === spec.id);

			// Prepare accumulated marks
			const existingMarks = activeSightMark?.givenMarks ?? [];
			const existingDistances = activeSightMark?.givenDistances ?? [];
			const givenMarks = [...existingMarks, data.mark];
			const givenDistances = [...existingDistances, data.distance];

			const payload: AimDistanceMark = {
				...Ballistics,
				new_given_mark: data.mark,
				new_given_distance: data.distance,
				given_marks: givenMarks,
				given_distances: givenDistances,
				bow_category: activeBow.type || 'recurve',
				interval_sight_real: activeBow.aimMeasure ?? 5,
				interval_sight_measured: activeBow.aimMeasure ?? 5,
				arrow_diameter_mm: activeArrow?.diameter ?? 5,
				arrow_mass_gram: activeArrow?.weight ?? 21.2,
				length_eye_sight_cm: activeBow.eyeToSight ?? 0,
				length_nock_eye_cm: activeBow.eyeToNock ?? 0,
			};

			const response = await fetch('/api/ballistics/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Klarte ikke å beregne: ${errorText}`);
			}

			const aimMarkResponse = await response.json();

			// Persist (Update or Create)
			let saveRes;
			if (activeSightMark) {
				// Update existing
				saveRes = await fetch(`/api/sight-marks/${activeSightMark.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						givenMarks,
						givenDistances,
						ballisticsParameters: aimMarkResponse,
					}),
				});
			} else {
				// Create new
				saveRes = await fetch('/api/sight-marks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bowSpecificationId: spec.id,
						givenMarks,
						givenDistances,
						ballisticsParameters: aimMarkResponse,
					}),
				});
			}

			if (!saveRes.ok) {
				throw new Error('Kunne ikke lagre siktemerke');
			}

			// Refresh list after save
			fetchSightMarks();
		} catch (err) {
			setCreateError(err instanceof Error ? err.message : 'En ukjent feil oppstod');
			throw err; // Re-throw to be caught by modal if needed, or handle error display here
		}
	};

	if (loading) {
		return (
			<section className={styles.section}>
				<div className={styles.header}>
					<h2 className={styles.title}>Siktemerker</h2>
				</div>
				<div className={styles.container}>
					<div className={styles.loading}>Laster...</div>
				</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>Siktemerker</h2>
				<Button
					label="Nytt merke"
					onClick={() => setIsModalOpen(true)}
					icon={<LuPlus size={18} />}
				/>
			</div>
			<div className={styles.container}>
				{error && (
					<div className={styles.error}>
						<span>{error}</span>
						<button onClick={clearError} className={styles.closeButton} aria-label="Lukk feilmelding">
							<LuX size={18} />
						</button>
					</div>
				)}
				{createError && (
					<div className={styles.error}>
						<span>{createError}</span>
						<button onClick={() => setCreateError(null)} className={styles.closeButton} aria-label="Lukk feilmelding">
							<LuX size={18} />
						</button>
					</div>
				)}
				<SightMarksTable sightMarks={sightMarks} onDelete={handleDelete} isDeleting={isDeletingId !== null} />
			</div>
			<SightMarkFormModal
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleCreate}
			/>
		</section>
	);
}
