'use client';

import React from 'react';
import { Input, NumberInput, Select, TextArea } from '@/components';
import { Check } from 'lucide-react';

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
	mode: 'create' | 'edit';
	loading?: boolean;
	onSubmit: (values: BowFormValues) => Promise<void>;
}

const bowTypeOptions = [
	{ value: 'RECURVE', label: 'Recurve' },
	{ value: 'COMPOUND', label: 'Compound' },
	{ value: 'LONGBOW', label: 'Langbue' },
	{ value: 'BAREBOW', label: 'Barebow' },
	{ value: 'HORSEBOW', label: 'Rytterbue' },
	{ value: 'TRADITIONAL', label: 'Tradisjonell' },
	{ value: 'OTHER', label: 'Annet' },
] as const;

export function BowForm({ initialValues, mode, loading, onSubmit }: BowFormProps) {
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
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, type, eyeToNock, aimMeasure, eyeToSight, isFavorite, notes });
			}}
		>
			<Input
				label="Navn på bue"
				value={name}
				onChange={(e) => setName(e.target.value)}
				helpText="Gi buen et lett gjenkjennelig navn"
				required
			/>
			<Select label="Type" value={type} onChange={(v) => setType(v as BowType)} options={bowTypeOptions.map((o) => ({ ...o }))} />

			<NumberInput label="Øye til nock (cm)" value={eyeToNock} onChange={setEyeToNock} min={0} step={1} />
			<NumberInput label="Aim measure (cm)" value={aimMeasure} onChange={setAimMeasure} min={0} step={1} />
			<NumberInput label="Øye til sight (cm)" value={eyeToSight} onChange={setEyeToSight} min={0} step={1} />

			<Select
				label="Favoritt"
				value={isFavorite ? 'yes' : 'no'}
				onChange={(v) => setIsFavorite(v === 'yes')}
				options={[
					{ value: 'yes', label: 'Ja', icon: <Check size={16} /> },
					{ value: 'no', label: 'Nei' },
				]}
				helpText="Marker som favorittbue"
			/>

			<TextArea label="Notater" value={notes} onChange={(e) => setNotes(e.target.value)} helpText="Tilleggsnotater om buen" />
		</form>
	);
}
