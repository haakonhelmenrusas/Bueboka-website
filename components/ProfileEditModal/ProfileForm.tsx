'use client';

import { useEffect, useState } from 'react';
import { Button, Input } from '@/components';

export interface ProfileFormValues {
	club: string;
}

interface ProfileFormProps {
	initialValues: ProfileFormValues;
	loading?: boolean;
	onSubmit: (values: ProfileFormValues) => Promise<void>;
}

export function ProfileForm({ initialValues, loading, onSubmit }: ProfileFormProps) {
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
		>
			<Input label="Klubb" value={club} onChange={(e) => setClub(e.target.value)} helpText="Navnet på klubben din" />
			<Button label={loading ? 'Lagrer...' : 'Lagre'} type="submit" disabled={loading} width={220} />
		</form>
	);
}
