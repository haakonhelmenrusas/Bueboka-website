'use client';

import React, { useEffect, useState } from 'react';
import styles from './CompetitionFormModal.module.css';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { Button, Checkbox, DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/hooks/useModalBehavior';
import {
	type ArrowsOption,
	type EquipmentOption,
	getArrowsOptions,
	getBowOptions,
	getEnvironmentOptions,
	getPracticeCategoryOptions,
	getWeatherSelectOptions,
} from '@/lib/formUtils';
import { LuX } from 'react-icons/lu';

export interface CompetitionRoundInput {
	roundNumber: number;
	distanceMeters?: number;
	targetType: string; // Changed from targetSizeCm to match practice form
	numberArrows?: number;
	arrowsWithoutScore?: number;
	roundScore: number;
	scores?: number[];
}

export interface CompetitionFormInput {
	date: string; // ISO
	name: string;
	location?: string;
	organizerName?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory: PracticeCategory;
	notes?: string;
	placement?: number;
	numberOfParticipants?: number;
	personalBest?: boolean;
	rounds: CompetitionRoundInput[];
	bowId?: string;
	arrowsId?: string;
}

interface CompetitionFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: CompetitionFormInput) => Promise<void>;
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
			targetSizeCm?: number | null;
			roundScore?: number | null;
			scores?: number[];
		}>;
	};
	bows?: EquipmentOption[];
	arrows?: ArrowsOption[];
}

export const CompetitionFormModal: React.FC<CompetitionFormModalProps> = ({
	open,
	onClose,
	onSave,
	mode,
	competition,
	bows = [],
	arrows = [],
}) => {
	useModalBehavior({ open, onClose });

	// Target type options - same as practice form
	const targetTypeOptions = [
		{ value: '40cm', label: '40 cm' },
		{ value: '60cm', label: '60 cm' },
		{ value: '80cm', label: '80 cm' },
		{ value: '122cm', label: '122 cm' },
		{ value: '3-spot', label: '3-spot' },
		{ value: 'vertical-3-spot', label: 'Vertical 3-spot' },
		{ value: 'animal', label: 'Dyr' },
		{ value: 'other', label: 'Annet' },
		{ value: 'halmmatte', label: 'Halmmatte' },
	];

	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [organizerName, setOrganizerName] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('SKIVE_INDOOR');
	const [notes, setNotes] = useState('');
	const [placement, setPlacement] = useState<number | null>(null);
	const [numberOfParticipants, setNumberOfParticipants] = useState<number | null>(null);
	const [personalBest, setPersonalBest] = useState(false);
	const [rounds, setRounds] = useState<CompetitionRoundInput[]>([
		{ roundNumber: 1, distanceMeters: 18, targetType: '40cm', numberArrows: 30, arrowsWithoutScore: 0, roundScore: 0 },
	]);
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize form based on mode
	useEffect(() => {
		if (!open) return;

		if (mode === 'edit' && competition) {
			setDate(competition.date.split('T')[0]);
			setName(competition.name);
			setLocation(competition.location || '');
			setOrganizerName(competition.organizerName || '');
			setEnvironment(competition.environment);
			setWeather(competition.weather || []);
			setPracticeCategory(competition.practiceCategory);
			setNotes(competition.notes || '');
			setPlacement(competition.placement ?? null);
			setNumberOfParticipants(competition.numberOfParticipants ?? null);
			setPersonalBest(competition.personalBest ?? false);

			if (competition.rounds && competition.rounds.length > 0) {
				const extractedRounds = competition.rounds.map((round) => ({
					roundNumber: round.roundNumber,
					distanceMeters: round.distanceMeters || undefined,
					targetType: round.targetSizeCm ? `${round.targetSizeCm}cm` : '',
					numberArrows: round.arrows || 0,
					arrowsWithoutScore: (round as any).arrowsWithoutScore || 0,
					roundScore: round.roundScore || 0,
					scores: round.scores,
				}));
				setRounds(extractedRounds);
			}

			setBowId(competition.bowId || '');
			setArrowsId(competition.arrowsId || '');
		} else {
			// Create mode: reset to defaults
			setDate(new Date().toISOString().slice(0, 10));
			setName('');
			setLocation('');
			setOrganizerName('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeCategory('SKIVE_INDOOR');
			setNotes('');
			setPlacement(null);
			setNumberOfParticipants(null);
			setPersonalBest(false);
			setRounds([{ roundNumber: 1, distanceMeters: 18, targetType: '40cm', numberArrows: 30, arrowsWithoutScore: 0, roundScore: 0 }]);
			// Set defaults based on favorites
			const favoriteBow = bows.find((b) => b.isFavorite);
			setBowId(favoriteBow ? favoriteBow.id : '');

			const favoriteArrows = arrows.find((a) => a.isFavorite);
			setArrowsId(favoriteArrows ? favoriteArrows.id : '');
		}
		setError(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, mode, competition]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;

		setError(null);

		// Validation
		if (!name.trim()) {
			setError('Navn på konkurransen er påkrevd');
			return;
		}

		const validRounds = rounds.filter((r) => (r.numberArrows ?? 0) > 0 || (r.arrowsWithoutScore ?? 0) > 0);
		if (validRounds.length === 0) {
			setError('Minst én runde med piler er påkrevd');
			return;
		}

		setSubmitting(true);
		try {
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
				rounds: validRounds,
				bowId: bowId || undefined,
				arrowsId: arrowsId || undefined,
			});
			onClose();
		} catch (err) {
			console.error('Error saving competition:', err);
			setError(err instanceof Error ? err.message : 'Kunne ikke lagre konkurranse.');
		} finally {
			setSubmitting(false);
		}
	};

	const addRound = () => {
		setRounds([
			...rounds,
			{
				roundNumber: rounds.length + 1,
				distanceMeters: rounds[rounds.length - 1]?.distanceMeters || 18,
				targetType: rounds[rounds.length - 1]?.targetType || '40cm',
				numberArrows: 30,
				arrowsWithoutScore: 0,
				roundScore: 0,
			},
		]);
	};

	const removeRound = (index: number) => {
		if (rounds.length > 1) {
			setRounds(rounds.filter((_, i) => i !== index));
		}
	};

	const updateRound = (index: number, field: keyof CompetitionRoundInput, value: any) => {
		const updated = [...rounds];
		updated[index] = { ...updated[index], [field]: value };
		setRounds(updated);
	};

	if (!open) return null;

	const environmentOptions = getEnvironmentOptions();
	const practiceCategoryOptions = getPracticeCategoryOptions();
	const bowOptions = getBowOptions(bows);
	const arrowsOptions = getArrowsOptions(arrows);

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h3 className={styles.title}>{mode === 'edit' ? 'Rediger konkurranse' : 'Legg til konkurranse'}</h3>
					<button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<LuX size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}
					<Input
						label="Navn på konkurransen"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						helpText="F.eks. 'NM Innendørs 2026'"
						containerClassName={styles.field}
					/>
					<div className={styles.row}>
						<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
						<Select
							label="Kategori"
							value={practiceCategory}
							onChange={(val) => setPracticeCategory(val as PracticeCategory)}
							options={practiceCategoryOptions}
							containerClassName={styles.field}
						/>
					</div>
					<div className={styles.row}>
						<Select
							label="Miljø"
							value={environment}
							onChange={(val) => setEnvironment(val as Environment)}
							options={environmentOptions}
							containerClassName={styles.field}
						/>
						<Input label="Sted" optional value={location} onChange={(e) => setLocation(e.target.value)} containerClassName={styles.field} />
					</div>
					<div className={styles.row}>
						<Select
							label="Bue"
							value={bowId}
							onChange={(val) => setBowId(val as string)}
							options={bowOptions}
							placeholderLabel="Velg bue (valgfritt)"
							containerClassName={styles.field}
						/>
						<Select
							label="Piler"
							value={arrowsId}
							onChange={(val) => setArrowsId(val as string)}
							options={arrowsOptions}
							placeholderLabel="Velg piler (valgfritt)"
							containerClassName={styles.field}
						/>
					</div>
					<Input
						label="Arrangør"
						optional
						value={organizerName}
						onChange={(e) => setOrganizerName(e.target.value)}
						helpText="Klubb eller organisasjon som arrangerte"
						containerClassName={styles.field}
					/>
					{environment === Environment.OUTDOOR ? (
						<Select
							label="Værforhold"
							value={weather}
							onChange={(val) => setWeather(val as WeatherCondition[])}
							options={getWeatherSelectOptions()}
							multiple
							maxSelectedLabels={2}
							placeholderLabel="Velg vær (valgfritt)"
							helpText="Velg ett eller flere"
							containerClassName={styles.field}
						/>
					) : null}
					<div className={styles.row}>
						<NumberInput
							label="Plassering"
							value={placement ?? 0}
							onChange={(val) => setPlacement(val || null)}
							onEmpty={() => setPlacement(null)}
							min={1}
							helpText="Din plassering"
							startEmpty
							optional
							inputClassName={styles.numberInput}
							containerClassName={styles.field}
						/>
						<NumberInput
							label="Antall deltakere"
							value={numberOfParticipants ?? 0}
							onChange={(val) => setNumberOfParticipants(val || null)}
							onEmpty={() => setNumberOfParticipants(null)}
							min={1}
							helpText="Totalt antall"
							startEmpty
							optional
							containerClassName={styles.field}
						/>
					</div>
					<Checkbox label="Personlig rekord" checked={personalBest} onChange={setPersonalBest} />
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>Runder</h4>
						{rounds.map((round, index) => (
							<div key={index} className={styles.roundCard}>
								<div className={styles.roundHeader}>
									<span className={styles.roundNumber}>Runde {round.roundNumber}</span>
									{rounds.length > 1 && (
										<button type="button" onClick={() => removeRound(index)} className={styles.removeRoundBtn} aria-label="Fjern runde">
											<LuX size={16} />
										</button>
									)}
								</div>
								<div className={styles.roundInputs}>
									<NumberInput
										label="Avstand"
										value={round.distanceMeters ?? 0}
										onChange={(val) => updateRound(index, 'distanceMeters', val || undefined)}
										onEmpty={() => updateRound(index, 'distanceMeters', undefined)}
										min={1}
										startEmpty
										unit="m"
										containerClassName={styles.distanceField}
									/>
									<Select
										label="Skive"
										value={round.targetType}
										onChange={(val) => updateRound(index, 'targetType', val as string)}
										options={targetTypeOptions}
										placeholderLabel="Velg skive"
										searchable
										searchPlaceholder="Søk etter skive..."
										containerClassName={styles.targetField}
									/>
								</div>
								<div className={styles.row}>
									<NumberInput
										label="Piler"
										value={round.numberArrows ?? 0}
										onChange={(val) => updateRound(index, 'numberArrows', val || 0)}
										onEmpty={() => updateRound(index, 'numberArrows', 0)}
										min={0}
										optional
										startEmpty
										width="120px"
										helpText="Ant. piler med score"
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label="Piler u/score"
										value={round.arrowsWithoutScore ?? 0}
										onChange={(val) => updateRound(index, 'arrowsWithoutScore', val || 0)}
										onEmpty={() => updateRound(index, 'arrowsWithoutScore', 0)}
										min={0}
										optional
										startEmpty
										width="120px"
										helpText="Piler uten score"
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label="Score"
										value={round.roundScore}
										onChange={(val) => updateRound(index, 'roundScore', val || 0)}
										min={0}
										optional
										startEmpty
										width="120px"
										containerClassName={styles.roundField}
									/>
								</div>
							</div>
						))}
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
					<TextArea
						label="Notater"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Hvordan gikk konkurransen?&#10;&#10;Hva gikk bra?&#10;Hva kan forbedres?&#10;Noen spesielle forhold eller observasjoner?"
						helpText={`Dine refleksjoner fra konkurransen (${notes.length}/500 tegn)`}
						maxLength={500}
						containerClassName={styles.field}
					/>
					<div className={styles.actions}>
						<Button type="button" label="Avbryt" onClick={onClose} buttonType="outline" disabled={submitting} width={160} />
						<Button type="submit" label={submitting ? 'Lagrer...' : 'Lagre'} disabled={submitting} loading={submitting} width={180} />
					</div>
				</form>
			</div>
		</div>
	);
};
