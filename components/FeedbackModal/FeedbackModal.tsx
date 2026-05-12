'use client';

import { useState } from 'react';
import { LuStar } from 'react-icons/lu';
import styles from './FeedbackModal.module.css';
import { Button, Modal } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

interface FeedbackModalProps {
	open: boolean;
	onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
	const { t } = useTranslation();
	const [rating, setRating] = useState<number>(0);
	const [hoveredRating, setHoveredRating] = useState<number>(0);
	const [feedback, setFeedback] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			setMessage({ type: 'error', text: t['feedback.errorNoRating'] });
			return;
		}

		if (!feedback.trim()) {
			setMessage({ type: 'error', text: t['feedback.errorNoText'] });
			return;
		}

		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating, feedback }),
			});

			if (!response.ok) {
				const error = await response.json();
				setMessage({ type: 'error', text: error.error || t['feedback.errorSend'] });
				return;
			}

			// Successfully submitted - close modal immediately
			setRating(0);
			setFeedback('');
			onClose();
		} catch (error) {
			setMessage({ type: 'error', text: t['validation.genericError'] });
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setRating(0);
			setFeedback('');
			setMessage(null);
			onClose();
		}
	};

	if (!open) return null;

	return (
		<Modal open={open} onClose={handleClose} title={t['feedback.title']} maxWidth={540} zIndex={10000}>
			{message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.ratingSection}>
					<label className={styles.label}>{t['feedback.ratingLabel']}</label>
					<div className={styles.stars}>
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								className={`${styles.starButton} ${star <= (hoveredRating || rating) ? styles.starActive : ''}`}
								onClick={() => setRating(star)}
								onMouseEnter={() => setHoveredRating(star)}
								onMouseLeave={() => setHoveredRating(0)}
								aria-label={`${star} ${t['feedback.ratingLabel']}`}
							>
								<LuStar size={32} fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'} />
							</button>
						))}
					</div>
				</div>

				<div className={styles.feedbackSection}>
					<label htmlFor="feedback-text" className={styles.label}>
						{t['feedback.textLabel']}
					</label>
					<textarea
						id="feedback-text"
						className={styles.textarea}
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						placeholder={t['feedback.placeholder']}
						rows={6}
						disabled={loading}
					/>
				</div>

				<div className={styles.actions}>
					<Button type="button" onClick={handleClose} disabled={loading} buttonType="outline" label={t['feedback.cancel']} />
					<Button
						type="submit"
						disabled={loading || rating === 0 || !feedback.trim()}
						label={loading ? t['feedback.submitting'] : t['feedback.submit']}
					/>
				</div>
			</form>
		</Modal>
	);
}
