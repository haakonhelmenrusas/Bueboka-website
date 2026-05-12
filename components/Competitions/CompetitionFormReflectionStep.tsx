'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { TextArea } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

interface ReflectionStepProps {
	notes: string;
	setNotes: (v: string) => void;
	error: string | null;
}

export const CompetitionFormReflectionStep: React.FC<ReflectionStepProps> = ({ notes, setNotes, error }) => {
	const { t } = useTranslation();
	return (
		<div className={styles.stepContent}>
			<TextArea
				label={t['form.notes']}
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder={t['competition.reflectionPlaceholder']}
				helpText={`${t['competition.reflectionHelp']} (${notes.length}/500 ${t['common.characters']})`}
				maxLength={500}
				containerClassName={styles.field}
			/>
			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
};
