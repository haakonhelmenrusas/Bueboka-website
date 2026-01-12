'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './PracticeCreateModal.module.css';
import { Cloud, CloudRain, CloudSnow, CloudSun, Cloudy, HelpCircle, Home, MapPin, Sun, Target, Trees, Wind, X, Zap } from 'lucide-react';
import { Environment, WeatherCondition } from '@prisma/client';
import { DateInput, Input, NumberInput, Select, TextArea } from '@/components';
import { useModalBehavior } from '@/lib/useModalBehavior';

export interface PracticeCreateInput {
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

interface PracticeCreateModalProps {
	open: boolean;
	onClose: () => void;
	onCreate: (input: PracticeCreateInput) => Promise<void>;
	bows?: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows?: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
	roundTypes?: Array<{ id: string; name: string; distanceMeters?: number | null; targetSizeCm?: number | null }>;
}

const weatherOptions: WeatherCondition[] = [
	WeatherCondition.SUN,
	WeatherCondition.CLOUDED,
	WeatherCondition.CLEAR,
	WeatherCondition.RAIN,
	WeatherCondition.WIND,
	WeatherCondition.SNOW,
	WeatherCondition.FOG,
	WeatherCondition.THUNDER,
	WeatherCondition.CHANGING_CONDITIONS,
	WeatherCondition.OTHER,
];

// Render user-friendly labels (instead of raw enum strings)
const weatherLabels: Record<WeatherCondition, string> = {
	[WeatherCondition.SUN]: 'Sol',
	[WeatherCondition.CLOUDED]: 'Overskyet',
	[WeatherCondition.CLEAR]: 'Klarvær',
	[WeatherCondition.RAIN]: 'Regn',
	[WeatherCondition.WIND]: 'Vind',
	[WeatherCondition.SNOW]: 'Snø',
	[WeatherCondition.FOG]: 'Tåke',
	[WeatherCondition.THUNDER]: 'Torden',
	[WeatherCondition.CHANGING_CONDITIONS]: 'Skiftende',
	[WeatherCondition.OTHER]: 'Annet',
};

const weatherIcons: Record<WeatherCondition, React.ComponentType<{ size?: number; className?: string }>> = {
	[WeatherCondition.SUN]: Sun,
	[WeatherCondition.CLOUDED]: Cloudy,
	[WeatherCondition.CLEAR]: CloudSun,
	[WeatherCondition.RAIN]: CloudRain,
	[WeatherCondition.WIND]: Wind,
	[WeatherCondition.SNOW]: CloudSnow,
	[WeatherCondition.FOG]: Cloud,
	[WeatherCondition.THUNDER]: Zap,
	[WeatherCondition.CHANGING_CONDITIONS]: CloudSun,
	[WeatherCondition.OTHER]: HelpCircle,
};

export const PracticeCreateModal: React.FC<PracticeCreateModalProps> = ({
	open,
	onClose,
	onCreate,
	bows = [],
	arrows = [],
	roundTypes = [],
}) => {
	useModalBehavior({ open, onClose });

	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [arrowsShot, setArrowsShot] = useState<number>(0);
	const [location, setLocation] = useState('');
	const [environment, setEnvironment] = useState<Environment>(Environment.OUTDOOR);
	const [weather, setWeather] = useState<WeatherCondition[]>([]);
	const [notes, setNotes] = useState('');
	const [roundTypeId, setRoundTypeId] = useState<string>('');
	const [bowId, setBowId] = useState<string>('');
	const [arrowsId, setArrowsId] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const weatherSet = useMemo(() => new Set(weather), [weather]);

	const toggleWeather = (w: WeatherCondition) => {
		if (environment === Environment.INDOOR) return;
		setWeather((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
	};

	useEffect(() => {
		if (environment === Environment.INDOOR) {
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
			await onCreate({
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
			setDate(new Date().toISOString().slice(0, 10));
			setArrowsShot(0);
			setLocation('');
			setEnvironment(Environment.OUTDOOR);
			setWeather([]);
			setNotes('');
			setRoundTypeId('');
			setBowId('');
			setArrowsId('');
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

	useEffect(() => {
		if (!open) return;
		// Always start with today's date when opening the modal.
		setDate(new Date().toISOString().slice(0, 10));
	}, [open]);

	// Prefill favorites when opening (without overriding user choice)
	useEffect(() => {
		if (!open) return;

		if (!bowId) {
			const favBow = bows.find((b) => b.isFavorite);
			if (favBow) setBowId(favBow.id);
		}
		if (!arrowsId) {
			const favArrows = arrows.find((a) => a.isFavorite);
			if (favArrows) setArrowsId(favArrows.id);
		}
	}, [open, bows, arrows, bowId, arrowsId]);

	if (!open) return null;

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h3 className={styles.title}>Ny trening</h3>
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
							required
							startEmpty
							emptyBehavior="ignore"
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

					<label className={styles.field}>
						<span className={styles.label}>Vær</span>
						{environment === Environment.INDOOR ? <div className={styles.helpText}>Vær registreres kun for utetrening.</div> : null}
						<div className={styles.weatherGrid}>
							{weatherOptions.map((w) => {
								const Icon = weatherIcons[w];
								const disabledWeather = environment === Environment.INDOOR;
								return (
									<label
										key={w}
										className={`${styles.weatherOption} ${weatherSet.has(w) ? styles.weatherOptionSelected : ''} ${disabledWeather ? styles.weatherOptionDisabled : ''}`}
									>
										<input
											type="checkbox"
											className={styles.weatherCheckbox}
											checked={weatherSet.has(w)}
											disabled={disabledWeather}
											onChange={() => toggleWeather(w)}
										/>
										<span className={styles.weatherBox} aria-hidden="true" />
										<span className={styles.weatherIcon} aria-hidden="true">
											<Icon size={16} />
										</span>
										<span className={styles.weatherText}>{weatherLabels[w] ?? w}</span>
									</label>
								);
							})}
						</div>
					</label>

					<div className={styles.row}>
						<Select
							label="Bue"
							value={bowId}
							onChange={setBowId}
							placeholderLabel="Velg bue (valgfritt)"
							options={bowOptions.map((o) => ({ ...o, icon: <CloudSun size={16} /> }))}
							containerClassName={styles.field}
						/>
						<Select
							label="Piler"
							value={arrowsId}
							onChange={setArrowsId}
							placeholderLabel="Velg piler (valgfritt)"
							options={arrowsOptions.map((o) => ({ ...o, icon: <MapPin size={16} /> }))}
							containerClassName={styles.field}
						/>
					</div>

					<div className={styles.row}>
						<Select
							label="Runde"
							value={roundTypeId}
							onChange={setRoundTypeId}
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
						<button type="button" className={`${styles.button} ${styles.secondary}`} onClick={onClose}>
							Avbryt
						</button>
						<button type="submit" className={`${styles.button} ${styles.primary}`} disabled={submitting}>
							{submitting ? 'Lagrer...' : 'Lagre trening'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
