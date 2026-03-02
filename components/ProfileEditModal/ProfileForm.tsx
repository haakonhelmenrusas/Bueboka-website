'use client';

import { useEffect, useState } from 'react';
import { Button, Input } from '@/components';
import styles from './ProfileForm.module.css';

export interface ProfileFormValues {
	name: string;
	club: string;
}

interface ProfileFormProps {
	initialValues: ProfileFormValues;
	loading?: boolean;
	onSubmit: (values: ProfileFormValues) => Promise<void>;
	onCancel?: () => void;
}

export function ProfileForm({ initialValues, loading, onSubmit, onCancel }: ProfileFormProps) {
	const [name, setName] = useState(initialValues.name);
	const [club, setClub] = useState(initialValues.club);

	useEffect(() => {
		setName(initialValues.name);
		setClub(initialValues.club);
	}, [initialValues.name, initialValues.club]);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, club });
			}}
			className={styles.form}
		>
			<Input label="Navn" value={name} onChange={(e) => setName(e.target.value)} helpText="Ditt fulle navn" required />
			<Input label="Klubb" value={club} onChange={(e) => setClub(e.target.value)} helpText="Navnet på klubben din" />

			<div className={styles.actions}>
				{onCancel && <Button label="Avbryt" onClick={onCancel} disabled={loading} buttonType="outline" width={160} type="button" />}
				<Button label={loading ? 'Lagrer...' : 'Lagre'} type="submit" disabled={loading} loading={loading} width={180} />
			</div>
		</form>
	);
}
