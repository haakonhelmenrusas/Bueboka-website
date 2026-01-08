'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button, Header, Input } from '@/components';
import styles from '@/app/ny-bruker/page.module.css';

export default function SignInPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);

		const formData = new FormData(e.currentTarget);

		const res = await signIn.email({
			email: formData.get('email') as string,
			password: formData.get('password') as string,
		});

		if (res.error) {
			setError(res.error.message || 'Something went wrong.');
		} else {
			router.push('/min-side');
		}
	}

	return (
		<div className={styles.container}>
			<Header />
			<div className={styles.formWrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>Logg inn</h1>
				</div>
				{error && <p className="text-red-500">{error}</p>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className={styles.inputGroup}>
						<Input label="E-postadresse" id="email" name="email" type="email" autoComplete="email" />
						<Input label="Passord" id="password" name="password" type="password" autoComplete="new-password" />
					</div>
					<Button type="submit" label="Logg inn" />
				</form>
				<div>
					<button type="button" onClick={() => signIn.social({ provider: 'google' })} aria-label="Sign in with Google">
						Logg på med Google
					</button>

					<button type="button" onClick={() => signIn.social({ provider: 'apple' })} aria-label="Sign in with Apple">
						Logg på med Apple
					</button>
				</div>
			</div>
		</div>
	);
}
