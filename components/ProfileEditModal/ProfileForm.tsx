'use client';

import { useEffect, useState } from 'react';
import { Button, Input } from '@/components';
import styles from './ProfileForm.module.css';

export interface ProfileFormValues {
	club: string;
}

interface ProfileFormProps {
	initialValues: ProfileFormValues;
	loading?: boolean;
	onSubmit: (values: ProfileFormValues) => Promise<void>;
	onCancel?: () => void;
}

export function ProfileForm({ initialValues, loading, onSubmit, onCancel }: ProfileFormProps) {
	const [club, setClub] = useState(initialValues.club);

	useEffect(() => {
		setClub(initialValues.club);
	}, [initialValues.club]);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ club });
			}}
			className={styles.form}
		>
			<Input label="Klubb" value={club} onChange={(e) => setClub(e.target.value)} helpText="Navnet på klubben din" />

			<div className={styles.actions}>
				{onCancel && <Button label="Avbryt" onClick={onCancel} disabled={loading} buttonType="outline" width={160} />}
				<Button label={loading ? 'Lagrer...' : 'Lagre'} type="submit" disabled={loading} loading={loading} width={180} />
			</div>
		</form>
	);
}
