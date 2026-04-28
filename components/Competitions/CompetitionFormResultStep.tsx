'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuTrophy } from 'react-icons/lu';
import { Checkbox, NumberInput } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

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
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.stepContent}>
			<div className={styles.resultSection}>
				<div className={styles.resultLabel}>
					<LuTrophy size={18} />
					{t['competition.placementLabel']}
				</div>
				<p className={styles.resultHelpText}>{t['competition.placementHeading']}</p>
				<div className={styles.row}>
					<NumberInput
						label={t['competition.placementLabel']}
						value={placement ?? 0}
						onChange={(v) => setPlacement(v || null)}
						onEmpty={() => setPlacement(null)}
						min={1}
						helpText={t['competition.placementHelp']}
						startEmpty
						optional
						containerClassName={styles.field}
					/>
					<NumberInput
						label={t['competition.participantsLabel']}
						value={numberOfParticipants ?? 0}
						onChange={(v) => setNumberOfParticipants(v || null)}
						onEmpty={() => setNumberOfParticipants(null)}
						min={1}
						helpText={t['competition.participantsHelp']}
						startEmpty
						optional
						containerClassName={styles.field}
					/>
				</div>
			</div>

			<Checkbox label={t['competition.personalBest']} checked={personalBest} onChange={setPersonalBest} />
		</div>
	);
};
