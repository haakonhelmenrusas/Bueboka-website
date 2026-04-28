'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuCircle, LuCircleCheck, LuLoader, LuLoaderPinwheel } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './page.module.css';

function VerifyEmailContent() {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setStatus('error');
				setMessage(t['verifyEmail.invalidLink']);
				return;
			}

			try {
				const response = await fetch('/api/auth/verify-email', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ token }),
				});

				// Better Auth might return a redirect (303/302) on success
				if (response.status === 303 || response.status === 302 || response.status === 200) {
					setStatus('success');
					setMessage(t['verifyEmail.confirmed']);

					// Redirect to dashboard after 2 seconds
					setTimeout(() => {
						router.push('/min-side');
					}, 2000);
					return;
				}

				setStatus('error');
				setMessage(`${t['verifyEmail.expired']} (${response.status})`);
			} catch (error) {
				setStatus('error');
				setMessage(t['verifyEmail.genericError']);
				console.error('Email verification error:', error);
			}
		};

		verifyEmail();
	}, [token, router, t]);

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				{status === 'loading' && (
					<>
						<LuLoader className={styles.iconLoading} size={64} />
						<h1 className={styles.title}>{t['verifyEmail.verifying']}</h1>
						<p className={styles.message}>{t['verifyEmail.pleaseWait']}</p>
					</>
				)}

				{status === 'success' && (
					<>
						<LuCircleCheck className={styles.iconSuccess} size={64} />
						<h1 className={styles.title}>{t['verifyEmail.success']}</h1>
						<p className={styles.message}>{message}</p>
					</>
				)}

				{status === 'error' && (
					<>
						<LuCircle className={styles.iconError} size={64} />
						<h1 className={styles.title}>{t['verifyEmail.error']}</h1>
						<p className={styles.message}>{message}</p>
						<button className={styles.button} onClick={() => router.push('/logg-inn')}>
							{t['verifyEmail.goToLogin']}
						</button>
					</>
				)}
			</div>
		</div>
	);
}

function LoadingFallback() {
	const { t } = useTranslation();
	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<LuLoaderPinwheel className={styles.iconLoading} size={64} />
				<h1 className={styles.title}>{t['common.loading']}</h1>
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<VerifyEmailContent />
		</Suspense>
	);
}
