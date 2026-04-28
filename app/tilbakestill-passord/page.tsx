'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Header, Input } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';
import styles from '@/app/ny-bruker/page.module.css';

function ResetPasswordContent() {
	const { t } = useTranslation();
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
				setError(t['tilbakestillPassord.noToken']);
				return;
			}

			if (!newPassword) {
				setError(t['tilbakestillPassord.passwordMissing']);
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
				setError(data?.message || t['tilbakestillPassord.error']);
				return;
			}

			setSuccess(t['tilbakestillPassord.success']);
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
						<h1 className={styles.title}>{t['tilbakestillPassord.title']}</h1>
					</div>

					{!token && <p className="text-red-500">{t['tilbakestillPassord.noToken']}</p>}
					{error && <p className="text-red-500">{error}</p>}
					{success && <p className="text-green-600">{success}</p>}

					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.inputGroup}>
							<Input label={t['tilbakestillPassord.passwordLabel']} id="password" name="password" type="password" autoComplete="new-password" />
						</div>
						<Button type="submit" label={isSubmitting ? t['tilbakestillPassord.saving'] : t['tilbakestillPassord.saveButton']} disabled={isSubmitting || !token} />
					</form>
				</div>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordContent />
		</Suspense>
	);
}
