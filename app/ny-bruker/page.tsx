'use client';

import { signUp } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button, Header, Input } from '@/components';
import styles from './page.module.css';

export default function SignUpPage() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);

		const form = e.currentTarget;
		const formData = new FormData(form);

		const data = await signUp.email({
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			name: formData.get('name') as string,
		});

		if (data.error) {
			setError(data.error.message || 'En feil har skjedd ved opprettelse av brukeren din.');
		} else {
			router.push('/min-side');
		}
	}

	return (
		<div className={styles.container}>
			<Header />
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
						<Input label="Navn" id="name" name="name" type="text" />
						<Input label="E-postadresse" id="email" name="email" type="email" autoComplete="email" />
						<Input label="Passord" id="password" name="password" type="password" autoComplete="new-password" minLength={8} />
					</div>
					<Button type="submit" label="Opprett bruker" />
				</form>
			</div>
		</div>
	);
}
