'use client';

import { signIn, signUp } from '@/lib/auth-client';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, Header, Input, SocialAuthButtons } from '@/components';
import styles from './page.module.css';

export default function SignUpPage() {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isSubmitting) return;

		setError(null);
		setIsSubmitting(true);

		try {
			const form = e.currentTarget;
			const formData = new FormData(form);

			const data = await signUp.email({
				email: formData.get('email') as string,
				password: formData.get('password') as string,
				name: formData.get('name') as string,
				callbackURL: '/min-side',
			});

			if (data.error) {
				setError(data.error.message || 'En feil har skjedd ved opprettelse av brukeren din.');
			}
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
						<h1 className={styles.title}>Ny bruker</h1>
						<p className={styles.subtitle}>
							Har du allerede en brukerkonto? <Link href="/logg-inn">Logg inn her</Link>
						</p>
					</div>
					{error && <div className={styles.errorMessage}>{error}</div>}
					<form onSubmit={handleSignUp} className={styles.form}>
						<div className={styles.inputGroup}>
							<Input label="Navn" id="name" name="name" type="text" disabled={isSubmitting} />
							<Input label="E-postadresse" id="email" name="email" type="email" autoComplete="email" disabled={isSubmitting} />
							<Input
								label="Passord"
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								minLength={8}
								disabled={isSubmitting}
							/>
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
						<SocialAuthButtons
							provider="apple"
							label="Logg på med Apple"
							onClick={() => signIn.social({ provider: 'apple', callbackURL: '/min-side' })}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
