'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { TextArea } from '@/components';

interface ReflectionStepProps {
	notes: string;
	setNotes: (v: string) => void;
	error: string | null;
}

export const CompetitionFormReflectionStep: React.FC<ReflectionStepProps> = ({ notes, setNotes, error }) => (
	<div className={styles.stepContent}>
		<TextArea
			label="Notater"
			value={notes}
			onChange={(e) => setNotes(e.target.value)}
			placeholder="Hvordan gikk konkurransen?&#10;&#10;Hva gikk bra?&#10;Hva kan forbedres?&#10;Noen spesielle forhold eller observasjoner?"
			helpText={`Dine refleksjoner fra konkurransen (${notes.length}/500 tegn)`}
			maxLength={500}
			containerClassName={styles.field}
		/>
		{error && <div className={styles.error}>{error}</div>}
	</div>
);

