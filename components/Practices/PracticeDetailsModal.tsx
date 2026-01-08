import React from 'react';
import styles from './PracticeDetailsModal.module.css';
import { X } from 'lucide-react';
import { Environment, WeatherCondition } from '@prisma/client';

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
}

export const PracticeDetailsModal: React.FC<PracticeDetailsModalProps> = ({ open, practice, onClose }) => {
	if (!open || !practice) return null;

	const formattedDate = new Date(practice.date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h3 className={styles.title}>Trening {formattedDate}</h3>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={20} />
					</button>
				</div>

				<div className={styles.grid}>
					{practice.location && (
						<div className={styles.row}>
							<span className={styles.label}>Sted</span>
							<span className={styles.value}>{practice.location}</span>
						</div>
					)}
					<div className={styles.row}>
						<span className={styles.label}>Miljø</span>
						<span className={styles.value}>{practice.environment === 'INDOOR' ? 'Inne' : 'Ute'}</span>
					</div>
					{practice.weather?.length ? (
						<div className={styles.row}>
							<span className={styles.label}>Vær</span>
							<span className={styles.value}>{practice.weather.join(', ')}</span>
						</div>
					) : null}
					{practice.roundType && (
						<div className={styles.row}>
							<span className={styles.label}>Runde</span>
							<span className={styles.value}>
								{practice.roundType.name}
								{practice.roundType.distanceMeters ? ` • ${practice.roundType.distanceMeters}m` : ''}
								{practice.roundType.targetSizeCm ? ` • ${practice.roundType.targetSizeCm}cm` : ''}
							</span>
						</div>
					)}
					{practice.bow && (
						<div className={styles.row}>
							<span className={styles.label}>Bue</span>
							<span className={styles.value}>
								{practice.bow.name} • {practice.bow.type}
							</span>
						</div>
					)}
					{practice.arrows && (
						<div className={styles.row}>
							<span className={styles.label}>Piler</span>
							<span className={styles.value}>
								{practice.arrows.name} • {practice.arrows.material}
							</span>
						</div>
					)}
				</div>

				{practice.notes ? <div className={styles.notes}>{practice.notes}</div> : null}
			</div>
		</div>
	);
};
