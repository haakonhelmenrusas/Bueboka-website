'use client';

import React from 'react';
import styles from './EquipmentSection.module.css';
import type { Arrow, Bow } from '@/lib/types';
import { useEquipmentData } from './useEquipmentData';
import { GiArrowhead, GiBowArrow } from 'react-icons/gi';
import { formatOneDecimal } from '@/lib/format';
import { getArrowMaterialLabel, getBowTypeLabel } from '@/lib/labels';
import { PiStar } from 'react-icons/pi';
import { EquipmentListSkeleton } from './EquipmentSkeleton';
import { onEquipmentChanged } from '@/lib/events';
import { useTranslation } from '@/context/LanguageProvider';

export interface EquipmentSectionProps {
	bows?: Bow[];
	arrows?: Arrow[];
	isLoading?: boolean;
	onCreateBow?: () => void;
	onCreateArrows?: () => void;
	onSelectBow: (bow: Bow) => void;
	onSelectArrows: (arrows: Arrow) => void;
	onDataReady?: (api: { refresh: () => Promise<void> }) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
	bows: bowsProp,
	arrows: arrowsProp,
	isLoading: isLoadingProp,
	onSelectBow,
	onSelectArrows,
	onDataReady,
}) => {
	const { t } = useTranslation();
	const managed = bowsProp === undefined || arrowsProp === undefined;
	const equipment = useEquipmentData();

	React.useEffect(() => {
		if (!managed) return;
		onDataReady?.({ refresh: equipment.refresh });
	}, [managed, onDataReady, equipment.refresh]);

	const bows = managed ? equipment.bows : (bowsProp ?? []);
	const arrows = managed ? equipment.arrows : (arrowsProp ?? []);
	const isLoading =
		isLoadingProp !== undefined ? isLoadingProp : (managed && equipment.loading) || (bowsProp === undefined && equipment.loading);

	// Listen for equipment:changed event and trigger refresh if onDataReady is provided
	React.useEffect(() => {
		if (!managed) return;

		return onEquipmentChanged(() => {
			equipment.refresh().then(() => {
				onDataReady?.({ refresh: equipment.refresh });
			});
		});
	}, [managed, onDataReady, equipment.refresh]);

	return (
		<section className={styles.section} aria-label={t['equipment.title']}>
			<div className={styles.header}>
				<h2 className={styles.title}>{t['equipment.title']}</h2>
			</div>

			<div className={styles.grid}>
				<div>
					<div className={styles.list} role="list">
						{isLoading ? (
							<EquipmentListSkeleton count={2} />
						) : bows && bows.length > 0 ? (
							bows.map((bow) => (
								<button
									key={bow.id}
									type="button"
									className={styles.item}
									onClick={() => onSelectBow(bow)}
									aria-label={`${t['equipment.editBow']} ${bow.name}, ${getBowTypeLabel(bow.type)}${bow.isFavorite ? t['equipment.favorite'] : ''}`}
									role="listitem"
								>
									<div className={styles.itemIcon} aria-hidden="true">
										<GiBowArrow size={18} />
									</div>
									<div className={styles.itemLeft}>
										<div className={styles.itemName}>
											{bow.name}
											{bow.isFavorite ? (
												<span className={styles.favorite} aria-hidden="true">
													<PiStar size={14} fill="currentColor" />
												</span>
											) : null}
										</div>
										<div className={styles.itemMeta}>
										{getBowTypeLabel(bow.type)}
										{typeof bow.braceHeight === 'number' ? ` • ${formatOneDecimal(bow.braceHeight)}cm ${t['equipment.stringHeight']}` : ''}
									</div>
									</div>
								</button>
							))
						) : (
							<div className={styles.placeholder} role="status">
								{t['equipment.noBows']}
							</div>
						)}
					</div>
				</div>
				<div>
					{arrows.length >= 5 && <div className={styles.limitMessage}>{t['equipment.maxArrowSets']}</div>}
					<div className={styles.list} role="list">
						{isLoading ? (
							<EquipmentListSkeleton count={2} />
						) : arrows && arrows.length > 0 ? (
							arrows.map((a) => (
								<button
									key={a.id}
									type="button"
									className={styles.item}
									onClick={() => onSelectArrows(a)}
									aria-label={`${t['equipment.editArrows']} ${a.name}, ${getArrowMaterialLabel(a.material)}${a.isFavorite ? t['equipment.favorite'] : ''}`}
									role="listitem"
								>
									<div className={styles.itemIcon} aria-hidden="true">
										<GiArrowhead size={18} style={{ transform: 'rotate(225deg)' }} />
									</div>
									<div className={styles.itemLeft}>
										<div className={styles.itemName}>
											{a.name}
											{a.isFavorite ? (
												<span className={styles.favorite} aria-hidden="true">
													<PiStar size={14} fill="currentColor" />
												</span>
											) : null}
										</div>
										<div className={styles.itemMeta}>
											{getArrowMaterialLabel(a.material)}
											{typeof a.length === 'number' ? ` • ${formatOneDecimal(a.length)}cm` : ''}
											{typeof a.weight === 'number' ? ` • ${formatOneDecimal(a.weight)}g` : ''}
										</div>
									</div>
								</button>
							))
						) : (
							<div className={styles.placeholder} role="status">
								{t['equipment.addFirstArrows']}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
