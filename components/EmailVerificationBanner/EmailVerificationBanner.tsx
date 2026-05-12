'use client';

import { useState } from 'react';
import { LuCircleAlert, LuX } from 'react-icons/lu';
import styles from './EmailVerificationBanner.module.css';
import { useTranslation } from '@/context/LanguageProvider';

interface EmailVerificationBannerProps {
	userEmail: string;
	emailVerified: boolean;
}

export function EmailVerificationBanner({ userEmail, emailVerified }: EmailVerificationBannerProps) {
	const { t } = useTranslation();
	const [dismissed, setDismissed] = useState(false);
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	// Don't show if user is verified or banner is dismissed
	if (emailVerified || dismissed) {
		return null;
	}

	const handleResend = async () => {
		try {
			setSending(true);
			setMessage(null);

			const response = await fetch('/api/auth/send-verification-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userEmail }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.message || t['emailVerification.sendError']);
			}

			setMessage(t['emailVerification.sent']);

			// Clear success message after 5 seconds
			setTimeout(() => setMessage(null), 5000);
		} catch (error: any) {
			console.error('Resend verification email error:', error);
			const errorMessage = error?.message || t['emailVerification.sendError'];
			setMessage(errorMessage);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className={styles.banner}>
			<div className={styles.content}>
				<LuCircleAlert size={18} />
				<div className={styles.textContainer}>
					<p className={styles.text}>{t['emailVerification.notVerified']}</p>
					<button className={styles.link} onClick={handleResend} disabled={sending}>
						{sending ? t['emailVerification.sending'] : t['emailVerification.resend']}
					</button>
					{message && <p className={styles.message}>{message}</p>}
				</div>
			</div>
			<button className={styles.closeButton} onClick={() => setDismissed(true)} aria-label={t['emailVerification.closeAlert']}>
				<LuX size={14} />
			</button>
		</div>
	);
}
