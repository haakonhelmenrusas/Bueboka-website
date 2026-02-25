'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import styles from './page.module.css';

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setStatus('error');
				setMessage('Ugyldig verifikasjonslenke. Sjekk e-posten din og prøv igjen.');
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
					setMessage('E-postadressen din er bekreftet! Du blir videresendt om et øyeblikk...');

					// Redirect to dashboard after 2 seconds
					setTimeout(() => {
						router.push('/min-side');
					}, 2000);
					return;
				}

				setStatus('error');
				setMessage(`Kunne ikke bekrefte e-postadressen. Lenken kan ha utløpt. (${response.status})`);
			} catch (error) {
				setStatus('error');
				setMessage('En feil oppstod. Prøv igjen senere.');
				console.error('Email verification error:', error);
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				{status === 'loading' && (
					<>
						<Loader2 className={styles.iconLoading} size={64} />
						<h1 className={styles.title}>Bekrefter e-postadresse...</h1>
						<p className={styles.message}>Vennligst vent.</p>
					</>
				)}

				{status === 'success' && (
					<>
						<CheckCircle className={styles.iconSuccess} size={64} />
						<h1 className={styles.title}>E-post bekreftet!</h1>
						<p className={styles.message}>{message}</p>
					</>
				)}

				{status === 'error' && (
					<>
						<XCircle className={styles.iconError} size={64} />
						<h1 className={styles.title}>Bekreftelse feilet</h1>
						<p className={styles.message}>{message}</p>
						<button className={styles.button} onClick={() => router.push('/logg-inn')}>
							Gå til innlogging
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className={styles.container}>
					<div className={styles.card}>
						<Loader2 className={styles.iconLoading} size={64} />
						<h1 className={styles.title}>Laster...</h1>
					</div>
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
