'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Header, Input } from '@/components';
import styles from '@/app/ny-bruker/page.module.css';

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

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
			const newPassword = (formData.get('password') as string | null) || '';

			if (!token) {
				setError('Mangler token. Åpne lenken på nytt fra e-posten.');
				return;
			}

			if (!newPassword) {
				setError('Passord mangler.');
				return;
			}

			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, newPassword }),
			});

			const data = (await res.json().catch(() => null)) as { message?: string } | null;

			if (!res.ok) {
				setError(data?.message || 'Kunne ikke tilbakestille passord.');
				return;
			}

			setSuccess('Passordet er oppdatert. Du kan logge inn.');
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
						<h1 className={styles.title}>Tilbakestill passord</h1>
					</div>

					{!token && <p className="text-red-500">Mangler token. Bruk lenken du fikk på e-post.</p>}
					{error && <p className="text-red-500">{error}</p>}
					{success && <p className="text-green-600">{success}</p>}

					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.inputGroup}>
							<Input label="Nytt passord" id="password" name="password" type="password" autoComplete="new-password" />
						</div>
						<Button type="submit" label={isSubmitting ? 'Lagrer…' : 'Lagre nytt passord'} disabled={isSubmitting || !token} />
					</form>
				</div>
			</div>
		</div>
	);
}
