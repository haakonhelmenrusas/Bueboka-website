'use client';

import React, { useEffect, useState } from 'react';
import styles from './CompetitionFormModal.module.css';
import { Trophy, X } from 'lucide-react';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { Button, Checkbox, DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/useModalBehavior';
import {
	type ArrowsOption,
	type EquipmentOption,
	getArrowsOptions,
	getBowOptions,
	getEnvironmentOptions,
	getPracticeCategoryOptions,
	getWeatherSelectOptions,
} from '@/lib/formUtils';

export interface CompetitionRoundInput {
	roundNumber: number;
	distanceMeters?: number;
	targetSizeCm?: number;
	numberArrows: number;
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
		{ roundNumber: 1, distanceMeters: 18, targetSizeCm: 40, numberArrows: 30, roundScore: 0 },
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
					targetSizeCm: round.targetSizeCm || undefined,
					numberArrows: round.arrows || 0,
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
			setRounds([{ roundNumber: 1, distanceMeters: 18, targetSizeCm: 40, numberArrows: 30, roundScore: 0 }]);
			setBowId('');
			setArrowsId('');
		}
		setError(null);
	}, [open, mode, competition]);

	// Prefill favorites
	useEffect(() => {
		if (open && mode === 'create') {
			const favoriteBow = bows.find((b) => b.isFavorite);
			const favoriteArrows = arrows.find((a) => a.isFavorite);

			if (favoriteBow && !bowId) setBowId(favoriteBow.id);
			if (favoriteArrows && !arrowsId) setArrowsId(favoriteArrows.id);
		}
	}, [open, mode, bows, arrows, bowId, arrowsId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;

		setError(null);

		// Validation
		if (!name.trim()) {
			setError('Navn på konkurransen er påkrevd');
			return;
		}

		const validRounds = rounds.filter((r) => r.numberArrows > 0);
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
				targetSizeCm: rounds[rounds.length - 1]?.targetSizeCm || 40,
				numberArrows: 30,
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
					<h2>{mode === 'edit' ? 'Rediger konkurranse' : 'Legg til konkurranse'}</h2>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={24} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}
					<div className={styles.section}>
						<h3>
							<Trophy size={20} /> Grunnleggende informasjon
						</h3>
						<Input
							label="Navn på konkurransen"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							helpText="F.eks. 'NM Innendørs 2026'"
						/>
						<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required />
						<Input label="Sted" value={location} onChange={(e) => setLocation(e.target.value)} helpText="Hvor konkurransen ble avholdt" />
						<Input
							label="Arrangør"
							value={organizerName}
							onChange={(e) => setOrganizerName(e.target.value)}
							helpText="Klubb eller organisasjon som arrangerte"
						/>
					</div>
					<div className={styles.section}>
						<h3>Resultater</h3>
						<div className={styles.row}>
							<NumberInput
								label="Plassering"
								value={placement ?? 0}
								onChange={(val) => setPlacement(val || null)}
								onEmpty={() => setPlacement(null)}
								min={1}
								helpText="Din plassering"
								startEmpty
							/>
							<NumberInput
								label="Antall deltakere"
								value={numberOfParticipants ?? 0}
								onChange={(val) => setNumberOfParticipants(val || null)}
								onEmpty={() => setNumberOfParticipants(null)}
								min={1}
								helpText="Totalt antall"
								startEmpty
							/>
						</div>
						<Checkbox label="Personlig rekord" checked={personalBest} onChange={setPersonalBest} />
					</div>
					<div className={styles.section}>
						<h3>Miljø og kategori</h3>
						<Select label="Miljø" value={environment} onChange={(val) => setEnvironment(val as Environment)} options={environmentOptions} />
						<Select
							label="Kategori"
							value={practiceCategory}
							onChange={(val) => setPracticeCategory(val as PracticeCategory)}
							options={practiceCategoryOptions}
						/>
						<Select
							label="Værforhold"
							value={weather}
							onChange={(val) => setWeather(val as WeatherCondition[])}
							options={getWeatherSelectOptions()}
							multiple
						/>
					</div>
					<div className={styles.section}>
						<h3>Runder</h3>
						{rounds.map((round, index) => (
							<div key={index} className={styles.round}>
								<div className={styles.roundHeader}>
									<span>Runde {round.roundNumber}</span>
									{rounds.length > 1 && (
										<button type="button" onClick={() => removeRound(index)} className={styles.removeBtn}>
											Fjern
										</button>
									)}
								</div>
								<div className={styles.row}>
									<NumberInput
										label="Distanse (m)"
										value={round.distanceMeters ?? 0}
										onChange={(val) => updateRound(index, 'distanceMeters', val || undefined)}
										onEmpty={() => updateRound(index, 'distanceMeters', undefined)}
										min={1}
										startEmpty
									/>
									<NumberInput
										label="Skive (cm)"
										value={round.targetSizeCm ?? 0}
										onChange={(val) => updateRound(index, 'targetSizeCm', val || undefined)}
										onEmpty={() => updateRound(index, 'targetSizeCm', undefined)}
										min={1}
										startEmpty
									/>
								</div>
								<div className={styles.row}>
									<NumberInput
										label="Antall piler"
										value={round.numberArrows}
										onChange={(val) => updateRound(index, 'numberArrows', val || 0)}
										min={1}
										required
									/>
									<NumberInput
										label="Poengsum"
										value={round.roundScore}
										onChange={(val) => updateRound(index, 'roundScore', val || 0)}
										min={0}
										required
									/>
								</div>
							</div>
						))}
						<Button type="button" label="Legg til runde" onClick={addRound} buttonType="outline" size="small" />
					</div>
					<div className={styles.section}>
						<h3>Utstyr</h3>
						<Select label="Bue" value={bowId} onChange={(val) => setBowId(val as string)} options={bowOptions} />
						<Select label="Piler" value={arrowsId} onChange={(val) => setArrowsId(val as string)} options={arrowsOptions} />
					</div>
					<div className={styles.section}>
						<TextArea
							label="Notater"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={4}
							helpText="Dine refleksjoner fra konkurransen"
						/>
					</div>
					<div className={styles.actions}>
						<Button type="button" label="Avbryt" onClick={onClose} buttonType="outline" disabled={submitting} />
						<Button type="submit" label={submitting ? 'Lagrer...' : 'Lagre'} disabled={submitting} loading={submitting} />
					</div>
				</form>
			</div>
		</div>
	);
};
