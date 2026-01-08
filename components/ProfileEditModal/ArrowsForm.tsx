'use client';

import React from 'react';
import { Button, Input, Select } from '@/components';

export type ArrowMaterial = 'KARBON' | 'ALUMINIUM' | 'TREVERK';

export interface ArrowsFormValues {
	name: string;
	material: ArrowMaterial;
}

interface ArrowsFormProps {
	initialValues?: Partial<ArrowsFormValues>;
	loading?: boolean;
	onSubmit: (values: ArrowsFormValues) => Promise<void>;
}

const materialOptions = [
	{ value: 'KARBON', label: 'Karbon' },
	{ value: 'ALUMINIUM', label: 'Aluminium' },
	{ value: 'TREVERK', label: 'Treverk' },
] as const;

export function ArrowsForm({ initialValues, loading, onSubmit }: ArrowsFormProps) {
	const [name, setName] = React.useState(initialValues?.name ?? '');
	const [material, setMaterial] = React.useState<ArrowMaterial>((initialValues?.material as ArrowMaterial) ?? 'KARBON');

	React.useEffect(() => {
		setName(initialValues?.name ?? '');
		setMaterial((initialValues?.material as ArrowMaterial) ?? 'KARBON');
	}, [initialValues?.name, initialValues?.material]);

	return (
		<form
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
			<Button label={loading ? 'Legger til...' : 'Legg til piler'} type="submit" disabled={loading} width={260} />
		</form>
	);
}
