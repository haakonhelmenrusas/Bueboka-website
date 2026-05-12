'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select } from '@/components';
import { NORWEGIAN_ARCHERY_CLUBS } from '@/lib/clubs';
import { useTranslation } from '@/context/LanguageProvider';
import styles from './ProfileForm.module.css';

export interface ProfileFormValues {
	name: string;
	club: string;
	skytternr: string;
}

interface ProfileFormProps {
	initialValues: ProfileFormValues;
	loading?: boolean;
	onSubmit: (values: ProfileFormValues) => Promise<void>;
	onCancel?: () => void;
}

export function ProfileForm({ initialValues, loading, onSubmit, onCancel }: ProfileFormProps) {
	const { t } = useTranslation();
	const [name, setName] = useState(initialValues.name);
	const [club, setClub] = useState(initialValues.club);
	const [skytternr, setSkytternr] = useState(initialValues.skytternr);

	useEffect(() => {
		setName(initialValues.name);
		setClub(initialValues.club);
		setSkytternr(initialValues.skytternr);
	}, [initialValues.name, initialValues.club, initialValues.skytternr]);

	const clubOptions = [{ value: '', label: t['profileEdit.noClub'] }, ...NORWEGIAN_ARCHERY_CLUBS];

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, club, skytternr });
			}}
			className={styles.form}
		>
			<Input label={t['profileEdit.nameLabel']} value={name} onChange={(e) => setName(e.target.value)} helpText={t['profileEdit.nameHelp']} required />
			<Select
				searchable
				label={t['profileEdit.clubLabel']}
				value={club}
				onChange={(val) => setClub(val as string)}
				options={clubOptions}
				helpText={t['profileEdit.clubHelp']}
			/>
			<Input
				label={t['profileEdit.archerNumberLabel']}
				value={skytternr}
				onChange={(e) => setSkytternr(e.target.value)}
				helpText={t['profileEdit.archerNumberHelp']}
				optional
			/>

			<div className={styles.actions}>
				{onCancel && <Button label={t['common.cancel']} onClick={onCancel} disabled={loading} buttonType="outline" width={160} type="button" />}
				<Button label={loading ? t['common.saving'] : t['common.save']} type="submit" disabled={loading} loading={loading} width={180} />
			</div>
		</form>
	);
}
