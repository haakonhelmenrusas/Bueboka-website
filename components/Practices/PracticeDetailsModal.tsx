import React from 'react';
import styles from './PracticeDetailsModal.module.css';
import { BowArrow, CloudSun, Hash, Home, MapPin, Navigation, NotebookText, Target, Trash2, Trees, X } from 'lucide-react';
import { Environment, WeatherCondition } from '@prisma/client';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { Button } from '@/components';

export interface PracticeDetails {
	id: string;
	date: string; // ISO
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	roundType?: {
		name: string;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
	};
	bow?: {
		name: string;
		type: string;
	};
	arrows?: {
		name: string;
		material: string;
	};
	ends?: Array<{
		id: string;
		arrows: number;
		arrowsPerEnd?: number | null;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
		scores: number[];
	}>;
}

interface PracticeDetailsModalProps {
	open: boolean;
	practice?: PracticeDetails;
	onClose: () => void;
	onDeleted?: (id: string) => void;
}

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

export const PracticeDetailsModal: React.FC<PracticeDetailsModalProps> = ({ open, practice, onClose, onDeleted }) => {
	useModalBehavior({ open, onClose });
	const [deleting, setDeleting] = React.useState(false);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);

	if (!open || !practice) return null;

	const formattedDate = new Date(practice.date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const totalArrows = practice.ends?.reduce((sum, end) => sum + (end.arrows ?? end.scores?.length ?? 0), 0) ?? 0;

	const handleDelete = async () => {
		setDeleting(true);
		setDeleteError(null);
		try {
			const res = await fetch(`/api/practices/${practice.id}`, { method: 'DELETE' });
			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}
				setDeleteError(details?.error || 'Kunne ikke slette trening.');
				return;
			}
			onDeleted?.(practice.id);
			onClose();
		} catch (e) {
			setDeleteError(e instanceof Error ? e.message : 'Kunne ikke slette trening.');
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={`Trening ${formattedDate}`}
			>
				<div className={styles.header}>
					<h3 className={styles.title}>
						Trening <span className={styles.titleDate}>{formattedDate}</span>
					</h3>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={20} />
					</button>
				</div>

				<div className={styles.grid}>
					{practice.location ? (
						<div className={styles.row}>
							<span className={styles.icon} aria-hidden="true">
								<MapPin size={18} />
							</span>
							<span className={styles.label}>Sted</span>
							<span className={styles.value}>{practice.location}</span>
						</div>
					) : null}

					<div className={styles.row}>
						<span className={styles.icon} aria-hidden="true">
							{practice.environment === 'INDOOR' ? <Home size={18} /> : <Trees size={18} />}
						</span>
						<span className={styles.label}>Miljø</span>
						<span className={styles.value}>{practice.environment === 'INDOOR' ? 'Inne' : 'Ute'}</span>
					</div>

					<div className={styles.row}>
						<span className={styles.icon} aria-hidden="true">
							<Hash size={18} />
						</span>
						<span className={styles.label}>Piler skutt</span>
						<span className={styles.value}>{totalArrows}</span>
					</div>

					{practice.weather?.length ? (
						<div className={styles.row}>
							<span className={styles.icon} aria-hidden="true">
								<CloudSun size={18} />
							</span>
							<span className={styles.label}>Vær</span>
							<span className={styles.value}>{practice.weather.map((w) => weatherLabels[w] ?? String(w)).join(', ')}</span>
						</div>
					) : null}

					{practice.roundType ? (
						<div className={styles.row}>
							<span className={styles.icon} aria-hidden="true">
								<Target size={18} />
							</span>
							<span className={styles.label}>Runde</span>
							<span className={styles.value}>
								{practice.roundType.name}
								{practice.roundType.distanceMeters ? ` • ${practice.roundType.distanceMeters}m` : ''}
								{practice.roundType.targetSizeCm ? ` • ${practice.roundType.targetSizeCm}cm` : ''}
							</span>
						</div>
					) : null}

					{practice.bow ? (
						<div className={styles.row}>
							<span className={styles.icon} aria-hidden="true">
								<BowArrow size={18} />
							</span>
							<span className={styles.label}>Bue</span>
							<span className={styles.value}>
								{practice.bow.name} • {practice.bow.type}
							</span>
						</div>
					) : null}

					{practice.arrows ? (
						<div className={styles.row}>
							<span className={styles.icon} aria-hidden="true">
								<Navigation size={18} />
							</span>
							<span className={styles.label}>Piler</span>
							<span className={styles.value}>
								{practice.arrows.name} • {practice.arrows.material}
							</span>
						</div>
					) : null}
				</div>

				{practice.notes ? (
					<div className={styles.notes}>
						<div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, color: 'var(--primary)', fontWeight: 900 }}>
							<NotebookText size={18} />
							Notater
						</div>
						{practice.notes}
					</div>
				) : null}

				{practice.ends?.length ? (
					<div className={styles.ends}>
						<h4 className={styles.endsTitle}>Serier</h4>

						{practice.ends.map((end, idx) => {
							const arrows = end.arrows ?? end.scores?.length ?? 0;
							const scoreSum = Array.isArray(end.scores) ? end.scores.reduce((s, v) => s + v, 0) : 0;
							return (
								<div key={end.id} className={styles.endRow}>
									<div className={styles.serieHeader}>
										<div className={styles.serieTitle}>Serie {idx + 1}</div>
										<div className={styles.serieStats}>
											{arrows} piler{scoreSum ? ` • ${scoreSum} poeng` : ''}
										</div>
									</div>
									<div className={styles.serieDetails}>
										{end.distanceMeters ? <span className={styles.chip}>{end.distanceMeters}m</span> : null}
										{end.targetSizeCm ? <span className={styles.chip}>{end.targetSizeCm}cm</span> : null}
										{end.arrowsPerEnd ? <span className={styles.chip}>{end.arrowsPerEnd} / serie</span> : null}
										{Array.isArray(end.scores) && end.scores.length ? <span className={styles.chip}>{end.scores.join(' · ')}</span> : null}
									</div>
								</div>
							);
						})}
					</div>
				) : null}

				{deleteError ? <div className={styles.errorBox}>{deleteError}</div> : null}

				<div className={styles.actions}>
					<Button label="Lukk" buttonType="outline" onClick={onClose} width={140} disabled={deleting} />
					<Button
						label={deleting ? 'Sletter...' : 'Slett trening'}
						onClick={handleDelete}
						width={220}
						variant="warning"
						buttonType="outline"
						disabled={deleting}
						icon={<Trash2 size={18} />}
					/>
				</div>
			</div>
		</div>
	);
};
