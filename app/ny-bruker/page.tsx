'use client';

import { signIn, signUp } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, SocialAuthButtons } from '@/components';
import { validateSignUpForm } from '@/lib/validations/authValidation';
import { LuChartBar, LuTarget, LuTrendingUp } from 'react-icons/lu';
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
			<Link href="/" className={styles.navLogo} aria-label="Gå til forsiden">
				<div className={styles.navLogoBox} aria-hidden="true">
					<Image width={24} height={24} src="/assets/logo.png" alt="" className={styles.navLogoImg} />
				</div>
				<span className={styles.navBrand}>Bueboka</span>
			</Link>
			<main id="main-content" className={styles.layout}>
				<section className={styles.brandSection} aria-labelledby="brand-heading">
					<div className={styles.brandContent}>
						<div className={styles.bigLogoBox} aria-hidden="true">
							<Image width={80} height={80} priority src="/assets/logo.png" alt="" className={styles.bigLogoImg} />
						</div>
						<h1 id="brand-heading" className={styles.brandTitle}>
							Bueboka
						</h1>
						<p className={styles.brandDescription}>
							Bli med i fellesskapet av bueskyttere som tar treningen til neste nivå med smart treningsdagbok og siktemerke-beregning.
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
				<section className={styles.formSection} aria-labelledby="signup-heading">
					<div className={styles.card}>
						<div className={styles.formWrapper}>
							<div className={styles.header}>
								<h2 id="signup-heading" className={styles.title}>
									Opprett konto
								</h2>
								<p className={styles.subtitle}>Start din treningsdagbok i dag – helt gratis!</p>
							</div>
							{error && (
								<div className={styles.errorBox} role="alert" aria-live="polite" aria-atomic="true">
									{error}
								</div>
							)}
							<form onSubmit={handleSignUp} className={styles.form} noValidate>
								<fieldset className={styles.inputGroup}>
									<legend className="sr-only">Brukerinformasjon</legend>
									<div>
										<Input
											label="Navn"
											id="name"
											name="name"
											type="text"
											disabled={isSubmitting}
											required
											aria-required="true"
											onFocus={() => clearFieldError('name')}
										/>
										{fieldErrors.name && (
											<div className={styles.fieldError} role="alert" aria-live="polite">
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
											autoComplete="new-password"
											minLength={8}
											disabled={isSubmitting}
											required
											aria-required="true"
											aria-describedby="password-requirements"
											onFocus={() => clearFieldError('password')}
										/>
										<div id="password-requirements" className={styles.helpText}>
											Må være minst 8 tegn
										</div>
										{fieldErrors.password && (
											<div className={styles.fieldError} role="alert" aria-live="polite">
												{fieldErrors.password}
											</div>
										)}
									</div>
								</fieldset>
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
							<div className={styles.loginPrompt}>
								Har du allerede en konto?
								<Link tabIndex={0} href="/logg-inn">
									Logg inn her
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
