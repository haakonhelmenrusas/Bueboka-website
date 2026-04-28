'use client';

import React from 'react';
import { Checkbox, Input, NumberInput, Select, TextArea, Tooltip } from '@/components';
import styles from './BowForm.module.css';
import { BOW_TYPE_OPTIONS } from '@/lib/labels';
import { LuChevronDown } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';

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
	braceHeight: number;
	stup: number;
	tiller: number;
	isFavorite: boolean;
	notes: string;
}

interface BowFormProps {
	initialValues: BowFormValues;
	onSubmit: (values: BowFormValues) => Promise<void>;
}

export function BowForm({ initialValues, onSubmit }: BowFormProps) {
	const { t } = useTranslation();
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
	const [braceHeight, setBraceHeight] = React.useState<number>(initialValues.braceHeight);
	const [stup, setStup] = React.useState<number>(initialValues.stup);
	const [tiller, setTiller] = React.useState<number>(initialValues.tiller);
	const [isFavorite, setIsFavorite] = React.useState<boolean>(initialValues.isFavorite);
	const [notes, setNotes] = React.useState<string>(initialValues.notes);
	const [sightMarksOpen, setSightMarksOpen] = React.useState<boolean>(false);
	const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(false);

	const isRecurveOrCompound = type === 'RECURVE' || type === 'COMPOUND';

	return (
		<form
			id="bow-form"
			className={styles.form}
			onSubmit={async (e) => {
				e.preventDefault();
				await onSubmit({
					name,
					type,
					eyeToNock,
					aimMeasure,
					eyeToSight,
					limbs,
					riser,
					handOrientation,
					drawWeight,
					bowLength,
					braceHeight,
					stup,
					tiller,
					isFavorite,
					notes,
				});
			}}
		>
			<div className={styles.row}>
				<Input label={t['bowForm.nameLabel']} value={name} onChange={(e) => setName(e.target.value)} required />
				<Select label={t['bowForm.typeLabel']} value={type} onChange={(v) => setType(v as BowType)} options={BOW_TYPE_OPTIONS.map((o) => ({ ...o }))} />
			</div>

		<Checkbox label={t['bowForm.favoriteLabel']} checked={isFavorite} onChange={setIsFavorite} helpText={t['bowForm.favoriteHelp']} />

		{isRecurveOrCompound && (
			<>
			<button type="button" className={styles.advancedToggle} onClick={() => setSightMarksOpen((prev) => !prev)}>
				<div className={styles.advancedLine} />
				<div className={styles.advancedLabelWrap}>
					<span className={styles.advancedLabel}>{t['bowForm.sightMarkSection']}</span>
					<div className={styles.advancedChevron} style={{ transform: sightMarksOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
						<LuChevronDown size={14} />
					</div>
				</div>
				<div className={styles.advancedLine} />
			</button>

			{sightMarksOpen && (
				<div className={styles.advancedContent}>
					<div className={styles.numberRow}>
						<NumberInput optional label={t['bowForm.eyeToNock']} value={eyeToNock} onChange={setEyeToNock} min={0} step={0.01} />
						<NumberInput optional label={t['bowForm.eyeToSight']} value={eyeToSight} onChange={setEyeToSight} min={0} step={0.01} />
						<NumberInput
							label={
								<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
									{t['bowForm.aimMeasure']}
									<Tooltip text={t['bowForm.aimMeasureTooltip']} label={`Hjelp for ${t['bowForm.aimMeasure']}`} />
								</span>
							}
							optional
							value={aimMeasure}
							onChange={setAimMeasure}
							min={0}
							step={0.01}
						/>
					</div>
				</div>
			)}
			</>
		)}

			<button type="button" className={styles.advancedToggle} onClick={() => setAdvancedOpen((prev) => !prev)}>
				<div className={styles.advancedLine} />
				<div className={styles.advancedLabelWrap}>
					<span className={styles.advancedLabel}>{t['bowForm.advancedSection']}</span>
					<div className={styles.advancedChevron} style={{ transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
						<LuChevronDown size={14} />
					</div>
				</div>
				<div className={styles.advancedLine} />
			</button>

			{advancedOpen && (
				<div className={styles.advancedContent}>
					{isRecurveOrCompound && (
						<div className={styles.row}>
							<Input optional label={t['bowForm.limbs']} value={limbs} onChange={(e) => setLimbs(e.target.value)} />
							<Input optional label={t['bowForm.riser']} value={riser} onChange={(e) => setRiser(e.target.value)} />
						</div>
					)}
					<div className={styles.numberRow}>
						<Select
							optional
							label={t['bowForm.hand']}
							value={handOrientation}
							onChange={(v) => setHandOrientation(v as 'RH' | 'LH' | '')}
							options={[
								{ label: t['bowForm.handSelect'], value: '' },
								{ label: t['bowForm.handRight'], value: 'RH' },
								{ label: t['bowForm.handLeft'], value: 'LH' },
							]}
						/>
						<NumberInput optional label={t['bowForm.drawWeight']} value={drawWeight} onChange={setDrawWeight} min={0} step={0.5} />
						<NumberInput optional label={t['bowForm.bowLength']} value={bowLength} onChange={setBowLength} min={0} step={0.5} />
					</div>
					{isRecurveOrCompound && (
						<div className={styles.numberRow}>
							<NumberInput optional label={t['bowForm.braceHeight']} value={braceHeight} onChange={setBraceHeight} min={0} step={0.1} />
							<NumberInput optional label={t['bowForm.stup']} value={stup} onChange={setStup} step={0.5} />
							<NumberInput optional label={t['bowForm.tiller']} value={tiller} onChange={setTiller} step={0.5} />
						</div>
					)}
				</div>
			)}

			<TextArea label={t['bowForm.notes']} value={notes} onChange={(e) => setNotes(e.target.value)} helpText={t['bowForm.notesHelp']} optional />
		</form>
	);
}
