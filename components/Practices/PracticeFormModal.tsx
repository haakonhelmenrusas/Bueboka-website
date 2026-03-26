'use client';

import React, { useEffect, useState } from 'react';
import styles from './PracticeFormModal.module.css';
import { LuX } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { ConfirmModal, Modal } from '@/components';
import { type PracticeFormInput, type RoundInput, emptyRound } from './PracticeFormModal.types';
import { PracticeFormStepIndicator } from './PracticeFormStepIndicator';
import { PracticeFormInfoStep } from './PracticeFormInfoStep';
import { PracticeFormRoundsStep } from './PracticeFormRoundsStep';
import { PracticeFormScoringStep } from './PracticeFormScoringStep';
import { PracticeFormReflectionStep } from './PracticeFormReflectionStep';
import { PracticeFormNavFooter } from './PracticeFormNavFooter';

export type { RoundInput, PracticeFormInput };

interface PracticeFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: PracticeFormInput) => Promise<void>;
	onDeleted?: (id: string) => void;
	mode: 'create' | 'edit';
	practice?: {
		id: string;
		date: string;
		arrowsShot: number;
		location?: string | null;
		environment: Environment;
		weather: WeatherCondition[];
		practiceCategory?: PracticeCategory | null;
		notes?: string | null;
		rating?: number | null;
		roundTypeId?: string | null;
		bowId?: string | null;
		arrowsId?: string | null;
		ends?: Array<{
			id: string;
			arrows: number;
			scores?: number[] | null;
			distanceMeters?: number | null;
			distanceFrom?: number | null;
			distanceTo?: number | null;
			targetSizeCm?: number | null;
			targetType?: string | null;
			arrowsWithoutScore?: number | null;
			roundScore?: number | null;
		}>;
	};
	bows?: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows?: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
}

export const PracticeFormModal: React.FC<PracticeFormModalProps> = ({
	open,
	onClose,
	onSave,
	onDeleted,
	mode,
	practice,
	bows = [],
	arrows = [],
}) => {
	// ─── Step ────────────────────────────────────────────────────────────────
	const [step, setStep] = useState(0);

	// ─── Form state ──────────────────────────────────────────────────────────
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [location, setLocation] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('SKIVE_INDOOR');
	const [notes, setNotes] = useState('');
	const [rating, setRating] = useState<number | null>(null);
	const [rounds, setRounds] = useState<RoundInput[]>([emptyRound('SKIVE_INDOOR')]);
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');

	// ─── UI state ────────────────────────────────────────────────────────────
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	const isEditMode = mode === 'edit';

	// ─── Init form on open ───────────────────────────────────────────────────
	useEffect(() => {
		if (!open) return;

		setStep(0);
		setError(null);

		if (mode === 'edit' && practice) {
			setDate(practice.date.split('T')[0]);
			setLocation(practice.location || '');
			setEnvironment(practice.environment);
			setWeather(practice.weather || []);
			setPracticeCategory(practice.practiceCategory || 'SKIVE_INDOOR');
			setNotes(practice.notes || '');
			setRating(practice.rating ?? null);
			setBowId(practice.bowId || '');
			setArrowsId(practice.arrowsId || '');

			if (practice.ends && practice.ends.length > 0) {
				setRounds(
					practice.ends.map((end) => {
						const savedScores = end.scores ?? [];
						const derivedArrows = end.arrows ?? (savedScores.length > 0 ? savedScores.length : undefined);
						return {
							distanceMeters: end.distanceMeters ?? undefined,
							distanceFrom: end.distanceFrom ?? undefined,
							distanceTo: end.distanceTo ?? undefined,
							targetType: end.targetType || (end.targetSizeCm ? `${end.targetSizeCm}cm` : ''),
							numberArrows: derivedArrows,
							arrowsWithoutScore: end.arrowsWithoutScore ?? undefined,
							roundScore: end.roundScore ?? 0,
							scores: savedScores,
						};
					})
				);
			} else {
				setRounds([emptyRound(practice.practiceCategory || 'SKIVE_INDOOR')]);
			}
		} else {
			setDate(new Date().toISOString().slice(0, 10));
			setLocation('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeCategory('SKIVE_INDOOR');
			setNotes('');
			setRating(null);
			setBowId(bows.find((b) => b.isFavorite)?.id || '');
			setArrowsId(arrows.find((a) => a.isFavorite)?.id || '');

			const lastDistance = typeof window !== 'undefined' ? localStorage.getItem('bueboka_last_distance') : null;
			const lastTarget = typeof window !== 'undefined' ? localStorage.getItem('bueboka_last_target') : null;
			setRounds([
				{
					distanceMeters: lastDistance ? parseFloat(lastDistance) : undefined,
					targetType: lastTarget || '',
					numberArrows: undefined,
					arrowsWithoutScore: undefined,
					roundScore: 0,
					scores: [],
				},
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, mode, practice]);

	useEffect(() => {
		if (environment !== Environment.OUTDOOR) setWeather([]);
	}, [environment]);

	// ─── Category ────────────────────────────────────────────────────────────
	const handleCategoryChange = (cat: PracticeCategory) => {
		setPracticeCategory(cat);
		setRounds([emptyRound(cat)]);
	};

	// ─── Rounds ──────────────────────────────────────────────────────────────
	const addRound = () => {
		if (rounds.length < 20) setRounds((prev) => [...prev, emptyRound(practiceCategory)]);
	};

	const removeRound = (index: number) => {
		if (rounds.length > 1) setRounds((prev) => prev.filter((_, i) => i !== index));
	};

	const updateRound = (index: number, field: keyof RoundInput, value: RoundInput[keyof RoundInput]) => {
		setRounds((prev) => {
			const next = [...prev];
			const updated: RoundInput = { ...next[index], [field]: value };
			if (field === 'numberArrows' && typeof value === 'number') {
				const max = value;
				if (updated.scores && updated.scores.length > max) {
					updated.scores = updated.scores.slice(0, max);
					updated.roundScore = updated.scores.reduce((a, b) => a + b, 0);
				}
			}
			next[index] = updated;
			return next;
		});
	};

	// ─── Arrow scoring ───────────────────────────────────────────────────────
	const addArrowScore = (roundIndex: number, score: number) => {
		const round = rounds[roundIndex];
		const maxArrows = round.numberArrows ?? 0;
		const current = round.scores ?? [];
		if (maxArrows > 0 && current.length >= maxArrows) return;
		const newScores = [...current, score];
		setRounds((prev) => {
			const next = [...prev];
			next[roundIndex] = { ...next[roundIndex], scores: newScores, roundScore: newScores.reduce((a, b) => a + b, 0) };
			return next;
		});
	};

	const removeLastArrowScore = (roundIndex: number) => {
		const current = rounds[roundIndex].scores ?? [];
		if (current.length === 0) return;
		const newScores = current.slice(0, -1);
		setRounds((prev) => {
			const next = [...prev];
			next[roundIndex] = { ...next[roundIndex], scores: newScores, roundScore: newScores.reduce((a, b) => a + b, 0) };
			return next;
		});
	};

	// ─── Weather ─────────────────────────────────────────────────────────────
	const toggleWeather = (condition: WeatherCondition) => {
		setWeather((prev) => (prev.includes(condition) ? prev.filter((w) => w !== condition) : [...prev, condition]));
	};

	// ─── Delete ──────────────────────────────────────────────────────────────
	const handleDelete = async () => {
		if (!practice?.id) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/practices/${practice.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Kunne ikke slette trening');
			onDeleted?.(practice.id);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Kunne ikke slette trening');
		} finally {
			setDeleting(false);
			setConfirmDeleteOpen(false);
		}
	};

	// ─── Submit ──────────────────────────────────────────────────────────────
	const handleSubmit = async () => {
		setSubmitting(true);
		setError(null);
		try {
			const validRounds = rounds.filter(
				(r) =>
					(r.distanceMeters && r.distanceMeters > 0) ||
					(r.distanceFrom && r.distanceFrom > 0) ||
					(r.distanceTo && r.distanceTo > 0) ||
					r.targetType ||
					(r.numberArrows ?? 0) > 0 ||
					r.roundScore > 0
			);

			if (validRounds.length > 0 && typeof window !== 'undefined') {
				const first = validRounds[0];
				if (first.distanceMeters && first.distanceMeters > 0)
					localStorage.setItem('bueboka_last_distance', first.distanceMeters.toString());
				if (first.targetType) localStorage.setItem('bueboka_last_target', first.targetType);
			}

			await onSave({
				date: new Date(date).toISOString(),
				location: location || undefined,
				environment,
				weather,
				practiceCategory,
				notes: notes || undefined,
				rating: rating ?? undefined,
				rounds: validRounds,
				bowId: bowId || undefined,
				arrowsId: arrowsId || undefined,
			});
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Kunne ikke lagre trening.');
		} finally {
			setSubmitting(false);
		}
	};

	if (!open) return null;

	const title = isEditMode ? 'Rediger trening' : 'Ny trening';

	return (
		<>
			<Modal
				open={open}
				onClose={onClose}
				title={title}
				maxWidth={760}
				closeOnBackdrop={false}
				hideHeader
				panelStyle={{ padding: 0, gap: 0, overflow: 'hidden' }}
			>
				<div className={styles.wizard}>
					{/* Header */}
					<div className={styles.wizardHeader}>
						<h2 className={styles.wizardTitle}>{title}</h2>
						<button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
							<LuX size={20} />
						</button>
					</div>

					<PracticeFormStepIndicator step={step} onStepChange={setStep} />

					<div className={styles.scrollArea}>
						{step === 0 && (
							<PracticeFormInfoStep
								date={date}
								setDate={setDate}
								practiceCategory={practiceCategory}
								onCategoryChange={handleCategoryChange}
								environment={environment}
								setEnvironment={setEnvironment}
								location={location}
								setLocation={setLocation}
								weather={weather}
								toggleWeather={toggleWeather}
								bowId={bowId}
								setBowId={setBowId}
								arrowsId={arrowsId}
								setArrowsId={setArrowsId}
								bows={bows}
								arrows={arrows}
								isEditMode={isEditMode}
								onDeleteRequest={() => setConfirmDeleteOpen(true)}
							/>
						)}
						{step === 1 && (
							<PracticeFormRoundsStep
								rounds={rounds}
								practiceCategory={practiceCategory}
								addRound={addRound}
								removeRound={removeRound}
								updateRound={updateRound}
							/>
						)}
						{step === 2 && (
							<PracticeFormScoringStep rounds={rounds} addArrowScore={addArrowScore} removeLastArrowScore={removeLastArrowScore} />
						)}
						{step === 3 && (
							<PracticeFormReflectionStep rating={rating} setRating={setRating} notes={notes} setNotes={setNotes} error={error} />
						)}
					</div>

					<PracticeFormNavFooter
						step={step}
						onPrev={() => setStep((s) => Math.max(s - 1, 0))}
						onNext={() => setStep((s) => Math.min(s + 1, 3))}
						isEditMode={isEditMode}
						submitting={submitting}
						onClose={onClose}
						onSubmit={handleSubmit}
					/>
				</div>
			</Modal>

			<ConfirmModal
				open={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
				onConfirm={handleDelete}
				title="Slett trening"
				message="Er du sikker på at du vil slette denne treningen? Handlingen kan ikke angres."
				confirmLabel="Slett"
				cancelLabel="Avbryt"
				variant="danger"
				isLoading={deleting}
			/>
		</>
	);
};
