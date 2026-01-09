'use client';

import React from 'react';
import styles from './EquipmentSection.module.css';
import { ArrowUpRight, BowArrow, Star } from 'lucide-react';
import { Button } from '@/components';
import type { Arrow, Bow } from '@/lib/types';

export interface EquipmentSectionProps {
	bows: Bow[];
	arrows: Arrow[];
	onCreateBow: () => void;
	onCreateArrows: () => void;
	onSelectBow: (bow: Bow) => void;
	onSelectArrows: (arrows: Arrow) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
	bows,
	arrows,
	onCreateBow,
	onCreateArrows,
	onSelectBow,
	onSelectArrows,
}) => {
	return (
		<section className={styles.section} aria-label="Utstyr">
			<div className={styles.header}>
				<h2 className={styles.title}>Utstyr</h2>
				<div className={styles.actions}>
					<Button label="Ny bue" onClick={onCreateBow} icon={<BowArrow size={18} />} width={170} size="small" />
					<Button label="Nye piler" onClick={onCreateArrows} icon={<ArrowUpRight size={18} />} width={170} size="small" />
				</div>
			</div>

			<div className={styles.panel}>
				<div className={styles.grid}>
					<div>
						<div className={styles.subTitle}>Buer</div>
						<div className={styles.list}>
							{bows && bows.length > 0 ? (
								bows.map((bow) => (
									<div key={bow.id} className={styles.item} onClick={() => onSelectBow(bow)}>
										<div className={styles.itemLeft}>
											<div className={styles.itemName}>
												{bow.name}
												{bow.isFavorite ? (
													<span className={styles.favorite} aria-label="Favorittbue">
														<Star size={14} />
													</span>
												) : null}
											</div>
											<div className={styles.itemMeta}>{bow.type}</div>
										</div>
										<div className={styles.itemIcon}>
											<BowArrow size={18} />
										</div>
									</div>
								))
							) : (
								<div className={styles.placeholder}>Ingen buer funnet</div>
							)}
						</div>
					</div>

					<div>
						<div className={styles.subTitle}>Piler</div>
						<div className={styles.list}>
							{arrows && arrows.length > 0 ? (
								arrows.map((a) => (
									<div key={a.id} className={styles.item} onClick={() => onSelectArrows(a)}>
										<div className={styles.itemLeft}>
											<div className={styles.itemName}>{a.name}</div>
											<div className={styles.itemMeta}>{a.material}</div>
										</div>
										<div className={styles.itemIcon}>
											<ArrowUpRight size={18} />
										</div>
									</div>
								))
							) : (
								<div className={styles.placeholder}>Legg til dine første piler</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
