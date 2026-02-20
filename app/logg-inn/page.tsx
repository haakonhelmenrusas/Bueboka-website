'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Button, Header, Input, SocialAuthButtons } from '@/components';
import { validateLoginForm } from '@/lib/validations/authValidation';
import styles from './page.module.css';

export default function SignInPage() {
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const clearFieldError = (field: 'email' | 'password') => {
		setFieldErrors((prev) => {
			const updated = { ...prev };
			delete updated[field];
			return updated;
		});
	};

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isSubmitting) return;

		setError(null);
		setFieldErrors({});
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.currentTarget);
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			// Client-side validation using shared utility
			const errors = validateLoginForm(email, password);

			if (Object.keys(errors).length > 0) {
				setFieldErrors(errors);
				setIsSubmitting(false);
				return;
			}

			const res = await signIn.email({
				email,
				password,
				callbackURL: '/min-side',
			});

			if (res.error) {
				setError(res.error.message || 'Feil brukernavn eller passord');
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
						<div className={styles.errorBox} role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<form onSubmit={handleSubmit} className={styles.form} aria-label="Logg inn skjema">
						<div className={styles.inputGroup}>
							<div>
								<Input
									label="E-postadresse"
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									disabled={isSubmitting}
									onFocus={() => clearFieldError('email')}
								/>
								{fieldErrors.email && (
									<div className={styles.fieldError} role="alert">
										{fieldErrors.email}
									</div>
								)}
							</div>
							<div className={styles.passwordInput}>
								<Input
									label="Passord"
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									disabled={isSubmitting}
									onFocus={() => clearFieldError('password')}
								/>
								{fieldErrors.password && (
									<div className={styles.fieldError} role="alert">
										{fieldErrors.password}
									</div>
								)}
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
					</div>
				</div>
			</main>
		</div>
	);
}
