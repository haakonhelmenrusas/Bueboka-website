'use client';

import React, { useEffect, useState } from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuX } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { ConfirmModal, Modal } from '@/components';
import { type CompetitionFormInput, type CompetitionRoundInput, emptyRound } from './CompetitionFormModal.types';
import { CompetitionFormStepIndicator } from './CompetitionFormStepIndicator';
import { CompetitionFormInfoStep } from './CompetitionFormInfoStep';
import { CompetitionFormRoundsStep } from './CompetitionFormRoundsStep';
import { CompetitionFormResultStep } from './CompetitionFormResultStep';
import { CompetitionFormReflectionStep } from './CompetitionFormReflectionStep';
import { CompetitionFormNavFooter } from './CompetitionFormNavFooter';

export type { CompetitionFormInput, CompetitionRoundInput };

interface CompetitionFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: CompetitionFormInput) => Promise<void>;
	onDeleted?: (id: string) => void;
	mode: 'create' | 'edit';
	competition?: {
		id: string;
		date: string;
		name: string;
		location?: string | null;
		organizerName?: string | null;
		environment: Environment;
		weather: WeatherCondition[];
		practiceCategory: PracticeCategory;
		notes?: string | null;
		placement?: number | null;
		numberOfParticipants?: number | null;
		personalBest?: boolean | null;
		bowId?: string | null;
		arrowsId?: string | null;
		rounds?: Array<{
			id: string;
			roundNumber: number;
			arrows: number;
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

export const CompetitionFormModal: React.FC<CompetitionFormModalProps> = ({
	open,
	onClose,
	onSave,
	onDeleted,
	mode,
	competition,
	bows = [],
	arrows = [],
}) => {
	const [step, setStep] = useState(0);

	const [name, setName] = useState('');
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [location, setLocation] = useState('');
	const [organizerName, setOrganizerName] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('SKIVE_INDOOR');
	const [rounds, setRounds] = useState<CompetitionRoundInput[]>([emptyRound('SKIVE_INDOOR')]);
	const [placement, setPlacement] = useState<number | null>(null);
	const [numberOfParticipants, setNumberOfParticipants] = useState<number | null>(null);
	const [personalBest, setPersonalBest] = useState(false);
	const [notes, setNotes] = useState('');
	const [bowId, setBowId] = useState('');
	const [arrowsId, setArrowsId] = useState('');

	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	const isEditMode = mode === 'edit';

	useEffect(() => {
		if (!open) return;

		setStep(0);
		setError(null);

		if (mode === 'edit' && competition) {
			setName(competition.name);
			setDate(competition.date.split('T')[0]);
			setLocation(competition.location || '');
			setOrganizerName(competition.organizerName || '');
			setEnvironment(competition.environment);
			setWeather(competition.weather || []);
			setPracticeCategory(competition.practiceCategory);
			setNotes(competition.notes || '');
			setPlacement(competition.placement ?? null);
			setNumberOfParticipants(competition.numberOfParticipants ?? null);
			setPersonalBest(competition.personalBest ?? false);
			setBowId(competition.bowId || '');
			setArrowsId(competition.arrowsId || '');

			if (competition.rounds && competition.rounds.length > 0) {
				setRounds(
					competition.rounds.map((r) => ({
						distanceMeters: r.distanceMeters ?? undefined,
						distanceFrom: r.distanceFrom ?? undefined,
						distanceTo: r.distanceTo ?? undefined,
						targetType: r.targetType || (r.targetSizeCm ? `${r.targetSizeCm}cm` : ''),
						numberArrows: r.arrows || undefined,
						arrowsWithoutScore: r.arrowsWithoutScore ?? undefined,
						roundScore: r.roundScore ?? 0,
					}))
				);
			} else {
				setRounds([emptyRound(competition.practiceCategory)]);
			}
		} else {
			setName('');
			setDate(new Date().toISOString().slice(0, 10));
			setLocation('');
			setOrganizerName('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeCategory('SKIVE_INDOOR');
			setNotes('');
			setPlacement(null);
			setNumberOfParticipants(null);
			setPersonalBest(false);
			setRounds([emptyRound('SKIVE_INDOOR')]);
			setBowId(bows.find((b) => b.isFavorite)?.id || '');
			setArrowsId(arrows.find((a) => a.isFavorite)?.id || '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, mode, competition]);

	useEffect(() => {
		if (environment !== Environment.OUTDOOR) setWeather([]);
	}, [environment]);

	const handleCategoryChange = (cat: PracticeCategory) => {
		setPracticeCategory(cat);
		setRounds([emptyRound(cat)]);
	};

	const addRound = () => {
		if (rounds.length < 20) setRounds((prev) => [...prev, emptyRound(practiceCategory)]);
	};

	const removeRound = (index: number) => {
		if (rounds.length > 1) setRounds((prev) => prev.filter((_, i) => i !== index));
	};

	const updateRound = (index: number, field: keyof CompetitionRoundInput, value: CompetitionRoundInput[keyof CompetitionRoundInput]) => {
		setRounds((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	};

	const toggleWeather = (condition: WeatherCondition) => {
		setWeather((prev) => (prev.includes(condition) ? prev.filter((w) => w !== condition) : [...prev, condition]));
	};

	const handleDelete = async () => {
		if (!competition?.id) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/competitions/${competition.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Kunne ikke slette konkurranse');
			onDeleted?.(competition.id);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Kunne ikke slette konkurranse');
		} finally {
			setDeleting(false);
			setConfirmDeleteOpen(false);
		}
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError('Navn på konkurransen er påkrevd');
			return;
		}

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

			await onSave({
				date: new Date(date).toISOString(),
				name: name.trim(),
				location: location || undefined,
				organizerName: organizerName || undefined,
				environment,
				weather,
				practiceCategory,
				notes: notes || undefined,
				placement: placement ?? undefined,
				numberOfParticipants: numberOfParticipants ?? undefined,
				personalBest: personalBest || undefined,
				rounds: validRounds.length > 0 ? validRounds : rounds,
				bowId: bowId || undefined,
				arrowsId: arrowsId || undefined,
			});
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Kunne ikke lagre konkurranse.');
		} finally {
			setSubmitting(false);
		}
	};

	if (!open) return null;

	const title = isEditMode ? 'Rediger konkurranse' : 'Ny konkurranse';

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
					<div className={styles.wizardHeader}>
						<h2 className={styles.wizardTitle}>{title}</h2>
						<button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
							<LuX size={20} />
						</button>
					</div>

					<CompetitionFormStepIndicator step={step} onStepChange={setStep} />

					<div className={styles.scrollArea}>
						{step === 0 && (
							<CompetitionFormInfoStep
								name={name}
								setName={setName}
								date={date}
								setDate={setDate}
								practiceCategory={practiceCategory}
								onCategoryChange={handleCategoryChange}
								environment={environment}
								setEnvironment={setEnvironment}
								location={location}
								setLocation={setLocation}
								organizerName={organizerName}
								setOrganizerName={setOrganizerName}
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
							<CompetitionFormRoundsStep
								rounds={rounds}
								practiceCategory={practiceCategory}
								addRound={addRound}
								removeRound={removeRound}
								updateRound={updateRound}
							/>
						)}
						{step === 2 && (
							<CompetitionFormResultStep
								placement={placement}
								setPlacement={setPlacement}
								numberOfParticipants={numberOfParticipants}
								setNumberOfParticipants={setNumberOfParticipants}
								personalBest={personalBest}
								setPersonalBest={setPersonalBest}
							/>
						)}
						{step === 3 && <CompetitionFormReflectionStep notes={notes} setNotes={setNotes} error={error} />}
					</div>

					<CompetitionFormNavFooter
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
				title="Slett konkurranse"
				message="Er du sikker på at du vil slette denne konkurransen? Handlingen kan ikke angres."
				confirmLabel="Slett"
				cancelLabel="Avbryt"
				variant="danger"
				isLoading={deleting}
			/>
		</>
	);
};
