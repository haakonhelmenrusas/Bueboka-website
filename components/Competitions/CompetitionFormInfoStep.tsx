'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuTrash2 } from 'react-icons/lu';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { DateInput, Input, Select } from '@/components';
import { getArrowsOptions, getBowOptions, getEnvironmentOptions, getPracticeCategoryOptions } from '@/lib/formUtils';
import { WEATHER_OPTIONS } from './CompetitionFormModal.types';

interface InfoStepProps {
	name: string;
	setName: (v: string) => void;
	date: string;
	setDate: (v: string) => void;
	practiceCategory: PracticeCategory;
	onCategoryChange: (cat: PracticeCategory) => void;
	environment: Environment;
	setEnvironment: (v: Environment) => void;
	location: string;
	setLocation: (v: string) => void;
	organizerName: string;
	setOrganizerName: (v: string) => void;
	weather: WeatherCondition[];
	toggleWeather: (condition: WeatherCondition) => void;
	bowId: string;
	setBowId: (id: string) => void;
	arrowsId: string;
	setArrowsId: (id: string) => void;
	bows: Array<{ id: string; name: string; type: string; isFavorite?: boolean }>;
	arrows: Array<{ id: string; name: string; material: string; isFavorite?: boolean }>;
	isEditMode: boolean;
	onDeleteRequest: () => void;
}

export const CompetitionFormInfoStep: React.FC<InfoStepProps> = ({
	name,
	setName,
	date,
	setDate,
	practiceCategory,
	onCategoryChange,
	environment,
	setEnvironment,
	location,
	setLocation,
	organizerName,
	setOrganizerName,
	weather,
	toggleWeather,
	bowId,
	setBowId,
	arrowsId,
	setArrowsId,
	bows,
	arrows,
	isEditMode,
	onDeleteRequest,
}) => {
	const environmentOptions = getEnvironmentOptions();
	const practiceCategoryOptions = getPracticeCategoryOptions();
	const bowOptions = getBowOptions(bows);
	const arrowsOptions = getArrowsOptions(arrows);

	return (
		<div className={styles.stepContent}>
			<Input
				label="Navn på konkurransen"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
				helpText="F.eks. «NM Innendørs 2026»"
				containerClassName={styles.field}
			/>

			<div className={styles.row}>
				<DateInput label="Dato" value={date} onChange={(e) => setDate(e.target.value)} required containerClassName={styles.field} />
				<Select
					label="Kategori"
					value={practiceCategory}
					onChange={(v) => onCategoryChange(v as PracticeCategory)}
					options={practiceCategoryOptions}
					containerClassName={styles.field}
				/>
			</div>

			<div className={styles.row}>
				<Select
					label="Miljø"
					value={environment}
					onChange={(v) => setEnvironment(v as Environment)}
					options={environmentOptions}
					containerClassName={styles.field}
				/>
				<Input
					label="Sted"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					helpText={`F.eks. Oslo (${location.length}/64 tegn)`}
					maxLength={64}
					containerClassName={styles.field}
				/>
			</div>

			<Input
				label="Arrangør"
				optional
				value={organizerName}
				onChange={(e) => setOrganizerName(e.target.value)}
				helpText="Klubb eller organisasjon som arrangerte"
				containerClassName={styles.field}
			/>

			{environment === Environment.OUTDOOR && (
				<div className={styles.weatherSection}>
					<div className={styles.weatherLabel}>Vær (valgfritt)</div>
					<div className={styles.weatherChips}>
						{WEATHER_OPTIONS.map((opt) => {
							const active = weather.includes(opt.value);
							return (
								<button
									key={opt.value}
									type="button"
									className={`${styles.weatherChip}${active ? ` ${styles.weatherChipActive}` : ''}`}
									onClick={() => toggleWeather(opt.value)}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>
			)}

			<div className={styles.sectionTitle}>Utstyr</div>
			<div className={styles.row}>
				<Select
					label="Bue"
					value={bowId}
					onChange={(v) => setBowId(v as string)}
					placeholderLabel="Velg bue (valgfritt)"
					options={bowOptions}
					containerClassName={styles.field}
				/>
				<Select
					label="Piler"
					value={arrowsId}
					onChange={(v) => setArrowsId(v as string)}
					placeholderLabel="Velg piler (valgfritt)"
					options={arrowsOptions}
					containerClassName={styles.field}
				/>
			</div>

			{isEditMode && (
				<div className={styles.deleteSection}>
					<button type="button" className={styles.deleteLink} onClick={onDeleteRequest}>
						<LuTrash2 size={16} />
						Slett konkurranse
					</button>
				</div>
			)}
		</div>
	);
};

