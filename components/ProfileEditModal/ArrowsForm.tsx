'use client';

import { useEffect, useState } from 'react';
import { Checkbox, Input, NumberInput, Select } from '@/components';

export type ArrowMaterial = 'KARBON' | 'ALUMINIUM' | 'TREVERK';

export interface ArrowsFormValues {
	name: string;
	material: ArrowMaterial;
	arrowsCount: number | null;
	diameter: number | null;
	length: number | null;
	weight: number | null;
	spine: string;
	isFavorite: boolean;
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
	const [arrowsCount, setArrowsCount] = useState<number | null>(
		typeof (initialValues as any)?.arrowsCount === 'number' ? (initialValues as any).arrowsCount : null
	);
	const [diameter, setDiameter] = useState<number | null>(
		typeof (initialValues as any)?.diameter === 'number' ? (initialValues as any).diameter : null
	);
	const [length, setLength] = useState<number | null>(typeof initialValues?.length === 'number' ? initialValues.length : null);
	const [weight, setWeight] = useState<number | null>(typeof initialValues?.weight === 'number' ? initialValues.weight : null);
	const [spine, setSpine] = useState<string>(typeof (initialValues as any)?.spine === 'string' ? (initialValues as any).spine : '');
	const [isFavorite, setIsFavorite] = useState<boolean>(Boolean((initialValues as any)?.isFavorite));
	const [nameError, setNameError] = useState<string>('');

	useEffect(() => {
		setName(initialValues?.name ?? '');
		setMaterial((initialValues?.material as ArrowMaterial) ?? 'KARBON');
		setArrowsCount(typeof (initialValues as any)?.arrowsCount === 'number' ? (initialValues as any).arrowsCount : null);
		setDiameter(typeof (initialValues as any)?.diameter === 'number' ? (initialValues as any).diameter : null);
		setLength(typeof initialValues?.length === 'number' ? initialValues.length : null);
		setWeight(typeof initialValues?.weight === 'number' ? initialValues.weight : null);
		setSpine(typeof (initialValues as any)?.spine === 'string' ? (initialValues as any).spine : '');
		setIsFavorite(Boolean((initialValues as any)?.isFavorite));
		setNameError('');
	}, [
		initialValues?.name,
		initialValues?.material,
		(initialValues as any)?.arrowsCount,
		(initialValues as any)?.diameter,
		initialValues?.length,
		initialValues?.weight,
		(initialValues as any)?.spine,
		(initialValues as any)?.isFavorite,
	]);

	return (
		<form
			id="arrows-form"
			onSubmit={async (e) => {
				e.preventDefault();
				const trimmedName = name.trim();
				if (!trimmedName) {
					setNameError('Du må legge inn et navn.');
					return;
				}
				setNameError('');
				await onSubmit({ name: trimmedName, material, arrowsCount, diameter, length, weight, spine, isFavorite });
			}}
		>
			<div
				style={{
					marginTop: 14,
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 'var(--space-6)',
					alignItems: 'end',
				}}
			>
				<Select
					label="Materiale"
					value={material}
					onChange={(v) => setMaterial(v as ArrowMaterial)}
					options={materialOptions.map((o) => ({ ...o }))}
				/>
				<NumberInput
					label="Diameter (mm)"
					value={diameter ?? 0}
					onChange={(v) => setDiameter(v)}
					onEmpty={() => setDiameter(null)}
					min={0}
					step={0.1}
					startEmpty
					emptyBehavior="ignore"
				/>
			</div>

			<div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'end' }}>
				<NumberInput
					label="Antall piler"
					value={arrowsCount ?? 0}
					onChange={(v) => setArrowsCount(v)}
					onEmpty={() => setArrowsCount(null)}
					min={0}
					step={1}
					startEmpty
					emptyBehavior="ignore"
				/>
				<Input label="Spine" value={spine} onChange={(e) => setSpine(e.target.value)} />
			</div>

			<div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'end' }}>
				<NumberInput
					label="Lengde (cm)"
					value={length ?? 0}
					onChange={(v) => setLength(v)}
					onEmpty={() => setLength(null)}
					min={0}
					step={0.5}
					startEmpty
					emptyBehavior="ignore"
				/>
				<NumberInput
					label="Vekt (gram)"
					value={weight ?? 0}
					onChange={(v) => setWeight(v)}
					onEmpty={() => setWeight(null)}
					min={0}
					step={0.1}
					startEmpty
					emptyBehavior="ignore"
				/>
			</div>

			<div style={{ marginTop: 12 }}>
				<Input
					label="Navn på piler"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						if (nameError) setNameError('');
					}}
					required
					helpText="Gi pilene et navn du kjenner igjen"
					error={Boolean(nameError)}
					errorMessage={nameError}
				/>
			</div>

			<div style={{ marginTop: 12 }}>
				<Checkbox label="Favorittpiler" checked={isFavorite} onChange={setIsFavorite} helpText="Marker som favorittpilsett" />
			</div>
		</form>
	);
}
