'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Button, Header, Input, SocialAuthButtons } from '@/components';
import styles from './page.module.css';

export default function SignInPage() {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isSubmitting) return;

		setError(null);
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.currentTarget);

			const res = await signIn.email({
				email: formData.get('email') as string,
				password: formData.get('password') as string,
				callbackURL: '/min-side',
			});

			if (res.error) {
				setError(res.error.message || 'Something went wrong.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className={`${styles.container} ${styles.themeBackground}`}>
			<a href="#main-content" className="skip-link">
				Gå til hovedinnhold
			</a>
			<Header />
			<main id="main-content" className={styles.card}>
				<div className={styles.formWrapper}>
					<div className={styles.header}>
						<h1 className={styles.title}>Logg inn</h1>
					</div>
					{error && (
						<p className="text-red-500" role="alert" aria-live="polite">
							{error}
						</p>
					)}
					<form onSubmit={handleSubmit} className={styles.form} aria-label="Logg inn skjema">
						<div className={styles.inputGroup}>
							<Input label="E-postadresse" id="email" name="email" type="email" autoComplete="email" disabled={isSubmitting} />
							<div className={styles.passwordInput}>
								<Input label="Passord" id="password" name="password" type="password" autoComplete="new-password" disabled={isSubmitting} />
							</div>
						</div>
						<div className={styles.forgotLinkRow}>
							<Link href="/glemt-passord" className="text-sm underline">
								Glemt passord?
							</Link>
						</div>
						<Button type="submit" label="Logg inn" loading={isSubmitting} disabled={isSubmitting} />
					</form>
					<div className={styles.authActions}>
						<SocialAuthButtons
							provider="google"
							label="Logg på med Google"
							onClick={() => signIn.social({ provider: 'google', callbackURL: '/min-side' })}
							disabled={isSubmitting}
						/>
						<SocialAuthButtons
							provider="apple"
							label="Logg på med Apple"
							onClick={() => signIn.social({ provider: 'apple', callbackURL: '/min-side' })}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
