'use client';

import { useEffect, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { Checkbox, Input, NumberInput, Select, TextArea } from '@/components';
import { ARROW_MATERIAL_OPTIONS } from '@/lib/labels';
import styles from './ArrowsForm.module.css';

export type ArrowMaterial = 'KARBON' | 'ALUMINIUM' | 'TREVERK';

export interface ArrowsFormValues {
	name: string;
	material: ArrowMaterial;
	arrowsCount: number | null;
	diameter: number | null;
	length: number | null;
	weight: number | null;
	spine: string;
	pointType: string;
	pointWeight: number | null;
	vanes: string;
	nock: string;
	notes: string;
	isFavorite: boolean;
}

interface ArrowsFormProps {
	initialValues?: Partial<ArrowsFormValues>;
	onSubmit: (values: ArrowsFormValues) => Promise<void>;
}

export function ArrowsForm({ initialValues, onSubmit }: ArrowsFormProps) {
	const [name, setName] = useState(initialValues?.name ?? '');
	const [material, setMaterial] = useState<ArrowMaterial>((initialValues?.material as ArrowMaterial) ?? 'KARBON');
	const [arrowsCount, setArrowsCount] = useState<number | null>(
		typeof initialValues?.arrowsCount === 'number' ? initialValues.arrowsCount : null
	);
	const [diameter, setDiameter] = useState<number | null>(
		typeof initialValues?.diameter === 'number' ? initialValues.diameter : null
	);
	const [length, setLength] = useState<number | null>(typeof initialValues?.length === 'number' ? initialValues.length : null);
	const [weight, setWeight] = useState<number | null>(typeof initialValues?.weight === 'number' ? initialValues.weight : null);
	const [spine, setSpine] = useState<string>(typeof initialValues?.spine === 'string' ? initialValues.spine : '');
	const [pointType, setPointType] = useState<string>(typeof initialValues?.pointType === 'string' ? initialValues.pointType : '');
	const [pointWeight, setPointWeight] = useState<number | null>(
		typeof initialValues?.pointWeight === 'number' ? initialValues.pointWeight : null
	);
	const [vanes, setVanes] = useState<string>(typeof initialValues?.vanes === 'string' ? initialValues.vanes : '');
	const [nock, setNock] = useState<string>(typeof initialValues?.nock === 'string' ? initialValues.nock : '');
	const [notes, setNotes] = useState<string>(typeof initialValues?.notes === 'string' ? initialValues.notes : '');
	const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(initialValues?.isFavorite));
	const [nameError, setNameError] = useState<string>('');
	const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

	useEffect(() => {
		setName(initialValues?.name ?? '');
		setMaterial((initialValues?.material as ArrowMaterial) ?? 'KARBON');
		setArrowsCount(typeof initialValues?.arrowsCount === 'number' ? initialValues.arrowsCount : null);
		setDiameter(typeof initialValues?.diameter === 'number' ? initialValues.diameter : null);
		setLength(typeof initialValues?.length === 'number' ? initialValues.length : null);
		setWeight(typeof initialValues?.weight === 'number' ? initialValues.weight : null);
		setSpine(typeof initialValues?.spine === 'string' ? initialValues.spine : '');
		setPointType(typeof initialValues?.pointType === 'string' ? initialValues.pointType : '');
		setPointWeight(typeof initialValues?.pointWeight === 'number' ? initialValues.pointWeight : null);
		setVanes(typeof initialValues?.vanes === 'string' ? initialValues.vanes : '');
		setNock(typeof initialValues?.nock === 'string' ? initialValues.nock : '');
		setNotes(typeof initialValues?.notes === 'string' ? initialValues.notes : '');
		setIsFavorite(Boolean(initialValues?.isFavorite));
		setNameError('');
	}, [
		initialValues?.name,
		initialValues?.material,
		initialValues?.arrowsCount,
		initialValues?.diameter,
		initialValues?.length,
		initialValues?.weight,
		initialValues?.spine,
		initialValues?.pointType,
		initialValues?.pointWeight,
		initialValues?.vanes,
		initialValues?.nock,
		initialValues?.notes,
		initialValues?.isFavorite,
	]);

	return (
		<form
			id="arrows-form"
			className={styles.form}
			onSubmit={async (e) => {
				e.preventDefault();
				const trimmedName = name.trim();
				if (!trimmedName) {
					setNameError('Du må legge inn et navn.');
					return;
				}
				setNameError('');
				await onSubmit({
					name: trimmedName,
					material,
					arrowsCount,
					diameter,
					length,
					weight,
					spine,
					pointType,
					pointWeight,
					vanes,
					nock,
					notes,
					isFavorite,
				});
			}}
		>
			<div className={styles.row}>
				<Input
					label="Navn på piler"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						if (nameError) setNameError('');
					}}
					required
					error={Boolean(nameError)}
					errorMessage={nameError}
				/>
				<Select
					label="Materiale"
					value={material}
					onChange={(v) => setMaterial(v as ArrowMaterial)}
					options={ARROW_MATERIAL_OPTIONS.map((o) => ({ ...o }))}
				/>
			</div>

			<NumberInput
				label="Antall piler"
				value={arrowsCount ?? 0}
				onChange={(v) => setArrowsCount(v)}
				onEmpty={() => setArrowsCount(null)}
				min={0}
				step={1}
				startEmpty
				emptyBehavior="ignore"
				optional
			/>

			<Checkbox label="Favorittpiler" checked={isFavorite} onChange={setIsFavorite} helpText="Marker som favorittpilsett" />

			<button type="button" className={styles.advancedToggle} onClick={() => setAdvancedOpen((prev) => !prev)}>
				<div className={styles.advancedLine} />
				<div className={styles.advancedLabelWrap}>
					<span className={styles.advancedLabel}>Avansert</span>
					<div className={styles.advancedChevron} style={{ transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
						<LuChevronDown size={14} />
					</div>
				</div>
				<div className={styles.advancedLine} />
			</button>

			{advancedOpen && (
				<div className={styles.advancedContent}>
					<div className={styles.grid}>
						<NumberInput
							label="Diameter (mm)"
							value={diameter ?? 0}
							onChange={(v) => setDiameter(v)}
							onEmpty={() => setDiameter(null)}
							min={0}
							step={0.1}
							startEmpty
							emptyBehavior="ignore"
							optional
						/>
						<NumberInput
							label="Lengde (cm)"
							value={length ?? 0}
							onChange={(v) => setLength(v)}
							onEmpty={() => setLength(null)}
							min={0}
							step={0.1}
							startEmpty
							emptyBehavior="ignore"
							optional
						/>
					</div>
					<div className={styles.grid}>
						<NumberInput
							label="Vekt (gram)"
							value={weight ?? 0}
							onChange={(v) => setWeight(v)}
							onEmpty={() => setWeight(null)}
							min={0}
							step={0.1}
							startEmpty
							emptyBehavior="ignore"
							optional
						/>
						<Input label="Spine" value={spine} onChange={(e) => setSpine(e.target.value)} optional />
					</div>
					<div className={styles.grid}>
						<Input label="Pilspiss type" value={pointType} onChange={(e) => setPointType(e.target.value)} optional />
						<NumberInput
							label="Pilspiss vekt (grain)"
							value={pointWeight ?? 0}
							onChange={(v) => setPointWeight(v)}
							onEmpty={() => setPointWeight(null)}
							min={0}
							step={0.5}
							startEmpty
							emptyBehavior="ignore"
							optional
						/>
					</div>
					<div className={styles.grid}>
						<Input label="Fjær (vanes)" value={vanes} onChange={(e) => setVanes(e.target.value)} optional />
						<Input label="Nock" value={nock} onChange={(e) => setNock(e.target.value)} optional />
					</div>
					<TextArea label="Notater" value={notes} onChange={(e) => setNotes(e.target.value)} helpText="Tilleggsnotater om pilene" optional />
				</div>
			)}
		</form>
	);
}
