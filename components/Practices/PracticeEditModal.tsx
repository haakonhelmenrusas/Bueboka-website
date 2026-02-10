'use client';

import React, { useEffect, useState } from 'react';
import styles from './PracticeCreateModal.module.css';
import { CloudSun, Home, MapPin, Target, Trees, X } from 'lucide-react';
import type { WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { Button, DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { getWeatherSelectOptions } from '@/lib/weatherUtils';

export interface PracticeEditInput {
	date: string; // ISO
	arrowsShot: number;
	location?: string;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string;
	roundTypeId?: string;
	bowId?: string;
	arrowsId?: string;
}

interface PracticeEditModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (input: PracticeEditInput) => Promise<void>;
	practice?: {
		id: string;
		date: string; // ISO
		arrowsShot: number;
		location?: string | null;
		environment: Environment;
		weather: WeatherCondition[];
		notes?: string | null;
		roundTypeId?: string | null;
		bowId?: string | null;
		arrowsId?: string | null;
	};
	bows?: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows?: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
	roundTypes?: Array<{ id: string; name: string; distanceMeters?: number | null; targetSizeCm?: number | null }>;
}

export const PracticeEditModal: React.FC<PracticeEditModalProps> = ({
	open,
	onClose,
	onSave,
	practice,
	bows = [],
	arrows = [],
	roundTypes = [],
}) => {
	useModalBehavior({ open, onClose });

	const [date, setDate] = useState<string>('');
	const [arrowsShot, setArrowsShot] = useState<number>(0);
	const [location, setLocation] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.INDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [notes, setNotes] = useState('');
	const [roundTypeId, setRoundTypeId] = useState<string>('');
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open || !practice) return;
		// Prefill with practice data
		setDate(practice.date.split('T')[0]); // Convert ISO to date string
		setArrowsShot(practice.arrowsShot);
		setLocation(practice.location || '');
		setEnvironment(practice.environment);
		setWeather(practice.weather || []);
		setNotes(practice.notes || '');
		setRoundTypeId(practice.roundTypeId || '');
		setBowId(practice.bowId || '');
		setArrowsId(practice.arrowsId || '');
		setError(null);
	}, [open, practice]);

	useEffect(() => {
		// Weather is only tracked for outdoor practice.
		if (environment !== Environment.OUTDOOR) {
			setWeather([]);
		}
	}, [environment]);

	const roundTypeOptions = roundTypes.map((r) => {
		const values: string[] = [];
		if (r.distanceMeters) values.push(`${r.distanceMeters}m`);
		if (r.targetSizeCm) values.push(`${r.targetSizeCm}cm`);
		const subtitle = values.length ? values.join(' • ') : undefined;
		return {
			value: r.id,
			label: r.name,
			subtitle,
		};
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await onSave({
				date: new Date(date).toISOString(),
				arrowsShot,
				location: location || undefined,
				environment,
				weather,
				notes: notes || undefined,
				roundTypeId: roundTypeId || undefined,
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
	const bowOptions = bows.map((b) => ({ value: b.id, label: `${b.name} • ${b.type}` }));
	const arrowsOptions = arrows.map((a) => ({ value: a.id, label: `${a.name} • ${a.material}` }));

	if (!open || !practice) return null;

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="practice-edit-title"
			>
				<div className={styles.header}>
					<h3 id="practice-edit-title" className={styles.title}>
						Rediger trening
					</h3>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={20} />
					</button>
				</div>

				{error && <div className={styles.error}>{error}</div>}

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.row}>
						<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
						<NumberInput
							label="Antall skutte piler"
							value={arrowsShot}
							onChange={setArrowsShot}
							min={0}
							step={1}
							startEmpty={false}
							emptyBehavior="clamp"
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
							options={bowOptions.map((o) => ({ ...o, icon: <CloudSun size={16} /> }))}
							containerClassName={styles.field}
						/>
						<Select
							label="Piler"
							value={arrowsId}
							onChange={(v) => setArrowsId(v as string)}
							placeholderLabel="Velg piler (valgfritt)"
							options={arrowsOptions.map((o) => ({ ...o, icon: <MapPin size={16} /> }))}
							containerClassName={styles.field}
						/>
					</div>

					<div className={styles.row}>
						<Select
							label="Runde"
							value={roundTypeId}
							onChange={(v) => setRoundTypeId(v as string)}
							placeholderLabel="Velg runde (valgfritt)"
							options={roundTypeOptions.map((o) => ({ ...o, icon: <Target size={16} /> }))}
							containerClassName={styles.field}
						/>
					</div>

					<TextArea
						label="Notater"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						helpText="Hvordan gikk treningen?"
						containerClassName={styles.field}
					/>

					<div className={styles.actions}>
						<Button type="button" label="Avbryt" onClick={onClose} />
						<Button type="submit" label={submitting ? 'Lagrer...' : 'Lagre endringer'} disabled={submitting} />
					</div>
				</form>
			</div>
		</div>
	);
};
