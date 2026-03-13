'use client';

import { useEffect, useState } from 'react';
import { LuPlus, LuX } from 'react-icons/lu';
import { Button } from '@/components';
import styles from './SightMarksSection.module.css';
import { SightMarksTable } from './SightMarksTable';
import { SightMarkFormModal } from '@/components';
import { useSightMarks } from './useSightMarks';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import { AimDistanceMark, SightMark } from '@/types/SightMarks';
import { Ballistics } from '@/lib/Contants';

interface SightMarksSectionProps {
	onRefresh?: number;
}

export function SightMarksSection({ onRefresh }: SightMarksSectionProps) {
	const { sightMarks, loading, error, fetchSightMarks, deleteSightMark, clearError } = useSightMarks();
	const { bows, arrows, refresh: refreshEquipment } = useEquipmentData();
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingSightMark, setEditingSightMark] = useState<SightMark | null>(null);
	const [createError, setCreateError] = useState<string | null>(null);

	useEffect(() => {
		fetchSightMarks();
		refreshEquipment();
	}, [fetchSightMarks, refreshEquipment, onRefresh]);

	const handleDeleteMark = async (sightMarkId: string, index: number) => {
		setIsDeletingId(sightMarkId);
		try {
			const sm = sightMarks.find((s) => s.id === sightMarkId);
			if (!sm) return;

			const newMarks = sm.givenMarks.filter((_, i) => i !== index);
			const newDistances = sm.givenDistances.filter((_, i) => i !== index);

			if (newMarks.length === 0) {
				// No marks left – delete the whole record
				await deleteSightMark(sightMarkId);
			} else {
				// Patch the record with the mark removed; also filter calculated_marks from stored ballistics
				const calc = sm.ballisticsParameters as import('@/types/SightMarks').CalculatedMarks;
				const newCalculated = Array.isArray(calc?.calculated_marks)
					? calc.calculated_marks.filter((_, i) => i !== index)
					: undefined;
				const updatedBallistics = newCalculated
					? { ...calc, calculated_marks: newCalculated, given_marks: newMarks, given_distances: newDistances }
					: sm.ballisticsParameters;

				const res = await fetch(`/api/sight-marks/${sightMarkId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						givenMarks: newMarks,
						givenDistances: newDistances,
						ballisticsParameters: updatedBallistics,
					}),
				});
				if (!res.ok) throw new Error('Kunne ikke oppdatere siktemerke');
				fetchSightMarks();
			}
		} catch (err) {
			console.error('Error deleting mark:', err);
		} finally {
			setIsDeletingId(null);
		}
	};

	const handleCardClick = (sm: SightMark) => {
		setEditingSightMark(sm);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setEditingSightMark(null);
	};

	const handleCreate = async (data: { distance: number; mark: number; bowId: string; arrowId: string; name: string }) => {
		setCreateError(null);
		try {
			const activeBow = bows.find((b) => b.id === data.bowId);
			const activeArrow = arrows.find((a) => a.id === data.arrowId) ?? arrows.find((a) => a.isFavorite) ?? arrows[0];

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

			// Find active sight mark: prefer the one the user clicked, else match by bow spec
			const activeSightMark = editingSightMark ?? sightMarks.find((sm) => sm.bowSpecificationId === spec.id);

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

			// Enrich with arrow name so the card can display it without a separate lookup
			if (activeArrow?.name) {
				aimMarkResponse.arrow_name = activeArrow.name;
			}

			// Persist (Update or Create)
			let saveRes;
			if (activeSightMark) {
				// Update existing
				saveRes = await fetch(`/api/sight-marks/${activeSightMark.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: data.name || undefined,
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
						name: data.name || undefined,
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
					onClick={() => { setEditingSightMark(null); setIsModalOpen(true); }}
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
				<SightMarksTable
					sightMarks={sightMarks}
					onDeleteMark={handleDeleteMark}
					onCardClick={handleCardClick}
					isDeleting={isDeletingId !== null}
				/>
			</div>
			<SightMarkFormModal
				open={isModalOpen}
				onClose={handleModalClose}
				onSave={handleCreate}
				onDelete={
					editingSightMark
						? async () => { await deleteSightMark(editingSightMark.id); fetchSightMarks(); }
						: undefined
				}
				bows={bows}
				arrows={arrows}
				initialData={
					editingSightMark
						? {
								bowId: editingSightMark.bowSpec?.bow?.id ?? '',
								bowName: editingSightMark.bowSpec?.bow?.name ?? 'Ukjent bue',
								name: editingSightMark.name ?? '',
							}
						: undefined
				}
			/>
		</section>
	);
}
