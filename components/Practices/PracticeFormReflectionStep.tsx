'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { TextArea } from '@/components';

interface ReflectionStepProps {
	rating: number | null;
	setRating: (r: number | null) => void;
	notes: string;
	setNotes: (n: string) => void;
	error: string | null;
}

export const PracticeFormReflectionStep: React.FC<ReflectionStepProps> = ({ rating, setRating, notes, setNotes, error }) => (
	<div className={styles.stepContent}>
		<div className={styles.ratingSection}>
			<div className={styles.ratingLabel}>
				Vurdering
				<span className={styles.ratingOptional}>(valgfritt)</span>
			</div>
			<p className={styles.ratingHelpText}>Hvordan vil du vurdere treningen?</p>
			<div className={styles.ratingButtons}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
					<button
						key={num}
						type="button"
						className={`${styles.ratingButton}${rating === num ? ` ${styles.ratingButtonActive}` : ''}`}
						onClick={() => setRating(rating === num ? null : num)}
						aria-label={`Vurdering ${num} av 10`}
						aria-pressed={rating === num}
					>
						{num}
					</button>
				))}
			</div>
		</div>
		<TextArea
			label="Notater"
			value={notes}
			onChange={(e) => setNotes(e.target.value)}
			placeholder="Hvordan gikk treningen?&#10;&#10;Hva gikk bra?&#10;Hva kan forbedres?"
			helpText={`Dine tanker og observasjoner (${notes.length}/500 tegn)`}
			maxLength={500}
			containerClassName={styles.field}
		/>
		{error && <div className={styles.error}>{error}</div>}
	</div>
);
