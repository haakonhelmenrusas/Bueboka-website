'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { TextArea } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

interface ReflectionStepProps {
	rating: number | null;
	setRating: (r: number | null) => void;
	notes: string;
	setNotes: (n: string) => void;
	error: string | null;
}

export const PracticeFormReflectionStep: React.FC<ReflectionStepProps> = ({ rating, setRating, notes, setNotes, error }) => {
	const { t } = useTranslation();
	return (
		<div className={styles.stepContent}>
			<div className={styles.ratingSection}>
				<div className={styles.ratingLabel}>
					{t['practice.ratingLabel']}
					<span className={styles.ratingOptional}>{t['common.optional']}</span>
				</div>
				<p className={styles.ratingHelpText}>{t['practice.ratingHelp']}</p>
				<div className={styles.ratingButtons}>
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
						<button
							key={num}
							type="button"
							className={`${styles.ratingButton}${rating === num ? ` ${styles.ratingButtonActive}` : ''}`}
							onClick={() => setRating(rating === num ? null : num)}
							aria-label={`${t['practice.ratingLabel']} ${num} ${t['practice.ratingOf10']}`}
							aria-pressed={rating === num}
						>
							{num}
						</button>
					))}
				</div>
			</div>
			<TextArea
				label={t['form.notes']}
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder={t['practice.reflectionPlaceholder']}
				helpText={`${t['practice.notesHelp']} (${notes.length}/500 ${t['common.characters']})`}
				maxLength={500}
				containerClassName={styles.field}
			/>
			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
};
