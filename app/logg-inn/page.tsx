'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from '@/lib/auth-client';
import { Button, Input, SocialAuthButtons } from '@/components';
import { validateLoginForm } from '@/lib/validations/authValidation';
import { LuChartBar, LuTarget, LuTrendingUp } from 'react-icons/lu';
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
			{/* Small navigation logo */}
			<Link href="/" className={styles.navLogo} aria-label="Gå til forsiden">
				<div className={styles.navLogoBox} aria-hidden="true">
					<Image width={24} height={24} src="/assets/logo.png" alt="" className={styles.navLogoImg} />
				</div>
				<span className={styles.navBrand}>Bueboka</span>
			</Link>

			<main id="main-content" className={styles.layout}>
				<section className={styles.brandSection} aria-labelledby="brand-heading">
					<div className={styles.brandContent}>
						{/* Big decorative logo */}
						<div className={styles.bigLogoBox} aria-hidden="true">
							<Image width={80} height={80} priority src="/assets/logo.png" alt="" className={styles.bigLogoImg} />
						</div>
						<h1 id="brand-heading" className={styles.brandTitle}>
							Bueboka
						</h1>
						<p className={styles.brandDescription}>
							Din komplette treningspartner for bueskyting. Logg økter, følg fremgang og optimaliser siktemerkene dine.
						</p>
						<ul className={styles.brandFeatures} aria-label="Hovedfunksjoner">
							<li className={styles.feature}>
								<LuChartBar size={32} className={styles.featureIcon} aria-hidden="true" />
								<span>Detaljert statistikk</span>
							</li>
							<li className={styles.feature}>
								<LuTarget size={32} className={styles.featureIcon} aria-hidden="true" />
								<span>Siktemerke-beregning</span>
							</li>
							<li className={styles.feature}>
								<LuTrendingUp size={32} className={styles.featureIcon} aria-hidden="true" />
								<span>Følg din utvikling</span>
							</li>
						</ul>
					</div>
				</section>

				<section className={styles.formSection} aria-labelledby="login-heading">
					<div className={styles.card}>
						<div className={styles.formWrapper}>
							<div className={styles.header}>
								<h2 id="login-heading" className={styles.title}>
									Logg inn
								</h2>
							</div>
							{error && (
								<div className={styles.errorBox} role="alert" aria-live="polite" aria-atomic="true">
									{error}
								</div>
							)}
							<form onSubmit={handleSubmit} className={styles.form} noValidate>
								<fieldset className={styles.inputGroup}>
									<legend className="sr-only">Innloggingsinformasjon</legend>
									<div>
										<Input
											label="E-postadresse"
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											disabled={isSubmitting}
											required
											aria-required="true"
											onFocus={() => clearFieldError('email')}
										/>
										{fieldErrors.email && (
											<div className={styles.fieldError} role="alert" aria-live="polite">
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
											required
											aria-required="true"
											onFocus={() => clearFieldError('password')}
										/>
										{fieldErrors.password && (
											<div className={styles.fieldError} role="alert" aria-live="polite">
												{fieldErrors.password}
											</div>
										)}
									</div>
								</fieldset>
								<div className={styles.forgotLinkRow}>
									<Link tabIndex={0} href="/glemt-passord">
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
							<div className={styles.signupPrompt}>
								Har du ikke en konto?{' '}
								<Link tabIndex={0} href="/ny-bruker">
									Opprett bruker
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
