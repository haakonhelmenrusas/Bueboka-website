'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select } from '@/components';
import { NORWEGIAN_ARCHERY_CLUBS } from '@/lib/clubs';
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

const CLUB_OPTIONS = [{ value: '', label: 'Ingen / ikke tilknyttet' }, ...NORWEGIAN_ARCHERY_CLUBS];

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
			<Select
				searchable
				label="Klubb"
				value={club}
				onChange={(val) => setClub(val as string)}
				options={CLUB_OPTIONS}
				helpText="Klubben din"
			/>

			<div className={styles.actions}>
				{onCancel && <Button label="Avbryt" onClick={onCancel} disabled={loading} buttonType="outline" width={160} type="button" />}
				<Button label={loading ? 'Lagrer...' : 'Lagre'} type="submit" disabled={loading} loading={loading} width={180} />
			</div>
		</form>
	);
}
