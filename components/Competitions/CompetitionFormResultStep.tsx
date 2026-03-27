'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuTrophy } from 'react-icons/lu';
import { Checkbox, NumberInput } from '@/components';

interface ResultStepProps {
	placement: number | null;
	setPlacement: (v: number | null) => void;
	numberOfParticipants: number | null;
	setNumberOfParticipants: (v: number | null) => void;
	personalBest: boolean;
	setPersonalBest: (v: boolean) => void;
}

export const CompetitionFormResultStep: React.FC<ResultStepProps> = ({
	placement,
	setPlacement,
	numberOfParticipants,
	setNumberOfParticipants,
	personalBest,
	setPersonalBest,
}) => (
	<div className={styles.stepContent}>
		<div className={styles.resultSection}>
			<div className={styles.resultLabel}>
				<LuTrophy size={18} />
				Plassering
			</div>
			<p className={styles.resultHelpText}>Fyll inn din plassering og antall deltakere i din klasse.</p>
			<div className={styles.row}>
				<NumberInput
					label="Plassering"
					value={placement ?? 0}
					onChange={(v) => setPlacement(v || null)}
					onEmpty={() => setPlacement(null)}
					min={1}
					helpText="Din plassering"
					startEmpty
					optional
					containerClassName={styles.field}
				/>
				<NumberInput
					label="Antall deltakere"
					value={numberOfParticipants ?? 0}
					onChange={(v) => setNumberOfParticipants(v || null)}
					onEmpty={() => setNumberOfParticipants(null)}
					min={1}
					helpText="Totalt antall"
					startEmpty
					optional
					containerClassName={styles.field}
				/>
			</div>
		</div>

		<Checkbox label="Personlig rekord" checked={personalBest} onChange={setPersonalBest} />
	</div>
);
