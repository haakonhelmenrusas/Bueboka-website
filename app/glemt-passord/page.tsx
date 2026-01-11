'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Header, Input } from '@/components';
import styles from '@/app/ny-bruker/page.module.css';

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.currentTarget);
			const email = (formData.get('email') as string | null)?.trim();
			const redirectTo = `${window.location.origin}/tilbakestill-passord`;

			if (!email) {
				setError('E-postadresse mangler.');
				return;
			}

			const res = await fetch('/api/auth/request-password-reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, redirectTo }),
			});

			const data = (await res.json().catch(() => null)) as { message?: string } | null;

			if (!res.ok) {
				setError(data?.message || 'Kunne ikke sende lenke. Prøv igjen.');
				return;
			}

			setSuccess(data?.message || 'Sjekk e-posten din for lenke til å tilbakestille passord.');
			// Optional: take user back to login after a short pause.
			setTimeout(() => router.push('/logg-inn'), 1200);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className={`${styles.container} ${styles.themeBackground}`}>
			<Header />
			<div className={styles.card}>
				<div className={styles.formWrapper}>
					<div className={styles.header}>
						<h1 className={styles.title}>Glemt passord</h1>
					</div>
					{error && <p className="text-red-500">{error}</p>}
					{success && <p className="text-green-600">{success}</p>}

					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.inputGroup}>
							<Input label="E-postadresse" id="email" name="email" type="email" autoComplete="email" />
						</div>
						<Button type="submit" label={isSubmitting ? 'Sender…' : 'Send lenke'} disabled={isSubmitting} />
					</form>
				</div>
			</div>
		</div>
	);
}
