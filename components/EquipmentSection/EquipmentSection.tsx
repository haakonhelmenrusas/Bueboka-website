'use client';

import React from 'react';
import styles from './EquipmentSection.module.css';
import { ArrowUpRight, BowArrow, Star } from 'lucide-react';
import { Button } from '@/components';
import type { Arrow, Bow } from '@/lib/types';
import { useEquipmentData } from './useEquipmentData';
import { formatOneDecimal } from '@/lib/format';

// Type translations
const BOW_TYPE_LABELS: Record<string, string> = {
	RECURVE: 'Recurve',
	COMPOUND: 'Compound',
	LONGBOW: 'Langbue',
	BAREBOW: 'Barebow',
	HORSEBOW: 'Rytterbue',
	TRADITIONAL: 'Tradisjonell',
	OTHER: 'Annet',
};

const ARROW_MATERIAL_LABELS: Record<string, string> = {
	KARBON: 'Karbon',
	ALUMINIUM: 'Aluminium',
	TREVERK: 'Treverk',
};

function getBowTypeLabel(type: string): string {
	return BOW_TYPE_LABELS[type] || type;
}

function getArrowMaterialLabel(material: string): string {
	return ARROW_MATERIAL_LABELS[material] || material;
}

export interface EquipmentSectionProps {
	/** If provided, the component becomes controlled and will not fetch its own data */
	bows?: Bow[];
	arrows?: Arrow[];
	onCreateBow: () => void;
	onCreateArrows: () => void;
	onSelectBow: (bow: Bow) => void;
	onSelectArrows: (arrows: Arrow) => void;
	/** Optional hook to expose a refresh function to the parent (useful after saving) */
	onDataReady?: (api: { refresh: () => Promise<void>; refreshBows: () => Promise<void>; refreshArrows: () => Promise<void> }) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
	bows: bowsProp,
	arrows: arrowsProp,
	onCreateBow,
	onCreateArrows,
	onSelectBow,
	onSelectArrows,
	onDataReady,
}) => {
	const managed = bowsProp === undefined || arrowsProp === undefined;
	const equipment = useEquipmentData();

	React.useEffect(() => {
		if (!managed) return;
		onDataReady?.({ refresh: equipment.refresh, refreshBows: equipment.refreshBows, refreshArrows: equipment.refreshArrows });
	}, [managed, onDataReady, equipment.refresh, equipment.refreshArrows, equipment.refreshBows]);

	const bows = managed ? equipment.bows : (bowsProp ?? []);
	const arrows = managed ? equipment.arrows : (arrowsProp ?? []);

	return (
		<section className={styles.section} aria-label="Utstyr">
			<div className={styles.header}>
				<h2 className={styles.title}>Utstyr</h2>
			</div>

			<div className={styles.panel}>
				<div className={styles.grid}>
					<div>
						<div className={styles.subHeaderRow}>
							<div className={styles.subTitle}>Buer</div>
							<Button label="Ny bue" onClick={onCreateBow} icon={<BowArrow size={18} />} width={140} size="small" />
						</div>
						<div className={styles.list} role="list">
							{bows && bows.length > 0 ? (
								bows.map((bow) => (
									<button
										key={bow.id}
										type="button"
										className={styles.item}
										onClick={() => onSelectBow(bow)}
										aria-label={`Rediger bue: ${bow.name}, ${getBowTypeLabel(bow.type)}${bow.isFavorite ? ', favoritt' : ''}`}
										role="listitem"
									>
										<div className={styles.itemLeft}>
											<div className={styles.itemName}>
												{bow.name}
												{bow.isFavorite ? (
													<span className={styles.favorite} aria-hidden="true">
														<Star size={14} fill="currentColor" />
													</span>
												) : null}
											</div>
											<div className={styles.itemMeta}>{getBowTypeLabel(bow.type)}</div>
										</div>
										<div className={styles.itemIcon} aria-hidden="true">
											<BowArrow size={18} />
										</div>
									</button>
								))
							) : (
								<div className={styles.placeholder} role="status">
									Ingen buer funnet
								</div>
							)}
						</div>
					</div>

					<div>
						<div className={styles.subHeaderRow}>
							<div className={styles.subTitle}>Piler</div>
							<Button
								label="Nye piler"
								onClick={onCreateArrows}
								icon={<ArrowUpRight size={18} />}
								width={140}
								size="small"
								disabled={arrows.length >= 5}
							/>
						</div>
						{arrows.length >= 5 && <div className={styles.limitMessage}>Maksimalt 5 pilsett tillatt</div>}
						<div className={styles.list} role="list">
							{arrows && arrows.length > 0 ? (
								arrows.map((a) => (
									<button
										key={a.id}
										type="button"
										className={styles.item}
										onClick={() => onSelectArrows(a)}
										aria-label={`Rediger pilsett: ${a.name}, ${getArrowMaterialLabel(a.material)}${a.isFavorite ? ', favoritt' : ''}`}
										role="listitem"
									>
										<div className={styles.itemLeft}>
											<div className={styles.itemName}>
												{a.name}
												{a.isFavorite ? (
													<span className={styles.favorite} aria-hidden="true">
														<Star size={14} fill="currentColor" />
													</span>
												) : null}
											</div>
											<div className={styles.itemMeta}>
												{getArrowMaterialLabel(a.material)}
												{typeof a.length === 'number' ? ` • ${formatOneDecimal(a.length)}cm` : ''}
												{typeof a.weight === 'number' ? ` • ${formatOneDecimal(a.weight)}g` : ''}
											</div>
										</div>
										<div className={styles.itemIcon} aria-hidden="true">
											<ArrowUpRight size={18} />
										</div>
									</button>
								))
							) : (
								<div className={styles.placeholder} role="status">
									Legg til dine første piler
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
