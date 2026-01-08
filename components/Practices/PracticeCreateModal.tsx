'use client';

import React, { useMemo, useState } from 'react';
import styles from './PracticeCreateModal.module.css';
import { X } from 'lucide-react';
import { Environment, WeatherCondition } from '@/prisma/prisma/generated/prisma-client/enums';

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
	bows?: Array<{ id: string; name: string; type: string }>;
	arrows?: Array<{ id: string; name: string; material: string }>;
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

export const PracticeCreateModal: React.FC<PracticeCreateModalProps> = ({
	open,
	onClose,
	onCreate,
	bows = [],
	arrows = [],
	roundTypes = [],
}) => {
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
		setWeather((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
	};

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
						<label className={styles.field}>
							<span className={styles.label}>Dato</span>
							<input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
						</label>
						<label className={styles.field}>
							<span className={styles.label}>Antall skutte piler</span>
							<input
								className={styles.input}
								type="number"
								min={0}
								value={arrowsShot}
								onChange={(e) => setArrowsShot(parseInt(e.target.value || '0', 10))}
								required
							/>
						</label>
					</div>

					<div className={styles.row}>
						<label className={styles.field}>
							<span className={styles.label}>Sted</span>
							<input
								className={styles.input}
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="f.eks. Oslo"
							/>
						</label>
						<label className={styles.field}>
							<span className={styles.label}>Miljø</span>
							<select className={styles.select} value={environment} onChange={(e) => setEnvironment(e.target.value as Environment)}>
								<option value={Environment.INDOOR}>Inne</option>
								<option value={Environment.OUTDOOR}>Ute</option>
							</select>
						</label>
					</div>

					<label className={styles.field}>
						<span className={styles.label}>Vær</span>
						<div className={styles.weatherGrid}>
							{weatherOptions.map((w) => (
								<label key={w} className={styles.checkbox}>
									<input type="checkbox" checked={weatherSet.has(w)} onChange={() => toggleWeather(w)} />
									<span>{weatherLabels[w] ?? w}</span>
								</label>
							))}
						</div>
					</label>

					<div className={styles.row}>
						<label className={styles.field}>
							<span className={styles.label}>Runde</span>
							<select className={styles.select} value={roundTypeId} onChange={(e) => setRoundTypeId(e.target.value)}>
								<option value="">Velg runde (valgfritt)</option>
								{roundTypes.map((r) => (
									<option key={r.id} value={r.id}>
										{r.name}
										{r.distanceMeters ? ` • ${r.distanceMeters}m` : ''}
										{r.targetSizeCm ? ` • ${r.targetSizeCm}cm` : ''}
									</option>
								))}
							</select>
						</label>
						<label className={styles.field}>
							<span className={styles.label}>Bue</span>
							<select className={styles.select} value={bowId} onChange={(e) => setBowId(e.target.value)}>
								<option value="">Velg bue (valgfritt)</option>
								{bows.map((b) => (
									<option key={b.id} value={b.id}>
										{b.name} • {b.type}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className={styles.row}>
						<label className={styles.field}>
							<span className={styles.label}>Piler</span>
							<select className={styles.select} value={arrowsId} onChange={(e) => setArrowsId(e.target.value)}>
								<option value="">Velg piler (valgfritt)</option>
								{arrows.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name} • {a.material}
									</option>
								))}
							</select>
						</label>
					</div>

					<label className={styles.field}>
						<span className={styles.label}>Notater</span>
						<textarea
							className={styles.textarea}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Hvordan gikk treningen?"
						/>
					</label>

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
