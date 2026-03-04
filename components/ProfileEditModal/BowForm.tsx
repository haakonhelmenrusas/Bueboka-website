'use client';

import React from 'react';
import { Checkbox, Input, NumberInput, Select, TextArea, Tooltip } from '@/components';
import styles from './BowForm.module.css';
import { BOW_TYPE_OPTIONS } from '@/lib/labels';

export type BowType = 'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER';

export interface BowFormValues {
	name: string;
	type: BowType;
	eyeToNock: number;
	aimMeasure: number;
	eyeToSight: number;
	isFavorite: boolean;
	notes: string;
}

interface BowFormProps {
	initialValues: BowFormValues;
	onSubmit: (values: BowFormValues) => Promise<void>;
}

export function BowForm({ initialValues, onSubmit }: BowFormProps) {
	const [name, setName] = React.useState(initialValues.name);
	const [type, setType] = React.useState<BowType>(initialValues.type);
	const [eyeToNock, setEyeToNock] = React.useState<number>(initialValues.eyeToNock);
	const [aimMeasure, setAimMeasure] = React.useState<number>(initialValues.aimMeasure);
	const [eyeToSight, setEyeToSight] = React.useState<number>(initialValues.eyeToSight);
	const [isFavorite, setIsFavorite] = React.useState<boolean>(initialValues.isFavorite);
	const [notes, setNotes] = React.useState<string>(initialValues.notes);

	React.useEffect(() => {
		setName(initialValues.name);
		setType(initialValues.type);
		setEyeToNock(initialValues.eyeToNock);
		setAimMeasure(initialValues.aimMeasure);
		setEyeToSight(initialValues.eyeToSight);
		setIsFavorite(initialValues.isFavorite);
		setNotes(initialValues.notes);
	}, [initialValues]);

	return (
		<form
			id="bow-form"
			className={styles.form}
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, type, eyeToNock, aimMeasure, eyeToSight, isFavorite, notes });
			}}
		>
			<div className={styles.row}>
				<Input label="Navn på bue" value={name} onChange={(e) => setName(e.target.value)} helpText="Gi buen et navn" required />
				<Select label="Type" value={type} onChange={(v) => setType(v as BowType)} options={BOW_TYPE_OPTIONS.map((o) => ({ ...o }))} />
			</div>

			<div className={styles.numberRow}>
				<NumberInput label="Øye til nock (cm)" value={eyeToNock} onChange={setEyeToNock} hideSteppers min={0} step={0.1} />
				<NumberInput
					label={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
							Målt sikte
							<Tooltip text="Mål hvor langt 5cm er på siktet ditt" label="Hjelp for Målt sikte" />
						</span>
					}
					hideSteppers
					value={aimMeasure}
					onChange={setAimMeasure}
					min={0}
					step={0.1}
				/>
				<NumberInput label="Øye til sikte (cm)" value={eyeToSight} hideSteppers onChange={setEyeToSight} min={0} step={0.1} />
			</div>

			<Checkbox label="Favorittbue" checked={isFavorite} onChange={setIsFavorite} helpText="Marker som favorittbue" />

			<TextArea label="Notater" value={notes} onChange={(e) => setNotes(e.target.value)} helpText="Tilleggsnotater om buen" />
		</form>
	);
}
