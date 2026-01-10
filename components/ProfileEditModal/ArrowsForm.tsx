'use client';

import { useEffect, useState } from 'react';
import { Input, Select } from '@/components';

export type ArrowMaterial = 'KARBON' | 'ALUMINIUM' | 'TREVERK';

export interface ArrowsFormValues {
	name: string;
	material: ArrowMaterial;
}

interface ArrowsFormProps {
	initialValues?: Partial<ArrowsFormValues>;
	onSubmit: (values: ArrowsFormValues) => Promise<void>;
}

const materialOptions = [
	{ value: 'KARBON', label: 'Karbon' },
	{ value: 'ALUMINIUM', label: 'Aluminium' },
	{ value: 'TREVERK', label: 'Treverk' },
] as const;

export function ArrowsForm({ initialValues, onSubmit }: ArrowsFormProps) {
	const [name, setName] = useState(initialValues?.name ?? '');
	const [material, setMaterial] = useState<ArrowMaterial>((initialValues?.material as ArrowMaterial) ?? 'KARBON');

	useEffect(() => {
		setName(initialValues?.name ?? '');
		setMaterial((initialValues?.material as ArrowMaterial) ?? 'KARBON');
	}, [initialValues?.name, initialValues?.material]);

	return (
		<form
			id="arrows-form"
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, material });
			}}
		>
			<Input
				label="Navn på piler"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
				helpText="Gi pilene et navn du kjenner igjen"
			/>
			<Select
				label="Material"
				value={material}
				onChange={(v) => setMaterial(v as ArrowMaterial)}
				options={materialOptions.map((o) => ({ ...o }))}
			/>
		</form>
	);
}
