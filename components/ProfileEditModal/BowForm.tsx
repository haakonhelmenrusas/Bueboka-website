'use client';

import React from 'react';
import { Checkbox, Input, NumberInput, Select, TextArea, Tooltip } from '@/components';
import styles from './BowForm.module.css';
import { BOW_TYPE_OPTIONS } from '@/lib/labels';
import { LuChevronDown } from 'react-icons/lu';

export type BowType = 'RECURVE' | 'COMPOUND' | 'LONGBOW' | 'BAREBOW' | 'HORSEBOW' | 'TRADITIONAL' | 'OTHER';

export interface BowFormValues {
	name: string;
	type: BowType;
	eyeToNock: number;
	aimMeasure: number;
	eyeToSight: number;
	limbs: string;
	riser: string;
	handOrientation: 'RH' | 'LH' | '';
	drawWeight: number;
	bowLength: number;
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
	const [limbs, setLimbs] = React.useState<string>(initialValues.limbs);
	const [riser, setRiser] = React.useState<string>(initialValues.riser);
	const [handOrientation, setHandOrientation] = React.useState<'RH' | 'LH' | ''>(initialValues.handOrientation);
	const [drawWeight, setDrawWeight] = React.useState<number>(initialValues.drawWeight);
	const [bowLength, setBowLength] = React.useState<number>(initialValues.bowLength);
	const [isFavorite, setIsFavorite] = React.useState<boolean>(initialValues.isFavorite);
	const [notes, setNotes] = React.useState<string>(initialValues.notes);
	const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(
		!!(initialValues.eyeToNock || initialValues.aimMeasure || initialValues.eyeToSight)
	);

	return (
		<form
			id="bow-form"
			className={styles.form}
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({ name, type, eyeToNock, aimMeasure, eyeToSight, limbs, riser, handOrientation, drawWeight, bowLength, isFavorite, notes });
			}}
		>
			<div className={styles.row}>
				<Input label="Navn på bue" value={name} onChange={(e) => setName(e.target.value)} required />
				<Select label="Type" value={type} onChange={(v) => setType(v as BowType)} options={BOW_TYPE_OPTIONS.map((o) => ({ ...o }))} />
			</div>

			<Checkbox label="Favorittbue" checked={isFavorite} onChange={setIsFavorite} helpText="Marker som favorittbue" />

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
					<div className={styles.numberRow}>
						<NumberInput optional label="Øye til nock (cm)" value={eyeToNock} onChange={setEyeToNock} min={0} step={0.01} />
						<NumberInput optional label="Øye til sikte (cm)" value={eyeToSight} onChange={setEyeToSight} min={0} step={0.01} />
						<NumberInput
							label={
								<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
									Målt sikte
									<Tooltip text="Mål hvor langt 5cm er på siktet ditt" label="Hjelp for Målt sikte" />
								</span>
							}
							optional
							value={aimMeasure}
							onChange={setAimMeasure}
							min={0}
							step={0.01}
						/>
					</div>
					<div className={styles.row}>
						<Input optional label="Lemmer" value={limbs} onChange={(e) => setLimbs(e.target.value)} />
						<Input optional label="Midtstykke" value={riser} onChange={(e) => setRiser(e.target.value)} />
					</div>
					<div className={styles.numberRow}>
						<Select
							optional
							label="Hånd"
							value={handOrientation}
							onChange={(v) => setHandOrientation(v as 'RH' | 'LH' | '')}
							options={[
								{ label: 'Velg hånd', value: '' },
								{ label: 'Høyre (RH)', value: 'RH' },
								{ label: 'Venstre (LH)', value: 'LH' },
							]}
						/>
						<NumberInput optional label="Styrke (pund)" value={drawWeight} onChange={setDrawWeight} min={0} step={0.5} />
						<NumberInput optional label="Lengde (tommer)" value={bowLength} onChange={setBowLength} min={0} step={0.5} />
					</div>
				</div>
			)}

			<TextArea label="Notater" value={notes} onChange={(e) => setNotes(e.target.value)} helpText="Tilleggsnotater om buen" optional />
		</form>
	);
}
