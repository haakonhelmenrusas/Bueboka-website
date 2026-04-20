import styles from './SightMarksTable.module.css';
import { SightMark, CalculatedMarks } from '@/types/SightMarks';
import { LuArrowRight, LuPencil, LuTarget, LuTrash2 } from 'react-icons/lu';
import { Badge } from '@/components/common/Badge/Badge';

interface SightMarksTableProps {
	sightMarks: SightMark[];
	onDeleteMark: (sightMarkId: string, index: number) => Promise<void>;
	onCardClick?: (sm: SightMark) => void;
	isDeleting?: boolean;
}

export function SightMarksTable({ sightMarks, onDeleteMark, onCardClick, isDeleting = false }: SightMarksTableProps) {
	if (sightMarks.length === 0) {
		return (
			<div className={styles.emptyState}>
				<p>Ingen siktemerker ennå. Legg til ditt første siktemerke med knappen over.</p>
			</div>
		);
	}

	return (
		<div className={styles.cardGrid}>
			{sightMarks.map((sm) => {
				const calc = sm.ballisticsParameters as CalculatedMarks;
				const bowName = sm.bowSpec?.bow?.name ?? 'Ukjent bue';
				const title = sm.name || bowName;
				const showBowBadge = !!sm.name;

				// Arrow name from stored ballistics parameters
				const arrowBadge = calc?.arrow_name ?? null;

				return (
					<div
						key={sm.id}
						className={`${styles.card} ${onCardClick ? styles.cardClickable : ''}`}
						onClick={() => onCardClick?.(sm)}
						role={onCardClick ? 'button' : undefined}
						tabIndex={onCardClick ? 0 : undefined}
						onKeyDown={
							onCardClick
								? (e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											onCardClick(sm);
										}
									}
								: undefined
						}
						aria-label={onCardClick ? `Rediger siktemerker for ${title}` : undefined}
					>
						<div className={styles.cardHeader}>
							<div className={styles.cardTitleRow}>
								<LuTarget className={styles.cardIcon} size={20} />
								<h3 className={styles.cardTitle}>{title}</h3>
								<span className={styles.markCount}>{sm.givenDistances.length} merker</span>
								{onCardClick && (
									<span className={styles.editHint} aria-hidden>
										<LuPencil size={14} />
									</span>
								)}
							</div>
							<div className={styles.badgeRow}>
								{showBowBadge && (
									<Badge variant="ghost" size="sm" icon={<LuTarget size={12} />}>
										{bowName}
									</Badge>
								)}
								{arrowBadge && (
									<Badge variant="ghost" size="sm" icon={<LuArrowRight size={12} />}>
										{arrowBadge}
									</Badge>
								)}
							</div>
						</div>

						{sm.givenDistances.length === 0 ? (
							<p className={styles.noMarks}>Ingen merker registrert</p>
						) : (
							<div className={styles.marksTable}>
								<div className={styles.marksHeader}>
									<span>Avstand</span>
									<span>Merke</span>
									<span className={styles.calculatedHeader}>Beregnet</span>
									<span></span>
								</div>
								{sm.givenDistances.map((distance, index) => {
									const givenMark = sm.givenMarks[index];
									const calculatedMark = Array.isArray(calc?.calculated_marks) ? calc.calculated_marks[index] : undefined;
									return (
										<div key={index} className={styles.markRow}>
											<span className={styles.distanceValue}>{distance.toFixed(1).replace('.', ',')} m</span>
											<span className={styles.markValue}>{givenMark != null ? givenMark.toFixed(2).replace('.', ',') : '-'}</span>
											<span className={styles.calculatedValue}>
												{calculatedMark != null ? calculatedMark.toFixed(2).replace('.', ',') : '-'}
											</span>
											<button
												className={styles.deleteBtn}
												onClick={(e) => {
													e.stopPropagation();
													onDeleteMark(sm.id, index);
												}}
												disabled={isDeleting}
												aria-label={`Fjern merke for ${distance.toFixed(1).replace('.', ',')}m`}
											>
												<LuTrash2 size={15} />
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
