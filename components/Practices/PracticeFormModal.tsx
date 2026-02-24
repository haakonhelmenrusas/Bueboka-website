'use client';

import React, { useEffect, useState } from 'react';
import styles from './PracticeFormModal.module.css';
import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudRain,
	CloudSnow,
	CloudSun,
	Home,
	Navigation,
	Sparkles,
	Sun,
	Target,
	Trees,
	Wind,
	X,
	Zap,
} from 'lucide-react';
import type { PracticeType, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { Button, DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/useModalBehavior';

// Weather select options
const getWeatherSelectOptions = () => [
	{ value: 'SUN', label: 'Sol', icon: <Sun size={16} /> },
	{ value: 'CLOUDED', label: 'Skyet', icon: <Cloud size={16} /> },
	{ value: 'CLEAR', label: 'Klarvær', icon: <Sparkles size={16} /> },
	{ value: 'RAIN', label: 'Regn', icon: <CloudRain size={16} /> },
	{ value: 'WIND', label: 'Vind', icon: <Wind size={16} /> },
	{ value: 'SNOW', label: 'Snø', icon: <CloudSnow size={16} /> },
	{ value: 'FOG', label: 'Tåke', icon: <CloudFog size={16} /> },
	{ value: 'THUNDER', label: 'Torden', icon: <Zap size={16} /> },
	{ value: 'CHANGING_CONDITIONS', label: 'Skiftende forhold', icon: <CloudDrizzle size={16} /> },
	{ value: 'OTHER', label: 'Annet', icon: <CloudSun size={16} /> },
];

export interface RoundInput {
	distanceMeters: number;
	targetType: string;
	numberArrows: number;
	roundScore: number;
}

export interface PracticeFormInput {
	date: string; // ISO
	location?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceType: PracticeType;
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
		practiceType?: PracticeType | null;
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
	const [practiceType, setPracticeType] = useState<PracticeType>('TRENING');
	const [notes, setNotes] = useState('');
	const [rating, setRating] = useState<number | null>(null);
	const [rounds, setRounds] = useState<RoundInput[]>([{ distanceMeters: 0, targetType: '', numberArrows: 0, roundScore: 0 }]);
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
	];

	// Initialize form based on mode
	useEffect(() => {
		if (!open) return;

		if (mode === 'edit' && practice) {
			// Edit mode: prefill with practice data
			setDate(practice.date.split('T')[0]);
			setLocation(practice.location || '');
			setEnvironment(practice.environment);
			setWeather(practice.weather || []);
			setPracticeType(practice.practiceType || 'TRENING');
			setNotes(practice.notes || '');
			setRating(practice.rating ?? null);

			// Extract rounds from ends data
			if (practice.ends && practice.ends.length > 0) {
				const extractedRounds = practice.ends.map((end) => {
					// Convert targetSizeCm back to targetType format (e.g., 40 -> "40cm")
					const targetType = end.targetSizeCm ? `${end.targetSizeCm}cm` : '';

					return {
						distanceMeters: end.distanceMeters || 0,
						targetType: targetType,
						numberArrows: end.arrows || 0,
						roundScore: end.roundScore || 0,
					};
				});
				setRounds(extractedRounds);
			} else {
				// No ends data, start with one empty round
				setRounds([{ distanceMeters: 0, targetType: '', numberArrows: 0, roundScore: 0 }]);
			}

			setBowId(practice.bowId || '');
			setArrowsId(practice.arrowsId || '');
		} else {
			// Create mode: reset to defaults
			setDate(new Date().toISOString().slice(0, 10));
			setLocation('');
			setEnvironment(Environment.INDOOR);
			setWeather([]);
			setPracticeType('TRENING');
			setNotes('');
			setRating(null);
			setRounds([{ distanceMeters: 0, targetType: '', numberArrows: 0, roundScore: 0 }]);
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

	// Clear weather when switching to indoor
	useEffect(() => {
		if (environment !== Environment.OUTDOOR) {
			setWeather([]);
		}
	}, [environment]);

	// Helper functions for managing rounds
	const addRound = () => {
		setRounds([...rounds, { distanceMeters: 0, targetType: '', numberArrows: 0, roundScore: 0 }]);
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
			const validRounds = rounds.filter((r) => r.distanceMeters > 0 || r.targetType || r.numberArrows > 0 || r.roundScore > 0);

			await onSave({
				date: new Date(date).toISOString(),
				location: location || undefined,
				environment,
				weather,
				practiceType,
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

	const environmentOptions = [
		{ value: Environment.INDOOR, label: 'Inne', icon: <Home size={16} /> },
		{ value: Environment.OUTDOOR, label: 'Ute', icon: <Trees size={16} /> },
	];
	const practiceTypeOptions = [
		{ value: 'TRENING', label: 'Trening' },
		{ value: 'KONKURRANSE', label: 'Konkurranse' },
	];
	const bowOptions = bows.map((b) => ({ value: b.id, label: `${b.name} • ${b.type}`, icon: <Target size={16} /> }));
	const arrowsOptions = arrows.map((a) => ({ value: a.id, label: `${a.name} • ${a.material}`, icon: <Navigation size={16} /> }));

	if (!open) return null;

	const isEditMode = mode === 'edit';
	const title = isEditMode ? 'Rediger trening' : 'Ny trening';
	const submitLabel = isEditMode ? 'Lagre endringer' : 'Lagre trening';

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="practice-form-title"
			>
				<div className={styles.header}>
					<h3 id="practice-form-title" className={styles.title}>
						{title}
					</h3>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={20} />
					</button>
				</div>
				{error && <div className={styles.error}>{error}</div>}
				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.row}>
						<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
						<Select
							label="Type"
							value={practiceType}
							onChange={(v) => setPracticeType(v as PracticeType)}
							options={practiceTypeOptions}
							containerClassName={styles.field}
						/>
					</div>
					<div className={styles.row}>
						<Input label="Sted" value={location} onChange={(e) => setLocation(e.target.value)} containerClassName={styles.field} />
						<Select
							label="Miljø"
							value={environment}
							onChange={(v) => setEnvironment(v as Environment)}
							options={environmentOptions}
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
						{rounds.map((round, index) => (
							<div key={index} className={styles.roundCard}>
								<div className={styles.roundHeader}>
									<span className={styles.roundNumber}>Runde {index + 1}</span>
									{rounds.length > 1 && (
										<button type="button" className={styles.removeRoundBtn} onClick={() => removeRound(index)} aria-label="Fjern runde">
											<X size={16} />
										</button>
									)}
								</div>
								<div className={styles.roundInputs}>
									<NumberInput
										label="Avstand"
										value={round.distanceMeters}
										onChange={(v) => updateRound(index, 'distanceMeters', v)}
										min={0}
										step={1}
										startEmpty={true}
										containerClassName={styles.roundField}
									/>
									<Select
										label="Blink"
										value={round.targetType}
										onChange={(v) => updateRound(index, 'targetType', v as string)}
										placeholderLabel="Velg"
										options={targetTypeOptions}
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label="Piler"
										value={round.numberArrows}
										onChange={(v) => updateRound(index, 'numberArrows', v)}
										min={0}
										step={1}
										startEmpty={true}
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label="Score"
										value={round.roundScore}
										onChange={(v) => updateRound(index, 'roundScore', v)}
										min={0}
										step={1}
										startEmpty={true}
										containerClassName={styles.roundField}
									/>
								</div>
							</div>
						))}
						<Button type="button" label="+ Legg til runde" onClick={addRound} variant="standard" buttonType="outline" width="100%" />
					</div>
					<NumberInput
						label="Vurdering"
						value={rating ?? 0}
						onChange={(v) => setRating(v)}
						onEmpty={() => setRating(null)}
						min={1}
						max={10}
						step={1}
						startEmpty
						emptyBehavior="ignore"
						helpText="Hvordan vil du vurdere treningen? (1-10)"
						containerClassName={styles.field}
					/>
					<TextArea
						label="Notater"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Hvordan gikk treningen?&#10;&#10;Hva gikk bra?&#10;Hva kan forbedres?&#10;Noen spesielle forhold eller observasjoner?"
						helpText="Dine tanker og observasjoner om treningen"
						containerClassName={styles.field}
					/>
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
