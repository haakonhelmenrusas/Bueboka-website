'use client';

import { signIn, signUp } from '@/lib/auth-client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Header, Input, SocialAuthButtons } from '@/components';
import { validateSignUpForm } from '@/lib/validations/authValidation';
import styles from './page.module.css';

export default function SignUpPage() {
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const clearFieldError = (field: 'name' | 'email' | 'password') => {
		setFieldErrors((prev) => {
			const updated = { ...prev };
			delete updated[field];
			return updated;
		});
	};

	async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isSubmitting) return;

		setError(null);
		setFieldErrors({});
		setIsSubmitting(true);

		try {
			const form = e.currentTarget;
			const formData = new FormData(form);
			const name = formData.get('name') as string;
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			// Client-side validation using shared utility
			const errors = validateSignUpForm(name, email, password);

			if (Object.keys(errors).length > 0) {
				setFieldErrors(errors);
				setIsSubmitting(false);
				return;
			}

			const data = await signUp.email({
				email,
				password,
				name,
				callbackURL: '/min-side',
			});

			if (data.error) {
				setError(data.error.message || 'En feil har skjedd ved opprettelse av brukeren din.');
				return;
			}

			router.push('/min-side');
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
						<h1 className={styles.title}>Ny bruker</h1>
						<p className={styles.subtitle}>
							Har du allerede en brukerkonto? <Link href="/logg-inn">Logg inn her</Link>
						</p>
					</div>
					{error && (
						<div className={styles.errorBox} role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<form onSubmit={handleSignUp} className={styles.form} aria-label="Registrer ny bruker skjema">
						<div className={styles.inputGroup}>
							<div>
								<Input label="Navn" id="name" name="name" type="text" disabled={isSubmitting} onFocus={() => clearFieldError('name')} />
								{fieldErrors.name && (
									<div className={styles.fieldError} role="alert">
										{fieldErrors.name}
									</div>
								)}
							</div>
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
									autoComplete="new-password"
									minLength={8}
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
						<Button type="submit" label="Opprett bruker" loading={isSubmitting} disabled={isSubmitting} />
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
