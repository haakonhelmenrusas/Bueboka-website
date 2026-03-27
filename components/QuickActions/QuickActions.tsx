'use client';

import styles from './QuickActions.module.css';
import { LuTarget, LuTrophy } from 'react-icons/lu';
import { GiArrowhead, GiBowArrow } from 'react-icons/gi';

interface QuickActionsProps {
	onCreatePractice: () => void;
	onCreateCompetition?: () => void;
	onCreateBow?: () => void;
	onCreateArrows?: () => void;
}

export function QuickActions({ onCreatePractice, onCreateCompetition, onCreateBow, onCreateArrows }: QuickActionsProps) {
	return (
		<div className={styles.section}>
			<div className={styles.grid}>
				<button type="button" className={styles.button} onClick={onCreatePractice}>
					<span className={styles.icon}>
						<LuTarget size={28} />
					</span>
					<span className={styles.label}>Ny trening</span>
				</button>

				{onCreateCompetition && (
					<button type="button" className={styles.button} onClick={onCreateCompetition}>
						<span className={styles.icon}>
							<LuTrophy size={28} />
						</span>
						<span className={styles.label}>Ny konkurranse</span>
					</button>
				)}

				{onCreateBow && (
					<button type="button" className={styles.button} onClick={onCreateBow}>
						<span className={styles.icon}>
							<GiBowArrow size={28} />
						</span>
						<span className={styles.label}>Ny bue</span>
					</button>
				)}

				{onCreateArrows && (
					<button type="button" className={styles.button} onClick={onCreateArrows}>
						<span className={styles.icon}>
							<GiArrowhead size={28} style={{ transform: 'rotate(225deg)' }} />
						</span>
						<span className={styles.label}>Ny pil</span>
					</button>
				)}
			</div>
		</div>
	);
}

