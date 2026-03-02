'use client';

import React, { useEffect, useState } from 'react';
import styles from './PracticeFormModal.module.css';
import { LuX } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { Button, DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/useModalBehavior';
import {
	getArrowsOptions,
	getBowOptions,
	getEnvironmentOptions,
	getPracticeCategoryOptions,
	getWeatherSelectOptions,
} from '@/lib/formUtils';

export interface RoundInput {
	distanceMeters?: number; // For SKIVE categories
	distanceFrom?: number; // For JAKT_3D and FELT categories
	distanceTo?: number; // For JAKT_3D and FELT categories
	targetType: string;
	numberArrows?: number;
	arrowsWithoutScore?: number;
	roundScore: number;
}

export interface PracticeFormInput {
	date: string; // ISO
	location?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory: PracticeCategory;
	notes?: string;
	rating?: number;
	rounds: RoundInput[];
	bowId?: string;
	arrowsId?: string;
}

interface PracticeFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: PracticeFormInput) => Promise<void>;
	mode: 'create' | 'edit';
	practice?: {
		id: string;
		date: string; // ISO
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
			distanceMeters?: number | null;
			targetSizeCm?: number | null;
			roundScore?: number | null;
		}>;
	};
	bows?: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows?: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
}

export const PracticeFormModal: React.FC<PracticeFormModalProps> = ({ open, onClose, onSave, mode, practice, bows = [], arrows = [] }) => {
	useModalBehavior({ open, onClose });

	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [location, setLocation] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('SKIVE_INDOOR');
	const [notes, setNotes] = useState('');
	const [rating, setRating] = useState<number | null>(null);
	const [rounds, setRounds] = useState<RoundInput[]>([
		{ distanceMeters: 0, targetType: '', numberArrows: 0, arrowsWithoutScore: 0, roundScore: 0 },
	]);
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Target type options - TODO: can be expanded based on requirements
	const targetTypeOptions = [
		{ value: '40cm', label: '40cm' },
		{ value: '60cm', label: '60cm' },
		{ value: '80cm', label: '80cm' },
		{ value: '122cm', label: '122cm' },
		{ value: '3-spot', label: '3-spot' },
		{ value: 'vertical-3-spot', label: 'Vertical 3-spot' },
		{ value: 'animal', label: 'Dyr' },
		{ value: 'other', label: 'Annet' },
		{ value: 'halmmatte', label: 'Halmmatte' },
	];

	useEffect(() => {
		if (!open) return;

		if (mode === 'edit' && practice) {
			setDate(practice.date.split('T')[0]);
			setLocation(practice.location || '');
			setEnvironment(practice.environment);
			setWeather(practice.weather || []);
			setPracticeCategory(practice.practiceCategory || 'SKIVE_INDOOR');
			setNotes(practice.notes || '');
			setRating(practice.rating ?? null);

			// Extract rounds from ends data
			if (practice.ends && practice.ends.length > 0) {
				const extractedRounds = practice.ends.map((end) => {
					// Convert targetSizeCm back to targetType format (e.g., 40 -> "40cm")
					const targetType = end.targetSizeCm ? `${end.targetSizeCm}cm` : '';

					return {
						distanceMeters: end.distanceMeters || undefined,
						distanceFrom: (end as any).distanceFrom || undefined,
						distanceTo: (end as any).distanceTo || undefined,
						targetType: targetType,
						numberArrows: end.arrows || 0,
						arrowsWithoutScore: (end as any).arrowsWithoutScore || 0,
						roundScore: end.roundScore || 0,
					};
				});
				setRounds(extractedRounds);
			} else {
				// No ends data, start with one empty round
				setRounds([{ distanceMeters: 0, targetType: '', numberArrows: 0, arrowsWithoutScore: 0, roundScore: 0 }]);
			}

			setBowId(practice.bowId || '');
			setArrowsId(practice.arrowsId || '');
		} else {
			setDate(new Date().toISOString().slice(0, 10));
			setLocation('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeCategory('SKIVE_INDOOR');
			setNotes('');
			setRating(null);

			const lastDistance = localStorage.getItem('bueboka_last_distance');
			const lastTarget = localStorage.getItem('bueboka_last_target');
			setRounds([
				{
					distanceMeters: lastDistance ? parseFloat(lastDistance) : 0,
					targetType: lastTarget || '',
					numberArrows: 0,
					arrowsWithoutScore: 0,
					roundScore: 0,
				},
			]);
			setBowId('');
			setArrowsId('');
		}
		setError(null);
	}, [open, mode, practice]);

	// Prefill favorites for create mode
	useEffect(() => {
		if (!open || mode !== 'create') return;

		if (!bowId) {
			const favBow = bows.find((b) => b.isFavorite);
			if (favBow) setBowId(favBow.id);
		}
		if (!arrowsId) {
			const favArrows = arrows.find((a) => a.isFavorite);
			if (favArrows) setArrowsId(favArrows.id);
		}
	}, [open, mode, bows, arrows, bowId, arrowsId]);

	useEffect(() => {
		if (environment !== Environment.OUTDOOR) {
			setWeather([]);
		}
	}, [environment]);

	// Helper functions for managing rounds
	const addRound = () => {
		const isRangeCategory = practiceCategory === 'JAKT_3D' || practiceCategory === 'FELT';
		if (isRangeCategory) {
			setRounds([...rounds, { distanceFrom: 0, distanceTo: 0, targetType: '', numberArrows: 0, arrowsWithoutScore: 0, roundScore: 0 }]);
		} else {
			setRounds([...rounds, { distanceMeters: 0, targetType: '', numberArrows: 0, arrowsWithoutScore: 0, roundScore: 0 }]);
		}
	};

	const updateRound = (index: number, field: keyof RoundInput, value: number | string) => {
		const newRounds = [...rounds];
		newRounds[index] = { ...newRounds[index], [field]: value };
		setRounds(newRounds);
	};

	const removeRound = (index: number) => {
		if (rounds.length > 1) {
			setRounds(rounds.filter((_, i) => i !== index));
		}
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			// Filter out empty rounds (where no values are set)
			const validRounds = rounds.filter((r) => {
				const hasDistance =
					(r.distanceMeters && r.distanceMeters > 0) || (r.distanceFrom && r.distanceFrom > 0) || (r.distanceTo && r.distanceTo > 0);
				return hasDistance || r.targetType || (r.numberArrows ?? 0) > 0 || r.roundScore > 0;
			});

			// Save last used distance and target to localStorage (from first round)
			if (validRounds.length > 0) {
				const firstRound = validRounds[0];
				if (firstRound.distanceMeters && firstRound.distanceMeters > 0) {
					localStorage.setItem('bueboka_last_distance', firstRound.distanceMeters.toString());
				}
				if (firstRound.targetType) {
					localStorage.setItem('bueboka_last_target', firstRound.targetType);
				}
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
			console.error('Error saving practice:', err);
			setError(err instanceof Error ? err.message : 'Kunne ikke lagre trening.');
		} finally {
			setSubmitting(false);
		}
	};

	if (!open) return null;

	const isEditMode = mode === 'edit';
	const title = isEditMode ? 'Rediger trening' : 'Ny trening';
	const submitLabel = isEditMode ? 'Lagre endringer' : 'Lagre trening';

	const environmentOptions = getEnvironmentOptions();
	const practiceCategoryOptions = getPracticeCategoryOptions();
	const bowOptions = getBowOptions(bows);
	const arrowsOptions = getArrowsOptions(arrows);

	return (
		<div className={styles.overlay} role="presentation">
			<div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="practice-form-title">
				<div className={styles.header}>
					<h3 id="practice-form-title" className={styles.title}>
						{title}
					</h3>
					<button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<LuX size={20} />
					</button>
				</div>
				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.row}>
						<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
						<Select
							label="Kategori"
							value={practiceCategory}
							onChange={(v) => setPracticeCategory(v as PracticeCategory)}
							options={practiceCategoryOptions}
							containerClassName={styles.field}
						/>
					</div>
					<div className={styles.row}>
						<Select
							label="Miljø"
							value={environment}
							onChange={(v) => setEnvironment(v as Environment)}
							options={environmentOptions}
							containerClassName={styles.field}
						/>
						<Input
							label="Sted"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							helpText={`F.eks. Oslo (${location.length}/64 tegn)`}
							maxLength={64}
							containerClassName={styles.field}
						/>
					</div>
					{environment === Environment.OUTDOOR ? (
						<Select
							label="Vær"
							helpText="Velg ett eller flere"
							value={weather}
							onChange={(v) => setWeather(v as WeatherCondition[])}
							multiple
							maxSelectedLabels={2}
							placeholderLabel="Velg vær (valgfritt)"
							options={getWeatherSelectOptions()}
							containerClassName={styles.field}
						/>
					) : null}
					<div className={styles.row}>
						<Select
							label="Bue"
							value={bowId}
							onChange={(v) => setBowId(v as string)}
							placeholderLabel="Velg bue (valgfritt)"
							options={bowOptions}
							containerClassName={styles.field}
						/>
						<Select
							label="Piler"
							value={arrowsId}
							onChange={(v) => setArrowsId(v as string)}
							placeholderLabel="Velg piler (valgfritt)"
							options={arrowsOptions}
							containerClassName={styles.field}
						/>
					</div>
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>Runder</h4>
						{rounds.map((round, index) => {
							const isRangeCategory = practiceCategory === 'JAKT_3D' || practiceCategory === 'FELT';

							return (
								<div key={index} className={styles.roundCard}>
									<div className={styles.roundHeader}>
										<span className={styles.roundNumber}>Runde {index + 1}</span>
										{rounds.length > 1 && (
											<button type="button" className={styles.removeRoundBtn} onClick={() => removeRound(index)} aria-label="Fjern runde">
												<LuX size={16} />
											</button>
										)}
									</div>
									<div className={styles.roundInputs}>
										{isRangeCategory ? (
											<>
												<NumberInput
													label="Fra"
													value={round.distanceFrom || 0}
													onChange={(v) => updateRound(index, 'distanceFrom', v)}
													min={0}
													step={1}
													startEmpty={true}
													hideSteppers
													unit="m"
													containerClassName={styles.roundField}
												/>
												<NumberInput
													label="Til"
													value={round.distanceTo || 0}
													onChange={(v) => updateRound(index, 'distanceTo', v)}
													min={0}
													step={1}
													startEmpty={true}
													hideSteppers
													unit="m"
													containerClassName={styles.roundField}
												/>
											</>
										) : (
											<NumberInput
												label="Avstand"
												value={round.distanceMeters || 0}
												onChange={(v) => updateRound(index, 'distanceMeters', v)}
												min={0}
												step={1}
												startEmpty={true}
												hideSteppers
												unit="m"
												containerClassName={styles.roundField}
											/>
										)}
										<Select
											label="Blink"
											value={round.targetType}
											onChange={(v) => updateRound(index, 'targetType', v as string)}
											placeholderLabel="Velg"
											options={targetTypeOptions}
											containerClassName={styles.roundField}
										/>
									</div>
									<div className={styles.row}>
										<NumberInput
											label="Piler"
											value={round.numberArrows || 0}
											onChange={(v) => updateRound(index, 'numberArrows', v || 0)}
											min={0}
											step={1}
											startEmpty={true}
											optional
											helpText="Ant. piler med score"
											containerClassName={styles.roundField}
										/>
										<NumberInput
											label="Piler u/score"
											value={round.arrowsWithoutScore || 0}
											onChange={(v) => updateRound(index, 'arrowsWithoutScore', v || 0)}
											min={0}
											step={1}
											startEmpty={true}
											optional
											helpText="Piler uten score"
											containerClassName={styles.roundField}
										/>
										<NumberInput
											label="Score"
											value={round.roundScore}
											onChange={(v) => updateRound(index, 'roundScore', v)}
											min={0}
											step={1}
											startEmpty={true}
											optional
											containerClassName={styles.roundField}
										/>
									</div>
								</div>
							);
						})}
						<Button
							type="button"
							label="+ Legg til runde"
							onClick={addRound}
							variant="standard"
							buttonType="outline"
							width="100%"
							disabled={rounds.length >= 20}
						/>
						{rounds.length >= 20 && <p className={styles.limitMessage}>Maksimalt 20 runder er tillatt</p>}
					</div>
					<div className={styles.ratingSection}>
						<div className={styles.ratingLabel}>
							Vurdering
							<span className={styles.ratingOptional}>(valgfritt)</span>
						</div>
						<p className={styles.ratingHelpText}>Hvordan vil du vurdere treningen?</p>
						<div className={styles.ratingButtons}>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
								<button
									key={num}
									type="button"
									className={`${styles.ratingButton} ${rating === num ? styles.ratingButtonActive : ''}`}
									onClick={() => setRating(rating === num ? null : num)}
									aria-label={`Vurdering ${num} av 10`}
									aria-pressed={rating === num}
								>
									{num}
								</button>
							))}
						</div>
					</div>
					<TextArea
						label="Notater"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Hvordan gikk treningen?&#10;&#10;Hva gikk bra?&#10;Hva kan forbedres?&#10;Noen spesielle forhold eller observasjoner?"
						helpText={`Dine tanker og observasjoner om treningen (${notes.length}/500 tegn)`}
						maxLength={500}
						containerClassName={styles.field}
					/>
					{error && <div className={styles.error}>{error}</div>}
					<div className={styles.actions}>
						<Button
							type="button"
							label="Avbryt"
							onClick={onClose}
							variant="standard"
							buttonType="outline"
							width={160}
							disabled={submitting}
						/>
						<Button
							type="submit"
							label={submitting ? 'Lagrer...' : submitLabel}
							variant="standard"
							disabled={submitting}
							loading={submitting}
							width={180}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};
